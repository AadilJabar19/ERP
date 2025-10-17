import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Manufacturing = () => {
  const { token, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('bom');
  const [boms, setBoms] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showBomForm, setShowBomForm] = useState(false);
  const [showWoForm, setShowWoForm] = useState(false);
  const [bomData, setBomData] = useState({
    product: '',
    components: [{ component: '', quantity: 1, unit: 'pcs' }],
    version: '1.0'
  });
  const [woData, setWoData] = useState({
    product: '',
    quantity: 1,
    bom: '',
    estimatedCost: 0,
    assignedTo: [],
    notes: ''
  });

  useEffect(() => {
    if (token) {
      fetchBoms();
      fetchWorkOrders();
      fetchProducts();
      fetchEmployees();
    }
  }, [token]);

  const fetchBoms = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/manufacturing/bom`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoms(response.data);
    } catch (error) {
      console.error('Error fetching BOMs:', error);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/manufacturing/work-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkOrders(response.data);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/inventory/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/hrm/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data.employees || response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleBomSubmit = async (e) => {
    e.preventDefault();
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/manufacturing/bom`, 
        bomData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfResponse.data.csrfToken
          } 
        }
      );
      
      setShowBomForm(false);
      fetchBoms();
      setBomData({ product: '', components: [{ component: '', quantity: 1, unit: 'pcs' }], version: '1.0' });
    } catch (error) {
      console.error('Error creating BOM:', error);
    }
  };

  const handleWoSubmit = async (e) => {
    e.preventDefault();
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/manufacturing/work-orders`, 
        woData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfResponse.data.csrfToken
          } 
        }
      );
      
      setShowWoForm(false);
      fetchWorkOrders();
      setWoData({ product: '', quantity: 1, bom: '', estimatedCost: 0, assignedTo: [], notes: '' });
    } catch (error) {
      console.error('Error creating work order:', error);
    }
  };

  const updateWorkOrderStatus = async (id, status) => {
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      await axios.patch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/manufacturing/work-orders/${id}/status`, 
        { status },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfResponse.data.csrfToken
          } 
        }
      );
      
      fetchWorkOrders();
    } catch (error) {
      console.error('Error updating work order:', error);
    }
  };

  const addBomComponent = () => {
    setBomData({
      ...bomData,
      components: [...bomData.components, { component: '', quantity: 1, unit: 'pcs' }]
    });
  };

  const renderBomTab = () => (
    <div>
      {hasRole(['admin', 'manager']) && (
        <div className="btn-group" style={{ marginBottom: '20px' }}>
          <button className="btn btn-primary" onClick={() => setShowBomForm(true)}>
            ➕ Create BOM
          </button>
        </div>
      )}

      {showBomForm && (
        <div className="card">
          <h3>Create Bill of Materials</h3>
          <form onSubmit={handleBomSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Product:</label>
                <select value={bomData.product} onChange={(e) => setBomData({...bomData, product: e.target.value})} required>
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Version:</label>
                <input 
                  type="text" 
                  value={bomData.version}
                  onChange={(e) => setBomData({...bomData, version: e.target.value})}
                  required 
                />
              </div>
            </div>

            <h4>Components</h4>
            {bomData.components.map((component, index) => (
              <div key={index} className="form-row">
                <div className="form-group">
                  <label>Component:</label>
                  <select 
                    value={component.component} 
                    onChange={(e) => {
                      const newComponents = [...bomData.components];
                      newComponents[index].component = e.target.value;
                      setBomData({...bomData, components: newComponents});
                    }}
                    required
                  >
                    <option value="">Select Component</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity:</label>
                  <input 
                    type="number" 
                    value={component.quantity}
                    onChange={(e) => {
                      const newComponents = [...bomData.components];
                      newComponents[index].quantity = parseInt(e.target.value);
                      setBomData({...bomData, components: newComponents});
                    }}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Unit:</label>
                  <input 
                    type="text" 
                    value={component.unit}
                    onChange={(e) => {
                      const newComponents = [...bomData.components];
                      newComponents[index].unit = e.target.value;
                      setBomData({...bomData, components: newComponents});
                    }}
                    required 
                  />
                </div>
              </div>
            ))}
            
            <button type="button" className="btn btn-secondary" onClick={addBomComponent}>
              ➕ Add Component
            </button>

            <div className="btn-group" style={{ marginTop: '20px' }}>
              <button type="submit" className="btn btn-success">💾 Create BOM</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowBomForm(false)}>❌ Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Bill of Materials</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Version</th>
                <th>Components</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {boms.map(bom => (
                <tr key={bom._id}>
                  <td>{bom.product?.name}</td>
                  <td>{bom.version}</td>
                  <td>{bom.components?.length} components</td>
                  <td>
                    <span className={`role-badge ${bom.isActive ? 'role-admin' : 'role-employee'}`}>
                      {bom.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(bom.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWorkOrdersTab = () => (
    <div>
      {hasRole(['admin', 'manager']) && (
        <div className="btn-group" style={{ marginBottom: '20px' }}>
          <button className="btn btn-primary" onClick={() => setShowWoForm(true)}>
            ➕ Create Work Order
          </button>
        </div>
      )}

      {showWoForm && (
        <div className="card">
          <h3>Create Work Order</h3>
          <form onSubmit={handleWoSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Product:</label>
                <select value={woData.product} onChange={(e) => setWoData({...woData, product: e.target.value})} required>
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>BOM:</label>
                <select value={woData.bom} onChange={(e) => setWoData({...woData, bom: e.target.value})} required>
                  <option value="">Select BOM</option>
                  {boms.map(bom => (
                    <option key={bom._id} value={bom._id}>{bom.product?.name} v{bom.version}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity:</label>
                <input 
                  type="number" 
                  value={woData.quantity}
                  onChange={(e) => setWoData({...woData, quantity: parseInt(e.target.value)})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Estimated Cost:</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={woData.estimatedCost}
                  onChange={(e) => setWoData({...woData, estimatedCost: parseFloat(e.target.value)})}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes:</label>
              <textarea 
                value={woData.notes}
                onChange={(e) => setWoData({...woData, notes: e.target.value})}
                rows="3"
              />
            </div>

            <div className="btn-group">
              <button type="submit" className="btn btn-success">🏭 Create Work Order</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowWoForm(false)}>❌ Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Work Orders</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Estimated Cost</th>
                <th>Actual Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map(wo => (
                <tr key={wo._id}>
                  <td>{wo.orderNumber}</td>
                  <td>{wo.product?.name}</td>
                  <td>{wo.quantity}</td>
                  <td>
                    <span className={`role-badge role-${wo.status}`}>
                      {wo.status}
                    </span>
                  </td>
                  <td>${wo.estimatedCost?.toFixed(2)}</td>
                  <td>${wo.actualCost?.toFixed(2)}</td>
                  <td>
                    {hasRole(['admin', 'manager']) && (
                      <select 
                        value={wo.status} 
                        onChange={(e) => updateWorkOrderStatus(wo._id, e.target.value)}
                        className="btn btn-sm"
                      >
                        <option value="planned">Planned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🏭 Manufacturing</h1>
        <p>Manage production planning and work orders</p>
      </div>

      <div className="btn-group" style={{ marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'bom' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('bom')}
        >
          📋 Bill of Materials
        </button>
        <button 
          className={`btn ${activeTab === 'workorders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('workorders')}
        >
          🏭 Work Orders
        </button>
      </div>

      {activeTab === 'bom' && renderBomTab()}
      {activeTab === 'workorders' && renderWorkOrdersTab()}
    </div>
  );
};

export default Manufacturing;