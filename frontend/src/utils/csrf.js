import axios from 'axios';

let csrfToken = null;

export const getCsrfToken = async () => {
  if (!csrfToken) {
    try {
      const response = await axios.get('http://localhost:5000/api/csrf-token', {
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
  axios.interceptors.request.use(async (config) => {
    if (config.method !== 'get' && !config.url.includes('/api/auth/')) {
      const token = await getCsrfToken();
      if (token) {
        config.headers['X-CSRF-Token'] = token;
      }
    }
    config.withCredentials = true;
    return config;
  });

  // Response interceptor to handle CSRF errors
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
        csrfToken = null; // Reset token
        const newToken = await getCsrfToken();
        if (newToken) {
          error.config.headers['X-CSRF-Token'] = newToken;
          return axios.request(error.config);
        }
      }
      return Promise.reject(error);
    }
  );
};