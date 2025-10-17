import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import Modal from '../components/Modal';
import BulkActions from '../components/BulkActions';
import CSVUpload from '../components/CSVUpload';
import useBulkActions from '../hooks/useBulkActions';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const InventoryManagement = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  
  // Bulk actions hooks
  const productsBulk = useBulkActions();
  const categoriesBulk = useBulkActions();
  const warehousesBulk = useBulkActions();
  const suppliersBulk = useBulkActions();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [alerts, setAlerts] = useState({ lowStock: [], expiringSoon: [] });
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvUploadType, setCSVUploadType] = useState('products');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [formData, setFormData] = useState({
    // Product form
    productId: '', name: '', description: '', category: '', sku: '', barcode: '',
    pricing: { cost: '', sellingPrice: '', currency: 'USD' },
    inventory: { 
      stockLevels: { reorderPoint: 10, maxStock: 1000 },
      trackingMethod: 'fifo'
    },
    specifications: { weight: '', dimensions: '', color: '', material: '' },
    // Category form
    categoryName: '', categoryDescription: '',
    // Warehouse form
    warehouseName: '', warehouseCode: '', location: '', capacity: { totalSpace: 1000 },
    // Stock movement form
    product: '', warehouse: '', movementType: 'in', quantity: 0, reason: '', reference: '',
    // Supplier form
    companyName: '', contactPerson: '', email: '', phone: '', address: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      switch (activeTab) {
        case 'products':
          const prodRes = await axios.get('http://localhost:5000/api/inventory/products', { headers });
          setProducts(prodRes.data.products || []);
          break;
        case 'categories':
          const catRes = await axios.get('http://localhost:5000/api/inventory/categories', { headers });
          setCategories(catRes.data || []);
          break;
        case 'warehouses':
          const whRes = await axios.get('http://localhost:5000/api/inventory/warehouses', { headers });
          setWarehouses(whRes.data || []);
          break;
        case 'movements':
          const movRes = await axios.get('http://localhost:5000/api/inventory/stock-movements', { headers });
          setStockMovements(movRes.data || []);
          break;
        case 'suppliers':
          const suppRes = await axios.get('http://localhost:5000/api/suppliers', { headers });
          setSuppliers(suppRes.data || []);
          break;
        case 'analytics':
          const analyticsRes = await axios.get('http://localhost:5000/api/inventory/analytics', { headers });
          setAnalytics(analyticsRes.data);
          break;
        case 'alerts':
          const alertsRes = await axios.get('http://localhost:5000/api/inventory/alerts', { headers });
          setAlerts(alertsRes.data);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let method = 'post';
      let data = {};
      
      switch (activeTab) {
        case 'products':
          if (editingItem) {
            endpoint = `http://localhost:5000/api/inventory/products/${editingItem._id}`;
            method = 'put';
          } else {
            endpoint = 'http://localhost:5000/api/inventory/products';
          }
          data = {
            productId: formData.productId,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            sku: formData.sku,
            barcode: formData.barcode,
            pricing: {
              cost: parseFloat(formData.pricing.cost),
              sellingPrice: parseFloat(formData.pricing.sellingPrice),
              currency: formData.pricing.currency
            },
            inventory: formData.inventory,
            specifications: formData.specifications
          };
          break;
        case 'categories':
          endpoint = 'http://localhost:5000/api/inventory/categories';
          data = {
            name: formData.categoryName,
            description: formData.categoryDescription
          };
          break;
        case 'warehouses':
          endpoint = 'http://localhost:5000/api/inventory/warehouses';
          data = {
            name: formData.warehouseName,
            warehouseCode: formData.warehouseCode,
            location: formData.location,
            capacity: { totalSpace: parseInt(formData.capacity.totalSpace) }
          };
          break;
        case 'suppliers':
          endpoint = 'http://localhost:5000/api/suppliers';
          data = {
            companyName: formData.companyName,
            contactPerson: formData.contactPerson,
            contactInfo: {
              email: formData.email,
              phone: formData.phone,
              address: formData.address
            }
          };
          break;
      }
      
      if (method === 'put') {
        await axios.put(endpoint, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(endpoint, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to submit'));
    }
  };

  const handleStockMovement = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/inventory/stock-movements', {
        product: formData.product,
        warehouse: formData.warehouse,
        movementType: formData.movementType,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        reference: formData.reference
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowStockModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error recording stock movement:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to record movement'));
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '', name: '', description: '', category: '', sku: '', barcode: '',
      pricing: { cost: '', sellingPrice: '', currency: 'USD' },
      inventory: { 
        stockLevels: { reorderPoint: 10, maxStock: 1000 },
        trackingMethod: 'fifo'
      },
      specifications: { weight: '', dimensions: '', color: '', material: '' },
      categoryName: '', categoryDescription: '',
      warehouseName: '', warehouseCode: '', location: '', capacity: { totalSpace: 1000 },
      product: '', warehouse: '', movementType: 'in', quantity: 0, reason: '', reference: '',
      companyName: '', contactPerson: '', email: '', phone: '', address: ''
    });
  };

  const handleCSVUpload = async (csvData) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch (csvUploadType) {
        case 'products':
          endpoint = 'http://localhost:5000/api/inventory/products/bulk';
          break;
        case 'categories':
          endpoint = 'http://localhost:5000/api/inventory/categories/bulk';
          break;
        case 'warehouses':
          endpoint = 'http://localhost:5000/api/inventory/warehouses/bulk';
          break;
        case 'suppliers':
          endpoint = 'http://localhost:5000/api/suppliers/bulk';
          break;
      }
      
      await axios.post(endpoint, { [csvUploadType]: csvData }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert(`Successfully imported ${csvData.length} ${csvUploadType}`);
      setShowCSVModal(false);
      fetchData();
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data: ' + (error.response?.data?.message || 'Failed to import'));
    }
  };

  const getCSVTemplate = () => {
    switch (csvUploadType) {
      case 'products':
        return [{
          productId: 'PROD001',
          name: 'Sample Product',
          sku: 'SKU001',
          category: 'Electronics',
          cost: '50.00',
          sellingPrice: '75.00',
          reorderPoint: '10',
          maxStock: '100'
        }];
      case 'categories':
        return [{
          name: 'Electronics',
          description: 'Electronic devices and accessories'
        }];
      case 'warehouses':
        return [{
          name: 'Main Warehouse',
          warehouseCode: 'WH001',
          location: 'New York',
          totalSpace: '1000'
        }];
      case 'suppliers':
        return [{
          companyName: 'ABC Suppliers',
          contactPerson: 'John Smith',
          email: 'john@abcsuppliers.com',
          phone: '+1234567890',
          address: '123 Business St, City, State'
        }];
      default:
        return [];
    }
  };

  const renderProducts = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>📦 Product Management</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {hasRole(['admin', 'manager']) && (
            <>
              <button className="btn btn-success" onClick={() => setShowStockModal(true)}>
                📊 Stock Movement
              </button>
              <button className="btn btn-primary" onClick={() => {
                setEditingItem(null);
                resetForm();
                setShowModal(true);
              }}>
                ➕ Add Product
              </button>
            </>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        {productsBulk.selectedItems.length > 0 && (
          <BulkActions
            selectedCount={productsBulk.selectedItems.length}
            onBulkDelete={() => productsBulk.handleBulkDelete('products', 'http://localhost:5000/api/inventory/products', fetchData)}
            onClearSelection={productsBulk.clearSelection}
          />
        )}
        <button className="btn btn-info" onClick={() => {
          setCSVUploadType('products');
          setShowCSVModal(true);
        }}>
          📤 Import CSV
        </button>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <select value={filterWarehouse} onChange={(e) => setFilterWarehouse(e.target.value)}>
          <option value="">All Warehouses</option>
          {(warehouses || []).map(wh => (
            <option key={wh._id} value={wh._id}>{wh.name}</option>
          ))}
        </select>
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={productsBulk.isAllSelected(products)}
                    onChange={(e) => productsBulk.handleSelectAll(e, products)}
                  />
                </th>
                <th>Product ID</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Cost</th>
                <th>Selling Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(products || []).filter(product => 
                product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.productId?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(product => (
                <tr key={product._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={productsBulk.selectedItems.includes(product._id)}
                      onChange={(e) => productsBulk.handleSelectItem(e, product._id)}
                    />
                  </td>
                  <td>{product.productId}</td>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.category?.name}</td>
                  <td>
                    <span style={{
                      color: product.totalQuantity <= product.inventory?.stockLevels?.reorderPoint ? 'red' : 'green',
                      fontWeight: 'bold'
                    }}>
                      {product.totalQuantity || 0}
                    </span>
                  </td>
                  <td>${product.pricing?.cost?.toFixed(2)}</td>
                  <td>${product.pricing?.sellingPrice?.toFixed(2)}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: product.status === 'active' ? '#28a745' : '#dc3545',
                      color: 'white'
                    }}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    {hasRole(['admin', 'manager']) && (
                      <>
                        <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-info">
                          View
                        </button>
                      </>
                    )}
                  </td>
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
        <h3>🏷️ Category Management</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {categoriesBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={categoriesBulk.selectedItems.length}
              onBulkDelete={() => categoriesBulk.handleBulkDelete('categories', 'http://localhost:5000/api/inventory/categories', fetchData)}
              onClearSelection={categoriesBulk.clearSelection}
            />
          )}
          {hasRole(['admin', 'manager']) && (
            <button className="btn btn-primary" onClick={() => {
              setEditingItem(null);
              resetForm();
              setShowModal(true);
            }}>
              ➕ Add Category
            </button>
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
                    checked={categoriesBulk.isAllSelected(categories)}
                    onChange={(e) => categoriesBulk.handleSelectAll(e, categories)}
                  />
                </th>
                <th>Category Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(categories || []).map(category => (
                <tr key={category._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={categoriesBulk.selectedItems.includes(category._id)}
                      onChange={(e) => categoriesBulk.handleSelectItem(e, category._id)}
                    />
                  </td>
                  <td>{category.categoryCode}</td>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td>{category.productCount || 0}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: '#28a745', color: 'white'
                    }}>
                      Active
                    </span>
                  </td>
                  <td>
                    {hasRole(['admin', 'manager']) && (
                      <>
                        <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger">
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderWarehouses = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>🏭 Warehouse Management</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {warehousesBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={warehousesBulk.selectedItems.length}
              onBulkDelete={() => warehousesBulk.handleBulkDelete('warehouses', 'http://localhost:5000/api/inventory/warehouses', fetchData)}
              onClearSelection={warehousesBulk.clearSelection}
            />
          )}
          {hasRole(['admin']) && (
            <button className="btn btn-primary" onClick={() => {
              setEditingItem(null);
              resetForm();
              setShowModal(true);
            }}>
              ➕ Add Warehouse
            </button>
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
                    checked={warehousesBulk.isAllSelected(warehouses)}
                    onChange={(e) => warehousesBulk.handleSelectAll(e, warehouses)}
                  />
                </th>
                <th>Warehouse Code</th>
                <th>Name</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(warehouses || []).map(warehouse => (
                <tr key={warehouse._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={warehousesBulk.selectedItems.includes(warehouse._id)}
                      onChange={(e) => warehousesBulk.handleSelectItem(e, warehouse._id)}
                    />
                  </td>
                  <td>{warehouse.warehouseCode}</td>
                  <td>{warehouse.name}</td>
                  <td>{warehouse.location}</td>
                  <td>{warehouse.capacity?.totalSpace}</td>
                  <td>{warehouse.manager?.personalInfo?.firstName} {warehouse.manager?.personalInfo?.lastName}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: '#28a745', color: 'white'
                    }}>
                      Active
                    </span>
                  </td>
                  <td>
                    {hasRole(['admin']) && (
                      <>
                        <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-info">
                          View
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderMovements = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>📊 Stock Movements</h3>
        <button className="btn btn-primary" onClick={() => setShowStockModal(true)}>
          ➕ Record Movement
        </button>
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
                <th>Reason</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(stockMovements || []).map(movement => (
                <tr key={movement._id}>
                  <td>{new Date(movement.date).toLocaleDateString()}</td>
                  <td>{movement.product?.name}</td>
                  <td>{movement.warehouse?.name}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: movement.movementType === 'in' ? '#28a745' : '#dc3545',
                      color: 'white'
                    }}>
                      {movement.movementType}
                    </span>
                  </td>
                  <td>{movement.quantity}</td>
                  <td>{movement.reason}</td>
                  <td>{movement.reference}</td>
                  <td>
                    <button className="btn btn-sm btn-info">
                      View
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

  const renderSuppliers = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>🏢 Supplier Management</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {suppliersBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={suppliersBulk.selectedItems.length}
              onBulkDelete={() => suppliersBulk.handleBulkDelete('suppliers', 'http://localhost:5000/api/suppliers', fetchData)}
              onClearSelection={suppliersBulk.clearSelection}
            />
          )}
          {hasRole(['admin', 'manager']) && (
            <button className="btn btn-primary" onClick={() => {
              setEditingItem(null);
              resetForm();
              setShowModal(true);
            }}>
              ➕ Add Supplier
            </button>
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
                    checked={suppliersBulk.isAllSelected(suppliers)}
                    onChange={(e) => suppliersBulk.handleSelectAll(e, suppliers)}
                  />
                </th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(suppliers) ? suppliers.map(supplier => (
                <tr key={supplier._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={suppliersBulk.selectedItems.includes(supplier._id)}
                      onChange={(e) => suppliersBulk.handleSelectItem(e, supplier._id)}
                    />
                  </td>
                  <td>{supplier.companyName}</td>
                  <td>{supplier.contactPerson}</td>
                  <td>{supplier.contactInfo?.email}</td>
                  <td>{supplier.contactInfo?.phone}</td>
                  <td>{supplier.contactInfo?.address}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: '#28a745', color: 'white'
                    }}>
                      Active
                    </span>
                  </td>
                  <td>
                    {hasRole(['admin', 'manager']) && (
                      <>
                        <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-info">
                          Orders
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )) : <tr><td colSpan="7">No suppliers found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAlerts = () => (
    <div className="card">
      <h3>🚨 Inventory Alerts</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="card" style={{ margin: 0, borderLeft: '4px solid #dc3545' }}>
          <h4 style={{ color: '#dc3545', marginBottom: '15px' }}>⚠️ Low Stock Items</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {(alerts.lowStock || []).map(item => (
              <div key={item._id} style={{ 
                padding: '10px', marginBottom: '10px', backgroundColor: '#f8f9fa', 
                borderRadius: '4px', border: '1px solid #dee2e6'
              }}>
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>SKU: {item.sku}</div>
                <div style={{ fontSize: '0.9rem', color: '#dc3545' }}>Stock: {item.totalQuantity} (Reorder: {item.reorderPoint})</div>
              </div>
            )) || <p>No low stock items</p>}
          </div>
        </div>
        
        <div className="card" style={{ margin: 0, borderLeft: '4px solid #ffc107' }}>
          <h4 style={{ color: '#ffc107', marginBottom: '15px' }}>📅 Expiring Soon</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {(alerts.expiringSoon || []).map(item => (
              <div key={item._id} style={{ 
                padding: '10px', marginBottom: '10px', backgroundColor: '#f8f9fa', 
                borderRadius: '4px', border: '1px solid #dee2e6'
              }}>
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Batch: {item.batchNumber}</div>
                <div style={{ fontSize: '0.9rem', color: '#ffc107' }}>Expires: {new Date(item.expiryDate).toLocaleDateString()}</div>
              </div>
            )) || <p>No items expiring soon</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];
    
    return (
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          📊 Inventory Analytics Dashboard
        </h3>
        
        <div className="grid-stats" style={{ marginBottom: '30px' }}>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📦</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Products</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>{analytics.totalProducts || 0}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>💰</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Value</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  ${analytics.totalValue?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>⚠️</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Low Stock</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.lowStockProducts || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>✅</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>In Stock</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.inStockProducts || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4>📊 Category Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3498db" name="Products" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4>🏭 Warehouse Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.warehouseStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, productCount }) => `${_id}: ${productCount}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="productCount"
                >
                  {(analytics.warehouseStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Inventory Management System</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products
        </button>
        <button 
          className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('categories')}
        >
          🏷️ Categories
        </button>
        <button 
          className={`btn ${activeTab === 'warehouses' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('warehouses')}
        >
          🏭 Warehouses
        </button>
        <button 
          className={`btn ${activeTab === 'movements' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('movements')}
        >
          📊 Stock Movements
        </button>
        <button 
          className={`btn ${activeTab === 'suppliers' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('suppliers')}
        >
          🏢 Suppliers
        </button>
        <button 
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={`btn ${activeTab === 'alerts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('alerts')}
        >
          🚨 Alerts
        </button>
      </div>

      {activeTab === 'products' && renderProducts()}
      {activeTab === 'categories' && renderCategories()}
      {activeTab === 'warehouses' && renderWarehouses()}
      {activeTab === 'movements' && renderMovements()}
      {activeTab === 'suppliers' && renderSuppliers()}
      {activeTab === 'alerts' && renderAlerts()}
      {activeTab === 'analytics' && renderAnalytics()}
      
      {/* Product/Category/Warehouse Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={
        activeTab === 'products' ? (editingItem ? 'Edit Product' : 'Add Product') :
        activeTab === 'categories' ? 'Add Category' :
        activeTab === 'warehouses' ? 'Add Warehouse' :
        activeTab === 'suppliers' ? 'Add Supplier' : 'Form'
      }>
        <form onSubmit={handleSubmit}>
          {activeTab === 'products' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Product ID:</label>
                  <input type="text" value={formData.productId} 
                    onChange={(e) => setFormData({...formData, productId: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>SKU:</label>
                  <input type="text" value={formData.sku} 
                    onChange={(e) => setFormData({...formData, sku: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Product Name:</label>
                <input type="text" value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category:</label>
                  <select value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                    <option value="">Select Category</option>
                    {(categories || []).map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Barcode:</label>
                  <input type="text" value={formData.barcode} 
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})} />
                </div>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Reorder Point:</label>
                  <input type="number" value={formData.inventory.stockLevels.reorderPoint} 
                    onChange={(e) => setFormData({...formData, inventory: {...formData.inventory, stockLevels: {...formData.inventory.stockLevels, reorderPoint: parseInt(e.target.value)}}})} />
                </div>
                <div className="form-group">
                  <label>Max Stock:</label>
                  <input type="number" value={formData.inventory.stockLevels.maxStock} 
                    onChange={(e) => setFormData({...formData, inventory: {...formData.inventory, stockLevels: {...formData.inventory.stockLevels, maxStock: parseInt(e.target.value)}}})} />
                </div>
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
                <textarea value={formData.categoryDescription} 
                  onChange={(e) => setFormData({...formData, categoryDescription: e.target.value})} />
              </div>
            </>
          )}
          
          {activeTab === 'warehouses' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Warehouse Name:</label>
                  <input type="text" value={formData.warehouseName} 
                    onChange={(e) => setFormData({...formData, warehouseName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Warehouse Code:</label>
                  <input type="text" value={formData.warehouseCode} 
                    onChange={(e) => setFormData({...formData, warehouseCode: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Location:</label>
                <input type="text" value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Total Capacity:</label>
                <input type="number" value={formData.capacity.totalSpace} 
                  onChange={(e) => setFormData({...formData, capacity: {totalSpace: parseInt(e.target.value)}})} required />
              </div>
            </>
          )}
          
          {activeTab === 'suppliers' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name:</label>
                  <input type="text" value={formData.companyName} 
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Contact Person:</label>
                  <input type="text" value={formData.contactPerson} 
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input type="tel" value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  placeholder="Full address..." />
              </div>
            </>
          )}
          
          <button type="submit" className="btn btn-success">
            {editingItem ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>

      {/* Stock Movement Modal */}
      <Modal isOpen={showStockModal} onClose={() => setShowStockModal(false)} title="Record Stock Movement">
        <form onSubmit={handleStockMovement}>
          <div className="form-group">
            <label>Product:</label>
            <select value={formData.product} 
              onChange={(e) => setFormData({...formData, product: e.target.value})} required>
              <option value="">Select Product</option>
              {(products || []).map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} - {product.sku}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Warehouse:</label>
              <select value={formData.warehouse} 
                onChange={(e) => setFormData({...formData, warehouse: e.target.value})} required>
                <option value="">Select Warehouse</option>
                {(warehouses || []).map(warehouse => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Movement Type:</label>
              <select value={formData.movementType} 
                onChange={(e) => setFormData({...formData, movementType: e.target.value})}>
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
                <option value="transfer">Transfer</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input type="number" value={formData.quantity} 
              onChange={(e) => setFormData({...formData, quantity: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Reason:</label>
            <input type="text" value={formData.reason} 
              onChange={(e) => setFormData({...formData, reason: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Reference:</label>
            <input type="text" value={formData.reference} 
              onChange={(e) => setFormData({...formData, reference: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-success">
            Record Movement
          </button>
        </form>
      </Modal>
      
      <CSVUpload
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onUpload={handleCSVUpload}
        templateData={getCSVTemplate()}
        title={`Import ${csvUploadType.charAt(0).toUpperCase() + csvUploadType.slice(1)}`}
        description={`Upload a CSV file to bulk import ${csvUploadType}. Download the template to see the required format.`}
      />
    </div>
  );
};

export default InventoryManagement;