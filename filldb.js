const express = require('express');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs module

const cors = require('cors');
const sql = require('mssql');
const axios = require('axios');

const app = express();
const port = 3001;

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static files from the uploads directory

const dbConfig = {
    user: process.env.SERVER_USER,
    password: process.env.SERVER_PASSWORD,
    server: process.env.SERVER_NAME,
    database: 'proj',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const fetchGenres = async () => {
    const response = await axios.get('https://api.themoviedb.org/3/genre/movie/list', {
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjYyZjViNmJiZjY5YTlhMTNmOWUzYTQxZGQ3YjExNyIsIm5iZiI6MTc0NjM1NTM2Mi43MjEsInN1YiI6IjY4MTc0NGEyNzhlMzI5YzJlOWY0ODJjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nn0ri6eIyjy8k12I4HkZ3Rn-VeNxVfU_eKHNDIK3lGA' // Replace with your actual API key
        }
    });
    return response.data.genres; // Returns an array of genre objects
};

let genreMap = {}; // Define genreMap globally

const initializeGenres = async () => {
    const genresList = await fetchGenres();
    genresList.forEach(genre => {
        genreMap[genre.id] = genre.name; // Create a mapping of id to name
    });
};

const updateMovieGenres = async () => {
    try {
        // Fetch genres first
        const genresList = await fetchGenres();
        const genreMap = {};
        genresList.forEach(genre => {
            genreMap[genre.id] = genre.name; // Create a mapping of id to name
        });

        // Connect to the database
        const pool = await sql.connect(dbConfig);

        // Get all movies from the MOVIES table
        const movies = await pool.request().query(`SELECT id, genre FROM MOVIES`);

        for (const movie of movies.recordset) {
            const { id, genre } = movie;
            const genreIds = genre.split(', '); // Split the genre string into an array
            const firstGenreId = genreIds[0]; // Get the first genre ID
            const firstGenreName = genreMap[firstGenreId]; // Map to the genre name

            // Update the movie's genre to the first genre name
            await pool.request()
                .input('id', sql.Int, id)
                .input('genre', sql.VarChar, firstGenreName)
                .query(`UPDATE MOVIES SET genre = @genre WHERE id = @id`);

            console.log(`Updated movie ID ${id} to genre: ${firstGenreName}`);
        }

        console.log('All movie genres updated successfully!');
    } catch (error) {
        console.error('Error updating movie genres:', error);
    }
};

const updateMovieDetails = async () => {
    try {
        // Connect to the database
        const pool = await sql.connect(dbConfig);

        // Get all movies from the MOVIES table
        const movies = await pool.request().query(`SELECT id, name FROM MOVIES`);

        for (const movie of movies.recordset) {
            const { id, name } = movie;

            // Search for the movie by name in TMDB
            try {
                const searchResponse = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
                    headers: {
                        accept: 'application/json',
                        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjYyZjViNmJiZjY5YTlhMTNmOWUzYTQxZGQ3YjExNyIsIm5iZiI6MTc0NjM1NTM2Mi43MjEsInN1YiI6IjY4MTc0NGEyNzhlMzI5YzJlOWY0ODJjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nn0ri6eIyjy8k12I4HkZ3Rn-VeNxVfU_eKHNDIK3lGA' // Replace with your actual API key
                    },
                    params: {
                        query: name,
                    },
                });

                // Check if any results were returned
                if (searchResponse.data.results.length > 0) {
                    const movieDetails = searchResponse.data.results[0]; // Get the first result

                    // Extract the required fields
                    const popularity = movieDetails.popularity;
                    const releaseYear = movieDetails.release_date.split('-')[0]; // Get the year from the release date
                    const description = movieDetails.overview;

                    // Check if credits exist and get the director's name
                    const director = movieDetails.credits?.crew?.find(crewMember => crewMember.job === 'Director')?.name || 'Unknown'; // Use optional chaining

                    const rating = movieDetails.vote_average;

                    // Update the movie details in the database
                    await pool.request()
                        .input('id', sql.Int, id)
                        .input('popularity', sql.Float, popularity)
                        .input('release_year', sql.Int, releaseYear)
                        .input('description', sql.VarChar, description)
                        .input('director', sql.VarChar, director)
                        .input('rating', sql.Float, rating)
                        .query(`UPDATE MOVIES SET popularity = @popularity, release_year = @release_year, description = @description, director = @director, rating = @rating WHERE id = @id`);

                    console.log(`Updated movie ID ${id} with additional details.`);
                } else {
                    console.log(`No results found for movie: ${name}. Skipping...`);
                }
            } catch (error) {
                console.error(`Error searching for movie "${name}":`, error);
            }
        }

        console.log('All movie details processed successfully!');
    } catch (error) {
        console.error('Error updating movie details:', error);
    }
};

