/**
 * Centralized error handler for API calls
 */

export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  // Network error
  if (!error.response) {
    return {
      message: customMessage || 'Network error. Please check your connection.',
      type: 'network'
    };
  }
  
  // HTTP error responses
  const { status, data } = error.response;
  
  switch (status) {
    case 400:
      return {
        message: data?.message || customMessage || 'Invalid request. Please check your input.',
        type: 'validation'
      };
    
    case 401:
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return {
        message: 'Session expired. Please login again.',
        type: 'auth'
      };
    
    case 403:
      return {
        message: data?.message || customMessage || 'You do not have permission to perform this action.',
        type: 'permission'
      };
    
    case 404:
      return {
        message: data?.message || customMessage || 'Resource not found.',
        type: 'notfound'
      };
    
    case 409:
      return {
        message: data?.message || customMessage || 'Conflict. Resource already exists.',
        type: 'conflict'
      };
    
    case 422:
      return {
        message: data?.message || customMessage || 'Validation failed. Please check your input.',
        type: 'validation'
      };
    
    case 500:
      return {
        message: data?.message || customMessage || 'Server error. Please try again later.',
        type: 'server'
      };
    
    case 503:
      return {
        message: 'Service temporarily unavailable. Please try again later.',
        type: 'service'
      };
    
    default:
      return {
        message: data?.message || customMessage || 'An unexpected error occurred.',
        type: 'unknown'
      };
  }
};

export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(err => err.message || err).join(', ');
  }
  
  if (typeof errors === 'object') {
    return Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ');
  }
  
  return errors?.toString() || 'Validation error';
};

export default { handleApiError, formatValidationErrors };
