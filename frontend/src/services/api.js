// src/services/api.js
import axios from 'axios';
   const BASE_URL = process.env.REACT_APP_API_URL;

const API_URL = `${BASE_URL}/api`;

// Create axios instance with default config
const apiInstance = axios.create({
  baseURL: API_URL,
});

// Add token to all requests automatically
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const api = {
  // Stock related endpoints
  getStocks: () => apiInstance.get('/stocks'),
  getStockBySymbol: (symbol) => apiInstance.get(`/stocks/${symbol}`),
  
  // Portfolio related endpoints
getPortfolio: () => apiInstance.get('/portfolio'),
  buyStock: (data) => apiInstance.post('/portfolio/buy', data),
  sellStock: (data) => apiInstance.post('/portfolio/sell', data),
  getTransactionHistory: () => apiInstance.get('/portfolio/transactions'),
  
  // Authentication related endpoints
  login: (credentials) => apiInstance.post('/auth/login', credentials),
  register: (userData) => apiInstance.post('/auth/register', userData),
};

export default api;