const fetchMovies = async () => {
    try {
        await initializeGenres(); // Ensure genres are initialized before fetching movies
        let currentPage = 1;
        let totalPages = 1;

        const pool = await sql.connect(dbConfig);

        while (currentPage <= totalPages) {
            const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?page=${currentPage}`, {
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjYyZjViNmJiZjY5YTlhMTNmOWUzYTQxZGQ3YjExNyIsIm5iZiI6MTc0NjM1NTM2Mi43MjEsInN1YiI6IjY4MTc0NGEyNzhlMzI5YzJlOWY0ODJjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nn0ri6eIyjy8k12I4HkZ3Rn-VeNxVfU_eKHNDIK3lGA' // Replace with your actual API key
                }
            });

            const movies = response.data.results;
            totalPages = response.data.total_pages;

            for (const movie of movies) {
                const { title, genre_ids, poster_path } = movie;
                const genres = genre_ids.map(id => genreMap[id]).join(', ');
                const posterUrl = `https://image.tmdb.org/t/p/w500${poster_path}`;

                const existingMovie = await pool.request()
                    .input('name', sql.VarChar, title)
                    .query(`SELECT COUNT(*) AS count FROM MOVIES WHERE name = @name`);

                if (existingMovie.recordset[0].count === 0) {
                    await pool.request()
                        .input('name', sql.VarChar, title)
                        .input('genre', sql.VarChar, genres)
                        .input('posters', sql.VarChar, posterUrl)
                        .query(`INSERT INTO MOVIES (name, genre, posters) VALUES (@name, @genre, @posters)`);
                    console.log(`Inserted movie: ${title}`);
                } else {
                    console.log(`Movie already exists: ${title}`);
                }
            }

            console.log(`Processed movies from page ${currentPage}`);
            currentPage++;
        }

        console.log('All movies processed successfully!');
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
};

const fetchTVShows = async () => {
    try {
        // Fetch genres first
        const genresList = await fetchGenres();
        const genreMap = {};
        genresList.forEach(genre => {
            genreMap[genre.id] = genre.name; // Create a mapping of id to name
        });

        let currentPage = 1;
        let totalPages = 1;

        const pool = await sql.connect(dbConfig);

        while (currentPage <= totalPages) {
            const response = await axios.get(`https://api.themoviedb.org/3/tv/popular?page=${currentPage}`, {
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjYyZjViNmJiZjY5YTlhMTNmOWUzYTQxZGQ3YjExNyIsIm5iZiI6MTc0NjM1NTM2Mi43MjEsInN1YiI6IjY4MTc0NGEyNzhlMzI5YzJlOWY0ODJjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nn0ri6eIyjy8k12I4HkZ3Rn-VeNxVfU_eKHNDIK3lGA' // Replace with your actual API key
                }
            });

            const tvShows = response.data.results;
            totalPages = response.data.total_pages;

            for (const show of tvShows) {
                const { id, name, genre_ids, poster_path, popularity, vote_average } = show;
                const posterUrl = `https://image.tmdb.org/t/p/w500${poster_path}`;

                // Fetch detailed information for each show
                const detailsResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
                    headers: {
                        accept: 'application/json',
                        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjYyZjViNmJiZjY5YTlhMTNmOWUzYTQxZGQ3YjExNyIsIm5iZiI6MTc0NjM1NTM2Mi43MjEsInN1YiI6IjY4MTc0NGEyNzhlMzI5YzJlOWY0ODJjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nn0ri6eIyjy8k12I4HkZ3Rn-VeNxVfU_eKHNDIK3lGA' // Replace with your actual API key
                }
            });

                const detailedShow = detailsResponse.data;
                const number_of_seasons = detailedShow.number_of_seasons || 0; // Default to 0 if missing
                const number_of_episodes = detailedShow.number_of_episodes || 0; // Default to 0 if missing

                // Get the first genre ID and map it to its name
                const firstGenreId = genre_ids[0]; // Get the first genre ID
                const genre = genreMap[firstGenreId] || 'Unknown'; // Map to the genre name or default to 'Unknown'

                const existingShow = await pool.request()
                    .input('name', sql.VarChar, name)
                    .query(`SELECT COUNT(*) AS count FROM TVSHOWS WHERE name = @name`);

                if (existingShow.recordset[0].count === 0) {
                    await pool.request()
                        .input('name', sql.VarChar, name)
                        .input('genre', sql.VarChar, genre) // Insert only the first genre
                        .input('posters', sql.VarChar, posterUrl)
                        .input('popularity', sql.Float, popularity)
                        .input('rating', sql.Float, vote_average)
                        .input('seasons', sql.Int, number_of_seasons)
                        .input('episodes', sql.Int, number_of_episodes)
                        .input('description', sql.VarChar, detailedShow.overview || '') // Use overview if available
                        .query(`INSERT INTO TVSHOWS (name, genre, posters, popularity, rating, seasons, episodes, description) VALUES (@name, @genre, @posters, @popularity, @rating, @seasons, @episodes, @description)`);
                    console.log(`Inserted TV show: ${name}`);
                } else {
                    console.log(`TV show already exists: ${name}`);
                }
            }

            console.log(`Processed TV shows from page ${currentPage}`);
            currentPage++;
        }

        console.log('All TV shows processed successfully!');
    } catch (error) {
        console.error('Error fetching TV shows:', error);
    }
};

// Call the fetchMovies function
//fetchMovies();
// Call the updateMovieGenres function
//updateMovieGenres();
// Call the updateMovieDetails function
// updateMovieDetails(); // Uncomment this line to run the function
// Call the fetchTVShows function
//fetchTVShows(); // Uncomment this line to run the function

app.get('/', (req, res) => {
    res.send('API is working!');
});

