import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings as SettingsIcon, BookmarkPlus, User, LogOut } from 'lucide-react';
import { CreatePostButton } from './CreatePostButton.jsx';
import axios from 'axios'; // Import axios for making API calls
import ViewProfile from './ViewProfile';
import Settings from './Settings';
import Recommendations from './Recommendations';
import Sidebar from './Sidebar'; // Import the Sidebar component
import Navbar from './Navbar'; // Import the Navbar component

export default function MovieBrowser() {
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('movies');
  const [activeSidebarItem, setActiveSidebarItem] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [movies, setMovies] = useState([]); // State to hold movies

  // Fetch movies from the database
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/movies'); // Updated to the correct port
        setMovies(response.data); // Set the movies state with the fetched data
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies(); // Call the fetchMovies function
  }, []); // Empty dependency array to run only once on component mount

  const toggleExplore = () => {
    setExploreExpanded(!exploreExpanded);
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const addToWatchlist = (e, movie) => {
    e.stopPropagation(); 
    console.log(`Added ${movie.name} to watchlist`);
    alert(`Added ${movie.name} to watchlist`);
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

  const filteredMovies = movies.filter(movie => 
    (movie.name && movie.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (movie.genre && movie.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        profileDropdownOpen={profileDropdownOpen} 
        setProfileDropdownOpen={setProfileDropdownOpen} 
      />

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          <Sidebar 
            activeSidebarItem={activeSidebarItem} 
            setActiveSidebarItem={setActiveSidebarItem} 
            toggleExplore={toggleExplore} 
            exploreExpanded={exploreExpanded} 
            className="my-2"
          />

          {/* Movies Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMovies.map(movie => (
                <div
                  key={movie.id}
                  onClick={() => handleMovieClick(movie)}
                  className="bg-white border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <img src={movie.posters} alt={movie.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{movie.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{movie.genre}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500 font-semibold">{movie.rating}</span>
                      <BookmarkPlus 
                        size={16} 
                        className="text-blue-500 cursor-pointer hover:text-blue-600" 
                        onClick={(e) => addToWatchlist(e, movie)} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Movie Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">{selectedMovie.name}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col md:flex-row gap-6">
                <img src={selectedMovie.posters} alt={selectedMovie.name} className="w-full md:w-1/3 h-64 object-cover rounded-md" />
                <div className="flex-1">
                  <div className="mb-4">
                    <p className="text-gray-500 mb-2">{selectedMovie.release_year} • {selectedMovie.director}</p>
                    <p className="text-gray-700 mb-4">{selectedMovie.description}</p>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-red-500 font-semibold">{selectedMovie.rating}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{selectedMovie.genre}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Available on:</span>
                      {//selectedMovie.platforms.map((platform, index) => (
                        //<span key={index} className="text-blue-500">{platform}</span>))
                      }
                    </div>
                  </div>
                  <button
                    onClick={(e) => addToWatchlist(e, selectedMovie)}
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