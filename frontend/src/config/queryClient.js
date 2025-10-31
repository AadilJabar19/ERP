import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Retry failed requests
      retry: 1,
      // Cache time (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      cacheTime: 10 * 60 * 1000,
      // Refetch on mount if data is stale
      refetchOnMount: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // HRM
  employees: {
    all: ['employees'],
    list: (params) => ['employees', 'list', params],
    detail: (id) => ['employees', 'detail', id],
  },
  leaves: {
    all: ['leaves'],
    list: (params) => ['leaves', 'list', params],
  },
  training: {
    all: ['training'],
    list: (params) => ['training', 'list', params],
  },
  departments: {
    all: ['departments'],
  },
  
  // Inventory
  products: {
    all: ['products'],
    list: (params) => ['products', 'list', params],
    detail: (id) => ['products', 'detail', id],
  },
  categories: {
    all: ['categories'],
  },
  warehouses: {
    all: ['warehouses'],
  },
  
  // Sales
  leads: {
    all: ['leads'],
    list: (params) => ['leads', 'list', params],
    detail: (id) => ['leads', 'detail', id],
  },
  quotes: {
    all: ['quotes'],
    list: (params) => ['quotes', 'list', params],
  },
  orders: {
    all: ['orders'],
    list: (params) => ['orders', 'list', params],
  },
  
  // Customers
  customers: {
    all: ['customers'],
    list: (params) => ['customers', 'list', params],
    detail: (id) => ['customers', 'detail', id],
  },
  
  // Projects
  projects: {
    all: ['projects'],
    list: (params) => ['projects', 'list', params],
    detail: (id) => ['projects', 'detail', id],
  },
  
  // Attendance
  attendance: {
    all: ['attendance'],
    list: (params) => ['attendance', 'list', params],
  },
  
  // Events
  events: {
    all: ['events'],
    list: (params) => ['events', 'list', params],
  },
  
  // Dashboard
  dashboard: {
    analytics: ['dashboard', 'analytics'],
  },
  
  // Analytics
  analytics: {
    hrm: ['analytics', 'hrm'],
    inventory: ['analytics', 'inventory'],
    sales: ['analytics', 'sales'],
    customers: ['analytics', 'customers'],
    projects: ['analytics', 'projects'],
  },
};
