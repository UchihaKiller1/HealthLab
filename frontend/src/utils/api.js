import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // This will be proxied to http://localhost:5000
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // If you're using cookies for auth
});

// Ensure we're not in a test environment
if (process.env.NODE_ENV === 'development') {
  console.log('API base URL:', api.defaults.baseURL);
}

// Add a request interceptor to log requests
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

export default api;
