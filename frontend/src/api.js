const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function send(path, payload) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  signup: (p) => send('/api/auth/signup', p),
  login:  (p) => send('/api/auth/login',  p),
};
