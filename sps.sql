-- 1. Register New User
CREATE PROCEDURE sp_RegisterUser
    @username VARCHAR(50),
    @email VARCHAR(100),
    @password VARCHAR(100),
    @bio VARCHAR(MAX),
    @accountType VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if username already exists
    IF EXISTS (SELECT 1 FROM USERS WHERE username = @username)
    BEGIN
        RAISERROR('Username already exists', 16, 1);
        RETURN;
    END
    
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM USERS WHERE email = @email)
    BEGIN
        RAISERROR('Email already exists', 16, 1);
        RETURN;
    END
    
    -- Insert new user
    INSERT INTO USERS (username, email, password, dateOfCreation, bio, accountType)
    VALUES (@username, @email, @password, GETDATE(), @bio, @accountType);
    
    -- Initialize review streak for the user
    INSERT INTO ReviewStreak (Username, CurrentStreak, LongestStreak, LastDate)
    VALUES (@username, 0, 0, NULL);
    
    -- Return success
    SELECT 'User registered successfully' AS Result;
END
GO

-- 2. Update User Profile
CREATE PROCEDURE sp_UpdateUser
    @username VARCHAR(50),
    @newPassword VARCHAR(100) = NULL,
    @newUsername VARCHAR(50) = NULL,
    @newBio VARCHAR(MAX) = NULL,
    @newPfp VARBINARY(MAX) = NULL,
    @newEmail VARCHAR(100) = NULL,
    @newAccountType VARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM USERS WHERE username = @username)
    BEGIN
        RAISERROR('User does not exist', 16, 1);
        RETURN;
    END
    
    -- Check if new username already exists
    IF @newUsername IS NOT NULL AND EXISTS (SELECT 1 FROM USERS WHERE username = @newUsername)
    BEGIN
        RAISERROR('New username already exists', 16, 1);
        RETURN;
    END
    
    -- Check if new email already exists
    IF @newEmail IS NOT NULL AND EXISTS (SELECT 1 FROM USERS WHERE email = @newEmail AND username <> @username)
    BEGIN
        RAISERROR('New email already exists', 16, 1);
        RETURN;
    END
    
    -- Start transaction
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Update password if provided
        IF @newPassword IS NOT NULL
        BEGIN
            UPDATE USERS SET password = @newPassword WHERE username = @username;
        END
        
        -- Update bio if provided
        IF @newBio IS NOT NULL
        BEGIN
            UPDATE USERS SET bio = @newBio WHERE username = @username;
        END
        
        -- Update profile picture if provided
        IF @newPfp IS NOT NULL
        BEGIN
            UPDATE USERS SET pfp = @newPfp WHERE username = @username;
        END
        
        -- Update email if provided
        IF @newEmail IS NOT NULL
        BEGIN
            UPDATE USERS SET email = @newEmail WHERE username = @username;
        END
        
        -- Update account type if provided
        IF @newAccountType IS NOT NULL
        BEGIN
            UPDATE USERS SET accountType = @newAccountType WHERE username = @username;
        END
        
        -- Update username if provided (this should be done last)
        IF @newUsername IS NOT NULL
        BEGIN
            -- Update references in other tables
            UPDATE POST_CONTENT SET username = @newUsername WHERE username = @username;
            UPDATE FRIENDS SET username = @newUsername WHERE username = @username;
            UPDATE FRIENDS SET friends_with = @newUsername WHERE friends_with = @username;
            UPDATE WATCHLIST SET username = @newUsername WHERE username = @username;
            UPDATE badges SET username = @newUsername WHERE username = @username;
            UPDATE ReviewStreak SET Username = @newUsername WHERE Username = @username;
            
            -- Update the username in USERS table
            UPDATE USERS SET username = @newUsername WHERE username = @username;
        END
        
        COMMIT TRANSACTION;
        SELECT 'User updated successfully' AS Result;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END
GO

-- 3. Search for a User
CREATE PROCEDURE sp_SearchUser
    @searchTerm VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT username, email, dateOfCreation, pfp, bio, accountType
    FROM USERS
    WHERE username LIKE '%' + @searchTerm + '%' 
       OR email LIKE '%' + @searchTerm + '%'
       OR bio LIKE '%' + @searchTerm + '%';
