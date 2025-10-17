import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Integrations = () => {
  const { token, hasRole } = useAuth();
  const [integrations, setIntegrations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'crm',
    provider: '',
    config: { apiKey: '', webhookUrl: '' }
  });

  const providers = {
    crm: ['HubSpot', 'Salesforce', 'Pipedrive'],
    accounting: ['QuickBooks', 'Xero', 'Zoho Books'],
    messaging: ['Slack', 'Microsoft Teams', 'WhatsApp Business'],
    ecommerce: ['Shopify', 'WooCommerce', 'Magento'],
    ai: ['OpenAI', 'Amazon Q', 'Google AI']
  };

  useEffect(() => {
    if (token && hasRole(['admin'])) {
      fetchIntegrations();
    }
  }, [token]);

  const fetchIntegrations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/integrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIntegrations(response.data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/integrations`, 
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfResponse.data.csrfToken
          } 
        }
      );
      
      setShowForm(false);
      fetchIntegrations();
      setFormData({ name: '', type: 'crm', provider: '', config: { apiKey: '', webhookUrl: '' } });
    } catch (error) {
      console.error('Error creating integration:', error);
    }
  };

  const testIntegration = async (id) => {
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/integrations/${id}/test`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-CSRF-Token': csrfResponse.data.csrfToken
        }
      });
      
      alert(response.data.message);
      fetchIntegrations();
    } catch (error) {
      alert('Integration test failed');
    }
  };

  const syncIntegration = async (id) => {
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/integrations/${id}/sync`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-CSRF-Token': csrfResponse.data.csrfToken
        }
      });
      
      alert('Sync initiated');
      fetchIntegrations();
    } catch (error) {
      alert('Sync failed');
    }
  };

  if (!hasRole(['admin'])) {
    return (
      <div className="page-container">
        <div className="card">
          <h3>Access Denied</h3>
          <p>You don't have permission to manage integrations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🔗 Integrations & APIs</h1>
        <p>Connect with external tools and automate workflows</p>
      </div>

      <div className="btn-group" style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Add Integration
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Add New Integration</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Integration Name:</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Type:</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="crm">CRM</option>
                  <option value="accounting">Accounting</option>
                  <option value="messaging">Messaging</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="ai">AI Assistant</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Provider:</label>
              <select 
                value={formData.provider} 
                onChange={(e) => setFormData({...formData, provider: e.target.value})}
                required
              >
                <option value="">Select Provider</option>
                {providers[formData.type]?.map(provider => (
                  <option key={provider} value={provider.toLowerCase()}>{provider}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>API Key:</label>
                <input 
                  type="password" 
                  value={formData.config.apiKey}
                  onChange={(e) => setFormData({
                    ...formData, 
                    config: {...formData.config, apiKey: e.target.value}
                  })}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Webhook URL:</label>
                <input 
                  type="url" 
                  value={formData.config.webhookUrl}
                  onChange={(e) => setFormData({
                    ...formData, 
                    config: {...formData.config, webhookUrl: e.target.value}
                  })}
                />
              </div>
            </div>

            <div className="btn-group">
              <button type="submit" className="btn btn-success">🔗 Create Integration</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>❌ Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Active Integrations</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Last Sync</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map(integration => (
                <tr key={integration._id}>
                  <td>{integration.name}</td>
                  <td>
                    <span className={`role-badge role-${integration.type}`}>
                      {integration.type.toUpperCase()}
                    </span>
                  </td>
                  <td>{integration.provider}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '0.8rem',
                      backgroundColor: integration.isActive ? '#2ecc71' : '#95a5a6'
                    }}>
                      {integration.isActive ? '✅ Active' : '⏸️ Inactive'}
                    </span>
                  </td>
                  <td>
                    {integration.lastSync ? 
                      new Date(integration.lastSync).toLocaleString() : 
                      'Never'
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => testIntegration(integration._id)}
                      >
                        🧪 Test
                      </button>
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => syncIntegration(integration._id)}
                      >
                        🔄 Sync
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>🚀 Available Integrations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {Object.entries(providers).map(([type, typeProviders]) => (
            <div key={type} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h4 style={{ textTransform: 'capitalize', marginBottom: '15px' }}>
                {type === 'crm' && '🤝'} 
                {type === 'accounting' && '💰'} 
                {type === 'messaging' && '💬'} 
                {type === 'ecommerce' && '🛒'} 
                {type === 'ai' && '🤖'} 
                {type}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {typeProviders.map(provider => (
                  <li key={provider} style={{ 
                    padding: '8px 0', 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{provider}</span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      {integrations.find(i => i.provider === provider.toLowerCase()) ? '✅' : '➕'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Integrations;