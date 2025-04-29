import { useState, useEffect } from 'react';
import { X, Search, Plus, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings as SettingsIcon, MessageSquare, ThumbsUp, ThumbsDown, Send, User, LogOut } from 'lucide-react';
import { CreatePostButton } from './CreatePostButton.jsx';

export default function SocialFeed() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [newComment, setNewComment] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('home'); // Track active sidebar item
  
  // Sample posts data 
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "MovieBuff42",
      authorAvatar: "./images/pfp.jpg",
      title: "Just watched Inception for the 5th time",
      content: "I keep noticing new details every time I watch it. The way Nolan crafts the dream layers is just brilliant. What's your favorite scene?",
      image: "/api/placeholder/500/300",
      timestamp: "2 hours ago",
      upvotes: 245,
      downvotes: 12,
      userVote: null,
      comments: [
        { id: 1, author: "DreamExplorer", authorAvatar: "/api/placeholder/80/80", content: "The hallway fight scene is a masterpiece of practical effects!", timestamp: "1 hour ago", upvotes: 38 },
        { id: 2, author: "CinematicVisions", authorAvatar: "/api/placeholder/80/80", content: "I'm still not sure if the top stopped spinning or not at the end...", timestamp: "45 minutes ago", upvotes: 27 }
      ]
    },
    {
      id: 2,
      author: "FilmCritic101",
      authorAvatar: "./images/pfp.jpg",
      title: "Underrated gems from the 90s",
      content: "Everyone knows Pulp Fiction and Shawshank, but let's talk about these lesser-known masterpieces from the 90s that deserve more recognition: Miller's Crossing, Leaving Las Vegas, and Before Sunrise.",
      timestamp: "5 hours ago",
      upvotes: 189,
      downvotes: 7,
      userVote: null,
      comments: [
        { id: 1, author: "RetroCinephile", authorAvatar: "/api/placeholder/80/80", content: "Before Sunrise is one of the most beautiful love stories ever told. The whole trilogy is amazing.", timestamp: "4 hours ago", upvotes: 42 },
        { id: 2, author: "ClassicMovieFan", authorAvatar: "/api/placeholder/80/80", content: "Don't forget 'The Usual Suspects'! That ending still blows my mind.", timestamp: "3 hours ago", upvotes: 31 }
      ]
    },
    {
      id: 3,
      author: "SciFiNerd",
      authorAvatar: "./images/pfp.jpg",
      title: "The Expanse is the best sci-fi show nobody's watching",
      content: "If you love hard sci-fi with realistic physics, complex politics, and incredible world-building, you need to check out The Expanse. It's criminally underrated and has some of the best character development I've seen.",
      image: "/api/placeholder/500/300",
      timestamp: "8 hours ago",
      upvotes: 372,
      downvotes: 18,
      userVote: null,
      comments: [
        { id: 1, author: "SpaceExplorer", authorAvatar: "/api/placeholder/80/80", content: "Completely agree! The attention to scientific detail is unmatched.", timestamp: "7 hours ago", upvotes: 65 },
        { id: 2, author: "SeriesAddict", authorAvatar: "/api/placeholder/80/80", content: "Amos is such a fantastic character. His development over the seasons is incredible.", timestamp: "5 hours ago", upvotes: 44 }
      ]
    },
    {
      id: 4,
      author: "HorrorFanatic",
      authorAvatar: "./images/pfp.jpg",
      title: "Modern horror recommendations thread",
      content: "Looking for modern horror films that are actually scary and not just jump scares? I've been impressed with Hereditary, The Witch, and It Follows. What would you add to this list?",
      timestamp: "12 hours ago",
      upvotes: 293,
      downvotes: 15,
      userVote: null,
      comments: [
        { id: 1, author: "MidnightWatcher", authorAvatar: "/api/placeholder/80/80", content: "Midsommar is a must-watch if you liked Hereditary. Same director, totally different vibe but equally disturbing.", timestamp: "10 hours ago", upvotes: 58 },
        { id: 2, author: "ScarySights", authorAvatar: "/api/placeholder/80/80", content: "The Babadook is phenomenal - psychological horror at its finest.", timestamp: "8 hours ago", upvotes: 47 }
      ]
    }
  ]);

  // CreatePostButton
  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const toggleExplore = () => {
    setExploreExpanded(!exploreExpanded);
    setActiveSidebarItem('explore');
  };

  const handlePostClick = (post) => {
    const currentPost = posts.find(p => p.id === post.id);
    setSelectedPost(currentPost);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setNewComment('');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };


  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };
  
  // Close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleVote = (postId, vote) => {
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post => {
        if (post.id === postId) {
          if (post.userVote === vote) {
            return {
              ...post,
              upvotes: vote === 'up' ? post.upvotes - 1 : post.upvotes,
              downvotes: vote === 'down' ? post.downvotes - 1 : post.downvotes,
              userVote: null
            };
          }
          
          if (post.userVote !== null && post.userVote !== vote) {
            return {
              ...post,
              upvotes: vote === 'up' ? post.upvotes + 1 : post.upvotes - 1,
              downvotes: vote === 'down' ? post.downvotes + 1 : post.downvotes - 1,
              userVote: vote
            };
          }

          return {
            ...post,
            upvotes: vote === 'up' ? post.upvotes + 1 : post.upvotes,
            downvotes: vote === 'down' ? post.downvotes + 1 : post.downvotes,
            userVote: vote
          };
        }
        return post;
      });
      
      // If the modal is open with the current post, update it too
      if (selectedPost && selectedPost.id === postId) {
        const updatedPost = updatedPosts.find(p => p.id === postId);
        setSelectedPost(updatedPost);
      }
      
      return updatedPosts;
    });
  };

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
    setPosts(prevPosts => {
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

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-pink-800/20 via-black to-orange-300/20">
      <div className="flex items-center">
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-800 to-orange-300 flex items-center">
            <img src="./images/logo.png" alt="RateIt Logo" className="w-20 h-14"/>
            RateIt
          </div>
        </div>
        
        {/* Centered search bar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-xl">
          <div className="relative transition-all duration-300 hover:scale-105">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search posts"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full py-2 pl-10 pr-4 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-pink-600 transition-all duration-300"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
        <CreatePostButton onPostCreated={handlePostCreated} />
      {/* Profile Button */}
      <div className="relative profile-dropdown-container">
            <button 
              onClick={toggleProfileDropdown}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300 overflow-hidden ring-2 ring-gray-700 hover:ring-pink-600/50 transform hover:scale-105"
            >
              {/* Profile picture */}
              <img 
                src="./images/pfp2.jpg" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
              
              {/* Glowing effect on hover */}
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-600/0 to-orange-400/0 hover:from-pink-600/20 hover:to-orange-400/20 transition-all duration-300"></span>
            </button>
            
            {/* Profile Dropdown with enhanced effects */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all duration-300 animate-fadeIn">
                {/* Animated top highlight bar */}
                <div className="h-1 bg-gradient-to-r from-pink-600 to-orange-400"></div>
                
                <div className="p-3 border-b border-gray-700 bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden ring-2 ring-pink-500/30 shadow-lg transform transition-all duration-300 hover:scale-110">
                      <img 
                        src="./images/pfp2.jpg" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-300">User</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-2 backdrop-blur-sm">
                  <button className="w-full text-left p-3 rounded-md hover:bg-gradient-to-r hover:from-pink-800/30 hover:to-orange-300/30 transition-all duration-200 transform hover:translate-x-1 flex items-center">
                    <User size={16} className="mr-2 text-pink-400" />
                    View Profile
                  </button>
                  <button className="w-full text-left p-3 rounded-md hover:bg-gradient-to-r hover:from-pink-800/30 hover:to-orange-300/30 transition-all duration-200 transform hover:translate-x-1 flex items-center">
                    <LogOut size={16} className="mr-2 text-orange-400" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800">
          <nav className="p-2">
            <ul>
              <li className="mb-2">
                <button 
                  onClick={() => setActiveSidebarItem('home')}
                  className={`flex items-center p-3 rounded-md w-full text-left transition duration-300 ${
                    activeSidebarItem === 'home' 
                      ? 'bg-gradient-to-r from-pink-800/30 to-orange-300/30' 
                      : 'hover:bg-gradient-to-r hover:from-pink-800/30 hover:to-orange-300/30 transform hover:translate-x-1'
                  }`}
                >
                  <Home size={20} className="mr-3 text-orange-300" />
                  <span>Home</span>
                </button>
              </li>
              <li className="mb-2">
                <button 
                  onClick={toggleExplore}
                  className={`w-full flex items-center justify-between p-3 rounded-md transition duration-300 ${
                    activeSidebarItem === 'explore' 
                      ? 'bg-gradient-to-r from-pink-800/30 to-orange-300/30' 
                      : 'hover:bg-gradient-to-r hover:from-pink-800/30 hover:to-orange-300/30 transform hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center">
                    <Compass size={20} className="mr-3 text-pink-500" />
                    <span>Explore</span>
                  </div>
                  {exploreExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </button>
                
                {exploreExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    <button 
                      className={`flex items-center p-2 rounded-md w-full text-left ${activeSection === 'movies' ? 'bg-gradient-to-r from-pink-800/40 to-orange-300/40' : 'hover:bg-gray-800'} transition duration-200`}
                      onClick={() => setActiveSection('movies')}
                    >
                      <Film size={16} className="mr-2 text-orange-300" />
                      <span>Movies</span>
                    </button>
                    <button 
                      className={`flex items-center p-2 rounded-md w-full text-left ${activeSection === 'tvshows' ? 'bg-gradient-to-r from-pink-800/40 to-orange-300/40' : 'hover:bg-gray-800'} transition duration-200`}
                      onClick={() => setActiveSection('tvshows')}
                    >
                      <Tv size={16} className="mr-2 text-pink-400" />
                      <span>TV Shows</span>
                    </button>
                  </div>
                )}
              </li>
              <li className="mb-2">
                <button 
                  onClick={() => setActiveSidebarItem('recommendations')}
                  className={`flex items-center p-3 rounded-md w-full text-left transition duration-300 ${
                    activeSidebarItem === 'recommendations' 
                      ? 'bg-gradient-to-r from-pink-800/30 to-orange-300/30' 
                      : 'hover:bg-gradient-to-r hover:from-pink-800/30 hover:to-orange-300/30 transform hover:translate-x-1'
                  }`}
                >
                  <Heart size={20} className="mr-3 text-pink-500" />
                  <span>Recommendations</span>
                </button>
              </li>
              <li className="mb-2">
                <button 
                  onClick={() => setActiveSidebarItem('settings')}
                  className={`flex items-center p-3 rounded-md w-full text-left transition duration-300 ${
                    activeSidebarItem === 'settings' 
                      ? 'bg-gradient-to-r from-pink-800/30 to-orange-300/30' 
                      : 'hover:bg-gradient-to-r hover:from-pink-800/30 hover:to-orange-300/30 transform hover:translate-x-1'
                  }`}
                >
                  <SettingsIcon size={20} className="mr-3 text-orange-300" />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Posts feed */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-black via-gray-900 to-black">
          <div className="max-w-2xl mx-auto py-6">
            {filteredPosts.map((post) => (
              <div 
                key={post.id}
                className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg mb-6 border border-gray-800 hover:border-orange-300/30 transition-all duration-300"
              >
                {/* Post header */}
                <div className="p-4 flex items-center">
                  <img src={post.authorAvatar} alt={post.author} className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <div className="font-medium">{post.author}</div>
                    <div className="text-gray-400 text-sm">{post.displayTime || post.timestamp}</div>
                  </div>
                </div>
                
                {/* Post content */}
                <div className="px-4 pb-3">
                  <h3 className="text-xl font-medium mb-2">{post.title}</h3>
                  <p className="text-gray-300 mb-4">{post.content}</p>
                  
                  {post.image && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img src={post.image} alt="Post image" className="w-full" />
                    </div>
                  )}
                  
                  {/* Post actions */}
                  <div className="flex items-center justify-between mt-4 border-t border-gray-700 pt-3">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleVote(post.id, 'up')}
                          className={`p-1 rounded hover:bg-gray-700 transition ${post.userVote === 'up' ? 'text-orange-300' : 'text-gray-400'}`}
                        >
                          <ThumbsUp size={18} />
                        </button>
                        <span>{post.upvotes}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleVote(post.id, 'down')}
                          className={`p-1 rounded hover:bg-gray-700 transition ${post.userVote === 'down' ? 'text-pink-500' : 'text-gray-400'}`}
                        >
                          <ThumbsDown size={18} />
                        </button>
                        <span>{post.downvotes}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handlePostClick(post)}
                      className="flex items-center text-gray-400 hover:text-white transition"
                    >
                      <MessageSquare size={18} className="mr-1" />
                      <span>{post.comments.length} Comments</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for post comments */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg w-full max-w-3xl h-3/4 relative border border-gray-800 flex flex-col">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white hover:scale-110 transition-all duration-300 z-20"
            >
              <X size={24} />
            </button>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Original post */}
              <div className="mb-6 pb-6 border-b border-gray-700">
                <div className="flex items-center mb-4">
                  <img src={selectedPost.authorAvatar} alt={selectedPost.author} className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <div className="font-medium">{selectedPost.author}</div>
                    <div className="text-gray-400 text-sm">{selectedPost.displayTime || selectedPost.timestamp}</div>
                  </div>
                </div>
                
                <h2 className="text-xl font-medium mb-3">{selectedPost.title}</h2>
                <p className="text-gray-300 mb-4">{selectedPost.content}</p>
                
                {selectedPost.image && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img src={selectedPost.image} alt="Post image" className="w-full" />
                  </div>
                )}
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleVote(selectedPost.id, 'up')}
                      className={`p-1 rounded hover:bg-gray-700 transition ${selectedPost.userVote === 'up' ? 'text-orange-300' : 'text-gray-400'}`}
                    >
                      <ThumbsUp size={18} />
                    </button>
                    <span>{selectedPost.upvotes}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleVote(selectedPost.id, 'down')}
                      className={`p-1 rounded hover:bg-gray-700 transition ${selectedPost.userVote === 'down' ? 'text-pink-500' : 'text-gray-400'}`}
                    >
                      <ThumbsDown size={18} />
                    </button>
                    <span>{selectedPost.downvotes}</span>
                  </div>
                </div>
              </div>
              
              {/* Comments section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Comments ({selectedPost.comments.length})</h3>
                
                <div className="space-y-4">
                  {selectedPost.comments.map(comment => (
                    <div key={comment.id} className="bg-gray-800/50 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <img src={comment.authorAvatar} alt={comment.author} className="w-8 h-8 rounded-full mr-2" />
                        <div>
                          <div className="font-medium text-sm">{comment.author}</div>
                          <div className="text-gray-400 text-xs">{comment.timestamp}</div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                      <div className="flex items-center mt-2 text-sm">
                        <button className="flex items-center text-gray-400 hover:text-orange-300 transition mr-2">
                          <ThumbsUp size={14} className="mr-1" />
                          <span>{comment.upvotes}</span>
                        </button>
                        <button className="text-gray-400 hover:text-white transition">Reply</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Comment input */}
            <div className="p-4 border-t border-gray-700">
              <form onSubmit={handleCommentSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-gray-800 rounded-l-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-300 text-white"
                />
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-pink-800 to-orange-300 text-white p-2 rounded-r-full hover:from-pink-900 hover:to-orange-400 transition"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}