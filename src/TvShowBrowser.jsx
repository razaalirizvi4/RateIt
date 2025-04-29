import { useState, useEffect } from 'react';
import { X, Search, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings, User, LogOut } from 'lucide-react';
import { CreatePostButton } from './CreatePostButton.jsx';

export default function TvShowBrowser() {
  const [selectedTvShow, setSelectedTvShow] = useState(null);
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('tvshows');
  const [activeSidebarItem, setActiveSidebarItem] = useState('explore'); // Default to 'explore'
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
              placeholder="Search TV shows"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full py-2 pl-10 pr-4 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-pink-600 transition-all duration-300"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
        <CreatePostButton />

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
                  className={`flex items-center justify-between p-3 rounded-md w-full text-left transition duration-300 ${
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
                  <div className="ml-6 mt-1 space-y-1 animate-fadeIn">
                    <button 
                      className={`flex items-center p-2 rounded-md w-full text-left transition duration-200 ${activeSection === 'tvshows' ? 'bg-gradient-to-r from-pink-800/40 to-orange-300/40' : 'hover:bg-gray-800'}`}
                      onClick={() => setActiveSection('tvshows')}
                    >
                      <Tv size={16} className="mr-2 text-pink-400" />
                      <span>TV Shows</span>
                    </button>
                    <button 
                      className={`flex items-center p-2 rounded-md w-full text-left transition duration-200 ${activeSection === 'movies' ? 'bg-gradient-to-r from-pink-800/40 to-orange-300/40' : 'hover:bg-gray-800'}`}
                      onClick={() => setActiveSection('movies')}
                    >
                      <Film size={16} className="mr-2 text-orange-300" />
                      <span>Movies</span>
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
                  <Settings size={20} className="mr-3 text-orange-300" />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* TV Show grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-black via-gray-900 to-black">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredTvShows.map((tvShow) => (
              <div
                key={tvShow.id}
                className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-700/20 border border-gray-800 hover:border-orange-300/30 cursor-pointer group"
                onClick={() => handleTvShowClick(tvShow)}
              >
                <div className="p-3">
                  <div className="rounded-lg overflow-hidden mb-3 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300 z-10"></div>
                    <img
                      src={tvShow.image}
                      alt={tvShow.title}
                      className="w-full object-cover aspect-[2/3]" 
                    />
                  </div>
                  
                  <div className="px-1">
                    <h3 className="font-medium text-center text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-700 group-hover:to-orange-300 transition-all duration-300">{tvShow.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-400 text-sm">{tvShow.year}</span>
                      <span className="text-yellow-400 text-sm">{tvShow.rating}⭐</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for TV show details - Smaller size and lighter orange */}
      {selectedTvShow && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg w-full max-w-3xl relative border border-gray-800">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white hover:scale-110 transition-all duration-300 z-20"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col md:flex-row">
              {/* Left side - Image */}
              <div className="w-full md:w-2/5">
                <div className="relative h-full">
                  <img
                    src={selectedTvShow.image}
                    alt={selectedTvShow.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Right side - Content */}
              <div className="w-full md:w-3/5 p-5 md:p-6">
                <div className="flex items-center mb-2">
                  <span className="flex items-center text-yellow-400 mr-3">
                    <span className="text-lg font-semibold">{selectedTvShow.rating}</span>
                    ⭐
                  </span>
                  <span className="text-gray-400">{selectedTvShow.year}</span>
                </div>
                
                <h2 className="text-2xl font-bold mb-3">{selectedTvShow.title}</h2>
                
                <div className="mb-4">
                  <h3 className="text-base font-medium mb-1">Genre</h3>
                  <p className="text-gray-300 text-sm">{selectedTvShow.genre}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-base font-medium mb-1">Creator</h3>
                  <p className="text-gray-300 text-sm">{selectedTvShow.creator}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-base font-medium mb-1">Synopsis</h3>
                  <p className="text-gray-300 text-sm">{selectedTvShow.description}</p>
                </div>
                
                <div className="mb-5">
                  <h3 className="text-base font-medium mb-2">Available on</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTvShow.platforms.map((platform, index) => (
                      <span key={index} className="bg-gray-800 rounded-md px-3 py-1 text-xs">{platform}</span>
                    ))}
                  </div>
                </div>
                
                {/* Add to Watchlist Button */}
                <div>
                  <button 
                    onClick={(e) => addToWatchlist(e, selectedTvShow)}
                    className="w-full bg-gradient-to-r from-pink-800 to-orange-300 text-white px-4 py-2 rounded-md hover:from-pink-900 hover:to-orange-400 transition duration-300 font-medium"
                  >
                    Add to Watchlist
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