END
GO

-- 4. Create Poll with Options
CREATE PROCEDURE sp_CreatePoll
    @question VARCHAR(MAX),
    @optionsArray VARCHAR(MAX) -- JSON array of option texts
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Insert the poll
    INSERT INTO POLLS (question, result)
    VALUES (@question, 0);
    
    -- Get the poll ID
    DECLARE @pollID INT = SCOPE_IDENTITY();
    
    -- Parse the JSON array and insert options
    INSERT INTO POLL_OPTIONS (pollID, optionText, voteCount)
    SELECT @pollID, value, 0
    FROM OPENJSON(@optionsArray);
    
    -- Return the new poll ID
    SELECT @pollID AS PollID;
END
GO

-- 5. Add Poll Option
CREATE PROCEDURE sp_AddPollOption
    @pollID INT,
    @optionText VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if poll exists
    IF NOT EXISTS (SELECT 1 FROM POLLS WHERE pollID = @pollID)
    BEGIN
        RAISERROR('Poll does not exist', 16, 1);
        RETURN;
    END
    
    -- Insert the new option
    INSERT INTO POLL_OPTIONS (pollID, optionText, voteCount)
    VALUES (@pollID, @optionText, 0);
    
    -- Return the new option ID
    SELECT SCOPE_IDENTITY() AS OptionID;
END
GO

-- 6. Delete Poll Option
CREATE PROCEDURE sp_DeletePollOption
    @optionID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if option exists
    IF NOT EXISTS (SELECT 1 FROM POLL_OPTIONS WHERE optionID = @optionID)
    BEGIN
        RAISERROR('Poll option does not exist', 16, 1);
        RETURN;
    END
    
    -- Delete the option
    DELETE FROM POLL_OPTIONS
    WHERE optionID = @optionID;
    
    SELECT 'Poll option deleted successfully' AS Result;
END
GO

-- 7. Delete Poll
CREATE PROCEDURE sp_DeletePoll
    @pollID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if poll exists
    IF NOT EXISTS (SELECT 1 FROM POLLS WHERE pollID = @pollID)
    BEGIN
        RAISERROR('Poll does not exist', 16, 1);
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Delete all poll options first
        DELETE FROM POLL_OPTIONS
        WHERE pollID = @pollID;
        
        -- Update posts that reference this poll
        UPDATE POST_CONTENT
        SET pollID = NULL
        WHERE pollID = @pollID;
        
        -- Delete the poll
        DELETE FROM POLLS
        WHERE pollID = @pollID;
        
        COMMIT TRANSACTION;
        SELECT 'Poll deleted successfully' AS Result;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END
GO

-- 8. Get Poll Results
CREATE PROCEDURE sp_GetPollResults
    @pollID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if poll exists
    IF NOT EXISTS (SELECT 1 FROM POLLS WHERE pollID = @pollID)
    BEGIN
        RAISERROR('Poll does not exist', 16, 1);
        RETURN;
    END
    
    -- Get poll question
    SELECT p.question
    FROM POLLS p
    WHERE p.pollID = @pollID;
    
    -- Get poll options with vote counts
    SELECT 
        po.optionID,
        po.optionText,
        po.voteCount,
        CASE 
            WHEN (SELECT SUM(voteCount) FROM POLL_OPTIONS WHERE pollID = @pollID) = 0 THEN 0
            ELSE CAST((po.voteCount * 100.0) / (SELECT SUM(voteCount) FROM POLL_OPTIONS WHERE pollID = @pollID) AS DECIMAL(5,2))
        END AS percentage
    FROM POLL_OPTIONS po
    WHERE po.pollID = @pollID;
END
GO

