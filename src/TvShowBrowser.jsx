import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Film, Tv, ChevronDown, ChevronRight, BookmarkPlus, Heart } from 'lucide-react';
import Sidebar from './Sidebar'; // Ensure Sidebar is also imported
import Navbar from './Navbar'; // Import the Navbar component
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
        setTvShows(response.data); // Set the TV shows state with the fetched data
      } catch (error) {
        console.error('Error fetching TV shows:', error);
      }
    };

    fetchTvShows(); // Call the fetchTvShows function
  }, []); // Empty dependency array to run only once on component mount

  const toggleExplore = () => {
    setExploreExpanded(!exploreExpanded);
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

  const filteredTvShows = tvShows.filter(tvShow => 
    (tvShow.Name && tvShow.Name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (tvShow.Genre && tvShow.Genre.toLowerCase().includes(searchQuery.toLowerCase()))
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
          />

          {/* TV Show grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTvShows.map(tvShow => (
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
                    <p className="text-gray-500 mb-2">{selectedTvShow.year} • {selectedTvShow.director}</p>
                    <p className="text-gray-700 mb-4">{selectedTvShow.description}</p>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-red-500 font-semibold">{selectedTvShow.rating}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{selectedTvShow.Genre}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Available on:</span>
                      {/* Add platforms if available */}
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