import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings, User, LogOut, Edit2, Mail, Calendar, MapPin, Star, BookmarkPlus, MessageSquare, ArrowUp } from 'lucide-react';

export default function ViewProfile() {
  const navigate = useNavigate();
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('profile');
  const [activeTab, setActiveTab] = useState('activity');
  
  // Sample user data
  const user = {
    username: "MovieBuff42",
    avatar: "./images/pfp2.jpg",
    joinDate: "January 2024",
    location: "New York, USA",
    email: "moviebuff42@example.com",
    bio: "Passionate about films and TV shows. Love discussing everything from classic cinema to the latest releases.",
    stats: {
      posts: 156,
      followers: 1234,
      following: 567,
      watchlist: 89
    },
    recentActivity: [
      {
        type: "review",
        title: "Inception",
        rating: 5,
        date: "2 days ago"
      },
      {
        type: "watchlist",
        title: "The Dark Knight",
        date: "3 days ago"
      },
      {
        type: "post",
        title: "Just watched Inception for the 5th time",
        date: "4 days ago"
      }
    ],
    comments: [
      {
        id: 1,
        postTitle: "Just watched Inception for the 5th time",
        content: "The hallway fight scene is a masterpiece of practical effects! The way they achieved zero gravity is mind-blowing.",
        date: "2 days ago",
        upvotes: 38,
        postId: 1
      },
      {
        id: 2,
        postTitle: "Underrated gems from the 90s",
        content: "Before Sunrise is one of the most beautiful love stories ever told. The whole trilogy is amazing.",
        date: "4 days ago",
        upvotes: 42,
        postId: 2
      },
      {
        id: 3,
        postTitle: "The Expanse is the best sci-fi show nobody's watching",
        content: "Completely agree! The attention to scientific detail is unmatched. The way they handle space physics is incredible.",
        date: "5 days ago",
        upvotes: 65,
        postId: 3
      }
    ]
  };

  const toggleExplore = () => {
    setExploreExpanded(!exploreExpanded);
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
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
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
                    src={user.avatar} 
                    alt={user.username} 
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        <span>Joined {user.joinDate}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1" />
                        <span>{user.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail size={16} className="mr-1" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                  <Edit2 size={16} className="mr-2" />
                  Edit Profile
                </button>
              </div>
              
              <p className="mt-4 text-gray-600">{user.bio}</p>
              
              <div className="flex items-center space-x-8 mt-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{user.stats.posts}</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{user.stats.followers}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{user.stats.following}</div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{user.stats.watchlist}</div>
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
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'comments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <MessageSquare size={18} className="mr-2" />
                      Comments
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {user.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        {activity.type === 'review' && (
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                            <Star size={20} className="text-blue-600" />
                          </div>
                        )}
                        {activity.type === 'watchlist' && (
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                            <BookmarkPlus size={20} className="text-green-600" />
                          </div>
                        )}
                        {activity.type === 'post' && (
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                            <User size={20} className="text-purple-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{activity.title}</h3>
                            <span className="text-sm text-gray-500">{activity.date}</span>
                          </div>
                          {activity.rating && (
                            <div className="flex items-center mt-1">
                              {[...Array(activity.rating)].map((_, i) => (
                                <Star key={i} size={16} className="text-yellow-400 fill-current" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    {user.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{comment.postTitle}</h3>
                          <span className="text-sm text-gray-500">{comment.date}</span>
                        </div>
                        <p className="text-gray-700 mb-3">{comment.content}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <div className="flex items-center">
                            <ArrowUp size={14} className="mr-1" />
                            {comment.upvotes}
                          </div>
                          <button 
                            onClick={() => navigate(`/post/${comment.postId}`)}
                            className="ml-4 text-blue-600 hover:text-blue-700"
                          >
                            View Post
                          </button>
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
    </div>
  );
} 