-- 9. Search for Posts
CREATE PROCEDURE sp_SearchPosts
    @searchTerm VARCHAR(MAX) = NULL,
    @username VARCHAR(50) = NULL,
    @movieID INT = NULL,
    @tvShowID INT = NULL,
    @tag VARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.postID,
        p.username,
        p.contentText,
        p.media,
        p.pollID,
        p.movieID,
        p.tvShowID,
        p.tags,
        p.dateOfPost,
        p.upvoteCount,
        p.title,
        CASE 
            WHEN p.movieID IS NOT NULL THEN m.name
            WHEN p.tvShowID IS NOT NULL THEN t.[Name]
            ELSE NULL
        END AS contentTitle
    FROM POST_CONTENT p
    LEFT JOIN movies m ON p.movieID = m.id
    LEFT JOIN TVShows t ON p.tvShowID = t.TVShow_ID
    WHERE 
        (@searchTerm IS NULL OR p.contentText LIKE '%' + @searchTerm + '%') AND
        (@username IS NULL OR p.username = @username) AND
        (@movieID IS NULL OR p.movieID = @movieID) AND
        (@tvShowID IS NULL OR p.tvShowID = @tvShowID) AND
        (@tag IS NULL OR p.tags LIKE '%' + @tag + '%')
    ORDER BY p.dateOfPost DESC;
END
GO

-- 10. Create Post
CREATE PROCEDURE sp_CreatePost
    @username VARCHAR(50),
    @contentText VARCHAR(MAX) = NULL,
    @media VARBINARY(MAX) = NULL,
    @pollID INT = NULL,
    @movieID INT = NULL,
    @tvShowID INT = NULL,
    @tags VARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM USERS WHERE username = @username)
    BEGIN
        RAISERROR('User does not exist', 16, 1);
        RETURN;
    END
    
    -- Check if movie exists if provided
    IF @movieID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM movies WHERE id = @movieID)
    BEGIN
        RAISERROR('Movie does not exist', 16, 1);
        RETURN;
    END
    
    -- Check if TV show exists if provided
    IF @tvShowID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM TVShows WHERE TVShow_ID = @tvShowID)
    BEGIN
        RAISERROR('TV Show does not exist', 16, 1);
        RETURN;
    END
    
    -- Check if poll exists if provided
    IF @pollID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM POLLS WHERE pollID = @pollID)
    BEGIN
        RAISERROR('Poll does not exist', 16, 1);
        RETURN;
    END
    
    -- Insert the post
    INSERT INTO POST_CONTENT (username, contentText, media, pollID, movieID, tvShowID, tags, dateOfPost)
    VALUES (@username, @contentText, @media, @pollID, @movieID, @tvShowID, @tags, GETDATE());
    
    -- Return the new post ID
    SELECT SCOPE_IDENTITY() AS PostID;
END
GO

-- 11. Update Content Popularity
CREATE PROCEDURE sp_UpdateContentPopularity
    @movieID INT = NULL,
    @tvShowID INT = NULL,
    @incrementValue INT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update movie popularity
    IF @movieID IS NOT NULL
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM movies WHERE id = @movieID)
        BEGIN
            RAISERROR('Movie does not exist', 16, 1);
            RETURN;
        END
        
        UPDATE movies
        SET popularity = ISNULL(popularity, 0) + @incrementValue
        WHERE id = @movieID;
        
        SELECT 'Movie popularity updated' AS Result;
    END
    
    -- Update TV show popularity
    IF @tvShowID IS NOT NULL
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM TVShows WHERE TVShow_ID = @tvShowID)
        BEGIN
            RAISERROR('TV Show does not exist', 16, 1);
            RETURN;
        END
        
        UPDATE TVShows
        SET popularity = ISNULL(popularity, 0) + @incrementValue
        WHERE TVShow_ID = @tvShowID;
        
        SELECT 'TV Show popularity updated' AS Result;
    END
END
GO

-- 12. Delete Post
CREATE PROCEDURE sp_DeletePost
    @postID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if post exists
    IF NOT EXISTS (SELECT 1 FROM POST_CONTENT WHERE postID = @postID)
    BEGIN
        RAISERROR('Post does not exist', 16, 1);
        RETURN;
    END
    
    -- Delete the post
    DELETE FROM POST_CONTENT
    WHERE postID = @postID;
    
    SELECT 'Post deleted successfully' AS Result;
