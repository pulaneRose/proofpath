import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
    : '/api',
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('proofpath_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('proofpath_token');
      localStorage.removeItem('proofpath_user');

      // Only redirect if not already on public routes or already showing expired flag
      const isPublicPage = ['/login', '/register', '/'].includes(window.location.pathname);
      const isAlreadyRedirecting = window.location.search.includes('expired=true');
      const isInitialCheck = error.config?.url?.includes('/auth/me');

      if (!isPublicPage && !isAlreadyRedirecting && !isInitialCheck) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
