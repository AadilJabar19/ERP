import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ActionDropdown from '../components/ActionDropdown';
import useBulkActions from '../hooks/useBulkActions';

const Sales = () => {
  const { hasRole } = useAuth();
  const { success, error, showConfirm } = useToast();
  const { selectedItems, selectAll, handleSelectAll, handleSelectItem, clearSelection } = useBulkActions();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    saleId: '',
    customer: {
      name: '',
      email: '',
      phone: ''
    },
    items: [{
      product: '',
      quantity: 1,
      price: 0
    }],
    totalAmount: 0
  });

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/sales', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(response.data.sales || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      error('Failed to load sales: ' + (error.response?.data?.message || 'Network error'));
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/inventory/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      error('Failed to load products: ' + (error.response?.data?.message || 'Network error'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/sales', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        saleId: '',
        customer: {
          name: '',
          email: '',
          phone: ''
        },
        items: [{
          product: '',
          quantity: 1,
          price: 0
        }],
        totalAmount: 0
      });
      setShowForm(false);
      fetchSales();
    } catch (error) {
      console.error('Error creating sale:', error);
      error('Failed to create sale: ' + (error.response?.data?.message || 'Network error'));
    }
  };

  const calculateTotal = () => {
    const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setFormData({...formData, totalAmount: total});
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, price: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Sales Management</h1>
      
      <button 
        className="btn btn-primary" 
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'New Sale'}
      </button>

      {showForm && (
        <div className="card">
          <h3>Create New Sale</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Sale ID:</label>
              <input
                type="text"
                value={formData.saleId}
                onChange={(e) => setFormData({...formData, saleId: e.target.value})}
                required
              />
            </div>
            
            <h4>Customer Information</h4>
            <div className="form-group">
              <label>Customer Name:</label>
              <input
                type="text"
                value={formData.customer.name}
                onChange={(e) => setFormData({
                  ...formData, 
                  customer: {...formData.customer, name: e.target.value}
                })}
                required
              />
            </div>
            <div className="form-group">
              <label>Customer Email:</label>
              <input
                type="email"
                value={formData.customer.email}
                onChange={(e) => setFormData({
                  ...formData, 
                  customer: {...formData.customer, email: e.target.value}
                })}
              />
            </div>
            <div className="form-group">
              <label>Customer Phone:</label>
              <input
                type="text"
                value={formData.customer.phone}
                onChange={(e) => setFormData({
                  ...formData, 
                  customer: {...formData.customer, phone: e.target.value}
                })}
              />
            </div>

            <h4>Items</h4>
            {formData.items.map((item, index) => (
              <div key={index} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                <div className="form-group">
                  <label>Product:</label>
                  <select
                    value={item.product}
                    onChange={(e) => updateItem(index, 'product', e.target.value)}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                    required
                  />
                </div>
              </div>
            ))}
            
            <button type="button" className="btn btn-secondary" onClick={addItem}>
              Add Item
            </button>
            <button type="button" className="btn btn-primary" onClick={calculateTotal}>
              Calculate Total
            </button>
            
            <div className="form-group">
              <label>Total Amount: ${formData.totalAmount.toFixed(2)}</label>
            </div>
            
            <button type="submit" className="btn btn-success">Create Sale</button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Sales List</h3>
          {selectedItems.length > 0 && (
            <ActionDropdown
              actions={[
                {
                  label: `View (${selectedItems.length})`,
                  icon: '👁️',
                  onClick: () => {
                    if (selectedItems.length === 1) {
                      success('View sale details');
                    } else {
                      error('Please select only one sale to view');
                    }
                  },
                  className: 'primary',
                  disabled: selectedItems.length !== 1
                },
                {
                  label: `Export (${selectedItems.length})`,
                  icon: '📥',
                  onClick: () => {
                    success(`Exporting ${selectedItems.length} sale(s)`);
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
        <div className="table-container">
          <table className="table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e, sales)}
                />
              </th>
              <th>Sale ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale._id}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(sale._id)}
                    onChange={(e) => handleSelectItem(e, sale._id)}
                  />
                </td>
                <td>{sale.saleId}</td>
                <td>{sale.customer?.name || 'N/A'}</td>
                <td>{sale.items.length} items</td>
                <td>${sale.totalAmount}</td>
                <td>{sale.status}</td>
                <td>{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;