END
GO

-- 13. Add Friend
CREATE PROCEDURE sp_AddFriend
    @username VARCHAR(50),
    @friendUsername VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if both users exist
    IF NOT EXISTS (SELECT 1 FROM USERS WHERE username = @username)
    BEGIN
        RAISERROR('User does not exist', 16, 1);
        RETURN;
    END
    
    IF NOT EXISTS (SELECT 1 FROM USERS WHERE username = @friendUsername)
    BEGIN
        RAISERROR('Friend user does not exist', 16, 1);
        RETURN;
    END
    
    -- Check if they are already friends
    IF EXISTS (SELECT 1 FROM FRIENDS WHERE username = @username AND friends_with = @friendUsername)
    BEGIN
        RAISERROR('Already friends', 16, 1);
        RETURN;
    END
    
    -- Add friendship (bidirectional)
    INSERT INTO FRIENDS (username, friends_with)
    VALUES (@username, @friendUsername), (@friendUsername, @username);
    
    SELECT 'Friend added successfully' AS Result;
END
GO

-- 14. Remove Friend
CREATE PROCEDURE sp_RemoveFriend
    @username VARCHAR(50),
    @friendUsername VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if friendship exists
    IF NOT EXISTS (SELECT 1 FROM FRIENDS WHERE username = @username AND friends_with = @friendUsername)
    BEGIN
        RAISERROR('Not friends', 16, 1);
        RETURN;
    END
    
    -- Remove friendship (bidirectional)
    DELETE FROM FRIENDS
    WHERE (username = @username AND friends_with = @friendUsername)
       OR (username = @friendUsername AND friends_with = @username);
    
    SELECT 'Friend removed successfully' AS Result;
END
GO

-- 15. Get Friend List
CREATE PROCEDURE sp_GetFriendList
    @username VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM USERS WHERE username = @username)
    BEGIN
        RAISERROR('User does not exist', 16, 1);
        RETURN;
    END
    
    -- Get all friends
    SELECT 
        u.username,
        u.email,
        u.dateOfCreation,
        u.pfp,
        u.bio,
        u.accountType
    FROM FRIENDS f
    JOIN USERS u ON f.friends_with = u.username
    WHERE f.username = @username
    ORDER BY u.username;
END
GO


--13
CREATE PROCEDURE SearchMovies
    @name varchar(255) = null,
    @genre varchar(100) = null
AS
BEGIN
    SET NOCOUNT ON

    Select * From Movies
    Where (@name IS NULL OR name LIKE '%' + @name + '%')
      AND (@genre IS NULL OR genre LIKE '%' + @genre + '%')
END

--14
CREATE PROCEDURE AddMovie
    @name varchar(255),
    @genre varchar(100),
    @posters varbinary(MAX)
AS
BEGIN
    SET NOCOUNT ON

    Insert Into Movies (name, genre, posters)
    Values (@name, @genre, @posters)
END

--15
CREATE PROCEDURE SearchTVShows
    @name nvarchar(100) = null,
    @genre nvarchar(100) = null
AS
BEGIN
    SET NOCOUNT ON

    Select * From TVShows
    Where(@name IS NULL OR [Name] LIKE '%' + @name + '%')
      AND (@genre IS NULL OR Genre LIKE '%' + @genre + '%')
END

--16
CREATE PROCEDURE AddTVShow
    @name nvarchar(100),
    @genre nvarchar(100),
    @seasons int,
    @episodes int,
    @posters varchar(255)
AS
BEGIN
    SET NOCOUNT ON

    Insert Into TVShows ([Name], Genre, Seasons, Episodes, Posters)
    Values (@name, @genre, @seasons, @episodes, @posters)
END

--17
CREATE PROCEDURE AddStreamingAvailability
    @movieID int = null,
    @tvShowID int = null,
    @type varchar(100),
    @platform varchar(100),
    @url varchar(255)
AS
BEGIN
    SET NOCOUNT ON

    Insert Into StreamingAvailability (Movie_ID, TVShow_ID, [Type], [Platform], [URL])
    Values (@movieID, @tvShowID, @type, @platform, @url)
END

--18
CREATE PROCEDURE SearchStreamingPlatform
    @platform varchar(100),
    @type varchar(100) = null
AS
BEGIN
    SET NOCOUNT ON

    Select * From StreamingAvailability
    Where Platform LIKE '%' + @platform + '%'
      AND (@type IS NULL OR [Type] = @type)
END

--19
CREATE PROCEDURE UpdateReviewStreak
    @Username varchar(50),
    @ErrorMessage varchar(255) Output
AS
BEGIN
    SET NOCOUNT ON

    IF Not Exists (Select 1 From ReviewStreak Where Username = @Username)
    BEGIN
        Set @ErrorMessage = 'User does not have a streak record.'
        RETURN
    END

    Update ReviewStreak
    Set
        CurrentStreak = CASE
                          When DATEDIFF(DAY, LastDate, GETDATE()) = 1 Then CurrentStreak + 1
                          When DATEDIFF(DAY, LastDate, GETDATE()) > 1 Then 1
                          Else CurrentStreak
                       END,
        LongestStreak = CASE
                          When DATEDIFF(DAY, LastDate, GETDATE()) = 1 AND CurrentStreak + 1 > LongestStreak Then CurrentStreak + 1
                          When DATEDIFF(DAY, LastDate, GETDATE()) > 1 AND 1 > LongestStreak Then 1
                          Else LongestStreak
                       END,
        LastDate = GETDATE()
    Where Username = @Username

    Set @ErrorMessage = 'Review streak updated successfully.'
END

--20
CREATE PROCEDURE StartReviewStreak
    @username varchar(50)
AS
BEGIN
    SET NOCOUNT ON

    Insert Into ReviewStreak (Username, CurrentStreak, LongestStreak, LastDate)
    Values (@username, 1, 1, GETDATE())
END

--32
CREATE PROCEDURE GetTopActiveReviewers
AS
BEGIN
    SET NOCOUNT ON

    Select U.username, RS.CurrentStreak, RS.LongestStreak
    From Users U
    JOIN ReviewStreak RS 
    ON U.username = RS.Username
    ORDER BY RS.CurrentStreak Desc
END

--33
CREATE PROCEDURE GetTopPosters
AS
BEGIN
    SET NOCOUNT ON

    Select U.username, COUNT(*) AS PostCount
    From Users U
    JOIN Post_Content P 
    ON U.username = P.username
    GROUP BY U.username
    ORDER BY PostCount Desc
END




CREATE PROCEDURE AssignBadge
    @username VARCHAR(50),
    @badge VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Badges (username, badge)
    VALUES (@username, @badge)
END

--23
CREATE PROCEDURE RemoveBadge
    @username VARCHAR(50),
    @badge VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM Badges
    WHERE username = @username AND badge = @badge
END

--24
CREATE PROCEDURE GetUsersSortedByBadgeCount
AS
BEGIN
    SET NOCOUNT ON;

    SELECT U.username, COUNT(B.badge) AS BadgeCount
    FROM USERS U
    LEFT JOIN Badges B ON U.username = B.username
    GROUP BY U.username
    ORDER BY BadgeCount DESC
END

--25
CREATE PROCEDURE AddMovieToWatchlist
    @username VARCHAR(50),
    @movieID INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO WATCHLIST (username, movieID, tvID)
    VALUES (@username, @movieID, NULL)
END

--26
CREATE PROCEDURE RemoveMovieFromWatchlist
    @username VARCHAR(50),
    @movieID INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM WATCHLIST
    WHERE username = @username AND movieID = @movieID
END

--27
CREATE PROCEDURE GetWatchlistForUser
    @username VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT M.name AS MovieName, M.genre, 'Movie' AS Type
    FROM WATCHLIST W
    JOIN MOVIES M ON W.movieID = M.id
    WHERE W.username = @username

    UNION

    SELECT T.Name AS TVShowName, T.Genre, 'TV Show' AS Type
    FROM WATCHLIST W
    JOIN TVSHOWS T ON W.tvID = T.TVShow_ID
    WHERE W.username = @username
