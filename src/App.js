import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import MovieBrowser from './MovieBrowser';
import TvShowBrowser from './TvShowBrowser';
import ViewProfile from './ViewProfile';
import Settings from './Settings';
import Recommendations from './Recommendations';

function App() {
  useEffect(() => {
    
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore/movies" element={<MovieBrowser />} />
        <Route path="/explore/tvshows" element={<TvShowBrowser />} />
        <Route path="/profile" element={<ViewProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>
    </Router>
  );
}

export default App;