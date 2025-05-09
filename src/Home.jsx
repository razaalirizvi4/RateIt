import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Plus, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings as SettingsIcon, MessageSquare, ThumbsUp, ThumbsDown, Send, User, LogOut, ArrowUp, ArrowDown, Share, BookmarkPlus } from 'lucide-react';
import { CreatePostButton } from './CreatePostButton.jsx';
import Sidebar from './Sidebar'; // Import the Sidebar component
import Navbar from './Navbar'; // Adjust the path if necessary
import Leaderboard from './Leaderboard';
import axios from 'axios';

export default function SocialFeed({ onInteract }) {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [newComment, setNewComment] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('home');
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);

  // Fetch current user's friends
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        
        const currentUser = JSON.parse(storedUser);
        const response = await axios.get(`http://localhost:3001/api/friends/${currentUser.username}`);
        setFriends(response.data.map(friend => friend.username));
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };
    fetchFriends();
  }, []);

  // Fetch posts from database and filter by friends
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/posts');
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const currentUser = JSON.parse(storedUser);
          // Filter posts to only show from friends or the current user
          const filtered = response.data.filter(post => 
            friends.includes(post.username) || post.username === currentUser.username
          );
          setPosts(filtered);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [friends]);


  const handleVote = async (postId, voteType) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        onInteract(); // Trigger login popup
        return;
      }
  
      const user = JSON.parse(storedUser);
  
      // Determine the endpoint based on current vote status
      const post = posts.find(p => p.postID === postId);
      const endpoint = post.userVote === 'up' ?
        `http://localhost:3001/api/posts/${postId}/removeupvote` :
        `http://localhost:3001/api/posts/${postId}/upvote`;
  
      const response = await axios.post(endpoint, {
        userId: user.id
      });
  
      setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
          if (post.postID === postId) {
            return {
              ...post,
              upvoteCount: response.data.upvoteCount,
              userVote: post.userVote === 'up' ? null : 'up', // Toggle between up and null
              comments: post.comments // Preserve the existing comments
            };
          }
          return post;
        });
  
        // If the modal is open with the current post, update it too
        if (selectedPost && selectedPost.postID === postId) {
          const updatedPost = updatedPosts.find(p => p.postID === postId);
          setSelectedPost({
            ...updatedPost,
            comments: selectedPost.comments // Preserve the modal's comments
          });
        }
  
        return updatedPosts;
      });
  
    } catch (error) {
      console.error('Error voting on post:', error);
    }
  };
  
  const closeModal = () => {
    setSelectedPost(null);
  };
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
  
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        onInteract();
        return;
      }
  
      const user = JSON.parse(storedUser);
      
      const response = await axios.post(`http://localhost:3001/api/posts/${selectedPost.postID}/comments`, {
        username: user.username,
        commentText: newComment
      });
  
      setSelectedPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), response.data]
      }));
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  // CreatePostButton
  const handlePostCreated = async (newPost) => {
    // try {
    //   const storedUser = localStorage.getItem('user');
    //   if (!storedUser) {
    //     onInteract(); // Trigger login popup
    //     return;
    //   }

    //   const user = JSON.parse(storedUser);
      
    //   // Structure the post data according to the table schema
    //   const postData = {
    //     username: user.username,
    //     contentText: newPost.content,
    //     media: null,
    //     pollID: null,
    //     movieID: null,
    //     tvShowID: null,
    //     tags: newPost.tags || null,
    //     title: newPost.title // Fixed: Access title directly from newPost
    //   };

    //   //const response = await axios.post('http://localhost:3001/api/posts', postData);
      
    //   // Construct the new post object for UI
    //   const newPostForUI = {
    //     ...postData,
    //     postID: response.data.postId, // or response.data.postID depending on backend
    //     upvoteCount: 0,
    //     commentCount: 0,
    //     dateOfPost: new Date().toISOString(),
    //     pfp: user.pfp || null,
    //     userVote: null,
    //     comments: []
    //   };

    //   setPosts(prevPosts => [newPostForUI, ...prevPosts]);
    // } catch (error) {
    //   console.error('Error creating post:', error);
    // }
  };

  const toggleExplore = () => {
    setExploreExpanded(!exploreExpanded);
    setActiveSidebarItem('explore');
  };

  const handleExploreItemClick = (section) => {
    setActiveSection(section);
    if (section === 'movies') {
      navigate('/explore/movies');
    } else if (section === 'tvshows') {
      navigate('/explore/tvshows');
    }
  };

  const handlePostClick = (post) => {
    // Check if user is logged in by checking localStorage
    const storedUser = localStorage.getItem('user');
    console.log('Stored user:', storedUser);
    
    onInteract();
    const currentPost = posts.find(p => p.postID === post.postID);
    
    // Fetch comments and poll data if exists
    const fetchData = async () => {
        try {
            const [commentsResponse, pollResponse] = await Promise.all([
                axios.get(`http://localhost:3001/api/posts/${post.postID}/comments`, {
                    params: { sortBy: 'recent' }
                }),
                post.pollID ? axios.get(`http://localhost:3001/api/polls/${post.pollID}`) : Promise.resolve(null)
            ]);
            
            const postWithData = {
                ...currentPost,
                comments: commentsResponse.data,
                pollData: pollResponse?.data || null
            };
            setSelectedPost(postWithData);
        } catch (error) {
            console.error('Error fetching post data:', error);
            setSelectedPost(currentPost);
        }
    };
    
    fetchData();
};

