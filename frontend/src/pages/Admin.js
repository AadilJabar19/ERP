import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ActionDropdown from '../components/ActionDropdown';
import useBulkActions from '../hooks/useBulkActions';

const Admin = () => {
  const { token, hasRole } = useAuth();
  const { success, error, showConfirm } = useToast();
  const { selectedItems, selectAll, handleSelectAll, handleSelectItem, clearSelection } = useBulkActions();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [health, setHealth] = useState({});
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (hasRole(['admin'])) {
      fetchData();
    }
  }, [hasRole, token]);

  const fetchData = async () => {
    try {
      const [usersRes, analyticsRes, healthRes, settingsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/health`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setUsers(usersRes.data);
      setAnalytics(analyticsRes.data);
      setHealth(healthRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}/status`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      alert('Error updating user status');
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      alert('Error updating user role');
    }
  };

  const handleBulkAction = async (action, value = null) => {
    if (selectedItems.length === 0) {
      error('Please select users first');
      return;
    }
    
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/users/bulk-action`,
        { userIds: selectedItems, action, value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      success(`${action} applied to ${selectedItems.length} user(s)`);
      clearSelection();
      fetchData();
    } catch (err) {
      error('Error performing bulk action');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const exportData = async (type) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/export/${type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export.json`;
      a.click();
    } catch (error) {
      alert('Error exporting data');
    }
  };

  if (!hasRole(['admin'])) {
    return <div className="page-container"><h2>Access Denied</h2></div>;
  }

  if (loading) {
    return <div className="page-container"><h2>Loading...</h2></div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">🔧 Admin Panel</h1>

      {/* Tab Navigation */}
      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {['overview', 'users', 'system', 'export'].map(tab => (
            <button
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid-stats">
            <div className="card">
              <h3>👥 Total Users</h3>
              <p style={{ fontSize: '2rem', margin: '10px 0' }}>{analytics.users?.total || 0}</p>
            </div>
            <div className="card">
              <h3>✅ Active Users</h3>
              <p style={{ fontSize: '2rem', margin: '10px 0' }}>{analytics.users?.active || 0}</p>
            </div>
            <div className="card">
              <h3>📊 Recent Logins</h3>
              <p style={{ fontSize: '2rem', margin: '10px 0' }}>{analytics.users?.recentLogins || 0}</p>
            </div>
            <div className="card">
              <h3>⏱️ System Uptime</h3>
              <p style={{ fontSize: '1.5rem', margin: '10px 0' }}>
                {Math.floor((analytics.system?.uptime || 0) / 3600)}h
              </p>
            </div>
          </div>
          
          <div className="grid-stats">
            <div className="card">
              <h3>📦 Products</h3>
              <p style={{ fontSize: '2rem', margin: '10px 0' }}>{analytics.system?.totalProducts || 0}</p>
            </div>
            <div className="card">
              <h3>💰 Sales</h3>
              <p style={{ fontSize: '2rem', margin: '10px 0' }}>{analytics.system?.totalSales || 0}</p>
            </div>
            <div className="card">
              <h3>📅 Monthly Attendance</h3>
              <p style={{ fontSize: '2rem', margin: '10px 0' }}>{analytics.system?.monthlyAttendance || 0}</p>
            </div>
            <div className="card">
              <h3>🏢 Departments</h3>
              <p style={{ fontSize: '2rem', margin: '10px 0' }}>{analytics.employees?.departmentStats?.length || 0}</p>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>User Management</h2>
            {selectedItems.length > 0 && (
              <ActionDropdown
                actions={[
                  {
                    label: `Activate (${selectedItems.length})`,
                    icon: '✅',
                    onClick: () => handleBulkAction('activate'),
                    className: 'success'
                  },
                  {
                    label: `Deactivate (${selectedItems.length})`,
                    icon: '❌',
                    onClick: () => handleBulkAction('deactivate'),
                    className: 'danger'
                  },
                  {
                    label: `Delete (${selectedItems.length})`,
                    icon: '🗑️',
                    onClick: () => {
                      showConfirm(
                        'Delete Users',
                        `Delete ${selectedItems.length} user(s)?`,
                        () => handleBulkAction('delete')
                      );
                    },
                    className: 'danger'
                  },
                  {
                    label: 'Clear Selection',
                    icon: '✖️',
                    onClick: clearSelection
                  }
                ]}
              />
            )}
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e, users)}
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(user._id)}
                        onChange={(e) => handleSelectItem(e, user._id)}
                      />
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => changeUserRole(user._id, e.target.value)}
                        style={{ padding: '5px' }}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span style={{ 
                        color: user.isActive ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td>
                      <button
                        className={`btn ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleUserStatus(user._id, user.isActive)}
                        style={{ fontSize: '12px', padding: '5px 10px', marginRight: '5px' }}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteUser(user._id)}
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <>
          <div className="card">
            <h2>System Health</h2>
            <div className="grid-stats">
              <div style={{ padding: '15px', backgroundColor: health.status === 'healthy' ? '#e6ffe6' : '#ffe6e6', borderRadius: '8px' }}>
                <h4>Status: {health.status || 'Unknown'}</h4>
                <p>Database: {health.database || 'Unknown'}</p>
                <p>Memory Used: {health.memory?.heapUsed ? Math.round(health.memory.heapUsed / 1024 / 1024) + ' MB' : 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2>System Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div>
                <h4>Environment</h4>
                <p>Version: {settings.system?.version}</p>
                <p>Environment: {settings.system?.environment}</p>
                <p>Node: {settings.system?.nodeVersion}</p>
                <p>Platform: {settings.system?.platform}</p>
              </div>
              <div>
                <h4>Performance</h4>
                <p>RSS: {settings.performance?.memoryUsage?.rss}</p>
                <p>Heap Used: {settings.performance?.memoryUsage?.heapUsed}</p>
                <p>Heap Total: {settings.performance?.memoryUsage?.heapTotal}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="card">
          <h2>Data Export</h2>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => exportData('users')}>
              📥 Export Users
            </button>
            <button className="btn btn-primary" onClick={() => exportData('employees')}>
              📥 Export Employees
            </button>
          </div>
          <p style={{ marginTop: '15px', color: '#666' }}>
            Export data as JSON files for backup or analysis purposes.
          </p>
        </div>
      )}
    </div>
  );
};

export default Admin;