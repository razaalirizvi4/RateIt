import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Home, Compass, Film, Tv, ChevronDown, ChevronRight, Heart, Settings as SettingsIcon, User, LogOut, Bell, Lock, Globe, Moon, Sun, Shield, HelpCircle } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('settings');
  const [activeTab, setActiveTab] = useState('account');
  
  // Sample settings data
  const settings = {
    account: {
      email: "moviebuff42@example.com",
      username: "MovieBuff42",
      password: "********",
      notifications: {
        email: true,
        push: true,
        marketing: false
      }
    },
    privacy: {
      profileVisibility: "public",
      showActivity: true,
      showWatchlist: true,
      showRatings: true
    },
    appearance: {
      theme: "light",
      fontSize: "medium",
      compactMode: false
    }
  };

  const toggleExplore = () => {
    setExploreExpanded(!exploreExpanded);
  };

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
                  placeholder="Search"
                  className="w-full py-1.5 pl-10 pr-4 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <SettingsIcon size={20} />
              </button>
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
                      setActiveSidebarItem('movies');
                      navigate('/explore/movies');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeSidebarItem === 'movies' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Film size={16} className="mr-3" />
                    Movies
                  </button>
                  <button 
                    onClick={() => {
                      setActiveSidebarItem('tvshows');
                      navigate('/explore/tvshows');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeSidebarItem === 'tvshows' 
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

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg">
              {/* Settings Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'account'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <User size={18} className="mr-2" />
                      Account
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('privacy')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'privacy'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Shield size={18} className="mr-2" />
                      Privacy
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('appearance')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'appearance'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Sun size={18} className="mr-2" />
                      Appearance
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'notifications'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Bell size={18} className="mr-2" />
                      Notifications
                    </div>
                  </button>
                </nav>
              </div>

              {/* Settings Content */}
              <div className="p-6">
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            value={settings.account.email}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Username</label>
                          <input
                            type="text"
                            value={settings.account.username}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Password</label>
                          <input
                            type="password"
                            value={settings.account.password}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Profile Visibility</label>
                            <p className="text-sm text-gray-500">Control who can see your profile</p>
                          </div>
                          <select
                            value={settings.privacy.profileVisibility}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="friends">Friends Only</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Show Activity</label>
                            <p className="text-sm text-gray-500">Display your recent activity on your profile</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.privacy.showActivity}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Show Watchlist</label>
                            <p className="text-sm text-gray-500">Display your watchlist on your profile</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.privacy.showWatchlist}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Appearance Settings</h3>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Theme</label>
                            <p className="text-sm text-gray-500">Choose your preferred theme</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <button className="p-2 rounded-full bg-gray-100">
                              <Sun size={20} className="text-gray-600" />
                            </button>
                            <button className="p-2 rounded-full bg-gray-100">
                              <Moon size={20} className="text-gray-600" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Font Size</label>
                            <p className="text-sm text-gray-500">Adjust the text size</p>
                          </div>
                          <select
                            value={settings.appearance.fontSize}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Compact Mode</label>
                            <p className="text-sm text-gray-500">Show more content in less space</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.appearance.compactMode}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.account.notifications.email}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                            <p className="text-sm text-gray-500">Receive push notifications</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.account.notifications.push}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Marketing Emails</label>
                            <p className="text-sm text-gray-500">Receive marketing and promotional emails</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.account.notifications.marketing}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 