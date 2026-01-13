import axios from "axios";

const getBaseUrl = () => {
  let url =
    import.meta.env.VITE_API_URL ||
    "https://health-app-backend-production-6421.up.railway.app/api";
  if (!url.endsWith("/api")) {
    if (url.endsWith("/")) {
      url = url + "api";
    } else {
      url = url + "/api";
    }
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optional: Trigger a redirect or event
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
