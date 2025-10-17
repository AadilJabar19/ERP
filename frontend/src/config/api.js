const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  CSRF_TOKEN: `${API_BASE_URL}/api/csrf-token`,
  
  // HRM
  HRM_EMPLOYEES: `${API_BASE_URL}/api/hrm/employees`,
  HRM_LEAVES: `${API_BASE_URL}/api/hrm/leaves`,
  HRM_TRAINING: `${API_BASE_URL}/api/hrm/training`,
  HRM_PERFORMANCE: `${API_BASE_URL}/api/hrm/performance`,
  HRM_USERS: `${API_BASE_URL}/api/hrm/users`,
  HRM_DEPARTMENTS: `${API_BASE_URL}/api/hrm/departments`,
  HRM_ANALYTICS: `${API_BASE_URL}/api/hrm/analytics`,
  
  // Payroll
  PAYROLL: `${API_BASE_URL}/api/payroll`,
  
  // Inventory
  INVENTORY_PRODUCTS: `${API_BASE_URL}/api/inventory/products`,
  INVENTORY_CATEGORIES: `${API_BASE_URL}/api/inventory/categories`,
  INVENTORY_WAREHOUSES: `${API_BASE_URL}/api/inventory/warehouses`,
  INVENTORY_SUPPLIERS: `${API_BASE_URL}/api/suppliers`,
  INVENTORY_ANALYTICS: `${API_BASE_URL}/api/inventory/analytics`,
  
  // Sales
  SALES_LEADS: `${API_BASE_URL}/api/sales/leads`,
  SALES_QUOTES: `${API_BASE_URL}/api/sales/quotes`,
  SALES_ORDERS: `${API_BASE_URL}/api/sales/orders`,
  SALES_ANALYTICS: `${API_BASE_URL}/api/sales/analytics`,
  
  // CRM
  CUSTOMERS: `${API_BASE_URL}/api/customers`,
  
  // Projects
  PROJECTS: `${API_BASE_URL}/api/projects`,
  
  // Finance
  FINANCE: `${API_BASE_URL}/api/finance`,
  
  // Calendar/Events
  EVENTS: `${API_BASE_URL}/api/events`,
  
  // Attendance
  ATTENDANCE: `${API_BASE_URL}/api/attendance`,
  
  // Admin
  ADMIN: `${API_BASE_URL}/api/admin`,
  
  // Dashboard
  DASHBOARD: `${API_BASE_URL}/api/dashboard`
};

export default API_BASE_URL;