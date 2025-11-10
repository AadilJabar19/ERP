import React, { useMemo } from 'react';
import { useDashboardAnalytics } from '../hooks/useQueryHooks';
import { Card, Badge, EmptyState } from '../components/ui';
import LoadingSpinner from '../components/LoadingSpinner';
import ActivityTimeline from '../components/ActivityTimeline';
import PDFExport from '../components/PDFExport';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();

  const chartData = useMemo(() => {
    if (!data) return null;

    return {
      salesTrend: data.trends?.monthlySales || [],
      departmentStats: data.trends?.departmentStats?.map((dept, index) => ({
        name: dept._id,
        employees: dept.count,
        fill: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'][index % 5]
      })) || [],
      inventoryStatus: data.trends?.inventoryStatus || [],
      revenueByMonth: data.trends?.monthlySales || []
    };
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
          icon={<WarningIcon />}
          title="Error Loading Dashboard"
          description="There was an error loading the dashboard data. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{t('dashboard')}</h1>
        <PDFExport elementId="dashboard-content" filename="dashboard-report.pdf">
          <BarChartIcon /> Export Dashboard
        </PDFExport>
      </div>

      <div id="dashboard-content">
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={<PeopleIcon />}
          title={t('totalEmployees')}
          value={data?.overview?.totalEmployees || 0}
          trend={data?.trends?.employeeTrend || null}
          color="#3498db"
        />
        <StatCard
          icon={<InventoryIcon />}
          title={t('totalProducts')}
          value={data?.overview?.totalProducts || 0}
          trend={data?.trends?.productTrend || null}
          color="#2ecc71"
        />
        <StatCard
          icon={<AttachMoneyIcon />}
          title={t('totalSales')}
          value={data?.overview?.totalSales || 0}
          trend={data?.trends?.salesTrend || null}
          color="#e74c3c"
        />
        <StatCard
          icon={<TrendingUpIcon />}
          title={t('totalRevenue')}
          value={`$${(data?.overview?.totalRevenue || 0).toFixed(2)}`}
          trend={data?.trends?.revenueTrend || null}
          color="#f39c12"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <Card title={<><TimelineIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('salesRevenueTrend')}</>}>
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
              icon={<BarChartIcon />}
              title="No sales data"
              description="Sales data will appear here once you start making sales"
            />
          )}
        </Card>

        <Card title={<><PieChartIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('departmentDistribution')}</>}>
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
              icon={<PeopleIcon />}
              title="No department data"
              description="Department distribution will appear here"
            />
          )}
        </Card>

        <Card title={<><InventoryIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('inventoryStatus')}</>}>
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

        <Card title={<><AttachMoneyIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('monthlyRevenue')}</>}>
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
              icon={<AttachMoneyIcon />}
              title="No revenue data"
              description="Revenue data will appear here"
            />
          )}
        </Card>

        <Card title={<><AssessmentIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('leadPipelineStatus')}</>} className="lead-chart-card">
          {data?.trends?.leadStats?.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.trends.leadStats.map((lead, index) => ({ 
                  name: lead._id, 
                  count: lead.count,
                  fill: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
                }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.trends.leadStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState 
              icon={<WarningIcon />}
              title="No lead data"
              description="Lead pipeline data will appear here"
            />
          )}
        </Card>

        <Card title={<><BarChartIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('projectStatusDistribution')}</>} className="project-chart-card">
          {data?.trends?.projectStats?.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.trends.projectStats.map((project, index) => ({
                      name: project._id,
                      value: project.count,
                      fill: ['#059669', '#DC2626', '#D97706', '#7C3AED', '#0891B2'][index % 5]
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={90}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {data.trends.projectStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#059669', '#DC2626', '#D97706', '#7C3AED', '#0891B2'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState 
              icon={<AssessmentIcon />}
              title="No project data"
              description="Project status data will appear here"
            />
          )}
        </Card>
      </div>

      {/* Secondary Stats Grid */}
      <div className="secondary-stats-grid">
        <Card title={<><AssessmentIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('projectStatus')}</>} className="project-status-card">
          {data?.trends?.projectStats?.length > 0 ? (
            <div className="status-grid">
              {data.trends.projectStats.map((status, index) => (
                <div key={index} className="status-item">
                  <div className="status-count">{status.count}</div>
                  <div className="status-label">{status._id}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<AssessmentIcon />} title="No projects" description="Project status will appear here" />
          )}
        </Card>



        <Card title={<><AccessTimeIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('todaysAttendance')}</>} className="attendance-card">
          {data?.alerts?.todayAttendance ? (
            <div className="attendance-stats">
              <div className="attendance-item present">
                <div className="attendance-count">{data.alerts.todayAttendance.present}</div>
                <div className="attendance-label">{t('present')}</div>
              </div>
              <div className="attendance-item late">
                <div className="attendance-count">{data.alerts.todayAttendance.late}</div>
                <div className="attendance-label">{t('late')}</div>
              </div>
              <div className="attendance-item total">
                <div className="attendance-count">{data.alerts.todayAttendance.total}</div>
                <div className="attendance-label">{t('total')}</div>
              </div>
            </div>
          ) : (
            <EmptyState icon={<PeopleIcon />} title="No attendance" description="Today's attendance will appear here" />
          )}
        </Card>
      </div>

      {/* Additional Info Grid */}
      <div className="info-grid">
        <Card title={<><CalendarTodayIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('upcomingEvents')}</>} className="events-card">
          {data?.upcomingEvents?.length > 0 ? (
            <ul className="events-list">
              {data.upcomingEvents.slice(0, 4).map((event, index) => (
                <li key={index} className="event-item">
                  <div className="event-date">
                    {new Date(event.startDate).toLocaleDateString()}
                  </div>
                  <div className="event-details">
                    <div className="event-title">{event.title}</div>
                    <div className="event-type">{event.type}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<EventIcon />} title="No upcoming events" description="Events will appear here" />
          )}
        </Card>

        <Card title={<><NotificationsIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('stockAlerts')}</>} className="alerts-card">
          {data?.alerts?.lowStockProducts?.length > 0 ? (
            <ul className="alerts-list">
              {data.alerts.lowStockProducts.slice(0, 4).map((product, index) => (
                <li key={index} className="alert-item">
                  <Badge variant="warning" size="sm">{t('lowStock')}</Badge>
                  <div className="alert-details">
                    <div className="alert-title">{product.name}</div>
                    <div className="alert-quantity">Qty: {product.totalQuantity}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<CheckCircleIcon />} title={t('allStockGood')} description={t('noLowStockAlerts')} />
          )}
        </Card>

        <Card title={<><DashboardIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('quickStats')}</>} className="quick-stats-card">
          <div className="quick-stats-grid">
            <div className="quick-stat">
              <div className="quick-stat-value">{data?.overview?.totalCustomers || 0}</div>
              <div className="quick-stat-label">{t('customers')}</div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-value">{data?.overview?.totalProjects || 0}</div>
              <div className="quick-stat-label">{t('projects')}</div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-value">{data?.upcomingEvents?.length || 0}</div>
              <div className="quick-stat-label">{t('events')}</div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-value">{data?.alerts?.lowStockProducts?.length || 0}</div>
              <div className="quick-stat-label">{t('alerts')}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card title={<><TimelineIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('recentActivity')}</>} className="activity-timeline-card" hoverable>
        <ActivityTimeline limit={15} />
      </Card>
      </div>
    </div>
  );
};

export default Dashboard;
