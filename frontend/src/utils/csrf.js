import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

let csrfToken = null;

export const getCSRFToken = async () => {
  if (!csrfToken) {
    try {
      const response = await axios.get(API_ENDPOINTS.CSRF_TOKEN, {
        withCredentials: true
      });
      csrfToken = response.data.csrfToken;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }
  return csrfToken;
};

export const setupAxiosInterceptors = () => {
  // Request interceptor to add CSRF token
  axios.interceptors.request.use(
    async (config) => {
      // Skip CSRF for GET requests and auth endpoints
      if (config.method !== 'get' && !config.url.includes('/auth/')) {
        const token = await getCSRFToken();
        if (token) {
          config.headers['X-CSRF-Token'] = token;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle CSRF errors
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
        // Reset CSRF token and retry
        csrfToken = null;
        const token = await getCSRFToken();
        if (token) {
          error.config.headers['X-CSRF-Token'] = token;
          return axios.request(error.config);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default { getCSRFToken, setupAxiosInterceptors };