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
      console.log('CSRF token obtained:', csrfToken ? 'Success' : 'Failed');
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }
  return csrfToken;
};

let interceptorsSetup = false;

export const setupAxiosInterceptors = () => {
  if (interceptorsSetup) return;
  interceptorsSetup = true;
  
  axios.defaults.withCredentials = true;
  
  axios.interceptors.request.use(
    async (config) => {
      console.log(`${config.method?.toUpperCase()} ${config.url}`);
      config.withCredentials = true;
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export default { getCSRFToken, setupAxiosInterceptors };