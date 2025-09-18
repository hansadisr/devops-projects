import { useState } from 'react';
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
}