END

--28
CREATE VIEW UserWatchlistGenres
AS
SELECT W.username, M.genre
FROM WATCHLIST W
JOIN MOVIES M ON W.movieID = M.id
WHERE M.genre IS NOT NULL

UNION ALL

SELECT W.username, T.Genre
FROM WATCHLIST W
JOIN TVSHOWS T ON W.tvID = T.TVShow_ID
WHERE T.Genre IS NOT NULL;


CREATE PROCEDURE RecommendBasedOnWatchlist
    @username VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @topGenre VARCHAR(100);

    -- Get top genre from the view
    SELECT TOP 1 @topGenre = Genre
    FROM UserWatchlistGenres
    WHERE username = @username
    GROUP BY Genre
    ORDER BY COUNT(*) DESC;

    -- Recommend top 5 movies based on top genre
    SELECT TOP 5 id AS ContentID, name AS Title, genre, popularity, 'Movie' AS Type
    FROM MOVIES
    WHERE genre = @topGenre
    ORDER BY popularity DESC;

    -- Recommend top 5 TV shows based on top genre
    SELECT TOP 5 TVShow_ID AS ContentID, Name AS Title, Genre, popularity, 'TV Show' AS Type
    FROM TVSHOWS
    WHERE Genre = @topGenre
    ORDER BY popularity DESC;
END


--29
CREATE PROCEDURE GetUserPostHistory
    @username VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT postID, contentText, dateOfPost, tags
    FROM POST_CONTENT
    WHERE username = @username
    ORDER BY dateOfPost DESC
END

--30
CREATE PROCEDURE GetPostsSortedByAccountType
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.postID,
        P.username,
        (SELECT U.accountType FROM USERS U WHERE U.username = P.username) AS accountType,
        P.dateOfPost,
        P.contentText
    FROM 
        POST_CONTENT P
    ORDER BY 
        (SELECT U.accountType FROM USERS U WHERE U.username = P.username) ASC,
        P.dateOfPost DESC;
END


-- 1. Upvote a Post
CREATE PROCEDURE sp_UpvotePost
    @postID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if post exists
    IF NOT EXISTS (SELECT 1 FROM POST_CONTENT WHERE postID = @postID)
    BEGIN
        RAISERROR('Post does not exist', 16, 1);
        RETURN;
    END
    
    -- Increment upvote count
    UPDATE POST_CONTENT
    SET upvoteCount = upvoteCount + 1
    WHERE postID = @postID;
    
    SELECT 'Post upvoted successfully' AS Result;
END
GO

-- 2. Remove Upvote from a Post
CREATE PROCEDURE sp_RemovePostUpvote
    @postID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if post exists
    IF NOT EXISTS (SELECT 1 FROM POST_CONTENT WHERE postID = @postID)
    BEGIN
        RAISERROR('Post does not exist', 16, 1);
        RETURN;
    END
    
    -- Check if upvote count is already 0
    DECLARE @currentUpvotes INT;
    SELECT @currentUpvotes = upvoteCount FROM POST_CONTENT WHERE postID = @postID;
    
    IF @currentUpvotes <= 0
    BEGIN
        SELECT 'Post already has 0 upvotes' AS Result;
        RETURN;
    END
    
    -- Decrement upvote count
    UPDATE POST_CONTENT
    SET upvoteCount = upvoteCount - 1
    WHERE postID = @postID;
    
    SELECT 'Post upvote removed successfully' AS Result;
END
GO

-- 3. Post a Comment
CREATE PROCEDURE sp_PostComment
    @postID INT,
    @username VARCHAR(50),
    @commentText VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if post exists
    IF NOT EXISTS (SELECT 1 FROM POST_CONTENT WHERE postID = @postID)
    BEGIN
        RAISERROR('Post does not exist', 16, 1);
        RETURN;
    END
    
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM USERS WHERE username = @username)
    BEGIN
        RAISERROR('User does not exist', 16, 1);
        RETURN;
    END
    
    -- Insert the comment
    INSERT INTO COMMENTS (postID, username, commentText, dateOfComment)
    VALUES (@postID, @username, @commentText, GETDATE());
    
    -- Return the new comment ID
    SELECT SCOPE_IDENTITY() AS CommentID;
