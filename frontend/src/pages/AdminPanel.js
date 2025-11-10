import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ActionDropdown from '../components/ActionDropdown';
import useBulkActions from '../hooks/useBulkActions';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminPanel = () => {
  const { hasRole } = useAuth();
  const { success, error, showConfirm } = useToast();
  const { selectedItems, selectAll, handleSelectAll, handleSelectItem, clearSelection } = useBulkActions();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [backups, setBackups] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'employee', isActive: true, password: ''
  });

  useEffect(() => {
    if (hasRole(['admin'])) {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      switch (activeTab) {
        case 'overview':
          const statsRes = await axios.get('http://localhost:5000/api/admin/system-stats', { headers });
          setSystemStats(statsRes.data);
          break;
        case 'users':
          const usersRes = await axios.get('http://localhost:5000/api/admin/users', { headers });
          setUsers(usersRes.data.users || []);
          break;
        case 'audit':
          const auditRes = await axios.get('http://localhost:5000/api/admin/audit-logs', { headers });
          setAuditLogs(auditRes.data || []);
          break;
        case 'backups':
          const backupsRes = await axios.get('http://localhost:5000/api/admin/backups', { headers });
          setBackups(backupsRes.data || []);
          break;
        case 'settings':
          const settingsRes = await axios.get('http://localhost:5000/api/admin/settings', { headers });
          setSettings(settingsRes.data || {});
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = editingUser 
        ? `http://localhost:5000/api/admin/users/${editingUser._id}`
        : 'http://localhost:5000/api/admin/users';
      
      const method = editingUser ? 'put' : 'post';
      
      if (method === 'put') {
        await axios.put(endpoint, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(endpoint, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to save user'));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const handleBackup = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/admin/backup', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Backup created successfully!');
      fetchData();
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Error creating backup');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', role: 'employee', isActive: true, password: ''
    });
  };

  const renderOverview = () => (
    <div>
      <h3 style={{ marginBottom: '30px' }}>🖥️ System Overview</h3>
      
      <div className="grid-stats" style={{ marginBottom: '30px' }}>
        <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2rem' }}>👥</span>
            <div>
              <h4 style={{ margin: 0, color: 'white' }}>Total Users</h4>
              <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                {systemStats.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2rem' }}>🏢</span>
            <div>
              <h4 style={{ margin: 0, color: 'white' }}>Active Employees</h4>
              <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                {systemStats.activeEmployees || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2rem' }}>💾</span>
            <div>
              <h4 style={{ margin: 0, color: 'white' }}>Database Size</h4>
              <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                {systemStats.databaseSize || '0 MB'}
              </p>
            </div>
          </div>
        </div>
        <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2rem' }}>⚡</span>
            <div>
              <h4 style={{ margin: 0, color: 'white' }}>System Uptime</h4>
              <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                {systemStats.uptime || '0 days'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h4>📊 User Activity (Last 7 Days)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={systemStats.userActivity || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="logins" stroke="#3498db" strokeWidth={3} name="Logins" />
              <Line type="monotone" dataKey="activeUsers" stroke="#2ecc71" strokeWidth={3} name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card">
          <h4>🥧 User Roles Distribution</h4>
          {(systemStats.roleDistribution || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={systemStats.roleDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={60}
                  innerRadius={20}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(systemStats.roleDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3498db', '#e74c3c', '#f39c12'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>No role distribution data available</p>
            </div>
          )}
        </div>
        
        <div className="card">
          <h4>📈 System Performance</h4>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>CPU Usage</span>
                <span>{systemStats.cpuUsage || 0}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
                <div style={{ 
                  width: `${systemStats.cpuUsage || 0}%`, 
                  height: '100%', 
                  backgroundColor: '#28a745', 
                  borderRadius: '5px' 
                }}></div>
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Memory Usage</span>
                <span>{systemStats.memoryUsage || 0}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
                <div style={{ 
                  width: `${systemStats.memoryUsage || 0}%`, 
                  height: '100%', 
                  backgroundColor: '#ffc107', 
                  borderRadius: '5px' 
                }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Disk Usage</span>
                <span>{systemStats.diskUsage || 0}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
                <div style={{ 
                  width: `${systemStats.diskUsage || 0}%`, 
                  height: '100%', 
                  backgroundColor: '#dc3545', 
                  borderRadius: '5px' 
                }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h4>🔔 Recent System Alerts</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {(systemStats.recentAlerts || []).map((alert, index) => (
              <div key={index} style={{ 
                padding: '10px', 
                marginBottom: '10px', 
                borderLeft: `4px solid ${alert.type === 'error' ? '#dc3545' : alert.type === 'warning' ? '#ffc107' : '#28a745'}`,
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{ fontWeight: 'bold' }}>{alert.message}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    showConfirm(
      'Delete Users',
      `Delete ${selectedItems.length} user(s)?`,
      async () => {
        try {
          const token = localStorage.getItem('token');
          await Promise.all(selectedItems.map(id => 
            axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          ));
          success(`Deleted ${selectedItems.length} user(s)`);
          clearSelection();
          fetchData();
        } catch (err) {
          error('Error deleting users');
        }
      }
    );
  };

  const renderUsers = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>👥 User Management</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => {
            setEditingUser(null);
            resetForm();
            setShowModal(true);
          }}>
            ➕ Add User
          </button>
          {selectedItems.length > 0 && (
            <ActionDropdown
              actions={[
                {
                  label: `Delete (${selectedItems.length})`,
                  icon: '🗑️',
                  onClick: handleBulkDelete,
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
      </div>
      
      {loading ? <LoadingSpinner /> : (
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
                <th>Created</th>
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
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      backgroundColor: 
                        user.role === 'admin' ? '#dc3545' :
                        user.role === 'manager' ? '#ffc107' : '#28a745',
                      color: 'white'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      backgroundColor: user.isActive ? '#28a745' : '#dc3545',
                      color: 'white'
                    }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary" 
                      style={{ marginRight: '5px' }}
                      onClick={() => {
                        setEditingUser(user);
                        setFormData({
                          name: user.name,
                          email: user.email,
                          role: user.role,
                          isActive: user.isActive,
                          password: ''
                        });
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAuditLogs = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>📋 Audit Logs</h3>
        {selectedItems.length > 0 && (
          <ActionDropdown
            actions={[
              {
                label: `Export (${selectedItems.length})`,
                icon: '📥',
                onClick: () => {
                  success(`Exporting ${selectedItems.length} log(s)`);
                  clearSelection();
                },
                className: 'primary'
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
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e, auditLogs)}
                  />
                </th>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(log._id)}
                      onChange={(e) => handleSelectItem(e, log._id)}
                    />
                  </td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.user?.name || 'System'}</td>
                  <td>{log.action}</td>
                  <td>{log.resource}</td>
                  <td>{log.ipAddress}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      backgroundColor: log.status === 'success' ? '#28a745' : '#dc3545',
                      color: 'white'
                    }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderBackups = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>💾 Database Backups</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-success" onClick={handleBackup}>
            🔄 Create Backup
          </button>
          {selectedItems.length > 0 && (
            <ActionDropdown
              actions={[
                {
                  label: `Download (${selectedItems.length})`,
                  icon: '📥',
                  onClick: () => {
                    success(`Downloading ${selectedItems.length} backup(s)`);
                    clearSelection();
                  },
                  className: 'primary'
                },
                {
                  label: `Delete (${selectedItems.length})`,
                  icon: '🗑️',
                  onClick: () => {
                    showConfirm(
                      'Delete Backups',
                      `Delete ${selectedItems.length} backup(s)?`,
                      () => {
                        success(`Deleted ${selectedItems.length} backup(s)`);
                        clearSelection();
                      }
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
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e, backups)}
                  />
                </th>
                <th>Backup Name</th>
                <th>Created Date</th>
                <th>Size</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map(backup => (
                <tr key={backup._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(backup._id)}
                      onChange={(e) => handleSelectItem(e, backup._id)}
                    />
                  </td>
                  <td>{backup.name}</td>
                  <td>{new Date(backup.createdAt).toLocaleString()}</td>
                  <td>{backup.size}</td>
                  <td>{backup.type}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      backgroundColor: backup.status === 'completed' ? '#28a745' : '#ffc107',
                      color: 'white'
                    }}>
                      {backup.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-info" style={{ marginRight: '5px' }}>
                      Download
                    </button>
                    <button className="btn btn-sm btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (!hasRole(['admin'])) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>🚫 Access Denied</h2>
          <p>You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">🔧 Admin Panel</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
        >
          🖥️ Overview
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('audit')}
        >
          📋 Audit Logs
        </button>
        <button 
          className={`btn ${activeTab === 'backups' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('backups')}
        >
          💾 Backups
        </button>
        <button 
          className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'audit' && renderAuditLogs()}
      {activeTab === 'backups' && renderBackups()}
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleUserSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input type="text" value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Role:</label>
              <select value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select value={formData.isActive} 
                onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          {!editingUser && (
            <div className="form-group">
              <label>Password:</label>
              <input type="password" value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
          )}
          <button type="submit" className="btn btn-success">
            {editingUser ? 'Update User' : 'Create User'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPanel;