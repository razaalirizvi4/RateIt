import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings, User, LogOut, Star, ThumbsUp, Clock } from 'lucide-react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Recommendations() {
  const navigate = useNavigate();
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('recommendations');
  const [activeTab, setActiveTab] = useState('movies');
  const [recommendations, setRecommendations] = useState({ movies: [], tvshows: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          navigate('/');
          return;
        }

        const user = JSON.parse(storedUser);
        const response = await axios.get(`http://localhost:3001/api/recommendations/${user.username}`);
        
        // The response already contains both movies and tvshows
        setRecommendations({
          movies: response.data.movies || [],
          tvshows: response.data.tvshows || []
        });
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    fetchRecommendations();
  }, [navigate]);

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
                    <div key={movie.ContentID} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                      <div className="relative">
                        <img src={movie.posters} alt={movie.Title} className="w-full h-[300px] object-cover" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{movie.Title}</h3>
                          <div className="flex items-center">
                            <Star size={16} className="text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-medium text-gray-900">{movie.popularity}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <span>{movie.genre}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {activeTab === 'tvshows' && recommendations.tvshows.map((show) => (
                    <div key={show.ContentID} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                      <div className="relative">
                        <img src={show.posters} alt={show.Title} className="w-full h-[300px] object-cover" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{show.Title}</h3>
                          <div className="flex items-center">
                            <Star size={16} className="text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-medium text-gray-900">{show.popularity}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <span>{show.Genre}</span>
                        </div>
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