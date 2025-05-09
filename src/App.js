import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import MovieBrowser from './MovieBrowser';
import TvShowBrowser from './TvShowBrowser';
import ViewProfile from './ViewProfile';
import Settings from './Settings';
import Recommendations from './Recommendations';
import LoginSignup from './LoginSignup';
import Watchlist from './Watchlist';
import People from './People';
import Trending from './Trending';

function App() {
  const [isPopupOpen, setPopupOpen] = useState(false);

  const handleInteraction = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setPopupOpen(true);
    }
  };

  useEffect(() => {
    
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home onInteract={handleInteraction} />} />
        <Route path="/explore/movies" element={<MovieBrowser onInteract={handleInteraction} />} />
        <Route path="/explore/tvshows" element={<TvShowBrowser onInteract={handleInteraction} />} />
        <Route path="/profile" element={<ViewProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/people" element={<People onInteract={handleInteraction} />} />
        <Route path="/trending" element={<Trending onInteract={handleInteraction} />} />
      </Routes>
      {isPopupOpen && <LoginSignup onClose={() => setPopupOpen(false)} />}
    </Router>
  );
}

export default App;