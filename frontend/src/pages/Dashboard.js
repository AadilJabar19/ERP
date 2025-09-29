import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({ employees: 0, products: 0, sales: 0, revenue: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    salesTrend: [],
    departmentStats: [],
    inventoryStatus: [],
    revenueByMonth: []
  });

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('/api/dashboard/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      
      // Set stats
      setStats({
        employees: data.overview?.totalEmployees || 0,
        products: data.overview?.totalProducts || 0,
        sales: data.overview?.totalSales || 0,
        revenue: data.overview?.totalRevenue || 0
      });
      
      // Set chart data
      setChartData({
        salesTrend: data.trends?.monthlySales || [],
        departmentStats: data.trends?.departmentStats?.map((dept, index) => ({
          name: dept._id,
          employees: dept.count,
          fill: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'][index % 5]
        })) || [],
        inventoryStatus: [
          { status: 'In Stock', count: data.overview?.totalProducts - (data.alerts?.lowStockProducts?.length || 0), fill: '#00C49F' },
          { status: 'Low Stock', count: data.alerts?.lowStockProducts?.length || 0, fill: '#FFBB28' },
          { status: 'Out of Stock', count: 0, fill: '#FF8042' }
        ],
        revenueByMonth: data.trends?.monthlySales || []
      });
      
      // Set recent activity
      const activities = [
        ...(data.recentActivity?.recentSales?.map(sale => ({
          type: 'Sale',
          description: `Sale to ${sale.customer?.companyName || 'Customer'} - $${sale.totalAmount}`,
          timestamp: new Date(sale.saleDate)
        })) || []),
        ...(data.recentActivity?.recentLeads?.map(lead => ({
          type: 'Lead',
          description: `New lead: ${lead.contact?.company || 'Company'} - ${lead.status}`,
          timestamp: new Date(lead.createdAt)
        })) || []),
        ...(data.alerts?.lowStockProducts?.map(product => ({
          type: 'Inventory',
          description: `Low stock alert - ${product.name}`,
          timestamp: new Date()
        })) || [])
      ];
      
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="grid-stats">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '2.5rem', backgroundColor: '#3498db', color: 'white', padding: '15px', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            👥
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#666' }}>Total Employees</h3>
            <p style={{ fontSize: '2rem', color: '#3498db', margin: '5px 0' }}>{stats.employees}</p>
            <span style={{ fontSize: '0.9rem', color: '#28a745' }}>+5% from last month</span>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '2.5rem', backgroundColor: '#2ecc71', color: 'white', padding: '15px', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            📦
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#666' }}>Total Products</h3>
            <p style={{ fontSize: '2rem', color: '#2ecc71', margin: '5px 0' }}>{stats.products}</p>
            <span style={{ fontSize: '0.9rem', color: '#28a745' }}>+12% from last month</span>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '2.5rem', backgroundColor: '#e74c3c', color: 'white', padding: '15px', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            💰
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#666' }}>Total Sales</h3>
            <p style={{ fontSize: '2rem', color: '#e74c3c', margin: '5px 0' }}>{stats.sales}</p>
            <span style={{ fontSize: '0.9rem', color: '#28a745' }}>+8% from last month</span>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '2.5rem', backgroundColor: '#f39c12', color: 'white', padding: '15px', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            📈
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#666' }}>Total Revenue</h3>
            <p style={{ fontSize: '2rem', color: '#f39c12', margin: '5px 0' }}>${stats.revenue.toFixed(2)}</p>
            <span style={{ fontSize: '0.9rem', color: '#28a745' }}>+15% from last month</span>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div className="card">
          <h3>Sales & Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card">
          <h3>Department Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.departmentStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="employees"
              >
                {chartData.departmentStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card">
          <h3>Inventory Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.inventoryStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8">
                {chartData.inventoryStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card">
          <h3>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
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