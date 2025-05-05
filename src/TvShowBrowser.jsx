import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings, User, LogOut, BookmarkPlus } from 'lucide-react';
import { CreatePostButton } from './CreatePostButton.jsx';
import axios from 'axios'; // Import axios for making API calls

export default function TvShowBrowser() {
  const navigate = useNavigate();
  const [selectedTvShow, setSelectedTvShow] = useState(null);
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('tvshows');
  const [activeSidebarItem, setActiveSidebarItem] = useState('explore');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [tvShows, setTvShows] = useState([]); // State to hold TV shows
  const [searchQuery, setSearchQuery] = useState(''); // State to hold the search query

  // Fetch TV shows from the database
  useEffect(() => {
    const fetchTvShows = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/tvshows');
        console.log(response.data); // Log the response data
        setTvShows(response.data); // Set the TV shows state with the fetched data
      } catch (error) {
        console.error('Error fetching TV shows:', error);
      }
    };

    fetchTvShows(); // Call the fetchTvShows function
  }, []); // Empty dependency array to run only once on component mount

  const toggleExplore = () => {
    setExploreExpanded(!exploreExpanded);
    setActiveSidebarItem('explore');
  };

  const handleTvShowClick = (tvShow) => {
    setSelectedTvShow(tvShow);
  };

  const closeModal = () => {
    setSelectedTvShow(null);
  };

  const addToWatchlist = (e, tvShow) => {
    e.stopPropagation(); 
    console.log(`Added ${tvShow.name} to watchlist`);
    alert(`Added ${tvShow.name} to watchlist`);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };
  
  // Close profile dropdown when clicking outside
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
                  placeholder="Search TV shows"
                  className="w-full py-1.5 pl-10 pr-4 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CreatePostButton />
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
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
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
                    onClick={() => {
                      setActiveSection('movies');
                      navigate('/explore/movies');
                    }}
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
                    onClick={() => {
                      setActiveSection('tvshows');
                      navigate('/explore/tvshows');
                    }}
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
            </nav>
          </div>

          {/* TV Show grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.isArray(tvShows) && tvShows.length > 0 ? (
                tvShows
                  .filter(tvShow => 
                    tvShow.Name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    tvShow.Genre.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((tvShow) => (
                    <div
                      key={tvShow.TVShow_ID}
                      onClick={() => handleTvShowClick(tvShow)}
                      className="bg-white border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
                    >
                      <img
                        src={tvShow.Posters}
                        alt={tvShow.Name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{tvShow.Name}</h3>
                        <p className="text-gray-500 text-sm mb-2">{tvShow.Seasons} Seasons • {tvShow.director || 'Unknown Director'}</p>
                        <p className="text-gray-600 text-sm mb-3">{tvShow.Genre}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Heart size={16} className="text-red-500" />
                            <span className="text-gray-900">{tvShow.rating}</span>
                          </div>
                          <button
                            onClick={(e) => addToWatchlist(e, tvShow)}
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <BookmarkPlus size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500">No TV shows found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TV Show Modal */}
      {selectedTvShow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">{selectedTvShow.Name}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col md:flex-row gap-6">
                <img src={selectedTvShow.Posters} alt={selectedTvShow.Name} className="w-full md:w-1/3 h-64 object-cover rounded-md" />
                <div className="flex-1">
                  <div className="mb-4">
                    <p className="text-gray-500 mb-2">{'selectedTvShow.year'} • {selectedTvShow.director}</p>
                    <p className="text-gray-700 mb-4">{selectedTvShow.description}</p>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-red-500 font-semibold">{selectedTvShow.rating}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{selectedTvShow.Genre}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Available on:</span>
                      
                    </div>
                  </div>
                  <button
                    onClick={(e) => addToWatchlist(e, selectedTvShow)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <BookmarkPlus size={20} />
                    <span>Add to Watchlist</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}