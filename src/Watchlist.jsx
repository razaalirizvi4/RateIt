import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Film, Tv, Star, Trash2 } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import axios from 'axios';

export default function Watchlist() {
  const navigate = useNavigate();
  const [activeSidebarItem, setActiveSidebarItem] = useState('watchlist');
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  // Replace the hardcoded useEffect with this:
  useEffect(() => {
      const fetchWatchlist = async () => {
          try {
              const storedUser = localStorage.getItem('user'); // Changed from 'username' to 'user'
              if (!storedUser) {
                  console.error('No user logged in');
                  return;
              }
              const user = JSON.parse(storedUser); // Parse the stored user object
              const username = user.username; // Extract username from user object
  
              const response = await axios.get(`http://localhost:3001/api/watchlist/${username}`);
              setWatchlist(response.data);
              console.log(response.data); // Log the fetched watchlist t
          } catch (error) {
              console.error('Error fetching watchlist:', error);
          }
      };
  
      fetchWatchlist();
  }, []);
  
  // Modify removeFromWatchlist function:
  const removeFromWatchlist = async (e, movieId) => {
      e.stopPropagation();
      try {
          const storedUser = localStorage.getItem('user');
          if (!storedUser) {
              alert('Please log in to remove movies from your watchlist');
              return;
          }
          const user = JSON.parse(storedUser);
          const username = user.username;
  
          // Ensure movieId is a valid number
          if (isNaN(movieId)) {
              console.error('Invalid movie ID:', movieId);
              return;
          }
  
          await axios.delete(`http://localhost:3001/api/watchlist/movie/${username}/${movieId}`);
          setWatchlist(prev => prev.filter(item => item.id !== movieId));
      } catch (error) {
          console.error('Error removing from watchlist:', error);
          alert('Failed to remove movie from watchlist');
      }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        profileDropdownOpen={profileDropdownOpen}
        setProfileDropdownOpen={setProfileDropdownOpen}
      />

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          <Sidebar 
            activeSidebarItem={activeSidebarItem}
            setActiveSidebarItem={setActiveSidebarItem}
            toggleExplore={() => setExploreExpanded(!exploreExpanded)}
            exploreExpanded={exploreExpanded}
          />

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Watchlist</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {watchlist.map(item => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="bg-white border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-gray-300 transition-colors relative group"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => removeFromWatchlist(e, item.id)}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <img
                    src={item.poster} // Changed from posters to poster
                    alt={item.title} // Changed from name to title
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      {item.type === 'movie' ? <Film size={16} /> : <Tv size={16} />}
                      <h3 className="text-lg font-medium text-gray-900">{item.title || item.Name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{item.genre || item.Genre}</p>
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">{item.description || item.Description}</p>
                    <div className="flex items-center space-x-1">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span className="text-gray-900">{item.rating || item.Rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">{selectedItem.title}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col md:flex-row gap-6">
                <img 
                  src={selectedItem.poster} // Changed from posters to poster
                  alt={selectedItem.title} // Changed from name to title
                  className="w-full md:w-1/3 h-64 object-cover rounded-md"
                />
                <div className="flex-1">
                  <p className="text-gray-500 mb-2">
                    {selectedItem.year} • {selectedItem.type === 'movie' ? selectedItem.director : selectedItem.creator}
                  </p>
                  <p className="text-gray-700 mb-4">{selectedItem.description}</p>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-yellow-400 font-semibold flex items-center">
                      <Star size={16} className="fill-current mr-1" />
                      {selectedItem.rating}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{selectedItem.genre}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}