import React, { useState } from 'react';
import './LoginSignup.css';

const LoginSignup = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('bio', bio);
    formData.append('accountType', 'user');
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    const response = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      setMessage('Account created successfully!');
      // Optionally reset the form
      setUsername('');
      setEmail('');
      setPassword('');
      setBio('');
      setProfilePicture(null);
    } else {
      setMessage('Error creating account. Please try again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (response.ok) {
      const userData = await response.json();
      setMessage('Login successful!');
      
      // Store complete user data in localStorage
      const userDataToStore = {
        ...userData,
        joinDate: userData.joinDate || new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        }),
        stats: userData.stats || {
          posts: 0,
          followers: 0,
          following: 0,
          watchlist: 0
        }
      };
      
      localStorage.setItem('user', JSON.stringify(userDataToStore));
      setUsername('');
      setPassword('');
      onClose();
    } else {
      const errorMessage = await response.text();
      setMessage(errorMessage || 'Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="popup">
      <form onSubmit={isLogin ? handleLogin : handleSignup}>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        {isLogin ? (
          <>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files[0])}
            />
          </>
        )}
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        <button type="button" onClick={onClose}>Close</button>
        <p>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
            {isLogin ? ' Sign Up' : ' Login'}
          </span>
        </p>
        {message && <p className="confirmation-message">{message}</p>}
      </form>
    </div>
  );
};

export default LoginSignup;
