import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, MessageSquare } from 'lucide-react';

export default function Leaderboard() {
  const [topPosters, setTopPosters] = useState([]);

  useEffect(() => {
    const fetchTopPosters = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/users/top-posters');
        setTopPosters(response.data);
      } catch (error) {
        console.error('Error fetching top posters:', error);
      }
    };

    fetchTopPosters();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-4">
        <Trophy className="text-yellow-500 mr-2" size={20} />
        <h2 className="text-lg font-semibold text-gray-900">Top Posters</h2>
      </div>
      <div className="space-y-3">
        {topPosters.map((user, index) => (
          <div key={user.username} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`w-6 text-sm font-medium ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-gray-400' :
                index === 2 ? 'text-amber-600' :
                'text-gray-500'
              }`}>
                #{index + 1}
              </span>
              <img
                src={user.pfp ? `http://localhost:3001${user.pfp}` : './images/pfp.jpg'}
                alt={user.username}
                className="w-8 h-8 rounded-full mx-2"
              />
              <span className="text-sm font-medium text-gray-900">{user.username}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <MessageSquare size={14} className="mr-1" />
              <span>{user.PostCount} posts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}