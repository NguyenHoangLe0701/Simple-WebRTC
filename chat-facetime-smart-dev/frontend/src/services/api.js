import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  timeout: 10000, // 10s
});
api.interceptors.request.use(config => {
  // Prefer sessionStorage to avoid cross-tab token overwrite; fall back to localStorage
  const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;