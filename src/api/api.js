import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Outgoing Request:', { ...config, headers: { ...config.headers } });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Incoming Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      config: error.config
    });

    // Handle 401/403 errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Add user-related API functions
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    // Extract username from token without using jwt-decode
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { sub: username } = JSON.parse(jsonPayload);
    return { username };
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

// Add the getCurrentUser function to the api object
api.getCurrentUser = getCurrentUser;

export default api;