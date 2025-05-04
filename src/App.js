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
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/test-connection');
        const data = await response.json();
        console.log('Database connection test:', data.message);
      } catch (error) {
        console.error('Error testing database connection:', error);
      }
    };

    testConnection();
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