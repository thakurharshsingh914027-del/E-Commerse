import axios from "axios";

const rawBaseURL = (import.meta.env.VITE_API_URL || "https://e-commerse-r3dd.onrender.com").trim();
const cleanBase = rawBaseURL.replace(/\/api\/?$/, '').replace(/\/$/, '');
const baseURL = `${cleanBase}/api`;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  if (config.url) {
    config.url = config.url.replace(/^\/api\/api\//, '/').replace(/^\/api\//, '/');
  }
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
