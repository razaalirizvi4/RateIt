import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings as SettingsIcon, BookmarkPlus, User, LogOut } from 'lucide-react';
import { CreatePostButton } from './CreatePostButton.jsx';

export default function MovieBrowser() {
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('movies');
  const [activeSidebarItem, setActiveSidebarItem] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const movies = [
    {
      id: 1,
      title: "Inception",
      image: "./images/movie1.jpg",
      genre: "Action, Adventure, Sci-Fi",
      platforms: ["Netflix", "HBO Max"],
      rating: 4.8,
      year: 2010,
      director: "Christopher Nolan",
      description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
    },
    {
      id: 2,
      title: "The Shawshank Redemption",
      image: "./images/movie1.jpg",
      genre: "Drama",
      platforms: ["Netflix", "Amazon Prime"],
      rating: 4.9,
      year: 1994,
      director: "Frank Darabont",
      description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
    },
    {
      id: 3,
      title: "The Dark Knight",
      image: "./images/movie1.jpg",
      genre: "Action, Crime, Drama",
      platforms: ["HBO Max"],
      rating: 4.9,
      year: 2008,
      director: "Christopher Nolan",
      description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
    },
    {
      id: 4,
      title: "Pulp Fiction",
      image: "./images/movie1.jpg",
      genre: "Crime, Drama",
      platforms: ["Amazon Prime", "Netflix"],
      rating: 4.7,
      year: 1994,
      director: "Quentin Tarantino",
      description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption."
    },
    {
      id: 5,
      title: "The Godfather",
      image: "./images/movie1.jpg",
      genre: "Crime, Drama",
      platforms: ["Netflix", "Paramount+"],
      rating: 4.9,
      year: 1972,
      director: "Francis Ford Coppola",
      description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
    },
    {
      id: 6,
      title: "Interstellar",
      image: "./images/movie1.jpg",
      genre: "Adventure, Drama, Sci-Fi",
      platforms: ["Paramount+"],
      rating: 4.7,
      year: 2014,
      director: "Christopher Nolan",
      description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
    },
    {
      id: 7,
      title: "The Matrix",
      image: "./images/movie1.jpg",
      genre: "Action, Sci-Fi",
      platforms: ["HBO Max", "Amazon Prime"],
      rating: 4.8,
      year: 1999,
      director: "Lana Wachowski, Lilly Wachowski",
      description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers."
    },
    {
      id: 8,
      title: "Parasite",
      image: "./images/movie1.jpg",
      genre: "Comedy, Drama, Thriller",
      platforms: ["Hulu"],
      rating: 4.8,
      year: 2019,
      director: "Bong Joon Ho",
      description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."
    }
  ];

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
    console.log(`Added ${movie.title} to watchlist`);
    alert(`Added ${movie.title} to watchlist`);
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
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.director.toLowerCase().includes(searchQuery.toLowerCase())
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
                  placeholder="Search movies"
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

          {/* Movies Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMovies.map(movie => (
                <div
                  key={movie.id}
                  onClick={() => handleMovieClick(movie)}
                  className="bg-white border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <img src={movie.image} alt={movie.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{movie.title}</h3>
                    <p className="text-gray-500 text-sm mb-2">{movie.year} • {movie.director}</p>
                    <p className="text-gray-600 text-sm mb-3">{movie.genre}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Heart size={16} className="text-red-500" />
                        <span className="text-gray-900">{movie.rating}</span>
                      </div>
                      <button
                        onClick={(e) => addToWatchlist(e, movie)}
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

      {/* Movie Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">{selectedMovie.title}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col md:flex-row gap-6">
                <img src={selectedMovie.image} alt={selectedMovie.title} className="w-full md:w-1/3 h-64 object-cover rounded-md" />
                <div className="flex-1">
                  <div className="mb-4">
                    <p className="text-gray-500 mb-2">{selectedMovie.year} • {selectedMovie.director}</p>
                    <p className="text-gray-700 mb-4">{selectedMovie.description}</p>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-red-500 font-semibold">{selectedMovie.rating}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{selectedMovie.genre}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Available on:</span>
                      {selectedMovie.platforms.map((platform, index) => (
                        <span key={index} className="text-blue-500">{platform}</span>
                      ))}
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