const handlePollVote = async (pollId, optionId) => {
    try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            onInteract(); // Trigger login popup
            return;
        }

        const response = await axios.post(`http://localhost:3001/api/polls/${pollId}/vote`, {
            optionId: optionId
        });

        // Update the selected post with new poll data
        setSelectedPost(prev => ({
            ...prev,
            pollData: response.data
        }));

        // Update the posts list
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post.postID === selectedPost.postID 
                    ? { ...post, pollData: response.data }
                    : post
            )
        );
    } catch (error) {
        console.error('Error voting on poll:', error);
    }
};

  const filteredPosts = posts?.filter(post => 
    (post?.contentText && post.contentText.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (post?.username && post.username.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        profileDropdownOpen={profileDropdownOpen} 
        setProfileDropdownOpen={setProfileDropdownOpen} 
      />

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          <Sidebar 
            activeSidebarItem={activeSidebarItem} 
            setActiveSidebarItem={setActiveSidebarItem} 
            toggleExplore={toggleExplore} 
            exploreExpanded={exploreExpanded} 
          />
          
          {/* Main content area */}
          <div className="flex-1">
            <div className="mb-4">
              <CreatePostButton onPostCreated={handlePostCreated} />
            </div>
            
            <div className="flex gap-6">
              {/* Posts feed */}
              <div className="flex-1">
                {Array.isArray(filteredPosts) && filteredPosts.map((post) => (
                  <div 
                    key={post.postID}
                    className="bg-white border border-gray-200 rounded-md mb-3 hover:border-gray-300 transition-colors min-w-[600px]"
                  >
                    <div className="flex">
                      {/* Vote buttons */}
                      <div className="flex flex-col items-center px-2 py-2 bg-gray-50 rounded-l-md">
                        <button 
                          onClick={() => handleVote(post.postID, 'up')}
                          className={`p-1 rounded hover:bg-gray-200 transition ${post.userVote === 'up' ? 'text-orange-500' : 'text-gray-400'}`}
                        >
                          <ArrowUp size={20} />
                        </button>
                        <span className="text-xs font-medium text-gray-900">{post.upvoteCount || 0}</span>
                        <button 
                          onClick={() => handleVote(post.postID, 'down')}
                          className={`p-1 rounded hover:bg-gray-200 transition ${post.userVote === 'down' ? 'text-blue-500' : 'text-gray-400'}`}
                        >
                          <ArrowDown size={20} />
                        </button>
                      </div>

                      {/* Post content */}
                      <div className="flex-1 p-3">
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <img src={post.pfp || './images/pfp.jpg'} alt={post.username} className="w-5 h-5 rounded-full mr-1" />
                          <span className="font-medium text-gray-900">r/{post.username}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(post.dateOfPost).toLocaleString()}</span>
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{post.title || 'Untitled'}</h3>
                        <p className="text-gray-800 text-sm mb-2">{post.contentText}</p>
                        
                        {post.media && (
                          <div className="mb-2 rounded-md overflow-hidden">
                            <img src={post.media} alt="Post image" className="w-full" />
                          </div>
                        )}
                        
                        <div className="flex items-center text-gray-500 text-xs">
                          <button 
                            onClick={() => handlePostClick(post)}
                            className="flex items-center hover:bg-gray-100 rounded-full px-2 py-1"
                          >
                            <MessageSquare size={16} className="mr-1" />
                            {post.commentCount || 0} Comments
                          </button>
                          <button className="flex items-center hover:bg-gray-100 rounded-full px-2 py-1 ml-2">
                            <Share size={16} className="mr-1" />
                            Share
                          </button>
                          <button className="flex items-center hover:bg-gray-100 rounded-full px-2 py-1 ml-2">
                            <BookmarkPlus size={16} className="mr-1" />
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Leaderboard */}
          <div className="w-80 flex-shrink-0">
            <Leaderboard />
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {selectedPost && localStorage.getItem('user') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">Comments</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Original post */}
              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <img src={selectedPost.pfp || './images/pfp.jpg'} alt={selectedPost.username} className="w-5 h-5 rounded-full mr-1" />
                  <span className="font-medium text-gray-900">r/{selectedPost.username}</span>
                  <span className="mx-1">•</span>
                  <span>{new Date(selectedPost.dateOfPost).toLocaleString()}</span>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedPost.title || 'Untitled'}</h3>
                <p className="text-gray-800 text-sm mb-3">{selectedPost.contentText}</p>
                
                {/* Add Poll Display */}
                {selectedPost.pollData && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
                    <h4 className="font-medium text-gray-900 mb-3">{selectedPost.pollData.question}</h4>
                    <div className="space-y-2">
                      {selectedPost.pollData.options.map((option) => (
                        <button
                          key={option.optionID}
                          onClick={() => handlePollVote(selectedPost.pollID, option.optionID)}
                          className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <span>{option.optionText}</span>
                            <span className="text-gray-500">{option.percentage}%</span>
                          </div>
                          <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${option.percentage}%` }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedPost.media && (
                  <div className="mb-3 rounded-md overflow-hidden">
                    <img src={selectedPost.media} alt="Post image" className="w-full" />
                  </div>
                )}
                
                <div className="flex items-center text-gray-500 text-xs">
                  <div className="flex items-center">
                    <button 
                      onClick={() => handleVote(selectedPost.postID, 'up')}
                      className={`p-1 rounded hover:bg-gray-200 transition ${selectedPost.userVote === 'up' ? 'text-orange-500' : 'text-gray-400'}`}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <span className="mx-1 font-medium text-gray-900">{selectedPost.upvoteCount || 0}</span>
                    <button 
                      onClick={() => handleVote(selectedPost.postID, 'down')}
                      className={`p-1 rounded hover:bg-gray-200 transition ${selectedPost.userVote === 'down' ? 'text-blue-500' : 'text-gray-400'}`}
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Comments */}
              <div className="space-y-4">
                {selectedPost?.comments?.map(comment => (
                  <div key={comment.commentID} className="bg-white border border-gray-200 rounded-md p-3">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <img src={comment.pfp || './images/pfp.jpg'} alt={comment.username} className="w-5 h-5 rounded-full mr-1" />
                      <span className="font-medium text-gray-900">r/{comment.username}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(comment.dateOfComment).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-800 text-sm">{comment.commentText}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <button className="flex items-center hover:bg-gray-100 rounded-full px-2 py-1">
                        <ArrowUp size={14} className="mr-1" />
                        {comment.upvoteCount || 0}
                      </button>
                      <button className="flex items-center hover:bg-gray-100 rounded-full px-2 py-1 ml-2">
                        <MessageSquare size={14} className="mr-1" />
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Comment input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleCommentSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="What are your thoughts?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-gray-100 rounded-full py-2 px-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <button 
                  type="submit"
                  className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Comment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



