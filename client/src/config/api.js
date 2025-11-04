import axios from "axios";

const api = axios.create({
  // During local dev the API is on 5000. In prod you can swap.
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

// If you add a token later:
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
