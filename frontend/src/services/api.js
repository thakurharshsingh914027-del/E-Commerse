import axios from 'axios';

const rawBaseURL = (import.meta.env.VITE_API_URL || 'https://e-commerse-r3dd.onrender.com').trim();
// Strip trailing /api or / from baseURL so paths starting with /api/ don't duplicate
const baseURL = rawBaseURL.replace(/\/api\/?$/, '').replace(/\/$/, '');

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests and normalize URL
API.interceptors.request.use(
  (config) => {
    if (config.url) {
      // Fix any accidental double /api/api/
      config.url = config.url.replace(/^\/api\/api\//, '/api/');
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 - unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login/register page
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
