import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import Modal from '../components/Modal';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesManagement = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    // Lead form
    contact: { firstName: '', lastName: '', email: '', phone: '', company: '' },
    source: 'website', priority: 'medium', opportunity: { value: '', expectedCloseDate: '' },
    // Quote form
    customer: '', items: [{ product: '', quantity: '', unitPrice: '' }],
    // Sale form
    saleId: '', customer: { name: '', email: '', phone: '' }, items: [{ product: '', quantity: '', price: '' }], totalAmount: ''
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
        case 'leads':
          const leadsRes = await axios.get('http://localhost:5000/api/sales/leads', { headers });
          setLeads(leadsRes.data);
          break;
        case 'quotes':
          const quotesRes = await axios.get('http://localhost:5000/api/sales/quotes', { headers });
          setQuotes(quotesRes.data);
          break;
        case 'orders':
          const salesRes = await axios.get('http://localhost:5000/api/sales', { headers });
          setSales(salesRes.data.sales || salesRes.data);
          break;
        case 'pipeline':
          const pipelineRes = await axios.get('http://localhost:5000/api/sales/pipeline', { headers });
          setPipeline(pipelineRes.data);
          break;
        case 'analytics':
          const analyticsRes = await axios.get('http://localhost:5000/api/sales/analytics', { headers });
          setAnalytics(analyticsRes.data);
          break;
      }
      
      // Always fetch customers and products for forms
      if (customers.length === 0) {
        const custRes = await axios.get('http://localhost:5000/api/customers', { headers });
        setCustomers(custRes.data.customers || custRes.data);
      }
      if (products.length === 0) {
        const prodRes = await axios.get('http://localhost:5000/api/inventory/products', { headers });
        setProducts(prodRes.data.products || prodRes.data);
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
      let data = {};
      
      switch (activeTab) {
        case 'leads':
          endpoint = 'http://localhost:5000/api/sales/leads';
          data = {
            contact: formData.contact,
            source: formData.source,
            priority: formData.priority,
            opportunity: {
              value: parseFloat(formData.opportunity.value) || 0,
              expectedCloseDate: formData.opportunity.expectedCloseDate
            }
          };
          console.log('Sending lead data:', data);
          break;
        case 'quotes':
          endpoint = 'http://localhost:5000/api/sales/quotes';
          const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)), 0);
          data = {
            customer: formData.customer,
            items: formData.items.filter(item => item.product && item.quantity && item.unitPrice).map(item => ({
              product: item.product,
              description: products.find(p => p._id === item.product)?.name || '',
              quantity: parseFloat(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              total: parseFloat(item.quantity) * parseFloat(item.unitPrice)
            })),
            pricing: {
              subtotal: subtotal,
              totalAmount: subtotal
            }
          };
          console.log('Sending quote data:', data);
          break;
        case 'orders':
          endpoint = 'http://localhost:5000/api/sales';
          data = formData;
          break;
      }
      
      await axios.post(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to submit'));
    }
  };

  const resetForm = () => {
    setFormData({
      contact: { firstName: '', lastName: '', email: '', phone: '', company: '' },
      source: 'website', priority: 'medium', opportunity: { value: '', expectedCloseDate: '' },
      customer: '', items: [{ product: '', quantity: '', unitPrice: '' }],
      saleId: '', customer: { name: '', email: '', phone: '' }, items: [{ product: '', quantity: '', price: '' }], totalAmount: ''
    });
  };

  const addItem = () => {
    if (activeTab === 'quotes') {
      setFormData({
        ...formData,
        items: [...formData.items, { product: '', quantity: '', unitPrice: '' }]
      });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, { product: '', quantity: '', price: '' }]
      });
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const getStatusColor = (status) => {
    const colors = {
      new: '#17a2b8', contacted: '#6c757d', qualified: '#ffc107',
      proposal: '#fd7e14', negotiation: '#e83e8c', won: '#28a745', lost: '#dc3545',
      draft: '#6c757d', sent: '#17a2b8', accepted: '#28a745', rejected: '#dc3545',
      pending: '#ffc107', completed: '#28a745', cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const renderLeads = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Lead Management</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Lead
        </button>
      </div>
      
      <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Lead #</th>
                <th>Contact</th>
                <th>Company</th>
                <th>Source</th>
                <th>Value</th>
                <th>Probability</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.filter(lead => 
                lead.contact?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.contact?.company?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(lead => (
                <tr key={lead._id}>
                  <td>{lead.leadNumber}</td>
                  <td>{lead.contact?.firstName} {lead.contact?.lastName}</td>
                  <td>{lead.contact?.company}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: '#6f42c1', color: 'white'
                    }}>
                      {lead.source}
                    </span>
                  </td>
                  <td>${lead.opportunity?.value?.toLocaleString() || '0'}</td>
                  <td>{lead.opportunity?.probability || 0}%</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: getStatusColor(lead.status), color: 'white'
                    }}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.assignedTo?.personalInfo?.firstName} {lead.assignedTo?.personalInfo?.lastName}</td>
                  <td>
                    <button className="btn btn-sm btn-primary">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderQuotes = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Quote Management</h3>
        {hasRole(['admin', 'manager']) && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Create Quote
          </button>
        )}
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Customer</th>
                <th>Issue Date</th>
                <th>Valid Until</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Sales Rep</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => (
                <tr key={quote._id}>
                  <td>{quote.quoteNumber}</td>
                  <td>{quote.customer?.companyName}</td>
                  <td>{new Date(quote.issueDate).toLocaleDateString()}</td>
                  <td>{new Date(quote.validUntil).toLocaleDateString()}</td>
                  <td>${quote.pricing?.totalAmount?.toLocaleString() || '0'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: getStatusColor(quote.status), color: 'white'
                    }}>
                      {quote.status}
                    </span>
                  </td>
                  <td>{quote.salesRep?.personalInfo?.firstName} {quote.salesRep?.personalInfo?.lastName}</td>
                  <td>
                    <button className="btn btn-sm btn-primary">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Sales Orders</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Order
        </button>
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale._id}>
                  <td>{sale.saleId}</td>
                  <td>{sale.customer?.name || sale.customer?.companyName}</td>
                  <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                  <td>{sale.items?.length || 0}</td>
                  <td>${sale.totalAmount?.toLocaleString() || '0'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: getStatusColor(sale.status), color: 'white'
                    }}>
                      {sale.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderPipeline = () => {
    const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];
    
    return (
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          📈 Sales Pipeline
        </h3>
        
        <div className="grid-stats" style={{ marginBottom: '30px' }}>
          {pipeline.map((stage, index) => (
            <div key={stage._id} className="card" style={{ 
              margin: 0, 
              background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}22, ${COLORS[index % COLORS.length]}44)`,
              border: `2px solid ${COLORS[index % COLORS.length]}`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '2rem', opacity: 0.3 }}>
                {index === 0 ? '🎯' : index === 1 ? '📞' : index === 2 ? '📄' : index === 3 ? '🤝' : '🎆'}
              </div>
              <h4 style={{ color: COLORS[index % COLORS.length], margin: '0 0 10px 0' }}>{stage._id}</h4>
              <p style={{ fontSize: '2rem', color: COLORS[index % COLORS.length], margin: '5px 0' }}>{stage.count}</p>
              <small style={{ color: '#666' }}>${(stage.totalValue || 0).toLocaleString()}</small>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📊 Pipeline Funnel
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3498db" name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              💰 Pipeline Value
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pipeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Value']} />
                <Legend />
                <Line type="monotone" dataKey="totalValue" stroke="#e74c3c" strokeWidth={3} name="Total Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];
    
    const leadStatusData = analytics.leadsByStatus?.map(status => ({
      name: status._id,
      count: status.count
    })) || [];
    
    const quoteStatusData = analytics.quotesByStatus?.map(status => ({
      name: status._id,
      count: status.count
    })) || [];
    
    const monthlyData = analytics.monthlySales?.map(month => ({
      month: month._id,
      sales: month.totalSales || 0,
      revenue: month.totalRevenue || 0
    })) || [];
    
    return (
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          📊 Sales Analytics Dashboard
        </h3>
        
        <div className="grid-stats" style={{ marginBottom: '30px' }}>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>💰</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Sales</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>{analytics.totalSales || 0}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>💵</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Revenue</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>${(analytics.totalRevenue || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>🎯</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Active Leads</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.leadsByStatus?.reduce((sum, status) => sum + status.count, 0) || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📄</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Pending Quotes</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.quotesByStatus?.find(s => s._id === 'sent')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              🎯 Lead Status Distribution
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {leadStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📄 Quote Status Distribution
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quoteStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2ecc71" name="Quotes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📈 Monthly Sales Trend
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#3498db" strokeWidth={3} name="Sales Count" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              💰 Monthly Revenue Trend
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#e74c3c" strokeWidth={3} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Sales Management System</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'leads' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('leads')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🎯 Leads
        </button>
        <button 
          className={`btn ${activeTab === 'quotes' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('quotes')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          📄 Quotes
        </button>
        <button 
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('orders')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          💰 Orders
        </button>
        <button 
          className={`btn ${activeTab === 'pipeline' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pipeline')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          📈 Pipeline
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

      {activeTab === 'leads' && renderLeads()}
      {activeTab === 'quotes' && renderQuotes()}
      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'pipeline' && renderPipeline()}
      {activeTab === 'analytics' && renderAnalytics()}
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={
        activeTab === 'leads' ? 'Add Lead' :
        activeTab === 'quotes' ? 'Create Quote' :
        activeTab === 'orders' ? 'Create Order' : 'Form'
      }>
        <form onSubmit={handleSubmit}>
          {activeTab === 'leads' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name:</label>
                  <input type="text" value={formData.contact.firstName} 
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, firstName: e.target.value}})} required />
                </div>
                <div className="form-group">
                  <label>Last Name:</label>
                  <input type="text" value={formData.contact.lastName} 
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, lastName: e.target.value}})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" value={formData.contact.email} 
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})} required />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input type="tel" value={formData.contact.phone} 
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})} />
                </div>
              </div>
              <div className="form-group">
                <label>Company:</label>
                <input type="text" value={formData.contact.company} 
                  onChange={(e) => setFormData({...formData, contact: {...formData.contact, company: e.target.value}})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Source:</label>
                  <select value={formData.source} 
                    onChange={(e) => setFormData({...formData, source: e.target.value})}>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="cold-call">Cold Call</option>
                    <option value="email">Email</option>
                    <option value="social-media">Social Media</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority:</label>
                  <select value={formData.priority} 
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Opportunity Value:</label>
                  <input type="number" value={formData.opportunity.value} 
                    onChange={(e) => setFormData({...formData, opportunity: {...formData.opportunity, value: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Expected Close Date:</label>
                  <input type="date" value={formData.opportunity.expectedCloseDate} 
                    onChange={(e) => setFormData({...formData, opportunity: {...formData.opportunity, expectedCloseDate: e.target.value}})} />
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'quotes' && (
            <>
              <div className="form-group">
                <label>Customer:</label>
                <select value={formData.customer} 
                  onChange={(e) => setFormData({...formData, customer: e.target.value})} required>
                  <option value="">Select Customer</option>
                  {customers.map(cust => (
                    <option key={cust._id} value={cust._id}>{cust.companyName}</option>
                  ))}
                </select>
              </div>
              <h4>Items</h4>
              {formData.items.map((item, index) => (
                <div key={index} className="form-row" style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
                  <div className="form-group">
                    <label>Product:</label>
                    <select value={item.product} 
                      onChange={(e) => updateItem(index, 'product', e.target.value)} required>
                      <option value="">Select Product</option>
                      {products.map(prod => (
                        <option key={prod._id} value={prod._id}>{prod.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity:</label>
                    <input type="number" value={item.quantity} 
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Unit Price:</label>
                    <input type="number" step="0.01" value={item.unitPrice} 
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)} required />
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addItem} style={{ marginBottom: '10px' }}>
                Add Item
              </button>
            </>
          )}
          
          {activeTab === 'orders' && (
            <>
              <div className="form-group">
                <label>Sale ID:</label>
                <input type="text" value={formData.saleId} 
                  onChange={(e) => setFormData({...formData, saleId: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name:</label>
                  <input type="text" value={formData.customer.name} 
                    onChange={(e) => setFormData({...formData, customer: {...formData.customer, name: e.target.value}})} required />
                </div>
                <div className="form-group">
                  <label>Customer Email:</label>
                  <input type="email" value={formData.customer.email} 
                    onChange={(e) => setFormData({...formData, customer: {...formData.customer, email: e.target.value}})} />
                </div>
              </div>
              <div className="form-group">
                <label>Total Amount:</label>
                <input type="number" step="0.01" value={formData.totalAmount} 
                  onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} required />
              </div>
            </>
          )}
          
          <button type="submit" className="btn btn-success">
            {activeTab === 'leads' ? 'Add Lead' :
             activeTab === 'quotes' ? 'Create Quote' :
             activeTab === 'orders' ? 'Create Order' : 'Submit'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SalesManagement;