import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState({ employees: 0, products: 0, sales: 0, revenue: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    const interval = setInterval(fetchStats, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, user needs to login');
        return;
      }
      
      console.log('Fetching stats with token:', token.substring(0, 20) + '...');
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log('Making API calls...');
      const responses = await Promise.allSettled([
        axios.get('/api/employees', { headers }),
        axios.get('/api/inventory', { headers }),
        axios.get('/api/sales', { headers })
      ]);
      
      const [employeesRes, productsRes, salesRes] = responses;
      
      console.log('API responses:', {
        employees: employeesRes.status,
        products: productsRes.status, 
        sales: salesRes.status
      });
      
      const employeesData = employeesRes.status === 'fulfilled' ? employeesRes.value.data : [];
      const productsData = productsRes.status === 'fulfilled' ? productsRes.value.data : [];
      const salesData = salesRes.status === 'fulfilled' ? salesRes.value.data : [];
      
      const revenue = salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

      setStats({
        employees: employeesData.length,
        products: productsData.length,
        sales: salesData.length,
        revenue: revenue
      });
      
      console.log('Stats updated:', {
        employees: employeesData.length,
        products: productsData.length,
        sales: salesData.length,
        revenue: revenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.log('Token expired, please login again');
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    // Mock recent activity - in real app, this would come from backend
    setRecentActivity([
      { type: 'Employee', description: 'New employee added', timestamp: new Date() },
      { type: 'Sale', description: 'Sale completed - $500', timestamp: new Date(Date.now() - 3600000) },
      { type: 'Inventory', description: 'Low stock alert - Product ABC', timestamp: new Date(Date.now() - 7200000) }
    ]);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="grid-stats">
        <div className="card">
          <h3>Total Employees</h3>
          <p style={{ fontSize: '2rem', color: '#3498db' }}>{stats.employees}</p>
        </div>
        
        <div className="card">
          <h3>Total Products</h3>
          <p style={{ fontSize: '2rem', color: '#2ecc71' }}>{stats.products}</p>
        </div>
        
        <div className="card">
          <h3>Total Sales</h3>
          <p style={{ fontSize: '2rem', color: '#e74c3c' }}>{stats.sales}</p>
        </div>
        
        <div className="card">
          <h3>Total Revenue</h3>
          <p style={{ fontSize: '2rem', color: '#f39c12' }}>${stats.revenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="card">
        <h3>Recent Activity</h3>
        {loading ? <LoadingSpinner /> : (
          <div>
            {recentActivity.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {recentActivity.map((activity, index) => (
                  <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <strong>{activity.type}:</strong> {activity.description}
                    <span style={{ float: 'right', color: '#666', fontSize: '0.9rem' }}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No recent activity</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;