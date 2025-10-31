/**
 * Form validation utilities
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phone.length >= 10 && phoneRegex.test(phone);
};

export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateNumber = (value, min = null, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

export const validateDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password.length >= 6;
};

export const validateEmployeeForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.employeeId)) {
    errors.employeeId = 'Employee ID is required';
  }
  
  if (!validateRequired(formData.personalInfo?.firstName)) {
    errors.firstName = 'First name is required';
  }
  
  if (!validateRequired(formData.personalInfo?.lastName)) {
    errors.lastName = 'Last name is required';
  }
  
  if (!validateEmail(formData.personalInfo?.email || '')) {
    errors.email = 'Valid email is required';
  }
  
  if (!validateRequired(formData.employment?.department)) {
    errors.department = 'Department is required';
  }
  
  if (!validateRequired(formData.employment?.position)) {
    errors.position = 'Position is required';
  }
  
  if (!validateNumber(formData.employment?.baseSalary, 0)) {
    errors.baseSalary = 'Valid salary is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateLeaveForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.leaveType)) {
    errors.leaveType = 'Leave type is required';
  }
  
  if (!validateDate(formData.startDate)) {
    errors.startDate = 'Valid start date is required';
  }
  
  if (!validateDate(formData.endDate)) {
    errors.endDate = 'Valid end date is required';
  }
  
  if (!validateDateRange(formData.startDate, formData.endDate)) {
    errors.dateRange = 'End date must be after start date';
  }
  
  if (!validateRequired(formData.reason)) {
    errors.reason = 'Reason is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateProductForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.name)) {
    errors.name = 'Product name is required';
  }
  
  if (!validateRequired(formData.sku)) {
    errors.sku = 'SKU is required';
  }
  
  if (!validateNumber(formData.pricing?.cost, 0)) {
    errors.cost = 'Valid cost is required';
  }
  
  if (!validateNumber(formData.pricing?.sellingPrice, 0)) {
    errors.sellingPrice = 'Valid selling price is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCustomerForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.companyName)) {
    errors.companyName = 'Company name is required';
  }
  
  if (!validateEmail(formData.contactInfo?.email || '')) {
    errors.email = 'Valid email is required';
  }
  
  if (formData.contactInfo?.phone && !validatePhone(formData.contactInfo.phone)) {
    errors.phone = 'Valid phone number is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePhone,
  validateRequired,
  validateNumber,
  validateDate,
  validateDateRange,
  validatePassword,
  validateEmployeeForm,
  validateLeaveForm,
  validateProductForm,
  validateCustomerForm
};
