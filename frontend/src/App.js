/*import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';

function Home() {
  const token = localStorage.getItem('token');
  return (
    <div style={{maxWidth:620, margin:'48px auto'}}>
      <h1>Task Manager</h1>
      <p>{token ? 'You are logged in.' : 'Please login or signup.'}</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{padding:12, borderBottom:'1px solid #eee'}}>
        <Link to="/">Home</Link>{" | "}
        <Link to="/login">Login</Link>{" | "}
        <Link to="/signup">Signup</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
  );
}
*/

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Tasks from './pages/Tasks';
import { api } from './api';
import './App.css';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [tokenChange, setTokenChange] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('Checking auth, token:', token);
      if (token) {
        try {
          const response = await api.getUser();
          console.log('getUser response:', response);
          setUserName(response.user.name);
          setIsLoggedIn(true);
          setError('');
        } catch (err) {
          console.error('getUser error:', err.message);
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setUserName('');
          setError('Failed to fetch user details. Please log in again.');
          setTimeout(() => setError(''), 3000);
        }
      } else {
        console.log('No token found');
        setIsLoggedIn(false);
        setUserName('');
      }
    };
    checkAuth();

    const handleTokenChange = () => {
      console.log('Token change detected');
      setTokenChange(prev => prev + 1);
    };
    window.addEventListener('tokenChange', handleTokenChange);
    return () => window.removeEventListener('tokenChange', handleTokenChange);
  }, [tokenChange]);

  const handleLogout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      <nav className="modern-nav">
        <div className="nav-links">
          {!isLoggedIn ? (
            <>
              <Link to="/signup" className="nav-link">Sign Up</Link>
              <Link to="/login" className="nav-link">Login</Link>
            </>
          ) : (
            <Link to="/tasks" className="nav-link">My Tasks</Link>
          )}
        </div>
        {isLoggedIn && (
          <div className="nav-user">
            <span className="nav-username">{userName || 'User'}</span>
            <button onClick={handleLogout} className="nav-logout-button">
              Logout
            </button>
          </div>
        )}
      </nav>
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            <div className="page-container welcome-container">
              <h1 className="welcome-title">Welcome to TaskFlow</h1>
              <p className="welcome-subtitle">Organize your life, one task at a time</p>
              <div className="form-footer">
                <button 
                  type="button" 
                  className="start"
                  onClick={handleLogin}
                >
                  ✨ Let's Get Started ✨
                </button>
              </div>
            </div>
          } />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
