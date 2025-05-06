import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, Film, Tv, ChevronDown, ChevronRight } from 'lucide-react';

const Sidebar = ({ activeSidebarItem, setActiveSidebarItem, toggleExplore, exploreExpanded }) => {
  const navigate = useNavigate();

  return (
    <div className="w-64 flex-shrink-0 sticky top-0 h-screen">
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
            <Link 
              to="/explore/movies" 
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeSidebarItem === 'movies' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveSidebarItem('movies')}
            >
              <Film size={16} className="mr-3" />
              Movies
            </Link>
            <Link 
              to="/explore/tvshows" 
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeSidebarItem === 'tvshows' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveSidebarItem('tvshows')}
            >
              <Tv size={16} className="mr-3" />
              TV Shows
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
