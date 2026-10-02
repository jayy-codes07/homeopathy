import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Injected by the Redux store (see src/store/index.ts). This module must not
// import the store: the patients slice imports this file, so importing the
// store here would create a cycle.
let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export const configureApi = (options: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) => {
  getToken = options.getToken;
  onUnauthorized = options.onUnauthorized;
};

api.interceptors.request.use((config) => {
  const token = getToken();
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
      onUnauthorized();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
