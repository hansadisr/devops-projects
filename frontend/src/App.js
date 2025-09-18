import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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

