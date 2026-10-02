import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("doctorJWT");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Any 401 means the stored token is missing, invalid or expired.
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("doctorJWT");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
