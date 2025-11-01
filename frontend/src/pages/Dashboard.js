import React, { useMemo } from 'react';
import { useDashboardAnalytics } from '../hooks/useQueryHooks';
import { Card, Badge, EmptyState } from '../components/ui';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import '../styles/pages/Dashboard.scss';

const StatCard = ({ icon, title, value, trend, color }) => (
  <Card hoverable className="stat-card">
    <div className="stat-card-content">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="stat-details">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
        {trend && <Badge variant="success" size="sm">{trend}</Badge>}
      </div>
    </div>
  </Card>
);

const Dashboard = () => {
  const { data, isLoading, error } = useDashboardAnalytics();

  const chartData = useMemo(() => {
    if (!data) return null;

    return {
      salesTrend: data.trends?.monthlySales || [],
      departmentStats: data.trends?.departmentStats?.map((dept, index) => ({
        name: dept._id,
        employees: dept.count,
        fill: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'][index % 5]
      })) || [],
      inventoryStatus: [
        { 
          status: 'In Stock', 
          count: data.overview?.totalProducts - (data.alerts?.lowStockProducts?.length || 0), 
          fill: '#00C49F' 
        },
        { 
          status: 'Low Stock', 
          count: data.alerts?.lowStockProducts?.length || 0, 
          fill: '#FFBB28' 
        },
        { 
          status: 'Out of Stock', 
          count: 0, 
          fill: '#FF8042' 
        }
      ],
      revenueByMonth: data.trends?.monthlySales || []
    };
  }, [data]);

  const recentActivity = useMemo(() => {
    if (!data) return [];

    const activities = [
      ...(data.recentActivity?.recentSales?.map(sale => ({
        type: 'Sale',
        description: `Sale to ${sale.customer?.companyName || 'Customer'} - $${sale.totalAmount}`,
        timestamp: new Date(sale.saleDate),
        variant: 'success'
      })) || []),
      ...(data.recentActivity?.recentLeads?.map(lead => ({
        type: 'Lead',
        description: `New lead: ${lead.contact?.company || 'Company'} - ${lead.status}`,
        timestamp: new Date(lead.createdAt),
        variant: 'info'
      })) || []),
      ...(data.alerts?.lowStockProducts?.map(product => ({
        type: 'Inventory',
        description: `Low stock alert - ${product.name}`,
        timestamp: new Date(),
        variant: 'warning'
      })) || [])
    ];

    return activities.slice(0, 5);
  }, [data]);

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <EmptyState 
          icon="⚠️"
          title="Error Loading Dashboard"
          description="There was an error loading the dashboard data. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon="👥"
          title="Total Employees"
          value={data?.overview?.totalEmployees || 0}
          trend="+5% from last month"
          color="#3498db"
        />
        <StatCard
          icon="📦"
          title="Total Products"
          value={data?.overview?.totalProducts || 0}
          trend="+12% from last month"
          color="#2ecc71"
        />
        <StatCard
          icon="💰"
          title="Total Sales"
          value={data?.overview?.totalSales || 0}
          trend="+8% from last month"
          color="#e74c3c"
        />
        <StatCard
          icon="📈"
          title="Total Revenue"
          value={`$${(data?.overview?.totalRevenue || 0).toFixed(2)}`}
          trend="+15% from last month"
          color="#f39c12"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <Card title="Sales & Revenue Trend">
          {chartData?.salesTrend?.length > 0 ? (
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
          ) : (
            <EmptyState 
              icon="📊"
              title="No sales data"
              description="Sales data will appear here once you start making sales"
            />
          )}
        </Card>

        <Card title="Department Distribution">
          {chartData?.departmentStats?.length > 0 ? (
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
          ) : (
            <EmptyState 
              icon="👥"
              title="No department data"
              description="Department distribution will appear here"
            />
          )}
        </Card>

        <Card title="Inventory Status">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData?.inventoryStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8">
                {chartData?.inventoryStatus?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Monthly Revenue">
          {chartData?.revenueByMonth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState 
              icon="💰"
              title="No revenue data"
              description="Revenue data will appear here"
            />
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity" className="activity-card">
        {recentActivity.length > 0 ? (
          <ul className="activity-list">
            {recentActivity.map((activity, index) => (
              <li key={index} className="activity-item">
                <div className="activity-content">
                  <Badge variant={activity.variant} size="sm">
                    {activity.type}
                  </Badge>
                  <span className="activity-description">{activity.description}</span>
                </div>
                <span className="activity-time">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState 
            icon="📋"
            title="No recent activity"
            description="Activity will appear here once you start using the system"
          />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