app.get('/api/movies', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM movies');
        res.send(result.recordset);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/tvshows', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM TVSHOWS');
        res.send(result.recordset); // Send the TV shows as a JSON response
    } catch (error) {
        console.error('Error fetching TV shows:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Configure multer for file uploads (keep only one instance)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Register endpoint
app.post('/api/register', upload.single('profilePicture'), async (req, res) => {
    const { username, email, password, bio, accountType } = req.body;
    const profilePicturePath = req.file ? req.file.path.replace(/\\/g, '/').slice(9) : null; // Normalize path for URL

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar(50), username)
            .input('email', sql.VarChar(100), email)
            .input('password', sql.VarChar(100), password)
            .input('bio', sql.VarChar(sql.MAX), bio)
            .input('accountType', sql.VarChar(sql.MAX), accountType)
            .input('pfp', sql.VarChar(sql.MAX), profilePicturePath) // Save the normalized path
            .execute('sp_RegisterUser'); // Call your stored procedure

        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .input('password', sql.VarChar(100), password)
            .query('SELECT * FROM USERS WHERE username = @username AND password = @password');

        if (result.recordset.length > 0) {
            // User found, return user data (excluding password)
            const user = result.recordset[0];
            const profilePicturePath = user.pfp ? `http://localhost:3001${user.pfp}` : null; // Use the relative path
            res.status(200).json({
                username: user.username,
                email: user.email,
                bio: user.bio,
                pfp: profilePicturePath // Return the profile picture path as a URL
            });
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get user's watchlist
app.get('/api/watchlist/:username', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar, req.params.username)
            .execute('GetWatchlistForUser3');

        // Transform the data to match the frontend expectations
        const watchlistItems = result.recordset.map(item => ({
            id: parseInt(item.id, 10), // Ensure ID is a number
            title: item.name || item.Name,
            type: item.Type.toLowerCase(),
            poster: item.posters,
            genre: item.genre,
            rating: item.rating || 0,
            description: item.description || '',
            year: item.release_year || '',
            director: item.director || ''
        }));

        res.json(watchlistItems);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add movie to watchlist
app.post('/api/watchlist/movie', async (req, res) => {
    try {
        const { username, movieId } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('AddMovieToWatchlist');
        res.status(200).send('Movie added to watchlist');
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Remove movie from watchlist
app.delete('/api/watchlist/movie/:username/:movieId', async (req, res) => {
    try {
        const { username, movieId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('RemoveMovieFromWatchlist');

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

app.delete('/api/watchlist/tvshow/:username/:tvShowId', async (req, res) => {
    try {
        const { username, tvShowId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('tvShowID', sql.Int, tvShowId)
            .query(`
                DELETE FROM WATCHLIST
                WHERE username = @username AND tvID = @tvShowID
            `);

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

// Add endpoint for getting recommendations based on watchlist
app.get('/api/recommendations/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .execute('RecommendBasedOnWatchlist');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for getting user's post history
app.get('/api/posts/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .execute('GetUserPostHistory');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for getting posts sorted by account type
app.get('/api/posts/sorted', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .execute('GetPostsSortedByAccountType');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching sorted posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for getting post comments
app.get('/api/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const { sortBy = 'recent' } = req.query;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('postID', sql.Int, parseInt(postId))
            .input('sortBy', sql.VarChar(20), sortBy)
            .execute('sp_GetPostComments');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching post comments:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for posting a comment
app.post('/api/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const { username, commentText } = req.body;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('postID', sql.Int, parseInt(postId))
            .input('username', sql.VarChar(50), username)
            .input('commentText', sql.VarChar(sql.MAX), commentText)
            .execute('sp_PostComment');
        res.json({ commentId: result.recordset[0].CommentID });
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for deleting a comment
app.delete('/api/comments/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { username } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('commentID', sql.Int, parseInt(commentId))
            .input('username', sql.VarChar(50), username)
            .execute('sp_DeleteComment');
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add watchlist endpoints
app.post('/api/watchlist/add', async (req, res) => {
    try {
        const { username, movieID, tvShowID } = req.body;
        const pool = await sql.connect(dbConfig);

        if (movieID) {
            // Call stored procedure for adding movie to watchlist
            await pool.request()
                .input('username', sql.VarChar, username)
                .input('movieID', sql.Int, movieID)
                .query(`
                    INSERT INTO WATCHLIST (username, movieID, tvID)
                    VALUES (@username, @movieID, NULL)
                    `);
        } else if (tvShowID) {
            // Add TV show to watchlist
            await pool.request()
                .input('username', sql.VarChar, username)
                .input('tvShowID', sql.Int, tvShowID)
                .query(`
                    INSERT INTO WATCHLIST (username, movieID, tvID)
                    VALUES (@username, NULL, @tvShowID)
                `);
        }

        res.json({ message: 'Added to watchlist successfully' });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

app.get('/api/watchlist/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);

        // Get both movies and TV shows from watchlist
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .execute('GetWatchlistForUser');

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

// Add delete endpoint for watchlist
app.delete('/api/watchlist/:username/:movieId', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, req.params.username)
            .input('movieID', sql.Int, req.params.movieId)
            .execute('RemoveMovieFromWatchlist');
        
        res.status(200).json({ message: 'Movie removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing movie from watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add movie to watchlist
app.post('/api/watchlist/movie', async (req, res) => {
    try {
        const { username, movieId } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('AddMovieToWatchlist');
        res.status(200).send('Movie added to watchlist');
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Remove movie from watchlist
app.delete('/api/watchlist/movie/:username/:movieId', async (req, res) => {
    try {
        const { username, movieId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('RemoveMovieFromWatchlist');

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

app.delete('/api/watchlist/tvshow/:username/:tvShowId', async (req, res) => {
    try {
        const { username, tvShowId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('tvShowID', sql.Int, tvShowId)
            .query(`
                DELETE FROM WATCHLIST
                WHERE username = @username AND tvID = @tvShowID
            `);

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

// Get all users (for search)
app.get('/api/users', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT username, email, pfp, bio FROM USERS');
        res.send(result.recordset);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add friend endpoint
app.post('/api/friends/add', async (req, res) => {
    try {
        const { username, friendUsername } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('friendUsername', sql.VarChar, friendUsername)
            .execute('sp_AddFriend');
        res.status(200).send('Friend added successfully');
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).send(error.message || 'Internal Server Error');
    }
});

// Remove friend endpoint
app.delete('/api/friends/remove', async (req, res) => {
    try {
        const { username, friendUsername } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('friendUsername', sql.VarChar, friendUsername)
            .execute('sp_RemoveFriend');
        res.status(200).send('Friend removed successfully');
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).send(error.message || 'Internal Server Error');
    }
});

// Get friends list
app.get('/api/friends/:username', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar, req.params.username)
            .execute('sp_GetFriendList');
        res.send(result.recordset);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Get user's posts endpoint
app.get('/api/posts', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const { searchTerm, username, movieId, tvShowId, tag } = req.query;

        // Call the stored procedure with optional parameters
        const result = await pool.request()
            .input('searchTerm', sql.VarChar, searchTerm || null)
            .input('username', sql.VarChar, username || null)
            .input('movieID', sql.Int, movieId ? parseInt(movieId) : null)
            .input('tvShowID', sql.Int, tvShowId ? parseInt(tvShowId) : null)
            .input('tag', sql.VarChar, tag || null)
            
            .execute('sp_SearchPosts');

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint to create a new post
app.post('/api/posts', async (req, res) => {
    try {
        const { username, contentText, movieId, tvShowId, tags, pollId, title } = req.body;
        const pool = await sql.connect(dbConfig);

        // Ensure tags is a string or null
        const sanitizedTags = tags ? String(tags).trim() : null;

        // First call the stored procedure to create a post
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('contentText', sql.VarChar, contentText)
            .input('media', sql.VarBinary, null)
            .input('pollID', sql.Int, pollId || null)
            .input('movieID', sql.Int, movieId || null)
            .input('tvShowID', sql.Int, tvShowId || null)
            .input('tags', sql.VarChar(500), sanitizedTags)
            .execute('sp_CreatePost');

        const postId = result.recordset[0].PostID;

        // Then update the title for the newly created post
        await pool.request()
            .input('postID', sql.Int, postId)
            .input('title', sql.VarChar(200), title || 'Untitled')
            .query('UPDATE POST_CONTENT SET title = @title WHERE postID = @postID');

        res.json({ postId: postId });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint to delete a post
app.delete('/api/posts/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const pool = await sql.connect(dbConfig);

        // Call the stored procedure to delete the post
        await pool.request()
            .input('postID', sql.Int, parseInt(postId))
            .execute('sp_DeletePost');

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoints for post interactions (upvotes)
app.post('/api/posts/:postId/upvote', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, vote } = req.body;
        const pool = await sql.connect(dbConfig);

        // Call the appropriate stored procedure based on vote type
        
            await pool.request()
                .input('postID', sql.Int, parseInt(postId))
                
                .execute('sp_UpvotePost');
        

        // Get updated upvote count
        const result = await pool.request()
            .input('postID', sql.Int, parseInt(postId))
            .query(`
                SELECT upvoteCount from POST_CONTENT
                WHERE postID = @postID
            `);

        // Get user's current vote status
       

        res.json({
            upvoteCount: result.recordset[0].upvoteCount,
            userVote: 1 // Assuming user voted up
        });
    } catch (error) {
        console.error('Error handling post vote:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/posts/:postId/removeupvote', async (req, res) => {
    try {
        const { postId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('postID', sql.Int, parseInt(postId))
            .execute('sp_RemovePostUpvote');

            const result = await pool.request()
            .input('postID', sql.Int, parseInt(postId))
            .query(`
                SELECT upvoteCount from POST_CONTENT
                WHERE postID = @postID
            `);

            res.json({
                upvoteCount: result.recordset[0].upvoteCount,
                userVote: 0 // Assuming user voted up
            });
    } catch (error) {
        console.error('Error removing post upvote:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Register endpoint
app.post('/api/register', upload.single('profilePicture'), async (req, res) => {
    const { username, email, password, bio, accountType } = req.body;
    const profilePicturePath = req.file ? req.file.path.replace(/\\/g, '/').slice(9) : null; // Normalize path for URL

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar(50), username)
            .input('email', sql.VarChar(100), email)
            .input('password', sql.VarChar(100), password)
            .input('bio', sql.VarChar(sql.MAX), bio)
            .input('accountType', sql.VarChar(sql.MAX), accountType)
            .input('pfp', sql.VarChar(sql.MAX), profilePicturePath) // Save the normalized path
            .execute('sp_RegisterUser'); // Call your stored procedure

        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .input('password', sql.VarChar(100), password)
            .query('SELECT * FROM USERS WHERE username = @username AND password = @password');

        if (result.recordset.length > 0) {
            // User found, return user data (excluding password)
            const user = result.recordset[0];
            const profilePicturePath = user.pfp ? `http://localhost:3001${user.pfp}` : null; // Use the relative path
            res.status(200).json({
                username: user.username,
                email: user.email,
                bio: user.bio,
                pfp: profilePicturePath // Return the profile picture path as a URL
            });
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add watchlist endpoints
app.post('/api/watchlist/add', async (req, res) => {
    try {
        const { username, movieID, tvShowID } = req.body;
        const pool = await sql.connect(dbConfig);

        if (movieID) {
            // Call stored procedure for adding movie to watchlist
            await pool.request()
                .input('username', sql.VarChar, username)
                .input('movieID', sql.Int, movieID)
                .execute('AddMovieToWatchlist');
        } else if (tvShowID) {
            // Add TV show to watchlist
            await pool.request()
                .input('username', sql.VarChar, username)
                .input('tvShowID', sql.Int, tvShowID)
                .query(`
                    INSERT INTO WATCHLIST (username, movieID, tvID)
                    VALUES (@username, NULL, @tvShowID)
                `);
        }

        res.json({ message: 'Added to watchlist successfully' });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

app.get('/api/watchlist/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);

        // Get both movies and TV shows from watchlist
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .execute('GetWatchlistForUser');

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

// Add delete endpoint for watchlist
app.delete('/api/watchlist/:username/:movieId', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, req.params.username)
            .input('movieID', sql.Int, req.params.movieId)
            .execute('RemoveMovieFromWatchlist');
        
        res.status(200).json({ message: 'Movie removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing movie from watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add movie to watchlist
app.post('/api/watchlist/movie', async (req, res) => {
    try {
        const { username, movieId } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('AddMovieToWatchlist');
        res.status(200).send('Movie added to watchlist');
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Remove movie from watchlist
app.delete('/api/watchlist/movie/:username/:movieId', async (req, res) => {
    try {
        const { username, movieId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('RemoveMovieFromWatchlist');

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

app.delete('/api/watchlist/tvshow/:username/:tvShowId', async (req, res) => {
    try {
        const { username, tvShowId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('tvShowID', sql.Int, tvShowId)
            .query(`
                DELETE FROM WATCHLIST
                WHERE username = @username AND tvID = @tvShowID
            `);

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

// Add endpoint for getting recommendations based on watchlist
app.get('/api/recommendations/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .execute('RecommendBasedOnWatchlist');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for getting user's post history
app.get('/api/posts/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .execute('GetUserPostHistory');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for getting posts sorted by account type
app.get('/api/posts/sorted', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .execute('GetPostsSortedByAccountType');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching sorted posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for getting post comments
app.get('/api/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const { sortBy = 'recent' } = req.query;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('postID', sql.Int, parseInt(postId))
            .input('sortBy', sql.VarChar(20), sortBy)
            .execute('sp_GetPostComments');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching post comments:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for posting a comment
app.post('/api/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const { username, commentText } = req.body;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('postID', sql.Int, parseInt(postId))
            .input('username', sql.VarChar(50), username)
            .input('commentText', sql.VarChar(sql.MAX), commentText)
            .execute('sp_PostComment');
        res.json({ commentId: result.recordset[0].CommentID });
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for deleting a comment
app.delete('/api/comments/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { username } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('commentID', sql.Int, parseInt(commentId))
            .input('username', sql.VarChar(50), username)
            .execute('sp_DeleteComment');
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add watchlist endpoints
app.post('/api/watchlist/add', async (req, res) => {
    try {
        const { username, movieID, tvShowID } = req.body;
        const pool = await sql.connect(dbConfig);

        if (movieID) {
            // Call stored procedure for adding movie to watchlist
            await pool.request()
                .input('username', sql.VarChar, username)
                .input('movieID', sql.Int, movieID)
                .execute('AddMovieToWatchlist');
        } else if (tvShowID) {
            // Add TV show to watchlist
            await pool.request()
                .input('username', sql.VarChar, username)
                .input('tvShowID', sql.Int, tvShowID)
                .query(`
                    INSERT INTO WATCHLIST (username, movieID, tvID)
                    VALUES (@username, NULL, @tvShowID)
                `);
        }

        res.json({ message: 'Added to watchlist successfully' });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

app.get('/api/watchlist/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);

        // Get both movies and TV shows from watchlist
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .execute('GetWatchlistForUser');

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

// Add delete endpoint for watchlist
app.delete('/api/watchlist/:username/:movieId', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, req.params.username)
            .input('movieID', sql.Int, req.params.movieId)
            .execute('RemoveMovieFromWatchlist');
        
        res.status(200).json({ message: 'Movie removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing movie from watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add movie to watchlist
app.post('/api/watchlist/movie', async (req, res) => {
    try {
        const { username, movieId } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('AddMovieToWatchlist');
        res.status(200).send('Movie added to watchlist');
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Remove movie from watchlist
app.delete('/api/watchlist/movie/:username/:movieId', async (req, res) => {
    try {
        const { username, movieId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('RemoveMovieFromWatchlist');

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

app.delete('/api/watchlist/tvshow/:username/:tvShowId', async (req, res) => {
    try {
        const { username, tvShowId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('tvShowID', sql.Int, tvShowId)
            .query(`
                DELETE FROM WATCHLIST
                WHERE username = @username AND tvID = @tvShowID
            `);

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

// Get all users (for search)
app.get('/api/users', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT username, email, pfp, bio FROM USERS');
        res.send(result.recordset);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add friend endpoint
app.post('/api/friends/add', async (req, res) => {
    try {
        const { username, friendUsername } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('friendUsername', sql.VarChar, friendUsername)
            .execute('sp_AddFriend');
        res.status(200).send('Friend added successfully');
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).send(error.message || 'Internal Server Error');
    }
});

// Remove friend endpoint
app.delete('/api/friends/remove', async (req, res) => {
    try {
        const { username, friendUsername } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('friendUsername', sql.VarChar, friendUsername)
            .execute('sp_RemoveFriend');
        res.status(200).send('Friend removed successfully');
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).send(error.message || 'Internal Server Error');
    }
});

// Get friends list
app.get('/api/friends/:username', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar, req.params.username)
            .execute('sp_GetFriendList');
        res.send(result.recordset);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Get user's posts endpoint
app.get('/api/posts/:username', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar, req.params.username)
            .query(`
                SELECT * FROM POST_CONTENT 
                WHERE username = @username 
                ORDER BY dateOfPost DESC
            `);
        
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: 'Error fetching user posts' });
    }
});

app.get('/api/posts/:username/count', async (req, res) => {
    try {
      const { username } = req.params;
      const query = `
        SELECT COUNT(*) as postCount 
        FROM post_content 
        WHERE username = @username
      `;
      
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .query(query);
        
      res.json({ count: result.recordset[0].postCount });
    } catch (error) {
      console.error('Error counting posts:', error);
      res.status(500).json({ error: 'Failed to count posts' });
    }
  });

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        p.*,
        u.username as author,
        u.pfp as authorAvatar,
        (SELECT COUNT(*) FROM POST_VOTES WHERE postID = p.postID AND voteType = 'up') as upvotes,
        (SELECT COUNT(*) FROM POST_VOTES WHERE postID = p.postID AND voteType = 'down') as downvotes
      FROM POST_CONTENT p
      JOIN USERS u ON p.username = u.username
      ORDER BY p.dateOfPost DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const pool = await sql.connect(dbConfig);
    
    const result = await pool.request()
      .input('title', sql.VarChar, title)
      .input('content', sql.VarChar, content)
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO POST_CONTENT (title, contentText, username, dateOfPost)
        OUTPUT INSERTED.*
        VALUES (@title, @content, (SELECT username FROM USERS WHERE id = @userId), GETDATE())
      `);
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vote on a post
app.post('/api/posts/:postId/vote', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, vote } = req.body;
    const pool = await sql.connect(dbConfig);

    // Check if user has already voted
    const existingVote = await pool.request()
      .input('postId', sql.Int, postId)
      .input('userId', sql.Int, userId)
      .query('SELECT voteType FROM POST_VOTES WHERE postID = @postId AND userID = @userId');

    if (existingVote.recordset.length > 0) {
      // Update existing vote
      await pool.request()
        .input('postId', sql.Int, postId)
        .input('userId', sql.Int, userId)
        .input('voteType', sql.VarChar, vote)
        .query('UPDATE POST_VOTES SET voteType = @voteType WHERE postID = @postId AND userID = @userId');
    } else {
      // Create new vote
      await pool.request()
        .input('postId', sql.Int, postId)
        .input('userId', sql.Int, userId)
        .input('voteType', sql.VarChar, vote)
        .query('INSERT INTO POST_VOTES (postID, userID, voteType) VALUES (@postId, @userId, @voteType)');
    }

    // Get updated vote counts
    const voteCounts = await pool.request()
      .input('postId', sql.Int, postId)
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM POST_VOTES WHERE postID = @postId AND voteType = 'up') as upvotes,
          (SELECT COUNT(*) FROM POST_VOTES WHERE postID = @postId AND voteType = 'down') as downvotes
      `);

    res.json({
      ...voteCounts.recordset[0],
      userVote: vote
    });
  } catch (error) {
    console.error('Error voting on post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a comment to a post
// Add comment endpoints
app.post('/api/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const { username, commentText } = req.body;

        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('postID', sql.Int, postId)
            .input('username', sql.VarChar, username)
            .input('commentText', sql.VarChar, commentText)
            .execute('sp_PostComment');

        const commentId = result.recordset[0].CommentID;
        
        // Fetch the newly created comment
        const commentResult = await pool.request()
            .input('postID', sql.Int, postId)
            .execute('sp_GetPostComments');

        const newComment = commentResult.recordset.find(comment => comment.commentID === commentId);
        res.json(newComment);
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).json({ error: 'Failed to post comment' });
    }
});



app.post('/api/comments/:commentId/removeupvote', async (req, res) => {
    try {
        const { commentId } = req.params;
        
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('commentID', sql.Int, commentId)
            .execute('sp_RemoveCommentUpvote');

        res.json({ message: 'Comment upvote removed successfully' });
    } catch (error) {
        console.error('Error removing comment upvote:', error);
        res.status(500).json({ error: 'Failed to remove comment upvote' });
    }
});



// Register endpoint
app.post('/api/register', upload.single('profilePicture'), async (req, res) => {
    const { username, email, password, bio, accountType } = req.body;
    const profilePicturePath = req.file ? req.file.path.replace(/\\/g, '/').slice(9) : null; // Normalize path for URL

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar(50), username)
            .input('email', sql.VarChar(100), email)
            .input('password', sql.VarChar(100), password)
            .input('bio', sql.VarChar(sql.MAX), bio)
            .input('accountType', sql.VarChar(sql.MAX), accountType)
            .input('pfp', sql.VarChar(sql.MAX), profilePicturePath) // Save the normalized path
            .execute('sp_RegisterUser'); // Call your stored procedure

        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .input('password', sql.VarChar(100), password)
            .query('SELECT * FROM USERS WHERE username = @username AND password = @password');

        if (result.recordset.length > 0) {
            // User found, return user data (excluding password)
            const user = result.recordset[0];
            const profilePicturePath = user.pfp ? `http://localhost:3001${user.pfp}` : null; // Use the relative path
            res.status(200).json({
                username: user.username,
                email: user.email,
                bio: user.bio,
                pfp: profilePicturePath // Return the profile picture path as a URL
            });
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/posts/:postId/comments', async (req, res) => {
    try {
      const { postId } = req.params;
      const { sortBy = 'recent' } = req.query;
      
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('postID', sql.Int, postId)
        .input('sortBy', sql.VarChar(20), sortBy)
        .execute('sp_GetPostComments');
        
      res.json(result.recordset);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

// Add watchlist endpoints
app.post('/api/watchlist/add', async (req, res) => {
    try {
        const { username, movieID, tvShowID } = req.body;
        const pool = await sql.connect(dbConfig);

        if (movieID) {
            // Call stored procedure for adding movie to watchlist
            await pool.request()
                .input('username', sql.VarChar, username)
                .input('movieID', sql.Int, movieID)
                .execute('AddMovieToWatchlist');
        } else if (tvShowID) {
            // Add TV show to watchlist
            await pool.request()
                .input('username', sql.VarChar, username)
                .input('tvShowID', sql.Int, tvShowID)
                .query(`
                    INSERT INTO WATCHLIST (username, movieID, tvID)
                    VALUES (@username, NULL, @tvShowID)
                `);
        }

        res.json({ message: 'Added to watchlist successfully' });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

app.get('/api/watchlist/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);

        // Get both movies and TV shows from watchlist
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .execute('GetWatchlistForUser');

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

// Add delete endpoint for watchlist
app.delete('/api/watchlist/:username/:movieId', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, req.params.username)
            .input('movieID', sql.Int, req.params.movieId)
            .execute('RemoveMovieFromWatchlist');
        
        res.status(200).json({ message: 'Movie removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing movie from watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add movie to watchlist
app.post('/api/watchlist/movie', async (req, res) => {
    try {
        const { username, movieId } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('AddMovieToWatchlist');
        res.status(200).send('Movie added to watchlist');
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Remove movie from watchlist
app.delete('/api/watchlist/movie/:username/:movieId', async (req, res) => {
    try {
        const { username, movieId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('RemoveMovieFromWatchlist');

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

app.delete('/api/watchlist/tvshow/:username/:tvShowId', async (req, res) => {
    try {
        const { username, tvShowId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('tvShowID', sql.Int, tvShowId)
            .query(`
                DELETE FROM WATCHLIST
                WHERE username = @username AND tvID = @tvShowID
            `);

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

// Add endpoint for getting recommendations based on watchlist
app.get('/api/recommendations/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .execute('RecommendBasedOnWatchlist');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for getting user's post history
app.get('/api/posts/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .execute('GetUserPostHistory');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for getting posts sorted by account type
app.get('/api/posts/sorted', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .execute('GetPostsSortedByAccountType');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching sorted posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for getting post comments
app.get('/api/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const { sortBy = 'recent' } = req.query;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('postID', sql.Int, parseInt(postId))
            .input('sortBy', sql.VarChar(20), sortBy)
            .execute('sp_GetPostComments');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching post comments:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for posting a comment
app.post('/api/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const { username, commentText } = req.body;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('postID', sql.Int, parseInt(postId))
            .input('username', sql.VarChar(50), username)
            .input('commentText', sql.VarChar(sql.MAX), commentText)
            .execute('sp_PostComment');
        res.json({ commentId: result.recordset[0].CommentID });
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for deleting a comment
app.delete('/api/comments/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { username } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('commentID', sql.Int, parseInt(commentId))
            .input('username', sql.VarChar(50), username)
            .execute('sp_DeleteComment');
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add watchlist endpoints
app.post('/api/watchlist/add', async (req, res) => {
    try {
        const { username, movieID, tvShowID } = req.body;
        const pool = await sql.connect(dbConfig);

        if (movieID) {
            // Call stored procedure for adding movie to watchlist
            await pool.request()
                .input('username', sql.VarChar, username)
                .input('movieID', sql.Int, movieID)
                .execute('AddMovieToWatchlist');
        } else if (tvShowID) {
            // Add TV show to watchlist
            await pool.request()
                .input('username', sql.VarChar, username)
                .input('tvShowID', sql.Int, tvShowID)
                .query(`
                    INSERT INTO WATCHLIST (username, movieID, tvID)
                    VALUES (@username, NULL, @tvShowID)
                `);
        }

        res.json({ message: 'Added to watchlist successfully' });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

app.get('/api/watchlist/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);

        // Get both movies and TV shows from watchlist
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .execute('GetWatchlistForUser');

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

// Add delete endpoint for watchlist
app.delete('/api/watchlist/:username/:movieId', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, req.params.username)
            .input('movieID', sql.Int, req.params.movieId)
            .execute('RemoveMovieFromWatchlist');
        
        res.status(200).json({ message: 'Movie removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing movie from watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add movie to watchlist
app.post('/api/watchlist/movie', async (req, res) => {
    try {
        const { username, movieId } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('AddMovieToWatchlist');
        res.status(200).send('Movie added to watchlist');
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Remove movie from watchlist
app.delete('/api/watchlist/movie/:username/:movieId', async (req, res) => {
    try {
        const { username, movieId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('RemoveMovieFromWatchlist');

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

app.delete('/api/watchlist/tvshow/:username/:tvShowId', async (req, res) => {
    try {
        const { username, tvShowId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('tvShowID', sql.Int, tvShowId)
            .query(`
                DELETE FROM WATCHLIST
                WHERE username = @username AND tvID = @tvShowID
            `);

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

// Get all users (for search)
app.get('/api/users', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT username, email, pfp, bio FROM USERS');
        res.send(result.recordset);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add friend endpoint
app.post('/api/friends/add', async (req, res) => {
    try {
        const { username, friendUsername } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('friendUsername', sql.VarChar, friendUsername)
            .execute('sp_AddFriend');
        res.status(200).send('Friend added successfully');
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).send(error.message || 'Internal Server Error');
    }
});

// Remove friend endpoint
app.delete('/api/friends/remove', async (req, res) => {
    try {
        const { username, friendUsername } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('friendUsername', sql.VarChar, friendUsername)
            .execute('sp_RemoveFriend');
        res.status(200).send('Friend removed successfully');
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).send(error.message || 'Internal Server Error');
    }
});

// Get friends list
app.get('/api/friends/:username', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar, req.params.username)
            .execute('sp_GetFriendList');
        res.send(result.recordset);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Get user's posts endpoint
app.get('/api/posts/:username', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar, req.params.username)
            .query(`
                SELECT * FROM POST_CONTENT 
                WHERE username = @username 
                ORDER BY dateOfPost DESC
            `);
        
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: 'Error fetching user posts' });
    }
});

app.get('/api/posts/:username/count', async (req, res) => {
    try {
      const { username } = req.params;
      const query = `
        SELECT COUNT(*) as postCount 
        FROM post_content 
        WHERE username = @username
      `;
      
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .query(query);
        
      res.json({ count: result.recordset[0].postCount });
    } catch (error) {
      console.error('Error counting posts:', error);
      res.status(500).json({ error: 'Failed to count posts' });
    }
  });

// Add watchlist endpoints
app.post('/api/watchlist/add', async (req, res) => {
    try {
        const { username, movieID, tvShowID } = req.body;
        const pool = await sql.connect(dbConfig);

        if (movieID) {
            // Call stored procedure for adding movie to watchlist
            await pool.request()
                .input('username', sql.VarChar, username)
                .input('movieID', sql.Int, movieID)
                .execute('AddMovieToWatchlist');
        } else if (tvShowID) {
            // Add TV show to watchlist
            await pool.request()
                .input('username', sql.VarChar, username)
                .input('tvShowID', sql.Int, tvShowID)
                .query(`
                    INSERT INTO WATCHLIST (username, movieID, tvID)
                    VALUES (@username, NULL, @tvShowID)
                `);
        }

        res.json({ message: 'Added to watchlist successfully' });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

app.get('/api/watchlist/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);

        // Get both movies and TV shows from watchlist
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .execute('GetWatchlistForUser');

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

// Add delete endpoint for watchlist
app.delete('/api/watchlist/:username/:movieId', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, req.params.username)
            .input('movieID', sql.Int, req.params.movieId)
            .execute('RemoveMovieFromWatchlist');
        
        res.status(200).json({ message: 'Movie removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing movie from watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add movie to watchlist
app.post('/api/watchlist/movie', async (req, res) => {
    try {
        const { username, movieId } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('AddMovieToWatchlist');
        res.status(200).send('Movie added to watchlist');
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Remove movie from watchlist
app.delete('/api/watchlist/movie/:username/:movieId', async (req, res) => {
    try {
        const { username, movieId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('movieID', sql.Int, movieId)
            .execute('RemoveMovieFromWatchlist');

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

app.delete('/api/watchlist/tvshow/:username/:tvShowId', async (req, res) => {
    try {
        const { username, tvShowId } = req.params;
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('tvShowID', sql.Int, tvShowId)
            .query(`
                DELETE FROM WATCHLIST
                WHERE username = @username AND tvID = @tvShowID
            `);

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

// Add endpoint for getting recommendations based on watchlist
app.get('/api/recommendations/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .execute('RecommendBasedOnWatchlist');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for getting user's post history
app.get('/api/posts/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .execute('GetUserPostHistory');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for getting posts sorted by account type
app.get('/api/posts/sorted', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .execute('GetPostsSortedByAccountType');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching sorted posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for getting post comments
app.get('/api/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const { sortBy = 'recent' } = req.query;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('postID', sql.Int, parseInt(postId))
            .input('sortBy', sql.VarChar(20), sortBy)
            .execute('sp_GetPostComments');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching post comments:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for posting a comment
app.post('/api/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const { username, commentText } = req.body;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('postID', sql.Int, parseInt(postId))
            .input('username', sql.VarChar(50), username)
            .input('commentText', sql.VarChar(sql.MAX), commentText)
            .execute('sp_PostComment');
        res.json({ commentId: result.recordset[0].CommentID });
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint for deleting a comment
app.delete('/api/comments/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { username } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('commentID', sql.Int, parseInt(commentId))
            .input('username', sql.VarChar(50), username)
            .execute('sp_DeleteComment');
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

