import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import Modal from '../components/Modal';
import BulkActions from '../components/BulkActions';
import useBulkActions from '../hooks/useBulkActions';
import CSVUpload from '../components/CSVUpload';
import { Button } from '../components/ui';
import '../styles/pages/CRMSystem.scss';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CRMSystem = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('customers');
  
  // Bulk actions hooks
  const customersBulk = useBulkActions();
  const contactsBulk = useBulkActions();
  const activitiesBulk = useBulkActions();
  const opportunitiesBulk = useBulkActions();
  const campaignsBulk = useBulkActions();
  const [customers, setCustomers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    // Customer form
    customerCode: '', companyName: '', industry: '', website: '', 
    contactPerson: '', email: '', phone: '', mobile: '',
    address: { street: '', city: '', state: '', country: '', zipCode: '' },
    taxId: '', creditLimit: 0, paymentTerms: 'net-30',
    // Contact form
    firstName: '', lastName: '', jobTitle: '', department: '',
    contactEmail: '', contactPhone: '', birthday: '',
    // Activity form
    activityType: 'call', subject: '', description: '', 
    activityDate: '', duration: 30, outcome: '',
    // Opportunity form
    opportunityName: '', value: 0, probability: 50, stage: 'prospecting',
    expectedCloseDate: '', source: 'referral',
    // Campaign form
    campaignName: '', campaignType: 'email', budget: 0, 
    startDate: '', endDate: '', targetAudience: ''
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
        case 'customers':
          const custRes = await axios.get('http://localhost:5000/api/customers', { headers });
          setCustomers(custRes.data.customers || []);
          break;
        case 'contacts':
          const contactRes = await axios.get('http://localhost:5000/api/customers/contacts', { headers });
          setContacts(contactRes.data || []);
          break;
        case 'activities':
          const actRes = await axios.get('http://localhost:5000/api/customers/activities', { headers });
          setActivities(actRes.data || []);
          break;
        case 'opportunities':
          const oppRes = await axios.get('http://localhost:5000/api/customers/opportunities', { headers });
          setOpportunities(oppRes.data || []);
          break;
        case 'campaigns':
          const campRes = await axios.get('http://localhost:5000/api/customers/campaigns', { headers });
          setCampaigns(campRes.data || []);
          break;
        case 'analytics':
          const analyticsRes = await axios.get('http://localhost:5000/api/customers/analytics', { headers });
          setAnalytics(analyticsRes.data);
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
        case 'customers':
          if (editingItem) {
            endpoint = `http://localhost:5000/api/customers/${editingItem._id}`;
            method = 'put';
          } else {
            endpoint = 'http://localhost:5000/api/customers';
          }
          data = {
            companyName: formData.companyName,
            industry: formData.industry,
            website: formData.website,
            contactPerson: formData.contactPerson,
            contactInfo: {
              email: formData.email,
              phone: formData.phone,
              mobile: formData.mobile
            },
            address: formData.address,
            taxId: formData.taxId,
            creditLimit: parseFloat(formData.creditLimit) || 0,
            paymentTerms: formData.paymentTerms
          };
          break;
        case 'contacts':
          endpoint = 'http://localhost:5000/api/customers/contacts';
          data = {
            customer: selectedCustomer?._id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            jobTitle: formData.jobTitle,
            department: formData.department,
            contactInfo: {
              email: formData.contactEmail,
              phone: formData.contactPhone
            },
            birthday: formData.birthday
          };
          break;
        case 'opportunities':
          endpoint = 'http://localhost:5000/api/customers/opportunities';
          data = {
            customer: selectedCustomer?._id,
            name: formData.opportunityName,
            value: parseFloat(formData.value),
            probability: parseInt(formData.probability),
            stage: formData.stage,
            expectedCloseDate: formData.expectedCloseDate,
            source: formData.source
          };
          break;
        case 'campaigns':
          endpoint = 'http://localhost:5000/api/customers/campaigns';
          data = {
            name: formData.campaignName,
            type: formData.campaignType,
            budget: parseFloat(formData.budget),
            startDate: formData.startDate,
            endDate: formData.endDate,
            targetAudience: formData.targetAudience
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
      setSelectedCustomer(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to submit'));
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/customers/activities', {
        customer: selectedCustomer?._id,
        type: formData.activityType,
        subject: formData.subject,
        description: formData.description,
        activityDate: formData.activityDate,
        duration: parseInt(formData.duration),
        outcome: formData.outcome
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowActivityModal(false);
      setSelectedCustomer(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error recording activity:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to record activity'));
    }
  };

  const resetForm = () => {
    setFormData({
      customerCode: '', companyName: '', industry: '', website: '', 
      contactPerson: '', email: '', phone: '', mobile: '',
      address: { street: '', city: '', state: '', country: '', zipCode: '' },
      taxId: '', creditLimit: 0, paymentTerms: 'net-30',
      firstName: '', lastName: '', jobTitle: '', department: '',
      contactEmail: '', contactPhone: '', birthday: '',
      activityType: 'call', subject: '', description: '', 
      activityDate: '', duration: 30, outcome: '',
      opportunityName: '', value: 0, probability: 50, stage: 'prospecting',
      expectedCloseDate: '', source: 'referral',
      campaignName: '', campaignType: 'email', budget: 0, 
      startDate: '', endDate: '', targetAudience: ''
    });
  };

  const handleCSVUpload = async (csvData) => {
    const token = localStorage.getItem('token');
    let endpoint = '';
    let payload = {};
    
    switch (activeTab) {
      case 'customers':
        endpoint = 'http://localhost:5000/api/customers/bulk';
        payload = { customers: csvData };
        break;
      case 'contacts':
        endpoint = 'http://localhost:5000/api/customers/contacts/bulk';
        payload = { contacts: csvData };
        break;
      case 'opportunities':
        endpoint = 'http://localhost:5000/api/customers/opportunities/bulk';
        payload = { opportunities: csvData };
        break;
      case 'campaigns':
        endpoint = 'http://localhost:5000/api/customers/campaigns/bulk';
        payload = { campaigns: csvData };
        break;
      default:
        throw new Error('Bulk upload not supported for this tab');
    }
    
    await axios.post(endpoint, payload, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    fetchData();
  };

  const getCSVTemplate = () => {
    switch (activeTab) {
      case 'customers':
        return [{
          companyName: 'ABC Company',
          contactPerson: 'John Smith',
          email: 'john@abccompany.com',
          phone: '+1234567890',
          industry: 'Technology',
          website: 'https://abccompany.com'
        }];
      case 'contacts':
        return [{
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@company.com',
          phone: '+1234567890',
          jobTitle: 'Manager',
          department: 'Sales'
        }];
      case 'opportunities':
        return [{
          name: 'New Project Deal',
          value: '50000',
          probability: '75',
          stage: 'negotiation',
          expectedCloseDate: '2024-03-15',
          source: 'referral'
        }];
      case 'campaigns':
        return [{
          name: 'Spring Campaign',
          type: 'email',
          budget: '10000',
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          targetAudience: 'Existing customers'
        }];
      default:
        return [];
    }
  };

  const renderCustomers = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>🏢 Customer Management</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="success" icon="📝" onClick={() => setShowActivityModal(true)}>
            Log Activity
          </Button>
          <Button variant="primary" icon="➕" onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}>
            Add Customer
          </Button>
        </div>
      </div>
      
      <div className="module-filters">
        <div className="filter-row">
          <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search customers..." />
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="prospect">Prospect</option>
          </select>
        </div>
        
        <div className="action-row">
          {customersBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={customersBulk.selectedItems.length}
              onBulkDelete={() => customersBulk.handleBulkDelete('customers', 'http://localhost:5000/api/customers', fetchData)}
              onClearSelection={customersBulk.clearSelection}
            />
          )}
          <Button 
            variant="info" 
            icon="📤" 
            onClick={() => setShowCSVUpload(true)}
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
                    checked={customersBulk.isAllSelected(customers)}
                    onChange={(e) => customersBulk.handleSelectAll(e, customers)}
                  />
                </th>
                <th>Customer Code</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Industry</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Credit Limit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.filter(customer => 
                customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(customer => (
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
                  <td>{customer.industry}</td>
                  <td>{customer.contactInfo?.email}</td>
                  <td>{customer.contactInfo?.phone}</td>
                  <td>${customer.creditLimit?.toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: customer.status === 'active' ? '#28a745' : '#6c757d',
                      color: 'white'
                    }}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-info" onClick={() => {
                      setSelectedCustomer(customer);
                      setShowActivityModal(true);
                    }}>
                      Log Activity
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

  const renderContacts = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>👥 Contact Management</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {contactsBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={contactsBulk.selectedItems.length}
              onBulkDelete={() => contactsBulk.handleBulkDelete('contacts', 'http://localhost:5000/api/customers/contacts', fetchData)}
              onClearSelection={contactsBulk.clearSelection}
            />
          )}
        <button className="btn btn-primary" onClick={() => {
          setEditingItem(null);
          resetForm();
          setShowModal(true);
        }}>
          ➕ Add Contact
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
                    checked={contactsBulk.isAllSelected(contacts)}
                    onChange={(e) => contactsBulk.handleSelectAll(e, contacts)}
                  />
                </th>
                <th>Name</th>
                <th>Company</th>
                <th>Job Title</th>
                <th>Department</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Birthday</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={contactsBulk.selectedItems.includes(contact._id)}
                      onChange={(e) => contactsBulk.handleSelectItem(e, contact._id)}
                    />
                  </td>
                  <td>{contact.firstName} {contact.lastName}</td>
                  <td>{contact.customer?.companyName}</td>
                  <td>{contact.jobTitle}</td>
                  <td>{contact.department}</td>
                  <td>{contact.contactInfo?.email}</td>
                  <td>{contact.contactInfo?.phone}</td>
                  <td>{contact.birthday ? new Date(contact.birthday).toLocaleDateString() : '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-success">
                      Email
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

  const renderActivities = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>📝 Activity Log</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {activitiesBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={activitiesBulk.selectedItems.length}
              onBulkDelete={() => activitiesBulk.handleBulkDelete('activities', 'http://localhost:5000/api/customers/activities', fetchData)}
              onClearSelection={activitiesBulk.clearSelection}
            />
          )}
        <button className="btn btn-primary" onClick={() => setShowActivityModal(true)}>
          ➕ Log Activity
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
                    checked={activitiesBulk.isAllSelected(activities)}
                    onChange={(e) => activitiesBulk.handleSelectAll(e, activities)}
                  />
                </th>
                <th>Date</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Duration</th>
                <th>Outcome</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map(activity => (
                <tr key={activity._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={activitiesBulk.selectedItems.includes(activity._id)}
                      onChange={(e) => activitiesBulk.handleSelectItem(e, activity._id)}
                    />
                  </td>
                  <td>{new Date(activity.activityDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: 
                        activity.type === 'call' ? '#17a2b8' :
                        activity.type === 'email' ? '#28a745' :
                        activity.type === 'meeting' ? '#ffc107' : '#6c757d',
                      color: 'white'
                    }}>
                      {activity.type}
                    </span>
                  </td>
                  <td>{activity.customer?.companyName}</td>
                  <td>{activity.subject}</td>
                  <td>{activity.duration} min</td>
                  <td>{activity.outcome}</td>
                  <td>{activity.createdBy?.name}</td>
                  <td>
                    <button className="btn btn-sm btn-primary">
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

  const renderOpportunities = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>💰 Opportunities</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {opportunitiesBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={opportunitiesBulk.selectedItems.length}
              onBulkDelete={() => opportunitiesBulk.handleBulkDelete('opportunities', 'http://localhost:5000/api/customers/opportunities', fetchData)}
              onClearSelection={opportunitiesBulk.clearSelection}
            />
          )}
        <button className="btn btn-primary" onClick={() => {
          setEditingItem(null);
          resetForm();
          setShowModal(true);
        }}>
          ➕ Add Opportunity
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
                    checked={opportunitiesBulk.isAllSelected(opportunities)}
                    onChange={(e) => opportunitiesBulk.handleSelectAll(e, opportunities)}
                  />
                </th>
                <th>Opportunity Name</th>
                <th>Customer</th>
                <th>Value</th>
                <th>Probability</th>
                <th>Stage</th>
                <th>Expected Close</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map(opp => (
                <tr key={opp._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={opportunitiesBulk.selectedItems.includes(opp._id)}
                      onChange={(e) => opportunitiesBulk.handleSelectItem(e, opp._id)}
                    />
                  </td>
                  <td>{opp.name}</td>
                  <td>{opp.customer?.companyName}</td>
                  <td>${opp.value?.toLocaleString()}</td>
                  <td>{opp.probability}%</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: 
                        opp.stage === 'closed-won' ? '#28a745' :
                        opp.stage === 'closed-lost' ? '#dc3545' :
                        opp.stage === 'negotiation' ? '#ffc107' : '#17a2b8',
                      color: 'white'
                    }}>
                      {opp.stage}
                    </span>
                  </td>
                  <td>{new Date(opp.expectedCloseDate).toLocaleDateString()}</td>
                  <td>{opp.source}</td>
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

  const renderCampaigns = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>📢 Marketing Campaigns</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {campaignsBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={campaignsBulk.selectedItems.length}
              onBulkDelete={() => campaignsBulk.handleBulkDelete('campaigns', 'http://localhost:5000/api/customers/campaigns', fetchData)}
              onClearSelection={campaignsBulk.clearSelection}
            />
          )}
        {hasRole(['admin', 'manager']) && (
          <button className="btn btn-primary" onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}>
            ➕ Create Campaign
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
                    checked={campaignsBulk.isAllSelected(campaigns)}
                    onChange={(e) => campaignsBulk.handleSelectAll(e, campaigns)}
                  />
                </th>
                <th>Campaign Name</th>
                <th>Type</th>
                <th>Budget</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Target Audience</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(campaign => (
                <tr key={campaign._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={campaignsBulk.selectedItems.includes(campaign._id)}
                      onChange={(e) => campaignsBulk.handleSelectItem(e, campaign._id)}
                    />
                  </td>
                  <td>{campaign.name}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: '#6f42c1', color: 'white'
                    }}>
                      {campaign.type}
                    </span>
                  </td>
                  <td>${campaign.budget?.toLocaleString()}</td>
                  <td>{new Date(campaign.startDate).toLocaleDateString()}</td>
                  <td>{new Date(campaign.endDate).toLocaleDateString()}</td>
                  <td>{campaign.targetAudience}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: campaign.status === 'active' ? '#28a745' : '#6c757d',
                      color: 'white'
                    }}>
                      {campaign.status || 'draft'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-success">
                      Launch
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

  const renderAnalytics = () => {
    const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];
    
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
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.totalCustomers || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>💰</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Pipeline Value</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  ${analytics.pipelineValue?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📝</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Activities</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {activities.length}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>🎯</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Conversion Rate</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.conversionRate || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4>📊 Customer by Industry</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.customersByIndustry || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3498db" name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4>🥧 Opportunity Stages</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.opportunityStages || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics.opportunityStages || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4>📈 Monthly Activities</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyActivities || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#2ecc71" strokeWidth={3} name="Activities" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4>📞 Activity Types</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.activityTypes || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#e74c3c" name="Count" />
              </BarChart>
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
        >
          🏢 Customers
        </button>
        <button 
          className={`btn ${activeTab === 'contacts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('contacts')}
        >
          👥 Contacts
        </button>
        <button 
          className={`btn ${activeTab === 'activities' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('activities')}
        >
          📝 Activities
        </button>
        <button 
          className={`btn ${activeTab === 'opportunities' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('opportunities')}
        >
          💰 Opportunities
        </button>
        <button 
          className={`btn ${activeTab === 'campaigns' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('campaigns')}
        >
          📢 Campaigns
        </button>
        <button 
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      {activeTab === 'customers' && renderCustomers()}
      {activeTab === 'contacts' && renderContacts()}
      {activeTab === 'activities' && renderActivities()}
      {activeTab === 'opportunities' && renderOpportunities()}
      {activeTab === 'campaigns' && renderCampaigns()}
      {activeTab === 'analytics' && renderAnalytics()}
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={
        activeTab === 'customers' ? (editingItem ? 'Edit Customer' : 'Add Customer') :
        activeTab === 'contacts' ? 'Add Contact' :
        activeTab === 'opportunities' ? 'Add Opportunity' :
        activeTab === 'campaigns' ? 'Add Campaign' : 'Form'
      }>
        <form onSubmit={handleSubmit}>
          {activeTab === 'customers' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name:</label>
                  <input type="text" value={formData.companyName} 
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Industry:</label>
                  <input type="text" value={formData.industry} 
                    onChange={(e) => setFormData({...formData, industry: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Person:</label>
                  <input type="text" value={formData.contactPerson} 
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Website:</label>
                  <input type="url" value={formData.website} 
                    onChange={(e) => setFormData({...formData, website: e.target.value})} />
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
                <input type="text" value={formData.address.street} 
                  onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})} 
                  placeholder="Street Address" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City:</label>
                  <input type="text" value={formData.address.city} 
                    onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Country:</label>
                  <input type="text" value={formData.address.country} 
                    onChange={(e) => setFormData({...formData, address: {...formData.address, country: e.target.value}})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Credit Limit:</label>
                  <input type="number" step="0.01" value={formData.creditLimit} 
                    onChange={(e) => setFormData({...formData, creditLimit: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Payment Terms:</label>
                  <select value={formData.paymentTerms} 
                    onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}>
                    <option value="net-15">Net 15</option>
                    <option value="net-30">Net 30</option>
                    <option value="net-60">Net 60</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'contacts' && (
            <>
              <div className="form-group">
                <label>Customer:</label>
                <select value={selectedCustomer?._id || ''} 
                  onChange={(e) => {
                    const customer = customers.find(c => c._id === e.target.value);
                    setSelectedCustomer(customer);
                  }} required>
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id}>
                      {customer.companyName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name:</label>
                  <input type="text" value={formData.firstName} 
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Last Name:</label>
                  <input type="text" value={formData.lastName} 
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title:</label>
                  <input type="text" value={formData.jobTitle} 
                    onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Department:</label>
                  <input type="text" value={formData.department} 
                    onChange={(e) => setFormData({...formData, department: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" value={formData.contactEmail} 
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input type="tel" value={formData.contactPhone} 
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} />
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'campaigns' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Campaign Name:</label>
                  <input type="text" value={formData.campaignName} 
                    onChange={(e) => setFormData({...formData, campaignName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Campaign Type:</label>
                  <select value={formData.campaignType} 
                    onChange={(e) => setFormData({...formData, campaignType: e.target.value})}>
                    <option value="email">Email</option>
                    <option value="social">Social Media</option>
                    <option value="print">Print</option>
                    <option value="digital">Digital</option>
                    <option value="event">Event</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Budget:</label>
                <input type="number" step="0.01" value={formData.budget} 
                  onChange={(e) => setFormData({...formData, budget: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date:</label>
                  <input type="date" value={formData.startDate} 
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>End Date:</label>
                  <input type="date" value={formData.endDate} 
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Target Audience:</label>
                <textarea value={formData.targetAudience} 
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})} 
                  placeholder="Describe your target audience..." />
              </div>
            </>
          )}
          
          <button type="submit" className="btn btn-success">
            {editingItem ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} title="Log Activity">
        <form onSubmit={handleActivitySubmit}>
          <div className="form-group">
            <label>Customer:</label>
            <select value={selectedCustomer?._id || ''} 
              onChange={(e) => {
                const customer = customers.find(c => c._id === e.target.value);
                setSelectedCustomer(customer);
              }} required>
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.companyName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Activity Type:</label>
              <select value={formData.activityType} 
                onChange={(e) => setFormData({...formData, activityType: e.target.value})}>
                <option value="call">Phone Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="task">Task</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (minutes):</label>
              <input type="number" value={formData.duration} 
                onChange={(e) => setFormData({...formData, duration: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Subject:</label>
            <input type="text" value={formData.subject} 
              onChange={(e) => setFormData({...formData, subject: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Activity Date:</label>
              <input type="datetime-local" value={formData.activityDate} 
                onChange={(e) => setFormData({...formData, activityDate: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Outcome:</label>
              <input type="text" value={formData.outcome} 
                onChange={(e) => setFormData({...formData, outcome: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn btn-success">
            Log Activity
          </button>
        </form>
      </Modal>

      <CSVUpload
        isOpen={showCSVUpload}
        onClose={() => setShowCSVUpload(false)}
        onUpload={handleCSVUpload}
        templateData={getCSVTemplate()}
        title={`Import ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        description={`Upload a CSV file to bulk import ${activeTab}. Download the template to see the required format.`}
      />
    </div>
  );
};

export default CRMSystem;