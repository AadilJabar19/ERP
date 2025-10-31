import axios from 'axios';
import API_BASE_URL from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const apiClient = {
  // HRM APIs
  hrm: {
    getEmployees: (params) => axios.get(`${API_BASE_URL}/api/hrm/employees`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createEmployee: (data) => axios.post(`${API_BASE_URL}/api/hrm/employees`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    updateEmployee: (id, data) => axios.put(`${API_BASE_URL}/api/hrm/employees/${id}`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    deleteEmployee: (id) => axios.delete(`${API_BASE_URL}/api/hrm/employees/${id}`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    bulkUploadEmployees: (data) => axios.post(`${API_BASE_URL}/api/hrm/employees/bulk`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    
    getLeaves: (params) => axios.get(`${API_BASE_URL}/api/hrm/leaves`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createLeave: (data) => axios.post(`${API_BASE_URL}/api/hrm/leaves`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    approveLeave: (id, approved) => axios.patch(`${API_BASE_URL}/api/hrm/leaves/${id}/approve`, 
      { approved }, 
      { headers: getAuthHeaders(), withCredentials: true }
    ),
    
    getTraining: (params) => axios.get(`${API_BASE_URL}/api/hrm/training`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createTraining: (data) => axios.post(`${API_BASE_URL}/api/hrm/training`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    
    getPerformance: (params) => axios.get(`${API_BASE_URL}/api/hrm/performance`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createPerformance: (data) => axios.post(`${API_BASE_URL}/api/hrm/performance`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    
    getUsers: (params) => axios.get(`${API_BASE_URL}/api/hrm/users`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    convertUserToEmployee: (id, data) => axios.post(`${API_BASE_URL}/api/hrm/users/${id}/convert-to-employee`, 
      data, 
      { headers: getAuthHeaders(), withCredentials: true }
    ),
    convertEmployeeToUser: (id, data) => axios.post(`${API_BASE_URL}/api/hrm/employees/${id}/convert-to-user`, 
      data, 
      { headers: getAuthHeaders(), withCredentials: true }
    ),
    
    getDepartments: (params) => axios.get(`${API_BASE_URL}/api/hrm/departments`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createDepartment: (data) => axios.post(`${API_BASE_URL}/api/hrm/departments`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    
    getAnalytics: () => axios.get(`${API_BASE_URL}/api/hrm/analytics`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    })
  },
  
  // Payroll APIs
  payroll: {
    getPayrolls: (params) => axios.get(`${API_BASE_URL}/api/payroll`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createPayroll: (data) => axios.post(`${API_BASE_URL}/api/payroll`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    updatePayrollStatus: (id, status) => axios.patch(`${API_BASE_URL}/api/payroll/${id}/status`, 
      { status }, 
      { headers: getAuthHeaders(), withCredentials: true }
    ),
    getAnalytics: () => axios.get(`${API_BASE_URL}/api/payroll/analytics`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    })
  },
  
  // Inventory APIs
  inventory: {
    getProducts: (params) => axios.get(`${API_BASE_URL}/api/inventory/products`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createProduct: (data) => axios.post(`${API_BASE_URL}/api/inventory/products`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    updateProduct: (id, data) => axios.put(`${API_BASE_URL}/api/inventory/products/${id}`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    deleteProduct: (id) => axios.delete(`${API_BASE_URL}/api/inventory/products/${id}`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    bulkUploadProducts: (data) => axios.post(`${API_BASE_URL}/api/inventory/products/bulk`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    
    getCategories: () => axios.get(`${API_BASE_URL}/api/inventory/categories`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    createCategory: (data) => axios.post(`${API_BASE_URL}/api/inventory/categories`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    bulkUploadCategories: (data) => axios.post(`${API_BASE_URL}/api/inventory/categories/bulk`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    
    getWarehouses: () => axios.get(`${API_BASE_URL}/api/inventory/warehouses`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    createWarehouse: (data) => axios.post(`${API_BASE_URL}/api/inventory/warehouses`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    bulkUploadWarehouses: (data) => axios.post(`${API_BASE_URL}/api/inventory/warehouses/bulk`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    
    getStockMovements: () => axios.get(`${API_BASE_URL}/api/inventory/stock-movements`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    createStockMovement: (data) => axios.post(`${API_BASE_URL}/api/inventory/stock-movements`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    
    getAnalytics: () => axios.get(`${API_BASE_URL}/api/inventory/analytics`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    getAlerts: () => axios.get(`${API_BASE_URL}/api/inventory/alerts`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    })
  },
  
  // Sales APIs
  sales: {
    getLeads: (params) => axios.get(`${API_BASE_URL}/api/sales/leads`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createLead: (data) => axios.post(`${API_BASE_URL}/api/sales/leads`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    updateLead: (id, data) => axios.put(`${API_BASE_URL}/api/sales/leads/${id}`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    bulkUploadLeads: (data) => axios.post(`${API_BASE_URL}/api/sales/leads/bulk`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    
    getQuotes: (params) => axios.get(`${API_BASE_URL}/api/sales/quotes`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createQuote: (data) => axios.post(`${API_BASE_URL}/api/sales/quotes`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    
    getOrders: (params) => axios.get(`${API_BASE_URL}/api/sales/orders`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createOrder: (data) => axios.post(`${API_BASE_URL}/api/sales/orders`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    updateOrder: (id, data) => axios.put(`${API_BASE_URL}/api/sales/orders/${id}`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    
    getInvoices: (params) => axios.get(`${API_BASE_URL}/api/sales/invoices`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createInvoice: (data) => axios.post(`${API_BASE_URL}/api/sales/invoices`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    updateInvoice: (id, data) => axios.put(`${API_BASE_URL}/api/sales/invoices/${id}`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    
    getAnalytics: () => axios.get(`${API_BASE_URL}/api/sales/analytics`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    getPipeline: () => axios.get(`${API_BASE_URL}/api/sales/pipeline`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    })
  },
  
  // Customer APIs
  customers: {
    getCustomers: (params) => axios.get(`${API_BASE_URL}/api/customers`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createCustomer: (data) => axios.post(`${API_BASE_URL}/api/customers`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    updateCustomer: (id, data) => axios.put(`${API_BASE_URL}/api/customers/${id}`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    deleteCustomer: (id) => axios.delete(`${API_BASE_URL}/api/customers/${id}`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    getAnalytics: () => axios.get(`${API_BASE_URL}/api/customers/analytics`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    })
  },
  
  // Project APIs
  projects: {
    getProjects: (params) => axios.get(`${API_BASE_URL}/api/projects`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createProject: (data) => axios.post(`${API_BASE_URL}/api/projects`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    updateProject: (id, data) => axios.put(`${API_BASE_URL}/api/projects/${id}`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    deleteProject: (id) => axios.delete(`${API_BASE_URL}/api/projects/${id}`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    getAnalytics: () => axios.get(`${API_BASE_URL}/api/projects/analytics`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    })
  },
  
  // Attendance APIs
  attendance: {
    getAttendance: (params) => axios.get(`${API_BASE_URL}/api/attendance`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    checkIn: (data) => axios.post(`${API_BASE_URL}/api/attendance/checkin`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    checkOut: (data) => axios.post(`${API_BASE_URL}/api/attendance/checkout`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    getAnalytics: () => axios.get(`${API_BASE_URL}/api/attendance/analytics`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    })
  },
  
  // Event/Calendar APIs
  events: {
    getEvents: (params) => axios.get(`${API_BASE_URL}/api/events`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createEvent: (data) => axios.post(`${API_BASE_URL}/api/events`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    updateEvent: (id, data) => axios.put(`${API_BASE_URL}/api/events/${id}`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    deleteEvent: (id) => axios.delete(`${API_BASE_URL}/api/events/${id}`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    getAnalytics: () => axios.get(`${API_BASE_URL}/api/events/analytics`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    })
  },
  
  // Dashboard APIs
  dashboard: {
    getAnalytics: () => axios.get(`${API_BASE_URL}/api/dashboard/analytics`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    })
  },
  
  // Finance APIs
  finance: {
    getInvoices: (params) => axios.get(`${API_BASE_URL}/api/invoices`, { 
      headers: getAuthHeaders(), 
      withCredentials: true,
      params 
    }),
    createInvoice: (data) => axios.post(`${API_BASE_URL}/api/invoices`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    updateInvoice: (id, data) => axios.put(`${API_BASE_URL}/api/invoices/${id}`, data, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    deleteInvoice: (id) => axios.delete(`${API_BASE_URL}/api/invoices/${id}`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    }),
    getAnalytics: () => axios.get(`${API_BASE_URL}/api/finance/analytics`, { 
      headers: getAuthHeaders(), 
      withCredentials: true 
    })
  }
};

export default apiClient;
