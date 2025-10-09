import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesManagement = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [formData, setFormData] = useState({
    contact: { firstName: '', lastName: '', email: '', phone: '', company: '' },
    source: 'website', priority: 'medium', opportunity: { value: '', expectedCloseDate: '' },
    customer: '', items: [{ product: '', quantity: '', unitPrice: '', taxRate: '' }],
    deliveryDate: '', taxRate: '', notes: '', salesOrder: '', dueDate: '', paymentTerms: '',
    saleId: '', totalAmount: ''
  });

  useEffect(() => {
    setPagination({ currentPage: 1, totalPages: 1, total: 0 });
    fetchData();
  }, [activeTab]);
  
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    setTimeout(fetchData, 0);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const page = pagination.currentPage;
      
      switch (activeTab) {
        case 'leads':
          const leadsRes = await axios.get(`http://localhost:5000/api/sales/leads?page=${page}&limit=10`, { headers });
          setLeads(leadsRes.data.leads || leadsRes.data);
          setPagination({ currentPage: leadsRes.data.currentPage || 1, totalPages: leadsRes.data.totalPages || 1, total: leadsRes.data.total || 0 });
          break;
        case 'quotes':
          const quotesRes = await axios.get(`http://localhost:5000/api/sales/quotes?page=${page}&limit=10`, { headers });
          setQuotes(quotesRes.data.quotes || quotesRes.data);
          setPagination({ currentPage: quotesRes.data.currentPage || 1, totalPages: quotesRes.data.totalPages || 1, total: quotesRes.data.total || 0 });
          break;
        case 'orders':
          const ordersRes = await axios.get(`http://localhost:5000/api/sales/orders?page=${page}&limit=10`, { headers });
          setOrders(ordersRes.data.orders || ordersRes.data);
          setPagination({ currentPage: ordersRes.data.currentPage || 1, totalPages: ordersRes.data.totalPages || 1, total: ordersRes.data.total || 0 });
          break;
        case 'invoices':
          const invoicesRes = await axios.get(`http://localhost:5000/api/sales/invoices?page=${page}&limit=10`, { headers });
          setInvoices(invoicesRes.data.invoices || invoicesRes.data);
          setPagination({ currentPage: invoicesRes.data.currentPage || 1, totalPages: invoicesRes.data.totalPages || 1, total: invoicesRes.data.total || 0 });
          break;
        case 'sales':
          const salesRes = await axios.get(`http://localhost:5000/api/sales?page=${page}&limit=10`, { headers });
          setSales(salesRes.data.sales || salesRes.data);
          setPagination({ currentPage: salesRes.data.currentPage || 1, totalPages: salesRes.data.totalPages || 1, total: salesRes.data.total || 0 });
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
          break;
        case 'orders':
          endpoint = 'http://localhost:5000/api/sales/orders';
          const orderSubtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)), 0);
          data = {
            customer: formData.customer,
            deliveryDate: formData.deliveryDate,
            items: formData.items.filter(item => item.product && item.quantity && item.unitPrice).map(item => ({
              product: item.product,
              quantity: parseFloat(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              total: parseFloat(item.quantity) * parseFloat(item.unitPrice)
            })),
            subtotal: orderSubtotal,
            taxRate: parseFloat(formData.taxRate || 0),
            taxAmount: orderSubtotal * (parseFloat(formData.taxRate || 0) / 100),
            totalAmount: orderSubtotal + (orderSubtotal * (parseFloat(formData.taxRate || 0) / 100)),
            notes: formData.notes
          };
          break;
        case 'invoices':
          endpoint = 'http://localhost:5000/api/sales/invoices';
          const invoiceSubtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)), 0);
          const totalTax = formData.items.reduce((sum, item) => sum + ((parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)) * (parseFloat(item.taxRate || 0) / 100)), 0);
          data = {
            customer: formData.customer,
            salesOrder: formData.salesOrder,
            dueDate: formData.dueDate,
            items: formData.items.filter(item => item.product && item.quantity && item.unitPrice).map(item => ({
              product: item.product,
              description: products.find(p => p._id === item.product)?.name || '',
              quantity: parseFloat(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              taxRate: parseFloat(item.taxRate || 0),
              taxAmount: (parseFloat(item.quantity) * parseFloat(item.unitPrice)) * (parseFloat(item.taxRate || 0) / 100),
              total: (parseFloat(item.quantity) * parseFloat(item.unitPrice)) + ((parseFloat(item.quantity) * parseFloat(item.unitPrice)) * (parseFloat(item.taxRate || 0) / 100))
            })),
            subtotal: invoiceSubtotal,
            totalTax: totalTax,
            totalAmount: invoiceSubtotal + totalTax,
            paymentTerms: formData.paymentTerms,
            notes: formData.notes
          };
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
      customer: '', items: [{ product: '', quantity: '', unitPrice: '', taxRate: '' }],
      deliveryDate: '', taxRate: '', notes: '', salesOrder: '', dueDate: '', paymentTerms: '',
      saleId: '', totalAmount: ''
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: '', unitPrice: '', taxRate: '' }]
    });
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
                <th>Status</th>
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
                  <td>{lead.source}</td>
                  <td>${lead.opportunity?.value?.toLocaleString() || '0'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: getStatusColor(lead.status), color: 'white'
                    }}>
                      {lead.status}
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
      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );

  const renderQuotes = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Quote Management</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Quote
        </button>
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Customer</th>
                <th>Issue Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => (
                <tr key={quote._id}>
                  <td>{quote.quoteNumber}</td>
                  <td>{quote.customer?.companyName}</td>
                  <td>{new Date(quote.issueDate).toLocaleDateString()}</td>
                  <td>${quote.pricing?.totalAmount?.toLocaleString() || '0'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: getStatusColor(quote.status), color: 'white'
                    }}>
                      {quote.status}
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
      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
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
                <th>Order #</th>
                <th>Customer</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customer?.companyName}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>${order.totalAmount?.toLocaleString() || '0'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: getStatusColor(order.status), color: 'white'
                    }}>
                      {order.status}
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
      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );

  const renderInvoices = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Tax Invoices</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Invoice
        </button>
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Invoice Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice._id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.customer?.companyName}</td>
                  <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                  <td>${invoice.totalAmount?.toLocaleString() || '0'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: getStatusColor(invoice.status), color: 'white'
                    }}>
                      {invoice.status}
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
      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );

  const renderAnalytics = () => {
    const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];
    
    const leadStatusData = analytics.leadStats?.map(stat => ({
      name: stat._id,
      count: stat.count,
      value: stat.totalValue || 0
    })) || [];
    
    const salesData = analytics.salesStats?.map(stat => ({
      name: stat._id,
      count: stat.count,
      revenue: stat.totalRevenue || 0
    })) || [];
    
    return (
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          📊 Sales Analytics Dashboard
        </h3>
        
        <div className="grid-stats" style={{ marginBottom: '30px' }}>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>🎯</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Leads</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.totalLeads || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>💰</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Revenue</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  ${(analytics.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📄</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Active Quotes</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.activeQuotes || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📋</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Pending Orders</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.pendingOrders || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📊 Lead Status Distribution
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
              💹 Sales Performance
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [name === 'revenue' ? `$${value.toLocaleString()}` : value, name]} />
                <Legend />
                <Bar dataKey="count" fill="#3498db" name="Count" />
                <Bar dataKey="revenue" fill="#2ecc71" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📈 Sales Pipeline
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Pipeline Value']} />
                <Legend />
                <Bar dataKey="value" fill="#e74c3c" name="Pipeline Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📅 Monthly Trends
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} name="Revenue" />
                <Line type="monotone" dataKey="leads" stroke="#82ca9d" strokeWidth={3} name="Leads" />
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
        >
          🎯 Leads
        </button>
        <button 
          className={`btn ${activeTab === 'quotes' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('quotes')}
        >
          📄 Quotes
        </button>
        <button 
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Orders
        </button>
        <button 
          className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('invoices')}
        >
          🧾 Invoices
        </button>
        {hasRole(['admin', 'manager']) && (
          <button 
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
        )}
      </div>

      {activeTab === 'leads' && renderLeads()}
      {activeTab === 'quotes' && renderQuotes()}
      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'invoices' && renderInvoices()}
      {activeTab === 'analytics' && renderAnalytics()}
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={
        activeTab === 'leads' ? 'Add Lead' :
        activeTab === 'quotes' ? 'Create Quote' :
        activeTab === 'orders' ? 'Create Sales Order' :
        activeTab === 'invoices' ? 'Create Tax Invoice' : 'Form'
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
              <div className="form-group">
                <label>Email:</label>
                <input type="email" value={formData.contact.email} 
                  onChange={(e) => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})} required />
              </div>
              <div className="form-group">
                <label>Company:</label>
                <input type="text" value={formData.contact.company} 
                  onChange={(e) => setFormData({...formData, contact: {...formData.contact, company: e.target.value}})} />
              </div>
            </>
          )}
          
          {(activeTab === 'quotes' || activeTab === 'orders' || activeTab === 'invoices') && (
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
              <button type="button" className="btn btn-secondary" onClick={addItem}>
                Add Item
              </button>
            </>
          )}
          
          <button type="submit" className="btn btn-success">
            {activeTab === 'leads' ? 'Add Lead' :
             activeTab === 'quotes' ? 'Create Quote' :
             activeTab === 'orders' ? 'Create Sales Order' :
             activeTab === 'invoices' ? 'Create Tax Invoice' : 'Submit'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SalesManagement;