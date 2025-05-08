import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Heart, MessageSquare } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function People({ onInteract }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSidebarItem, setActiveSidebarItem] = useState('people');
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Fetch all users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const currentUser = JSON.parse(storedUser);
        const [allUsersResponse, friendsResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/users'),
          axios.get(`http://localhost:3001/api/friends/${currentUser.username}`)
          
        ]);

        const friendsUsernames = friendsResponse.data.map(friend => friend.username);
        setUsers(allUsersResponse.data.map(user => ({
          ...user,
          isFollowing: friendsUsernames.includes(user.username)
        })));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleFollow = async (username) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        alert('Please log in to follow users');
        return;
      }

      const currentUser = JSON.parse(storedUser);
      await axios.post('http://localhost:3001/api/friends/add', {
        username: currentUser.username,
        friendUsername: username
      });
      
      // Update local state to reflect the follow
      setUsers(users.map(user => 
        user.username === username ? { ...user, isFollowing: true } : user
      ));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (username) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        alert('Please log in to unfollow users');
        return;
      }
  
      const currentUser = JSON.parse(storedUser);
      await axios.delete(`http://localhost:3001/api/friends/remove`, {
        data: {
          username: currentUser.username,
          friendUsername: username
        }
      });
      
      // Update local state to reflect the unfollow
      setUsers(users.map(user => 
        user.username === username ? { ...user, isFollowing: false } : user
      ));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

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
            <div className="max-w-5xl mx-auto">
              {/* Search bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search people..."
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <User size={20} />
                  </div>
                </div>
              </div>

              {/* Users list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map(user => (
                  <div key={user.username} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.pfp ? (
                          <img src={user.pfp} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{user.username}</h3>
                        <p className="text-sm text-gray-500">{user.accountType || 'Member'}</p>
                      </div>
                    </div>
                    
                    {user.bio && <p className="text-sm text-gray-600 mb-3">{user.bio}</p>}
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => user.isFollowing ? handleUnfollow(user.username) : handleFollow(user.username)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
                          user.isFollowing 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        <Heart size={14} />
                        <span>{user.isFollowing ? 'Unfriend' : 'Follow'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No users found matching your search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}