import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Plus, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings as SettingsIcon, MessageSquare, ThumbsUp, ThumbsDown, Send, User, LogOut, ArrowUp, ArrowDown, Share, BookmarkPlus } from 'lucide-react';
import { CreatePostButton } from './CreatePostButton.jsx';

export default function SocialFeed() {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [newComment, setNewComment] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('home');
  
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

  const handleExploreItemClick = (section) => {
    setActiveSection(section);
    if (section === 'movies') {
      navigate('/explore/movies');
    } else if (section === 'tvshows') {
      navigate('/explore/tvshows');
    }
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
                  placeholder="Search posts"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full py-1.5 pl-10 pr-4 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CreatePostButton onPostCreated={handlePostCreated} />
              <div className="relative profile-dropdown-container">
                <button 
                  onClick={toggleProfileDropdown}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <img 
                    src="./images/pfp2.jpg" 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </button>
                
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200">
                    <div className="p-2">
                      <button 
                        onClick={() => {
                          navigate('/profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                      >
                        <User size={16} className="mr-2" />
                        View Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                        <LogOut size={16} className="mr-2" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                    onClick={() => handleExploreItemClick('movies')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeSection === 'movies' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Film size={16} className="mr-3" />
                    Movies
                  </button>
                  <button 
                    onClick={() => handleExploreItemClick('tvshows')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeSection === 'tvshows' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Tv size={16} className="mr-3" />
                    TV Shows
                  </button>
                </div>
              )}
              <button 
                onClick={() => {
                  setActiveSidebarItem('recommendations');
                  navigate('/recommendations');
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeSidebarItem === 'recommendations' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ThumbsUp size={18} className="mr-3" />
                Recommendations
              </button>
            </nav>
          </div>

          {/* Posts feed */}
          <div className="flex-1">
            {filteredPosts.map((post) => (
              <div 
                key={post.id}
                className="bg-white border border-gray-200 rounded-md mb-3 hover:border-gray-300 transition-colors"
              >
                <div className="flex">
                  {/* Vote buttons */}
                  <div className="flex flex-col items-center px-2 py-2 bg-gray-50 rounded-l-md">
                    <button 
                      onClick={() => handleVote(post.id, 'up')}
                      className={`p-1 rounded hover:bg-gray-200 transition ${post.userVote === 'up' ? 'text-orange-500' : 'text-gray-400'}`}
                    >
                      <ArrowUp size={20} />
                    </button>
                    <span className="text-xs font-medium text-gray-900">{post.upvotes - post.downvotes}</span>
                    <button 
                      onClick={() => handleVote(post.id, 'down')}
                      className={`p-1 rounded hover:bg-gray-200 transition ${post.userVote === 'down' ? 'text-blue-500' : 'text-gray-400'}`}
                    >
                      <ArrowDown size={20} />
                    </button>
                  </div>

                  {/* Post content */}
                  <div className="flex-1 p-3">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <img src={post.authorAvatar} alt={post.author} className="w-5 h-5 rounded-full mr-1" />
                      <span className="font-medium text-gray-900">r/{post.author}</span>
                      <span className="mx-1">•</span>
                      <span>{post.timestamp}</span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{post.title}</h3>
                    <p className="text-gray-800 text-sm mb-2">{post.content}</p>
                    
                    {post.image && (
                      <div className="mb-2 rounded-md overflow-hidden">
                        <img src={post.image} alt="Post image" className="w-full" />
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-500 text-xs">
                      <button 
                        onClick={() => handlePostClick(post)}
                        className="flex items-center hover:bg-gray-100 rounded-full px-2 py-1"
                      >
                        <MessageSquare size={16} className="mr-1" />
                        {post.comments.length} Comments
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

      {/* Post Modal */}
      {selectedPost && (
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
                  <img src={selectedPost.authorAvatar} alt={selectedPost.author} className="w-5 h-5 rounded-full mr-1" />
                  <span className="font-medium text-gray-900">r/{selectedPost.author}</span>
                  <span className="mx-1">•</span>
                  <span>{selectedPost.timestamp}</span>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedPost.title}</h3>
                <p className="text-gray-800 text-sm mb-3">{selectedPost.content}</p>
                
                {selectedPost.image && (
                  <div className="mb-3 rounded-md overflow-hidden">
                    <img src={selectedPost.image} alt="Post image" className="w-full" />
                  </div>
                )}
                
                <div className="flex items-center text-gray-500 text-xs">
                  <div className="flex items-center">
                    <button 
                      onClick={() => handleVote(selectedPost.id, 'up')}
                      className={`p-1 rounded hover:bg-gray-200 transition ${selectedPost.userVote === 'up' ? 'text-orange-500' : 'text-gray-400'}`}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <span className="mx-1 font-medium text-gray-900">{selectedPost.upvotes - selectedPost.downvotes}</span>
                    <button 
                      onClick={() => handleVote(selectedPost.id, 'down')}
                      className={`p-1 rounded hover:bg-gray-200 transition ${selectedPost.userVote === 'down' ? 'text-blue-500' : 'text-gray-400'}`}
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Comments */}
              <div className="space-y-4">
                {selectedPost.comments.map(comment => (
                  <div key={comment.id} className="bg-white border border-gray-200 rounded-md p-3">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <img src={comment.authorAvatar} alt={comment.author} className="w-5 h-5 rounded-full mr-1" />
                      <span className="font-medium text-gray-900">r/{comment.author}</span>
                      <span className="mx-1">•</span>
                      <span>{comment.timestamp}</span>
                    </div>
                    <p className="text-gray-800 text-sm">{comment.content}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <button className="flex items-center hover:bg-gray-100 rounded-full px-2 py-1">
                        <ArrowUp size={14} className="mr-1" />
                        {comment.upvotes}
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