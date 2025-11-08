/*import { useState } from 'react';
import { api } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault(); setMsg('');
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('token', data.token);
      setMsg(`Welcome ${data.user?.name || ''}!`);
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div style={{maxWidth:420, margin:'48px auto'}}>
      <h2>Login</h2>
      {msg && <p style={{color:'purple'}}>{msg}</p>}
      <form onSubmit={onSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={{display:'block', width:'100%', marginBottom:8}}/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required style={{display:'block', width:'100%', marginBottom:8}}/>
        <button>Login</button>
      </form>
    </div>
  );
}*/

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/tasks');
    }
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('');
    setIsLoading(true);
    
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('token', data.token);
      console.log('Login successful, token:', data.token); // Debug
      setMsg(`Welcome back ${data.user?.name || ''}! 🎉`);
      window.dispatchEvent(new Event('tokenChange')); // Trigger token change
      setTimeout(() => navigate('/tasks'), 1500);
    } catch (err) {
      console.error('Login error:', err.message); // Debug
      setMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  }
  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="modern-form">
      <h2 className="form-title">Welcome Back! 👋</h2>
      {msg && (
        <div className={msg.includes('Welcome') ? 'success-message' : 'error-message'}>
          {msg}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <input 
          type="email" 
          placeholder="✉️ Enter your email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          className="form-input"
          disabled={isLoading}
        />
        <input 
          type="password" 
          placeholder="🔒 Enter your password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          className="form-input"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="form-button" 
          disabled={isLoading}
        >
          {isLoading ? <span className="loading"></span> : 'Login ✨'}
        </button>
        <div className="form-footer">
              <span>Don't you have an account? </span>
              <button 
                type="button" 
                className="signup-link"
                onClick={handleSignUp}
              >
                Sign Up
              </button>
        </div>
      </form>
    </div>
  );
}
