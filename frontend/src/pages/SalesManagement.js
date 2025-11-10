import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import Modal from '../components/Modal';
import BulkActions from '../components/BulkActions';
import CSVUpload from '../components/CSVUpload';
import ExportMenu from '../components/ExportMenu';
import { Button } from '../components/ui';
import useBulkActions from '../hooks/useBulkActions';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/pages/SalesManagement.scss';
import { useLanguage } from '../context/LanguageContext';

const SalesManagement = () => {
  const { hasRole } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('leads');
  
  // Bulk actions hooks
  const leadsBulk = useBulkActions();
  const quotesBulk = useBulkActions();
  const ordersBulk = useBulkActions();
  const invoicesBulk = useBulkActions();
  const customersBulk = useBulkActions();
  const [leads, setLeads] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [pipeline, setPipeline] = useState([]);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvUploadType, setCSVUploadType] = useState('leads');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    // Lead form
    leadNumber: '', companyName: '', contactPerson: '', email: '', phone: '',
    source: 'website', status: 'new', priority: 'medium',
    opportunity: { value: 0, probability: 50, expectedCloseDate: '' },
    // Quote form
    quoteNumber: '', customer: '', validUntil: '', terms: '',
    items: [{ product: '', quantity: 1, unitPrice: 0, discount: 0 }],
    // Order form
    orderNumber: '', deliveryDate: '', shippingAddress: '',
    // Invoice form
    invoiceNumber: '', dueDate: '', paymentTerms: 'net-30',
    // Customer form
    customerCode: '', companyName: '', contactPerson: '', email: '', phone: '',
    address: '', city: '', country: '', taxId: ''
  });

  useEffect(() => {
    fetchData();
    fetchCustomers();
    fetchProducts();
  }, [activeTab]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
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
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      switch (activeTab) {
        case 'leads':
          const leadsRes = await axios.get('http://localhost:5000/api/sales/leads', { headers });
          setLeads(leadsRes.data.leads || []);
          break;
        case 'quotes':
          const quotesRes = await axios.get('http://localhost:5000/api/sales/quotes', { headers });
          setQuotes(quotesRes.data.quotes || []);
          break;
        case 'orders':
          const ordersRes = await axios.get('http://localhost:5000/api/sales/orders', { headers });
          setOrders(ordersRes.data.orders || []);
          break;
        case 'invoices':
          const invoicesRes = await axios.get('http://localhost:5000/api/sales/invoices', { headers });
          setInvoices(invoicesRes.data.invoices || []);
          break;
        case 'analytics':
          const analyticsRes = await axios.get('http://localhost:5000/api/sales/analytics', { headers });
          setAnalytics(analyticsRes.data);
          break;
        case 'pipeline':
          const pipelineRes = await axios.get('http://localhost:5000/api/sales/pipeline', { headers });
          setPipeline(pipelineRes.data || []);
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
        case 'leads':
          if (editingItem) {
            endpoint = `http://localhost:5000/api/sales/leads/${editingItem._id}`;
            method = 'put';
          } else {
            endpoint = 'http://localhost:5000/api/sales/leads';
          }
          data = {
            companyName: formData.companyName,
            contactPerson: formData.contactPerson,
            contactInfo: {
              email: formData.email,
              phone: formData.phone
            },
            source: formData.source,
            status: formData.status,
            priority: formData.priority,
            opportunity: {
              value: parseFloat(formData.opportunity.value),
              probability: parseInt(formData.opportunity.probability),
              expectedCloseDate: formData.opportunity.expectedCloseDate
            }
          };
          break;
        case 'quotes':
          endpoint = 'http://localhost:5000/api/sales/quotes';
          data = {
            customer: formData.customer,
            validUntil: formData.validUntil,
            terms: formData.terms,
            items: formData.items.map(item => ({
              product: item.product,
              quantity: parseInt(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              discount: parseFloat(item.discount) || 0
            }))
          };
          break;
        case 'orders':
          endpoint = 'http://localhost:5000/api/sales/orders';
          data = {
            customer: formData.customer,
            deliveryDate: formData.deliveryDate,
            shippingAddress: formData.shippingAddress,
            items: formData.items.map(item => ({
              product: item.product,
              quantity: parseInt(item.quantity),
              unitPrice: parseFloat(item.unitPrice)
            }))
          };
          break;
        case 'invoices':
          endpoint = 'http://localhost:5000/api/sales/invoices';
          data = {
            customer: formData.customer,
            dueDate: formData.dueDate,
            paymentTerms: formData.paymentTerms,
            items: formData.items.map(item => ({
              product: item.product,
              quantity: parseInt(item.quantity),
              unitPrice: parseFloat(item.unitPrice)
            }))
          };
          break;
        case 'customers':
          endpoint = 'http://localhost:5000/api/customers';
          data = {
            companyName: formData.companyName,
            contactPerson: formData.contactPerson,
            contactInfo: {
              email: formData.email,
              phone: formData.phone
            },
            address: {
              street: formData.address,
              city: formData.city,
              country: formData.country
            },
            taxId: formData.taxId
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

  const resetForm = () => {
    setFormData({
      leadNumber: '', companyName: '', contactPerson: '', email: '', phone: '',
      source: 'website', status: 'new', priority: 'medium',
      opportunity: { value: 0, probability: 50, expectedCloseDate: '' },
      quoteNumber: '', customer: '', validUntil: '', terms: '',
      items: [{ product: '', quantity: 1, unitPrice: 0, discount: 0 }],
      orderNumber: '', deliveryDate: '', shippingAddress: '',
      invoiceNumber: '', dueDate: '', paymentTerms: 'net-30',
      customerCode: '', companyName: '', contactPerson: '', email: '', phone: '',
      address: '', city: '', country: '', taxId: ''
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, unitPrice: 0, discount: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const discount = subtotal * (item.discount / 100);
      return total + (subtotal - discount);
    }, 0);
  };

  const handleCSVUpload = async (csvData) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch (csvUploadType) {
        case 'leads':
          endpoint = 'http://localhost:5000/api/sales/leads/bulk';
          break;
        case 'customers':
          endpoint = 'http://localhost:5000/api/customers/bulk';
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
      case 'leads':
        return [{
          companyName: 'ABC Company',
          contactPerson: 'John Smith',
          email: 'john@abccompany.com',
          phone: '+1234567890',
          source: 'website',
          priority: 'medium',
          opportunityValue: '50000',
          probability: '75'
        }];
      case 'customers':
        return [{
          companyName: 'XYZ Corp',
          contactPerson: 'Jane Doe',
          email: 'jane@xyzcorp.com',
          phone: '+1234567890',
          address: '123 Business St',
          city: 'New York',
          country: 'USA',
          taxId: 'TAX123456'
        }];
      default:
        return [];
    }
  };

  const renderLeads = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>🎯 Lead {t('management')}</h3>
        <Button variant="primary" icon="➕" onClick={() => {
          setEditingItem(null);
          resetForm();
          setShowModal(true);
        }}>
          Add Lead
        </Button>
      </div>
      
      <div className="module-filters">
        <div className="filter-row">
          <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search leads..." />
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed-won">Closed Won</option>
            <option value="closed-lost">Closed Lost</option>
          </select>
        </div>
        
        <div className="action-row">
          {leadsBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={leadsBulk.selectedItems.length}
              onBulkDelete={() => leadsBulk.handleBulkDelete('leads', 'http://localhost:5000/api/sales/leads', fetchData)}
              onClearSelection={leadsBulk.clearSelection}
            />
          )}
          <ExportMenu 
            data={leads.filter(lead => 
              lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              lead.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            filename="leads"
            selectedItems={leadsBulk.selectedItems}
            allData={leads}
          />
          <Button 
            variant="info" 
            icon="📤" 
            onClick={() => {
              setCSVUploadType('leads');
              setShowCSVModal(true);
            }}
          >
            Import CSV
          </Button>
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
                    checked={leadsBulk.isAllSelected(leads)}
                    onChange={(e) => leadsBulk.handleSelectAll(e, leads)}
                  />
                </th>
                <th>Lead #</th>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Source</th>
                <th>Value</th>
                <th>Probability</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.filter(lead => 
                lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(lead => (
                <tr key={lead._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={leadsBulk.selectedItems.includes(lead._id)}
                      onChange={(e) => leadsBulk.handleSelectItem(e, lead._id)}
                    />
                  </td>
                  <td>{lead.leadNumber}</td>
                  <td>{lead.companyName}</td>
                  <td>{lead.contactPerson}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: '#17a2b8', color: 'white'
                    }}>
                      {lead.source}
                    </span>
                  </td>
                  <td>${lead.opportunity?.value?.toLocaleString()}</td>
                  <td>{lead.opportunity?.probability}%</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: 
                        lead.status === 'closed-won' ? '#28a745' :
                        lead.status === 'closed-lost' ? '#dc3545' :
                        lead.status === 'qualified' ? '#17a2b8' : '#ffc107',
                      color: 'white'
                    }}>
                      {lead.status}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: 
                        lead.priority === 'high' ? '#dc3545' :
                        lead.priority === 'medium' ? '#ffc107' : '#28a745',
                      color: 'white'
                    }}>
                      {lead.priority}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-success">
                      Convert
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

  const renderQuotes = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>📋 Quote {t('management')}</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {quotesBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={quotesBulk.selectedItems.length}
              onBulkDelete={() => quotesBulk.handleBulkDelete('quotes', 'http://localhost:5000/api/sales/quotes', fetchData)}
              onClearSelection={quotesBulk.clearSelection}
            />
          )}
          <button className="btn btn-primary" onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}>
            ➕ Create Quote
          </button>
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
                    checked={quotesBulk.isAllSelected(quotes)}
                    onChange={(e) => quotesBulk.handleSelectAll(e, quotes)}
                  />
                </th>
                <th>Quote #</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => (
                <tr key={quote._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={quotesBulk.selectedItems.includes(quote._id)}
                      onChange={(e) => quotesBulk.handleSelectItem(e, quote._id)}
                    />
                  </td>
                  <td>{quote.quoteNumber}</td>
                  <td>{quote.customer?.companyName}</td>
                  <td>${quote.totalAmount?.toLocaleString()}</td>
                  <td>{new Date(quote.validUntil).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: 
                        quote.status === 'accepted' ? '#28a745' :
                        quote.status === 'rejected' ? '#dc3545' :
                        quote.status === 'sent' ? '#17a2b8' : '#ffc107',
                      color: 'white'
                    }}>
                      {quote.status}
                    </span>
                  </td>
                  <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                      View
                    </button>
                    <button className="btn btn-sm btn-success">
                      Convert to Order
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

  const renderOrders = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>📦 Sales Orders</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {ordersBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={ordersBulk.selectedItems.length}
              onBulkDelete={() => ordersBulk.handleBulkDelete('orders', 'http://localhost:5000/api/sales/orders', fetchData)}
              onClearSelection={ordersBulk.clearSelection}
            />
          )}
          <button className="btn btn-primary" onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}>
            ➕ Create Order
          </button>
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
                    checked={ordersBulk.isAllSelected(orders)}
                    onChange={(e) => ordersBulk.handleSelectAll(e, orders)}
                  />
                </th>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Order Date</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={ordersBulk.selectedItems.includes(order._id)}
                      onChange={(e) => ordersBulk.handleSelectItem(e, order._id)}
                    />
                  </td>
                  <td>{order.orderNumber}</td>
                  <td>{order.customer?.companyName}</td>
                  <td>${order.totalAmount?.toLocaleString()}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>{new Date(order.deliveryDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: 
                        order.status === 'delivered' ? '#28a745' :
                        order.status === 'shipped' ? '#17a2b8' :
                        order.status === 'processing' ? '#ffc107' : '#6c757d',
                      color: 'white'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                      View
                    </button>
                    <button className="btn btn-sm btn-success">
                      Create Invoice
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

  const renderInvoices = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>🧾 Invoice Management</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {invoicesBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={invoicesBulk.selectedItems.length}
              onBulkDelete={() => invoicesBulk.handleBulkDelete('invoices', 'http://localhost:5000/api/sales/invoices', fetchData)}
              onClearSelection={invoicesBulk.clearSelection}
            />
          )}
          <button className="btn btn-primary" onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}>
            ➕ Create Invoice
          </button>
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
                    checked={invoicesBulk.isAllSelected(invoices)}
                    onChange={(e) => invoicesBulk.handleSelectAll(e, invoices)}
                  />
                </th>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Payment Terms</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={invoicesBulk.selectedItems.includes(invoice._id)}
                      onChange={(e) => invoicesBulk.handleSelectItem(e, invoice._id)}
                    />
                  </td>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.customer?.companyName}</td>
                  <td>${invoice.totalAmount?.toLocaleString()}</td>
                  <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td>{invoice.paymentTerms}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: 
                        invoice.status === 'paid' ? '#28a745' :
                        invoice.status === 'overdue' ? '#dc3545' : '#ffc107',
                      color: 'white'
                    }}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                      View
                    </button>
                    <button className="btn btn-sm btn-success">
                      Send
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

  const renderCustomers = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>👥 {t('customerManagement')}</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {customersBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={customersBulk.selectedItems.length}
              onBulkDelete={() => customersBulk.handleBulkDelete('customers', 'http://localhost:5000/api/customers', fetchData)}
              onClearSelection={customersBulk.clearSelection}
            />
          )}
          <button className="btn btn-primary" onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}>
            ➕ Add Customer
          </button>
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
                    checked={customersBulk.isAllSelected(customers)}
                    onChange={(e) => customersBulk.handleSelectAll(e, customers)}
                  />
                </th>
                <th>Customer Code</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={customersBulk.selectedItems.includes(customer._id)}
                      onChange={(e) => customersBulk.handleSelectItem(e, customer._id)}
                    />
                  </td>
                  <td>{customer.customerCode}</td>
                  <td>{customer.companyName}</td>
                  <td>{customer.contactPerson}</td>
                  <td>{customer.contactInfo?.email}</td>
                  <td>{customer.contactInfo?.phone}</td>
                  <td>{customer.address?.city}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: '#28a745', color: 'white'
                    }}>
                      Active
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                      Edit
                    </button>
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

  const renderPipeline = () => (
    <div className="card">
      <h3>🔄 Sales Pipeline</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won'].map(stage => (
          <div key={stage} className="card" style={{ margin: 0, minHeight: '300px' }}>
            <h4 style={{ textAlign: 'center', marginBottom: '15px', textTransform: 'capitalize' }}>
              {stage.replace('-', ' ')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leads.filter(lead => lead.status === stage).map(lead => (
                <div key={lead._id} style={{ 
                  padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{lead.companyName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{lead.contactPerson}</div>
                  <div style={{ fontSize: '0.8rem', color: '#28a745', fontWeight: 'bold' }}>
                    ${lead.opportunity?.value?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];
    
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
                <h4 style={{ margin: 0, color: 'white' }}>Total Revenue</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  ${analytics.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>🎯</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Leads</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {leads.length}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📋</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Active Quotes</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {quotes.filter(q => q.status === 'sent').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📦</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Orders</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {orders.length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4>📈 Monthly Sales Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlySales || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3498db" strokeWidth={3} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4>🥧 Lead Status Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.leadsByStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics.leadsByStatus || []).map((entry, index) => (
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
      <h1 className="page-title">{t('salesManagement')}</h1>
      
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
          📋 Quotes
        </button>
        <button 
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders
        </button>
        <button 
          className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('invoices')}
        >
          🧾 Invoices
        </button>
        <button 
          className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('customers')}
        >
          👥 Customers
        </button>
        <button 
          className={`btn ${activeTab === 'pipeline' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pipeline')}
        >
          🔄 Pipeline
        </button>
        <button 
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      {activeTab === 'leads' && renderLeads()}
      {activeTab === 'quotes' && renderQuotes()}
      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'invoices' && renderInvoices()}
      {activeTab === 'customers' && renderCustomers()}
      {activeTab === 'pipeline' && renderPipeline()}
      {activeTab === 'analytics' && renderAnalytics()}
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={
        activeTab === 'leads' ? (editingItem ? 'Edit Lead' : 'Add Lead') :
        activeTab === 'quotes' ? 'Create Quote' :
        activeTab === 'orders' ? 'Create Order' :
        activeTab === 'invoices' ? 'Create Invoice' :
        activeTab === 'customers' ? 'Add Customer' : 'Form'
      }>
        <form onSubmit={handleSubmit}>
          {activeTab === 'leads' && (
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
              <div className="form-row">
                <div className="form-group">
                  <label>Source:</label>
                  <select value={formData.source} 
                    onChange={(e) => setFormData({...formData, source: e.target.value})}>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="cold-call">Cold Call</option>
                    <option value="social-media">Social Media</option>
                    <option value="trade-show">Trade Show</option>
                    <option value="advertisement">Advertisement</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority:</label>
                  <select value={formData.priority} 
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Opportunity Value:</label>
                  <input type="number" step="0.01" value={formData.opportunity.value} 
                    onChange={(e) => setFormData({...formData, opportunity: {...formData.opportunity, value: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Probability (%):</label>
                  <input type="number" min="0" max="100" value={formData.opportunity.probability} 
                    onChange={(e) => setFormData({...formData, opportunity: {...formData.opportunity, probability: e.target.value}})} />
                </div>
              </div>
              <div className="form-group">
                <label>Expected Close Date:</label>
                <input type="date" value={formData.opportunity.expectedCloseDate} 
                  onChange={(e) => setFormData({...formData, opportunity: {...formData.opportunity, expectedCloseDate: e.target.value}})} />
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
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id}>
                      {customer.companyName}
                    </option>
                  ))}
                </select>
              </div>
              
              {activeTab === 'quotes' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Valid Until:</label>
                    <input type="date" value={formData.validUntil} 
                      onChange={(e) => setFormData({...formData, validUntil: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Terms:</label>
                    <input type="text" value={formData.terms} 
                      onChange={(e) => setFormData({...formData, terms: e.target.value})} />
                  </div>
                </div>
              )}
              
              <h4>Items</h4>
              {formData.items.map((item, index) => (
                <div key={index} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product:</label>
                      <select value={item.product} 
                        onChange={(e) => updateItem(index, 'product', e.target.value)} required>
                        <option value="">Select Product</option>
                        {products.map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name} - ${product.pricing?.sellingPrice}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Quantity:</label>
                      <input type="number" min="1" value={item.quantity} 
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Unit Price:</label>
                      <input type="number" step="0.01" value={item.unitPrice} 
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))} required />
                    </div>
                    {activeTab === 'quotes' && (
                      <div className="form-group">
                        <label>Discount (%):</label>
                        <input type="number" min="0" max="100" value={item.discount} 
                          onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value))} />
                      </div>
                    )}
                  </div>
                  {formData.items.length > 1 && (
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(index)}>
                      Remove Item
                    </button>
                  )}
                </div>
              ))}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
                <button type="button" className="btn btn-secondary" onClick={addItem}>
                  Add Item
                </button>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  Total: ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </>
          )}
          
          <button type="submit" className="btn btn-success">
            {editingItem ? 'Update' : 'Create'}
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

export default SalesManagement;