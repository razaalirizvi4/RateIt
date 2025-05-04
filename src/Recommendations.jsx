import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings, User, LogOut, Star, ThumbsUp, Clock } from 'lucide-react';

export default function Recommendations() {
  const navigate = useNavigate();
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('recommendations');
  const [activeTab, setActiveTab] = useState('movies');
  
  // Sample recommendations data
  const recommendations = {
    movies: [
      {
        id: 1,
        title: "Inception",
        poster: "/api/placeholder/300/450",
        rating: 4.8,
        year: 2010,
        genre: "Sci-Fi",
        match: 95,
        reason: "Based on your interest in mind-bending films"
      },
      {
        id: 2,
        title: "The Dark Knight",
        poster: "/api/placeholder/300/450",
        rating: 4.9,
        year: 2008,
        genre: "Action",
        match: 92,
        reason: "Matches your preference for complex narratives"
      },
      {
        id: 3,
        title: "Parasite",
        poster: "/api/placeholder/300/450",
        rating: 4.7,
        year: 2019,
        genre: "Thriller",
        match: 88,
        reason: "Similar to your favorite social commentary films"
      }
    ],
    tvshows: [
      {
        id: 1,
        title: "Breaking Bad",
        poster: "/api/placeholder/300/450",
        rating: 4.9,
        year: "2008-2013",
        genre: "Drama",
        match: 97,
        reason: "Matches your interest in character-driven stories"
      },
      {
        id: 2,
        title: "The Expanse",
        poster: "/api/placeholder/300/450",
        rating: 4.7,
        year: "2015-2022",
        genre: "Sci-Fi",
        match: 94,
        reason: "Based on your love for sci-fi series"
      },
      {
        id: 3,
        title: "Succession",
        poster: "/api/placeholder/300/450",
        rating: 4.8,
        year: "2018-2023",
        genre: "Drama",
        match: 91,
        reason: "Similar to your favorite family dramas"
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
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <User size={20} />
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

          {/* Recommendations Content */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('movies')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'movies'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Film size={18} className="mr-2" />
                      Movies
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('tvshows')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'tvshows'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Tv size={18} className="mr-2" />
                      TV Shows
                    </div>
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTab === 'movies' && recommendations.movies.map((movie) => (
                    <div key={movie.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                      <div className="relative">
                        <img src={movie.poster} alt={movie.title} className="w-full h-[300px] object-cover" />
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                          {movie.match}% Match
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{movie.title}</h3>
                          <div className="flex items-center">
                            <Star size={16} className="text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-medium text-gray-900">{movie.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <span>{movie.year}</span>
                          <span className="mx-2">•</span>
                          <span>{movie.genre}</span>
                        </div>
                        <p className="text-sm text-gray-600">{movie.reason}</p>
                      </div>
                    </div>
                  ))}

                  {activeTab === 'tvshows' && recommendations.tvshows.map((show) => (
                    <div key={show.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                      <div className="relative">
                        <img src={show.poster} alt={show.title} className="w-full h-[300px] object-cover" />
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                          {show.match}% Match
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{show.title}</h3>
                          <div className="flex items-center">
                            <Star size={16} className="text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-medium text-gray-900">{show.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <span>{show.year}</span>
                          <span className="mx-2">•</span>
                          <span>{show.genre}</span>
                        </div>
                        <p className="text-sm text-gray-600">{show.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 