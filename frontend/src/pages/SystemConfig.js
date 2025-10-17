import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SystemConfig = () => {
  const { token, hasRole } = useAuth();
  const [configs, setConfigs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('config');
  const [editingConfig, setEditingConfig] = useState(null);
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (token && hasRole(['admin'])) {
      fetchConfigs();
      fetchSessions();
    }
  }, [token]);

  const fetchConfigs = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/system/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfigs(response.data);
    } catch (error) {
      console.error('Error fetching configs:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/system/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const updateConfig = async (key, value) => {
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/system/config/${key}`, 
        { value },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfResponse.data.csrfToken
          } 
        }
      );
      
      fetchConfigs();
      setEditingConfig(null);
      setNewValue('');
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const terminateSession = async (sessionId) => {
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/system/sessions/${sessionId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-CSRF-Token': csrfResponse.data.csrfToken
        }
      });
      
      fetchSessions();
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const initializeSystem = async () => {
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/system/init`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-CSRF-Token': csrfResponse.data.csrfToken
        }
      });
      
      fetchConfigs();
      alert('System initialized with default configurations');
    } catch (error) {
      console.error('Error initializing system:', error);
    }
  };

  const groupedConfigs = configs.reduce((groups, config) => {
    const category = config.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(config);
    return groups;
  }, {});

  const renderConfigTab = () => (
    <div>
      <div className="btn-group" style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={initializeSystem}>
          🔧 Initialize System
        </button>
      </div>

      {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
        <div key={category} className="card">
          <h3 style={{ textTransform: 'capitalize', marginBottom: '20px' }}>
            {category === 'company' && '🏢'} 
            {category === 'security' && '🔒'} 
            {category === 'notifications' && '🔔'} 
            {category === 'inventory' && '📦'} 
            {category === 'finance' && '💰'} 
            {category} Configuration
          </h3>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>Current Value</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoryConfigs.map(config => (
                  <tr key={config._id}>
                    <td><strong>{config.key.split('.').pop()}</strong></td>
                    <td>
                      {editingConfig === config.key ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            type={typeof config.value === 'boolean' ? 'checkbox' : 
                                  typeof config.value === 'number' ? 'number' : 'text'}
                            value={typeof config.value === 'boolean' ? undefined : newValue}
                            checked={typeof config.value === 'boolean' ? newValue : undefined}
                            onChange={(e) => setNewValue(
                              typeof config.value === 'boolean' ? e.target.checked : e.target.value
                            )}
                            style={{ flex: 1 }}
                          />
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => updateConfig(config.key, newValue)}
                          >
                            ✅
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setEditingConfig(null);
                              setNewValue('');
                            }}
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: typeof config.value === 'boolean' ? 
                            (config.value ? '#d4edda' : '#f8d7da') : '#e9ecef',
                          color: typeof config.value === 'boolean' ? 
                            (config.value ? '#155724' : '#721c24') : '#495057'
                        }}>
                          {typeof config.value === 'boolean' ? 
                            (config.value ? '✅ Enabled' : '❌ Disabled') : 
                            config.value.toString()}
                        </span>
                      )}
                    </td>
                    <td>{config.description}</td>
                    <td>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setEditingConfig(config.key);
                          setNewValue(config.value);
                        }}
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSessionsTab = () => (
    <div className="card">
      <h3>🔐 Active User Sessions</h3>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Device Info</th>
              <th>IP Address</th>
              <th>Last Activity</th>
              <th>Login Method</th>
              <th>Risk Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr key={session._id}>
                <td>
                  <div>
                    <strong>{session.deviceInfo?.browser}</strong>
                    <br />
                    <small>{session.deviceInfo?.os}</small>
                  </div>
                </td>
                <td>{session.deviceInfo?.ip}</td>
                <td>{new Date(session.lastActivity).toLocaleString()}</td>
                <td>
                  <span className={`role-badge role-${session.loginMethod}`}>
                    {session.loginMethod}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    backgroundColor: session.riskScore > 70 ? '#e74c3c' : 
                                   session.riskScore > 30 ? '#f39c12' : '#2ecc71'
                  }}>
                    {session.riskScore}%
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => terminateSession(session._id)}
                  >
                    🚫 Terminate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (!hasRole(['admin'])) {
    return (
      <div className="page-container">
        <div className="card">
          <h3>Access Denied</h3>
          <p>You don't have permission to access system configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>⚙️ System Configuration</h1>
        <p>Manage system settings and user sessions</p>
      </div>

      <div className="btn-group" style={{ marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'config' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('config')}
        >
          ⚙️ Configuration
        </button>
        <button 
          className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('sessions')}
        >
          🔐 Sessions
        </button>
      </div>

      {activeTab === 'config' && renderConfigTab()}
      {activeTab === 'sessions' && renderSessionsTab()}
    </div>
  );
};

export default SystemConfig;