END
GO

-- 4. Upvote a Comment
CREATE PROCEDURE sp_UpvoteComment
    @commentID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if comment exists
    IF NOT EXISTS (SELECT 1 FROM COMMENTS WHERE commentID = @commentID)
    BEGIN
        RAISERROR('Comment does not exist', 16, 1);
        RETURN;
    END
    
    -- Increment upvote count
    UPDATE COMMENTS
    SET upvoteCount = upvoteCount + 1
    WHERE commentID = @commentID;
    
    SELECT 'Comment upvoted successfully' AS Result;
END
GO

-- 5. Remove Upvote from a Comment
CREATE PROCEDURE sp_RemoveCommentUpvote
    @commentID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if comment exists
    IF NOT EXISTS (SELECT 1 FROM COMMENTS WHERE commentID = @commentID)
    BEGIN
        RAISERROR('Comment does not exist', 16, 1);
        RETURN;
    END
    
    -- Check if upvote count is already 0
    DECLARE @currentUpvotes INT;
    SELECT @currentUpvotes = upvoteCount FROM COMMENTS WHERE commentID = @commentID;
    
    IF @currentUpvotes <= 0
    BEGIN
        SELECT 'Comment already has 0 upvotes' AS Result;
        RETURN;
    END
    
    -- Decrement upvote count
    UPDATE COMMENTS
    SET upvoteCount = upvoteCount - 1
    WHERE commentID = @commentID;
    
    SELECT 'Comment upvote removed successfully' AS Result;
END
GO

-- 6. Get Comments for a Post
CREATE PROCEDURE sp_GetPostComments
    @postID INT,
    @sortBy VARCHAR(20) = 'recent' -- 'recent' or 'top'
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if post exists
    IF NOT EXISTS (SELECT 1 FROM POST_CONTENT WHERE postID = @postID)
    BEGIN
        RAISERROR('Post does not exist', 16, 1);
        RETURN;
    END
    
    -- Get comments with sorting
    IF @sortBy = 'top'
    BEGIN
        SELECT 
            c.commentID,
            c.username,
            u.pfp,
            c.commentText,
            c.dateOfComment,
            c.upvoteCount
        FROM COMMENTS c
        JOIN USERS u ON c.username = u.username
        WHERE c.postID = @postID
        ORDER BY c.upvoteCount DESC, c.dateOfComment DESC;
    END
    ELSE
    BEGIN
        SELECT 
            c.commentID,
            c.username,
            u.pfp,
            c.commentText,
            c.dateOfComment,
            c.upvoteCount
        FROM COMMENTS c
        JOIN USERS u ON c.username = u.username
        WHERE c.postID = @postID
        ORDER BY c.dateOfComment DESC;
    END
END
GO

-- 7. Delete a Comment
CREATE PROCEDURE sp_DeleteComment
    @commentID INT,
    @username VARCHAR(50) -- User requesting deletion
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if comment exists
    IF NOT EXISTS (SELECT 1 FROM COMMENTS WHERE commentID = @commentID)
    BEGIN
        RAISERROR('Comment does not exist', 16, 1);
        RETURN;
    END
    
    -- Check if user is the comment author
    DECLARE @commentAuthor VARCHAR(50);
    SELECT @commentAuthor = username FROM COMMENTS WHERE commentID = @commentID;
    
    IF @commentAuthor <> @username
    BEGIN
        -- Check if user is admin (optional)
        DECLARE @isAdmin BIT;
        SELECT @isAdmin = CASE WHEN accountType = 'admin' THEN 1 ELSE 0 END 
        FROM USERS 
        WHERE username = @username;
        
        IF @isAdmin = 0
        BEGIN
            RAISERROR('Only the comment author or admin can delete this comment', 16, 1);
            RETURN;
        END
    END
    
    -- Delete the comment
    DELETE FROM COMMENTS
    WHERE commentID = @commentID;
    
    SELECT 'Comment deleted successfully' AS Result;
END
GO