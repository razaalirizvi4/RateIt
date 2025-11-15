import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings, User, LogOut, Edit2, Mail, Calendar, MapPin, Star, BookmarkPlus, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';

export default function ViewProfile() {
  const navigate = useNavigate();
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('profile');
  const [activeTab, setActiveTab] = useState('activity');
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [friends, setFriends] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [watchlistCount, setWatchlistCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      
      fetchUserPosts(user.username);
      fetchPostCount(user.username);
      fetchFriends(user.username);
      fetchWatchlistCount(user.username); // Add this line
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Add this function to fetch watchlist count
  const fetchWatchlistCount = async (username) => {
    try {
      const response = await fetch(`http://localhost:3001/api/watchlist/${username}`);
      if (response.ok) {
        const data = await response.json();
        setWatchlistCount(data.length); // Changed from data.count to data.length
        console.log('Watchlist count:', data.length);
      }
    } catch (error) {
      console.error('Error fetching watchlist count:', error);
    }
  };

  const fetchUserPosts = async (username) => {
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${username}`);
      if (response.ok) {
        const posts = await response.json();
        setUserPosts(posts);
        setPostCount(posts.length); // Set the post count based on number of posts returned
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchPostCount = async (username) => {
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${username}/count`);
      if (response.ok) {
        const data = await response.json();
        setPostCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching post count:', error);
    }
  };

  const fetchFriends = async (username) => {
    try {
      const response = await fetch(`http://localhost:3001/api/friends/${username}`);
      if (response.ok) {
        const friends = await response.json();
        setFriends(friends);
          console.log(friends);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const toggleExplore = () => {
    setExploreExpanded(!exploreExpanded);
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  const openPostModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closePostModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  // Add handleCommentSubmit function
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // Create the new comment
    const newCommentObj = {
      id: Date.now(),
      author: "You",
      authorAvatar: "./images/pfp2.jpg",
      content: newComment,
      timestamp: "Just now",
      upvotes: 0
    };
    
    // Update both posts state and selected post
    setUserPosts(prevPosts => {
      return prevPosts.map(post => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            comments: [...post.comments, newCommentObj]
          };
        }
        return post;
      });
    });
    
    setSelectedPost(prev => ({
      ...prev,
      comments: [...prev.comments, newCommentObj]
    }));
    
    setNewComment('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <img src="./images/logo.png" alt="RateIt Logo" className="h-8 w-8 mr-2"/>
                <span className="text-xl font-bold text-gray-900">RateIt</span>
              </div>
            </div>
            
            {/* Search bar */}
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full py-1.5 pl-10 pr-4 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <button 
                onClick={() => {
                  setActiveSidebarItem('home');
                  navigate('/');
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeSidebarItem === 'home' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Home size={18} className="mr-3" />
                Home
              </button>
              <button 
                onClick={toggleExplore}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                  activeSidebarItem === 'explore' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <Compass size={18} className="mr-3" />
                  Explore
                </div>
                {exploreExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {exploreExpanded && (
                <div className="ml-6 space-y-1">
                  <button 
                    onClick={() => {
                      setActiveSidebarItem('movies');
                      navigate('/explore/movies');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeSidebarItem === 'movies' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Film size={16} className="mr-3" />
                    Movies
                  </button>
                  <button 
                    onClick={() => {
                      setActiveSidebarItem('tvshows');
                      navigate('/explore/tvshows');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeSidebarItem === 'tvshows' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Tv size={16} className="mr-3" />
                    TV Shows
                  </button>
                </div>
              )}
            </nav>
          </div>

          {/* Profile Content */}
          <div className="flex-1">
            {/* Profile Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={userData.pfp || './images/default-avatar.jpg'} 
                    alt={userData.username} 
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{userData.username}</h1>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        <span>Joined {userData.joinDate}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail size={16} className="mr-1" />
                        <span>{userData.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
              
              <p className="mt-4 text-gray-600">{userData.bio}</p>
              
              <div className="flex items-center space-x-8 mt-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{postCount}</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{friends.length}</div>
                  <div className="text-sm text-gray-500">Friends</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{watchlistCount}</div>
                  <div className="text-sm text-gray-500">Watchlist</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'activity'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Star size={18} className="mr-2" />
                      Activity
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {userPosts.map((post, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => openPostModal(post)}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                          <User size={20} className="text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{post.title}</h3>
                            <span className="text-sm text-gray-500">
                              {new Date(post.dateOfPost).toLocaleDateString()}
                            </span>
                          </div>
                          {post.media && (
                            <img src={post.media} alt="Post media" className="mt-2 rounded-lg" />
                          )}
                          <div className="flex items-center mt-2">
                            <ArrowUp size={14} className="mr-1" />
                            <span>{post.upvoteCount}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    {userPosts.filter(post => post.contentText?.startsWith('Comment:')).map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{comment.contentText}</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.dateOfPost).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <div className="flex items-center">
                            <ArrowUp size={14} className="mr-1" />
                            {comment.upvoteCount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Post Details</h2>
              <button 
                onClick={closePostModal}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                  <User size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">{userData.username}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedPost.dateOfPost).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-800 mb-4">{selectedPost.contentText}</p>
              
              {selectedPost.media && (
                <img 
                  src={selectedPost.media} 
                  alt="Post media" 
                  className="w-full rounded-lg mb-4"
                />
              )}
              
              <div className="flex items-center space-x-4 text-gray-500">
                <div className="flex items-center">
                  <ArrowUp size={16} className="mr-1" />
                  <span>{selectedPost.upvoteCount}</span>
                </div>
                {selectedPost.movieID && (
                  <div className="flex items-center">
                    <Film size={16} className="mr-1" />
                    <span>Movie Review</span>
                  </div>
                )}
                {selectedPost.tvShowID && (
                  <div className="flex items-center">
                    <Tv size={16} className="mr-1" />
                    <span>TV Show Review</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}