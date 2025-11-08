/*import { useState } from 'react';
import { api } from '../api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault(); setMsg('');
    try {
      const data = await api.signup({ name, email, password });
      localStorage.setItem('token', data.token);
      setMsg('Account created! You can go to Login.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div style={{maxWidth:420, margin:'48px auto'}}>
      <h2>Sign up</h2>
      {msg && <p style={{color:'purple'}}>{msg}</p>}
      <form onSubmit={onSubmit}>
        <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required style={{display:'block', width:'100%', marginBottom:8}}/>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={{display:'block', width:'100%', marginBottom:8}}/>
        <input type="password" placeholder="Password (min 6)" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required style={{display:'block', width:'100%', marginBottom:8}}/>
        <button>Create account</button>
      </form>
    </div>
  );
}*/
import { useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
   const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('');
    setIsLoading(true);
    
    try {
      const data = await api.signup({ name, email, password });
      localStorage.setItem('token', data.token);
      setMsg('🎉 Account created successfully! You can now login.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="modern-form">
      <h2 className="form-title">Join TaskFlow! 🚀</h2>
      {msg && (
        <div className={msg.includes('🎉') ? 'success-message' : 'error-message'}>
          {msg}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <input 
          placeholder="👤 Full name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
          className="form-input"
          disabled={isLoading}
        />
        <input 
          type="email" 
          placeholder="✉️ Email address" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          className="form-input"
          disabled={isLoading}
        />
        <input 
          type="password" 
          placeholder="🔒 Password (min 6 characters)" 
          minLength={6} 
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
          {isLoading ? <span className="loading"></span> : 'Create Account ✨'}
        </button>
        <div className="form-footer">
              <span>Do you have an account? </span>
              <button 
                type="button" 
                className="signup-link"
                onClick={handleLogin}
              >
                Log In
              </button>
        </div>
      </form>
    </div>
  );
}
