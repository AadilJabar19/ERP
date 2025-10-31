import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ActionDropdown from '../components/ActionDropdown';
import useBulkActions from '../hooks/useBulkActions';

const Procurement = () => {
  const { token, hasRole } = useAuth();
  const { success, error, showConfirm } = useToast();
  const { selectedItems, selectAll, handleSelectAll, handleSelectItem, clearSelection } = useBulkActions();
  const [procurements, setProcurements] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    supplier: '',
    items: [{ product: '', quantity: 1, unitPrice: 0 }],
    expectedDelivery: '',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    if (token) {
      fetchProcurements();
      fetchSuppliers();
      fetchProducts();
    }
  }, [token]);

  const fetchProcurements = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/procurement`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProcurements(response.data.procurements || response.data);
    } catch (error) {
      console.error('Error fetching procurements:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/procurement`, 
        { ...formData, totalAmount },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfResponse.data.csrfToken
          } 
        }
      );
      
      setShowForm(false);
      fetchProcurements();
      setFormData({ supplier: '', items: [{ product: '', quantity: 1, unitPrice: 0 }], expectedDelivery: '', priority: 'medium', notes: '' });
    } catch (error) {
      console.error('Error creating procurement:', error);
    }
  };

  const approveProcurement = async (id) => {
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      await axios.patch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/procurement/${id}/approve`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-CSRF-Token': csrfResponse.data.csrfToken
        }
      });
      fetchProcurements();
    } catch (error) {
      console.error('Error approving procurement:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, unitPrice: 0 }]
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🛒 Procurement Management</h1>
        <p>Manage purchase requests and supplier orders</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ New Purchase Request
        </button>
        {selectedItems.length > 0 && (
          <ActionDropdown
            actions={[
              {
                label: `Approve (${selectedItems.length})`,
                icon: '✅',
                onClick: () => {
                  selectedItems.forEach(id => approveProcurement(id));
                  success(`Approved ${selectedItems.length} procurement(s)`);
                  clearSelection();
                },
                className: 'success'
              },
              {
                label: `Reject (${selectedItems.length})`,
                icon: '❌',
                onClick: () => {
                  success(`Rejected ${selectedItems.length} procurement(s)`);
                  clearSelection();
                },
                className: 'danger'
              },
              {
                label: `Export (${selectedItems.length})`,
                icon: '📥',
                onClick: () => {
                  success(`Exporting ${selectedItems.length} procurement(s)`);
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

      {showForm && (
        <div className="card">
          <h3>Create Purchase Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Supplier:</label>
                <select value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} required>
                  <option value="">Select Supplier</option>
                  {Array.isArray(suppliers) ? suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
                  )) : []}
                </select>
              </div>
              <div className="form-group">
                <label>Priority:</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <h4>Items</h4>
            {formData.items.map((item, index) => (
              <div key={index} className="form-row">
                <div className="form-group">
                  <label>Product:</label>
                  <select 
                    value={item.product} 
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].product = e.target.value;
                      setFormData({...formData, items: newItems});
                    }}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity:</label>
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].quantity = parseInt(e.target.value);
                      setFormData({...formData, items: newItems});
                    }}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price:</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].unitPrice = parseFloat(e.target.value);
                      setFormData({...formData, items: newItems});
                    }}
                    required 
                  />
                </div>
              </div>
            ))}
            
            <button type="button" className="btn btn-secondary" onClick={addItem}>
              ➕ Add Item
            </button>

            <div className="form-group">
              <label>Expected Delivery:</label>
              <input 
                type="date" 
                value={formData.expectedDelivery}
                onChange={(e) => setFormData({...formData, expectedDelivery: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Notes:</label>
              <textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="3"
              />
            </div>

            <div className="btn-group">
              <button type="submit" className="btn btn-success">💾 Create Request</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>❌ Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Purchase Requests</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e, procurements)}
                  />
                </th>
                <th>Request #</th>
                <th>Supplier</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Requested By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {procurements.map(procurement => (
                <tr key={procurement._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(procurement._id)}
                      onChange={(e) => handleSelectItem(e, procurement._id)}
                    />
                  </td>
                  <td>{procurement.requisitionNumber}</td>
                  <td>{procurement.supplier?.name}</td>
                  <td>${procurement.totalAmount?.toFixed(2)}</td>
                  <td>
                    <span className={`role-badge role-${procurement.status}`}>
                      {procurement.status}
                    </span>
                  </td>
                  <td>{procurement.priority}</td>
                  <td>{procurement.requestedBy?.name}</td>
                  <td>
                    {hasRole(['admin', 'manager']) && procurement.status === 'pending' && (
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => approveProcurement(procurement._id)}
                      >
                        ✅ Approve
                      </button>
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
};

export default Procurement;