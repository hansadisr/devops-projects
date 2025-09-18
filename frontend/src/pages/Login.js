import { useState } from 'react';
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
}
