import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';
import { queryKeys } from '../config/queryClient';
import { handleApiError } from '../utils/errorHandler';
import { useToast } from '../context/ToastContext';

// ============= HRM Hooks =============

export const useEmployees = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.employees.list(params),
    queryFn: () => apiClient.hrm.getEmployees(params).then(res => res.data),
    onError: (error) => {
      console.error('Error fetching employees:', handleApiError(error));
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  return useMutation({
    mutationFn: (data) => apiClient.hrm.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.hrm });
      success('Employee created successfully');
    },
    onError: (err) => {
      const { message } = handleApiError(err);
      error(message);
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.hrm.updateEmployee(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(variables.id) });
      success('Employee updated successfully');
    },
    onError: (err) => {
      const { message } = handleApiError(err);
      error(message);
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  return useMutation({
    mutationFn: (id) => apiClient.hrm.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      success('Employee deleted successfully');
    },
    onError: (err) => {
      const { message } = handleApiError(err);
      error(message);
    },
  });
};

export const useLeaves = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.leaves.list(params),
    queryFn: () => apiClient.hrm.getLeaves(params).then(res => res.data),
  });
};

export const useCreateLeave = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  return useMutation({
    mutationFn: (data) => apiClient.hrm.createLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all });
      success('Leave request submitted successfully');
    },
    onError: (err) => {
      const { message } = handleApiError(err);
      error(message);
    },
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: () => apiClient.hrm.getDepartments().then(res => res.data),
    staleTime: 10 * 60 * 1000, // Departments don't change often
  });
};

// ============= Inventory Hooks =============

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => apiClient.inventory.getProducts(params).then(res => res.data),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  return useMutation({
    mutationFn: (data) => apiClient.inventory.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.inventory });
      success('Product created successfully');
    },
    onError: (err) => {
      const { message } = handleApiError(err);
      error(message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.inventory.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
      success('Product updated successfully');
    },
    onError: (err) => {
      const { message } = handleApiError(err);
      error(message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  return useMutation({
    mutationFn: (id) => apiClient.inventory.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      success('Product deleted successfully');
    },
    onError: (err) => {
      const { message } = handleApiError(err);
      error(message);
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => apiClient.inventory.getCategories().then(res => res.data),
    staleTime: 10 * 60 * 1000,
  });
};

export const useWarehouses = () => {
  return useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: () => apiClient.inventory.getWarehouses().then(res => res.data),
    staleTime: 10 * 60 * 1000,
  });
};

// ============= Sales Hooks =============

export const useLeads = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.leads.list(params),
    queryFn: () => apiClient.sales.getLeads(params).then(res => res.data),
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  return useMutation({
    mutationFn: (data) => apiClient.sales.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.sales });
      success('Lead created successfully');
    },
    onError: (err) => {
      const { message } = handleApiError(err);
      error(message);
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.sales.updateLead(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) });
      success('Lead updated successfully');
    },
    onError: (err) => {
      const { message } = handleApiError(err);
      error(message);
    },
  });
};

// ============= Customer Hooks =============

export const useCustomers = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => apiClient.customers.getCustomers(params).then(res => res.data),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  return useMutation({
    mutationFn: (data) => apiClient.customers.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      success('Customer created successfully');
    },
    onError: (err) => {
      const { message } = handleApiError(err);
      error(message);
    },
  });
};

// ============= Dashboard Hooks =============

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.analytics,
    queryFn: () => apiClient.dashboard.getAnalytics().then(res => res.data),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// ============= Analytics Hooks =============

export const useHRMAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics.hrm,
    queryFn: () => apiClient.hrm.getAnalytics().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useInventoryAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics.inventory,
    queryFn: () => apiClient.inventory.getAnalytics().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSalesAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics.sales,
    queryFn: () => apiClient.sales.getAnalytics().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
};
