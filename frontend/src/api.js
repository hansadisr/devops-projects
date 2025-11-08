/*const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
};*/

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) {
    return;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'An error occurred with the request');
  }
  
  return data;
}

export const api = {
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getUser: () => request('/api/auth/me'),
  getTasks: () => request('/api/tasks'),
  createTask: (payload) => request('/api/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  deleteTask: (taskId) => request(`/api/tasks/${taskId}`, { method: 'DELETE' }),
  updateTask: (taskId, payload) => request(`/api/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};
