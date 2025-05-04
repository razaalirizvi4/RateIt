import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings, User, LogOut, BookmarkPlus } from 'lucide-react';
import { CreatePostButton } from './CreatePostButton.jsx';

export default function TvShowBrowser() {
  const navigate = useNavigate();
  const [selectedTvShow, setSelectedTvShow] = useState(null);
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('tvshows');
  const [activeSidebarItem, setActiveSidebarItem] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const tvShows = [
    {
      id: 1,
      title: "Wednesday",
      image: "./images/tv1.jpg",
      genre: "Crime, Drama, Thriller",
      platforms: ["Netflix", "Amazon Prime"],
      rating: 4.9,
      year: 2008,
      creator: "Vince Gilligan",
      description: "A high school chemistry teacher turned methamphetamine producer navigates the dangers of the criminal underworld."
    },
    {
      id: 2,
      title: "Stranger Things",
      image: "./images/tv1.jpg",
      genre: "Drama, Fantasy, Horror",
      platforms: ["Netflix"],
      rating: 4.8,
      year: 2016,
      creator: "The Duffer Brothers",
      description: "When a young boy disappears, a small town uncovers a mystery involving secret experiments, supernatural forces, and a strange girl."
    },
    {
      id: 3,
      title: "Game of Thrones",
      image: "./images/tv1.jpg",
      genre: "Action, Adventure, Drama",
      platforms: ["HBO Max"],
      rating: 4.7,
      year: 2011,
      creator: "David Benioff, D.B. Weiss",
      description: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia."
    },
    {
      id: 4,
      title: "The Office",
      image: "./images/tv1.jpg",
      genre: "Comedy",
      platforms: ["Peacock", "Netflix"],
      rating: 4.6,
      year: 2005,
      creator: "Greg Daniels",
      description: "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium."
    },
    {
      id: 5,
      title: "The Crown",
      image: "./images/tv1.jpg",
      genre: "Biography, Drama, History",
      platforms: ["Netflix"],
      rating: 4.5,
      year: 2016,
      creator: "Peter Morgan",
      description: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the twentieth century."
    },
    {
      id: 6,
      title: "The Mandalorian",
      image: "./images/tv1.jpg",
      genre: "Action, Adventure, Fantasy",
      platforms: ["Disney+"],
      rating: 4.7,
      year: 2019,
      creator: "Jon Favreau",
      description: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic."
    },
    {
      id: 7,
      title: "Friends",
      image: "./images/tv1.jpg",
      genre: "Comedy, Romance",
      platforms: ["Netflix", "HBO Max"],
      rating: 4.8,
      year: 1994,
      creator: "David Crane, Marta Kauffman",
      description: "Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan."
    },
    {
      id: 8,
      title: "The Witcher",
      image: "./images/tv1.jpg",
      genre: "Action, Adventure, Drama",
      platforms: ["Netflix"],
      rating: 4.6,
      year: 2019,
      creator: "Lauren Schmidt Hissrich",
      description: "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts."
    }
  ];

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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const addToWatchlist = (e, tvShow) => {
    e.stopPropagation(); 
    console.log(`Added ${tvShow.title} to watchlist`);
    alert(`Added ${tvShow.title} to watchlist`);
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

  const filteredTvShows = tvShows.filter(tvShow => 
    tvShow.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tvShow.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tvShow.creator.toLowerCase().includes(searchQuery.toLowerCase())
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
                  placeholder="Search TV shows"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full py-1.5 pl-10 pr-4 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
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
              {filteredTvShows.map((tvShow) => (
                <div
                  key={tvShow.id}
                  onClick={() => handleTvShowClick(tvShow)}
                  className="bg-white border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <img
                    src={tvShow.image}
                    alt={tvShow.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{tvShow.title}</h3>
                    <p className="text-gray-500 text-sm mb-2">{tvShow.year} • {tvShow.creator}</p>
                    <p className="text-gray-600 text-sm mb-3">{tvShow.genre}</p>
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TV Show Modal */}
      {selectedTvShow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">{selectedTvShow.title}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col md:flex-row gap-6">
                <img src={selectedTvShow.image} alt={selectedTvShow.title} className="w-full md:w-1/3 h-64 object-cover rounded-md" />
                <div className="flex-1">
                  <div className="mb-4">
                    <p className="text-gray-500 mb-2">{selectedTvShow.year} • {selectedTvShow.creator}</p>
                    <p className="text-gray-700 mb-4">{selectedTvShow.description}</p>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-red-500 font-semibold">{selectedTvShow.rating}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{selectedTvShow.genre}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Available on:</span>
                      {selectedTvShow.platforms.map((platform, index) => (
                        <span key={index} className="text-blue-500">{platform}</span>
                      ))}
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