import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import LoginSignup from './LoginSignup';

const Navbar = ({ searchQuery, setSearchQuery, profileDropdownOpen, setProfileDropdownOpen }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-12">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-6 h-6 relative">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path
                d="M5 4.5L19 12L5 19.5V4.5Z"
                className="fill-current"
                style={{
                  fill: 'url(#playButtonGradient)'
                }}
              />
              <defs>
                <linearGradient id="playButtonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FF7B54' }} />
                  <stop offset="100%" style={{ stopColor: '#FF4081' }} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-xl font-bold" style={{
            background: 'linear-gradient(135deg, #FF7B54, #FF4081)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>RateIt</span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-1.5 pl-10 pr-4 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Profile Section */}
        <div className="relative profile-dropdown-container">
          {!user ? (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
            >
              Log In
            </button>
          ) : (
            <>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <img 
                  src={user.pfp} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200">
                  <div className="p-2">
                    <Link 
                      to="/profile" 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      View Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginSignup onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

export default Navbar;
