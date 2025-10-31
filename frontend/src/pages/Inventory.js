import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ActionDropdown from '../components/ActionDropdown';
import useBulkActions from '../hooks/useBulkActions';

const Inventory = () => {
  const { hasRole } = useAuth();
  const { success, error, showConfirm } = useToast();
  const { selectedItems, selectAll, handleSelectAll, handleSelectItem, clearSelection } = useBulkActions();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    minStock: '',
    supplier: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

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
      await axios.post('http://localhost:5000/api/inventory/products', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        productId: '',
        name: '',
        description: '',
        category: '',
        price: '',
        quantity: '',
        minStock: '',
        supplier: ''
      });
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/inventory/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        error('Failed to delete product: ' + (error.response?.data?.message || 'Network error'));
      }
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Inventory Management</h1>

      {showForm && (
        <div className="card">
          <h3>Add New Product</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product ID:</label>
              <input
                type="text"
                value={formData.productId}
                onChange={(e) => setFormData({...formData, productId: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Category:</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Minimum Stock:</label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({...formData, minStock: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Supplier:</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-success">Add Product</button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Product List</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {hasRole(['admin', 'manager']) && (
              <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : 'Add Product'}
              </button>
            )}
            {selectedItems.length > 0 && (
              <ActionDropdown
                actions={[
                  {
                    label: `Edit (${selectedItems.length})`,
                    icon: '✏️',
                    onClick: () => {
                      if (selectedItems.length === 1) {
                        success('Edit product');
                      } else {
                        error('Please select only one product to edit');
                      }
                    },
                    className: 'primary',
                    disabled: selectedItems.length !== 1
                  },
                  {
                    label: `Delete (${selectedItems.length})`,
                    icon: '🗑️',
                    onClick: () => {
                      showConfirm(
                        'Delete Products',
                        `Delete ${selectedItems.length} product(s)?`,
                        async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const csrfResponse = await axios.get('http://localhost:5000/api/csrf-token');
                            await Promise.all(selectedItems.map(id => 
                              axios.delete(`http://localhost:5000/api/inventory/products/${id}`, {
                                headers: { 
                                  Authorization: `Bearer ${token}`,
                                  'X-CSRF-Token': csrfResponse.data.csrfToken
                                }
                              })
                            ));
                            success(`Deleted ${selectedItems.length} product(s)`);
                            clearSelection();
                            fetchProducts();
                          } catch (err) {
                            error('Error deleting products: ' + (err.response?.data?.message || 'Failed to delete products'));
                          }
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
        <div className="table-container">
          <table className="table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e, products)}
                />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Min Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(product._id)}
                    onChange={(e) => handleSelectItem(e, product._id)}
                  />
                </td>
                <td>{product.productId}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>${product.price}</td>
                <td>{product.quantity}</td>
                <td>{product.minStock}</td>
                <td>
                  <span style={{
                    color: product.quantity <= product.minStock ? 'red' : 'green',
                    fontWeight: 'bold'
                  }}>
                    {product.quantity <= product.minStock ? 'Low Stock' : 'In Stock'}
                  </span>
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

export default Inventory;