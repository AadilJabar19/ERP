import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export const checkDataFlow = async () => {
  const results = {
    endpoints: {},
    errors: [],
    summary: { total: 0, working: 0, failed: 0 }
  };

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const endpointsToTest = [
    { name: 'HRM Employees', url: API_ENDPOINTS.HRM_EMPLOYEES, method: 'GET' },
    { name: 'HRM Leaves', url: API_ENDPOINTS.HRM_LEAVES, method: 'GET' },
    { name: 'HRM Training', url: API_ENDPOINTS.HRM_TRAINING, method: 'GET' },
    { name: 'HRM Performance', url: API_ENDPOINTS.HRM_PERFORMANCE, method: 'GET' },
    { name: 'HRM Departments', url: API_ENDPOINTS.HRM_DEPARTMENTS, method: 'GET' },
    { name: 'HRM Analytics', url: API_ENDPOINTS.HRM_ANALYTICS, method: 'GET' },
    { name: 'Payroll', url: API_ENDPOINTS.PAYROLL, method: 'GET' },
    { name: 'Inventory Products', url: API_ENDPOINTS.INVENTORY_PRODUCTS, method: 'GET' },
    { name: 'Sales Leads', url: API_ENDPOINTS.SALES_LEADS, method: 'GET' },
    { name: 'Customers', url: API_ENDPOINTS.CUSTOMERS, method: 'GET' },
    { name: 'Projects', url: API_ENDPOINTS.PROJECTS, method: 'GET' },
    { name: 'Events', url: API_ENDPOINTS.EVENTS, method: 'GET' },
    { name: 'Attendance', url: API_ENDPOINTS.ATTENDANCE, method: 'GET' }
  ];

  for (const endpoint of endpointsToTest) {
    results.summary.total++;
    try {
      const response = await axios.get(endpoint.url, { headers, timeout: 5000 });
      results.endpoints[endpoint.name] = {
        status: 'SUCCESS',
        statusCode: response.status,
        dataReceived: !!response.data,
        dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
        recordCount: Array.isArray(response.data) ? response.data.length : 
                    (response.data && typeof response.data === 'object' && response.data.length !== undefined) ? 
                    response.data.length : 'N/A'
      };
      results.summary.working++;
    } catch (error) {
      results.endpoints[endpoint.name] = {
        status: 'FAILED',
        error: error.response?.status || error.code || 'UNKNOWN',
        message: error.response?.data?.message || error.message
      };
      results.errors.push(`${endpoint.name}: ${error.response?.data?.message || error.message}`);
      results.summary.failed++;
    }
  }

  return results;
};

export const logDataFlowResults = (results) => {
  console.group('🔍 ERP Data Flow Check Results');
  console.log(`📊 Summary: ${results.summary.working}/${results.summary.total} endpoints working`);
  
  if (results.summary.working === results.summary.total) {
    console.log('✅ All endpoints are working correctly!');
  } else {
    console.warn(`⚠️ ${results.summary.failed} endpoints have issues:`);
    results.errors.forEach(error => console.error(`❌ ${error}`));
  }
  
  console.group('📋 Detailed Results:');
  Object.entries(results.endpoints).forEach(([name, result]) => {
    if (result.status === 'SUCCESS') {
      console.log(`✅ ${name}: ${result.recordCount} records`);
    } else {
      console.error(`❌ ${name}: ${result.error} - ${result.message}`);
    }
  });
  console.groupEnd();
  console.groupEnd();
  
  return results;
};