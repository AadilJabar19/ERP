import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import Modal from '../components/Modal';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CRM = () => {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [activeTab, setActiveTab] = useState('customers');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '', contactPerson: '', email: '', phone: '',
    category: 'retail', creditLimit: '', paymentTerms: 'net30',
    addresses: [{ type: 'billing', street: '', city: '', state: '', zipCode: '', country: '', isDefault: true }]
  });

  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomers();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, currentPage, searchTerm, filterStatus]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus })
      });
      
      const response = await axios.get(`http://localhost:5000/api/customers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCustomers(response.data.customers);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/customers/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/customers', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        companyName: '', contactPerson: '', email: '', phone: '',
        category: 'retail', creditLimit: '', paymentTerms: 'net30',
        addresses: [{ type: 'billing', street: '', city: '', state: '', zipCode: '', country: '', isDefault: true }]
      });
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = { active: '#28a745', inactive: '#6c757d', blocked: '#dc3545' };
    return colors[status] || '#6c757d';
  };

  const getCategoryColor = (category) => {
    const colors = { retail: '#17a2b8', wholesale: '#28a745', distributor: '#ffc107', enterprise: '#6f42c1' };
    return colors[category] || '#6c757d';
  };

  const renderCustomers = () => (
    <div>
      {hasRole(['admin', 'manager']) && (
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginBottom: '20px' }}>
          Add Customer
        </button>
      )}

      <SearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterOptions={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'blocked', label: 'Blocked' }
        ]}
        selectedFilter={filterStatus}
        setSelectedFilter={setFilterStatus}
      />

      <div className="card">
        <h3>Customer Database</h3>
        {loading ? <LoadingSpinner /> : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer Code</th>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Category</th>
                    <th>Credit Limit</th>
                    <th>Payment Terms</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer._id}>
                      <td>{customer.customerCode}</td>
                      <td>{customer.companyName}</td>
                      <td>{customer.contactPerson}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                          backgroundColor: getCategoryColor(customer.category), color: 'white'
                        }}>
                          {customer.category}
                        </span>
                      </td>
                      <td>${customer.creditLimit?.toLocaleString() || '0'}</td>
                      <td>{customer.paymentTerms}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                          backgroundColor: getStatusColor(customer.status), color: 'white'
                        }}>
                          {customer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
    </div>
  );
  
  const renderAnalytics = () => {
    const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];
    
    const categoryData = analytics.categoryStats?.map(cat => ({
      name: cat._id,
      count: cat.count,
      totalCredit: cat.totalCreditLimit || 0
    })) || [];
    
    const statusData = analytics.statusStats?.map(status => ({
      name: status._id,
      count: status.count
    })) || [];
    
    return (
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          📊 CRM Analytics Dashboard
        </h3>
        
        <div className="grid-stats" style={{ marginBottom: '30px' }}>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>🏢</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Customers</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>{analytics.totalCustomers || 0}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>✅</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Active Customers</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.statusStats?.find(s => s._id === 'active')?.count || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>💳</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Credit Limit</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>${(analytics.totalCreditLimit || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📈</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Avg Credit Limit</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>${(analytics.avgCreditLimit || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📊 Customer Categories
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3498db" name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              🥧 Customer Status Distribution
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
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
      <h1 className="page-title">Customer Relationship Management</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('customers')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🏢 Customers
        </button>
        {hasRole(['admin', 'manager']) && (
          <button 
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('analytics')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            📊 Analytics
          </button>
        )}
      </div>

      {activeTab === 'customers' && renderCustomers()}
      {activeTab === 'analytics' && renderAnalytics()}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Customer">
        <form onSubmit={handleSubmit}>
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
                onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category:</label>
              <select value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="distributor">Distributor</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="form-group">
              <label>Credit Limit:</label>
              <input type="number" value={formData.creditLimit} 
                onChange={(e) => setFormData({...formData, creditLimit: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Payment Terms:</label>
            <select value={formData.paymentTerms} 
              onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}>
              <option value="net15">Net 15</option>
              <option value="net30">Net 30</option>
              <option value="net45">Net 45</option>
              <option value="net60">Net 60</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success">Create Customer</button>
        </form>
      </Modal>
    </div>
  );
};

export default CRM;