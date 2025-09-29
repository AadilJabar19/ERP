import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import Modal from '../components/Modal';

const InventoryManagement = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [alerts, setAlerts] = useState({ lowStock: [], expiringSoon: [] });
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    // Product form
    sku: '', name: '', category: '', pricing: { cost: '', sellingPrice: '' },
    inventory: { stockLevels: { reorderPoint: '' } },
    // Warehouse form
    name: '', type: 'main', address: { city: '', state: '' },
    // Stock movement form
    product: '', warehouse: '', movementType: 'in', quantity: '', notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, searchTerm, filterCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let data = {};
      
      switch (activeTab) {
        case 'products':
          endpoint = 'http://localhost:5000/api/inventory/products';
          data = {
            sku: formData.sku,
            productId: formData.sku,
            name: formData.name,
            category: formData.category,
            pricing: {
              cost: parseFloat(formData.pricing.cost),
              sellingPrice: parseFloat(formData.pricing.sellingPrice)
            },
            inventory: {
              stockLevels: {
                reorderPoint: parseInt(formData.inventory.stockLevels.reorderPoint)
              },
              locations: []
            }
          };
          break;
        case 'warehouses':
          endpoint = 'http://localhost:5000/api/inventory/warehouses';
          data = {
            name: formData.name,
            type: formData.type,
            address: formData.address
          };
          break;
        case 'movements':
          endpoint = 'http://localhost:5000/api/inventory/stock-movements';
          data = {
            product: formData.product,
            warehouse: formData.warehouse,
            movementType: formData.movementType,
            transactionType: formData.movementType === 'in' ? 'purchase' : 'sale',
            quantity: parseInt(formData.quantity),
            notes: formData.notes
          };
          break;
      }
      
      await axios.post(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowModal(false);
      setFormData({
        sku: '', name: '', category: '', pricing: { cost: '', sellingPrice: '' },
        inventory: { stockLevels: { reorderPoint: '' } },
        name: '', type: 'main', address: { city: '', state: '' },
        product: '', warehouse: '', movementType: 'in', quantity: '', notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to submit'));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      switch (activeTab) {
        case 'products':
          const params = new URLSearchParams({
            page: currentPage,
            limit: 10,
            ...(searchTerm && { search: searchTerm }),
            ...(filterCategory && { category: filterCategory })
          });
          const prodRes = await axios.get(`http://localhost:5000/api/inventory/products?${params}`, { headers });
          setProducts(prodRes.data.products);
          setTotalPages(prodRes.data.totalPages);
          break;
        case 'warehouses':
          const whRes = await axios.get('http://localhost:5000/api/inventory/warehouses', { headers });
          setWarehouses(whRes.data);
          break;
        case 'movements':
          const movRes = await axios.get('http://localhost:5000/api/inventory/stock-movements', { headers });
          setStockMovements(movRes.data);
          break;
        case 'alerts':
          const alertRes = await axios.get('http://localhost:5000/api/inventory/alerts', { headers });
          setAlerts(alertRes.data);
          break;
        case 'analytics':
          const analyticsRes = await axios.get('http://localhost:5000/api/inventory/analytics', { headers });
          setAnalytics(analyticsRes.data);
          break;
      }
      
      // Always fetch categories for filters
      if (categories.length === 0) {
        const catRes = await axios.get('http://localhost:5000/api/inventory/categories', { headers });
        setCategories(catRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product) => {
    const totalQty = product.totalQuantity || 0;
    const reorderPoint = product.inventory?.stockLevels?.reorderPoint || 0;
    
    if (totalQty === 0) return { status: 'Out of Stock', color: '#dc3545' };
    if (totalQty <= reorderPoint) return { status: 'Low Stock', color: '#ffc107' };
    return { status: 'In Stock', color: '#28a745' };
  };

  const renderProducts = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Product Inventory</h3>
        {hasRole(['admin', 'manager']) && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Add Product
          </button>
        )}
      </div>
      
      <SearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterOptions={categories.map(cat => ({ value: cat._id, label: cat.name }))}
        selectedFilter={filterCategory}
        setSelectedFilter={setFilterCategory}
      />
      
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Stock Qty</th>
                  <th>Available</th>
                  <th>Reorder Point</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const stockStatus = getStockStatus(product);
                  const totalValue = (product.totalQuantity || 0) * (product.pricing?.cost || 0);
                  
                  return (
                    <tr key={product._id}>
                      <td>{product.sku}</td>
                      <td>{product.name}</td>
                      <td>{product.category?.name}</td>
                      <td>{product.totalQuantity || 0}</td>
                      <td>{product.availableQuantity || 0}</td>
                      <td>{product.inventory?.stockLevels?.reorderPoint || 0}</td>
                      <td>${product.pricing?.sellingPrice?.toFixed(2) || '0.00'}</td>
                      <td>${totalValue.toFixed(2)}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                          backgroundColor: stockStatus.color, color: 'white'
                        }}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                          View
                        </button>
                        {hasRole(['admin', 'manager']) && (
                          <button className="btn btn-sm btn-secondary">
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span style={{ padding: '10px' }}>Page {currentPage} of {totalPages}</span>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderWarehouses = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Warehouse Management</h3>
        {hasRole(['admin']) && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Add Warehouse
          </button>
        )}
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Warehouse Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Manager</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map(warehouse => (
                <tr key={warehouse._id}>
                  <td>{warehouse.warehouseCode}</td>
                  <td>{warehouse.name}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: '#17a2b8', color: 'white'
                    }}>
                      {warehouse.type}
                    </span>
                  </td>
                  <td>{warehouse.manager?.personalInfo?.firstName} {warehouse.manager?.personalInfo?.lastName}</td>
                  <td>{warehouse.address?.city}, {warehouse.address?.state}</td>
                  <td>
                    {warehouse.capacity?.usedSpace || 0} / {warehouse.capacity?.totalSpace || 0} sq ft
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: warehouse.status === 'active' ? '#28a745' : '#6c757d',
                      color: 'white'
                    }}>
                      {warehouse.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAlerts = () => (
    <div>
      <h3>Inventory Alerts</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h4 style={{ color: '#ffc107' }}>Low Stock Items ({alerts.lowStock?.length || 0})</h4>
          {alerts.lowStock?.slice(0, 5).map(product => (
            <div key={product._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              <strong>{product.name}</strong><br />
              <small>SKU: {product.sku} | Qty: {product.totalQuantity} | Reorder: {product.inventory?.stockLevels?.reorderPoint}</small>
            </div>
          ))}
        </div>
        
        <div className="card">
          <h4 style={{ color: '#dc3545' }}>Expiring Soon ({alerts.expiringSoon?.length || 0})</h4>
          {alerts.expiringSoon?.slice(0, 5).map(product => (
            <div key={product._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              <strong>{product.name}</strong><br />
              <small>Expires: {new Date(product.inventory?.batchTracking?.batches?.[0]?.expiryDate).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMovements = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Stock Movements</h3>
        {hasRole(['admin', 'manager']) && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Record Movement
          </button>
        )}
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Warehouse</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {stockMovements.map(movement => (
                <tr key={movement._id}>
                  <td>{new Date(movement.movementDate).toLocaleDateString()}</td>
                  <td>{movement.product?.name} ({movement.product?.sku})</td>
                  <td>{movement.warehouse?.name}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: movement.movementType === 'in' ? '#28a745' : 
                                     movement.movementType === 'out' ? '#dc3545' : '#ffc107',
                      color: 'white'
                    }}>
                      {movement.movementType}
                    </span>
                  </td>
                  <td>{movement.quantity}</td>
                  <td>{movement.referenceNumber || '-'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: movement.status === 'completed' ? '#28a745' : '#ffc107',
                      color: 'white'
                    }}>
                      {movement.status}
                    </span>
                  </td>
                  <td>{movement.createdBy?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Category Management</h3>
        {hasRole(['admin', 'manager']) && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Add Category
          </button>
        )}
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Category Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category._id}>
                  <td>{category.categoryCode}</td>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: category.status === 'active' ? '#28a745' : '#6c757d',
                      color: 'white'
                    }}>
                      {category.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <h3>Inventory Analytics</h3>
      <div className="grid-stats">
        <div className="card" style={{ margin: 0 }}>
          <h4>Total Products</h4>
          <p style={{ fontSize: '2rem', color: '#3498db' }}>{analytics.totalProducts || 0}</p>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <h4>Total Inventory Value</h4>
          <p style={{ fontSize: '2rem', color: '#28a745' }}>${(analytics.totalValue || 0).toLocaleString()}</p>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <h4>Low Stock Items</h4>
          <p style={{ fontSize: '2rem', color: '#ffc107' }}>{analytics.lowStockProducts || 0}</p>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <h4>Warehouses</h4>
          <p style={{ fontSize: '2rem', color: '#6f42c1' }}>{analytics.warehouseStats?.length || 0}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <h1 className="page-title">Inventory Management System</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('products')}
          style={{ marginRight: '10px' }}
        >
          Products
        </button>
        <button 
          className={`btn ${activeTab === 'warehouses' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('warehouses')}
          style={{ marginRight: '10px' }}
        >
          Warehouses
        </button>
        <button 
          className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('categories')}
          style={{ marginRight: '10px' }}
        >
          Categories
        </button>
        <button 
          className={`btn ${activeTab === 'movements' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('movements')}
          style={{ marginRight: '10px' }}
        >
          Stock Movements
        </button>
        <button 
          className={`btn ${activeTab === 'alerts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('alerts')}
          style={{ marginRight: '10px' }}
        >
          Alerts
        </button>
        {hasRole(['admin', 'manager']) && (
          <button 
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        )}
      </div>

      {activeTab === 'products' && renderProducts()}
      {activeTab === 'warehouses' && renderWarehouses()}
      {activeTab === 'categories' && renderCategories()}
      {activeTab === 'movements' && renderMovements()}
      {activeTab === 'alerts' && renderAlerts()}
      {activeTab === 'analytics' && renderAnalytics()}
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={
        activeTab === 'products' ? 'Add Product' :
        activeTab === 'categories' ? 'Add Category' :
        activeTab === 'warehouses' ? 'Add Warehouse' :
        activeTab === 'movements' ? 'Stock Movement' : 'Form'
      }>
        <form onSubmit={handleSubmit}>
          {activeTab === 'products' && (
            <>
              <div className="form-group">
                <label>SKU:</label>
                <input type="text" value={formData.sku} 
                  onChange={(e) => setFormData({...formData, sku: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Product Name:</label>
                <input type="text" value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Category:</label>
                <select value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cost Price:</label>
                  <input type="number" step="0.01" value={formData.pricing.cost} 
                    onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, cost: e.target.value}})} required />
                </div>
                <div className="form-group">
                  <label>Selling Price:</label>
                  <input type="number" step="0.01" value={formData.pricing.sellingPrice} 
                    onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, sellingPrice: e.target.value}})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Reorder Point:</label>
                <input type="number" value={formData.inventory.stockLevels.reorderPoint} 
                  onChange={(e) => setFormData({...formData, inventory: {...formData.inventory, stockLevels: {...formData.inventory.stockLevels, reorderPoint: e.target.value}}})} required />
              </div>
            </>
          )}
          
          {activeTab === 'categories' && (
            <>
              <div className="form-group">
                <label>Category Name:</label>
                <input type="text" value={formData.categoryName} 
                  onChange={(e) => setFormData({...formData, categoryName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
            </>
          )}
          
          {activeTab === 'warehouses' && (
            <>
              <div className="form-group">
                <label>Warehouse Name:</label>
                <input type="text" value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Type:</label>
                <select value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="main">Main Warehouse</option>
                  <option value="distribution">Distribution Center</option>
                  <option value="retail">Retail Store</option>
                  <option value="transit">Transit Hub</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City:</label>
                  <input type="text" value={formData.address.city} 
                    onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})} required />
                </div>
                <div className="form-group">
                  <label>State:</label>
                  <input type="text" value={formData.address.state} 
                    onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})} required />
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'movements' && (
            <>
              <div className="form-group">
                <label>Product:</label>
                <select value={formData.product} 
                  onChange={(e) => setFormData({...formData, product: e.target.value})} required>
                  <option value="">Select Product</option>
                  {products.map(prod => (
                    <option key={prod._id} value={prod._id}>{prod.name} ({prod.sku})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Warehouse:</label>
                <select value={formData.warehouse} 
                  onChange={(e) => setFormData({...formData, warehouse: e.target.value})} required>
                  <option value="">Select Warehouse</option>
                  {warehouses.map(wh => (
                    <option key={wh._id} value={wh._id}>{wh.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Movement Type:</label>
                  <select value={formData.movementType} 
                    onChange={(e) => setFormData({...formData, movementType: e.target.value})}>
                    <option value="in">Stock In</option>
                    <option value="out">Stock Out</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity:</label>
                  <input type="number" value={formData.quantity} 
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Notes:</label>
                <textarea value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})} />
              </div>
            </>
          )}
          
          <button type="submit" className="btn btn-success">
            {activeTab === 'products' ? 'Add Product' :
             activeTab === 'categories' ? 'Add Category' :
             activeTab === 'warehouses' ? 'Add Warehouse' :
             activeTab === 'movements' ? 'Record Movement' : 'Submit'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;