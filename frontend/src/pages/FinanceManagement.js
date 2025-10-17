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

const FinanceManagement = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('accounts');
  
  // Bulk actions hooks
  const accountsBulk = useBulkActions();
  const transactionsBulk = useBulkActions();
  const budgetsBulk = useBulkActions();
  const expensesBulk = useBulkActions();
  const invoicesBulk = useBulkActions();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvUploadType, setCSVUploadType] = useState('accounts');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    // Account form
    accountName: '', accountType: 'asset', accountCode: '', 
    balance: 0, description: '', parentAccount: '',
    // Transaction form
    transactionType: 'income', amount: 0, description: '', 
    account: '', category: '', reference: '', transactionDate: '',
    // Budget form
    budgetName: '', department: '', period: 'monthly', 
    totalAmount: 0, startDate: '', endDate: '',
    // Expense form
    expenseType: 'office', amount: 0, description: '', 
    expenseDate: '', receipt: '', approvedBy: '',
    // Invoice form
    invoiceNumber: '', customer: '', amount: 0, 
    dueDate: '', status: 'draft', items: []
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
        case 'accounts':
          const accRes = await axios.get('http://localhost:5000/api/finance/accounts', { headers });
          setAccounts(accRes.data.accounts || []);
          break;
        case 'transactions':
          const transRes = await axios.get('http://localhost:5000/api/finance/transactions', { headers });
          setTransactions(transRes.data.transactions || []);
          break;
        case 'budgets':
          const budgetRes = await axios.get('http://localhost:5000/api/finance/budgets', { headers });
          setBudgets(budgetRes.data.budgets || []);
          break;
        case 'expenses':
          const expRes = await axios.get('http://localhost:5000/api/finance/expenses', { headers });
          setExpenses(expRes.data || []);
          break;
        case 'invoices':
          const invRes = await axios.get('http://localhost:5000/api/invoices', { headers });
          setInvoices(invRes.data.invoices || []);
          break;
        case 'analytics':
          const analyticsRes = await axios.get('http://localhost:5000/api/finance/analytics', { headers });
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
        case 'accounts':
          if (editingItem) {
            endpoint = `http://localhost:5000/api/finance/accounts/${editingItem._id}`;
            method = 'put';
          } else {
            endpoint = 'http://localhost:5000/api/finance/accounts';
          }
          data = {
            name: formData.accountName,
            type: formData.accountType,
            code: formData.accountCode,
            balance: parseFloat(formData.balance),
            description: formData.description,
            parentAccount: formData.parentAccount || null
          };
          break;
        case 'transactions':
          endpoint = 'http://localhost:5000/api/finance/transactions';
          data = {
            type: formData.transactionType,
            amount: parseFloat(formData.amount),
            description: formData.description,
            account: formData.account,
            category: formData.category,
            reference: formData.reference,
            date: formData.transactionDate
          };
          break;
        case 'budgets':
          endpoint = 'http://localhost:5000/api/finance/budgets';
          data = {
            name: formData.budgetName,
            department: formData.department,
            period: formData.period,
            totalAmount: parseFloat(formData.totalAmount),
            startDate: formData.startDate,
            endDate: formData.endDate
          };
          break;
        case 'expenses':
          endpoint = 'http://localhost:5000/api/finance/expenses';
          data = {
            type: formData.expenseType,
            amount: parseFloat(formData.amount),
            description: formData.description,
            date: formData.expenseDate,
            receipt: formData.receipt,
            approvedBy: formData.approvedBy
          };
          break;
        case 'invoices':
          endpoint = 'http://localhost:5000/api/invoices';
          data = {
            invoiceNumber: formData.invoiceNumber,
            customer: formData.customer,
            amount: parseFloat(formData.amount),
            dueDate: formData.dueDate,
            status: formData.status,
            items: formData.items
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
      accountName: '', accountType: 'asset', accountCode: '', 
      balance: 0, description: '', parentAccount: '',
      transactionType: 'income', amount: 0, description: '', 
      account: '', category: '', reference: '', transactionDate: '',
      budgetName: '', department: '', period: 'monthly', 
      totalAmount: 0, startDate: '', endDate: '',
      expenseType: 'office', amount: 0, description: '', 
      expenseDate: '', receipt: '', approvedBy: '',
      invoiceNumber: '', customer: '', amount: 0, 
      dueDate: '', status: 'draft', items: []
    });
  };

  const handleCSVUpload = async (csvData) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch (csvUploadType) {
        case 'accounts':
          endpoint = 'http://localhost:5000/api/finance/accounts/bulk';
          break;
        case 'transactions':
          endpoint = 'http://localhost:5000/api/finance/transactions/bulk';
          break;
        case 'expenses':
          endpoint = 'http://localhost:5000/api/finance/expenses/bulk';
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
      case 'accounts':
        return [{
          name: 'Cash Account',
          code: 'ACC001',
          type: 'asset',
          balance: '10000.00',
          description: 'Main cash account'
        }];
      case 'transactions':
        return [{
          type: 'income',
          amount: '1000.00',
          description: 'Sales revenue',
          category: 'Sales',
          transactionDate: '2024-01-15',
          reference: 'REF001'
        }];
      case 'expenses':
        return [{
          type: 'office',
          amount: '500.00',
          description: 'Office supplies',
          expenseDate: '2024-01-15',
          receipt: 'REC001'
        }];
      default:
        return [];
    }
  };

  const renderAccounts = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>🏦 Chart of Accounts</h3>
        {hasRole(['admin', 'manager']) && (
          <button className="btn btn-primary" onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}>
            ➕ Add Account
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        {accountsBulk.selectedItems.length > 0 && (
          <BulkActions
            selectedCount={accountsBulk.selectedItems.length}
            onBulkDelete={() => accountsBulk.handleBulkDelete('accounts', 'http://localhost:5000/api/finance/accounts', fetchData)}
            onClearSelection={accountsBulk.clearSelection}
          />
        )}
        <button className="btn btn-info" onClick={() => {
          setCSVUploadType('accounts');
          setShowCSVModal(true);
        }}>
          📤 Import CSV
        </button>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="asset">Asset</option>
          <option value="liability">Liability</option>
          <option value="equity">Equity</option>
          <option value="revenue">Revenue</option>
          <option value="expense">Expense</option>
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
                    checked={accountsBulk.isAllSelected(accounts)}
                    onChange={(e) => accountsBulk.handleSelectAll(e, accounts)}
                  />
                </th>
                <th>Account Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Parent Account</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(accounts || []).filter(account => 
                account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.code?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(account => (
                <tr key={account._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={accountsBulk.selectedItems.includes(account._id)}
                      onChange={(e) => accountsBulk.handleSelectItem(e, account._id)}
                    />
                  </td>
                  <td>{account.code}</td>
                  <td>{account.name}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: 
                        account.type === 'asset' ? '#28a745' :
                        account.type === 'liability' ? '#dc3545' :
                        account.type === 'equity' ? '#17a2b8' :
                        account.type === 'revenue' ? '#28a745' : '#ffc107',
                      color: 'white'
                    }}>
                      {account.type}
                    </span>
                  </td>
                  <td style={{ 
                    color: account.balance >= 0 ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}>
                    ${account.balance?.toLocaleString()}
                  </td>
                  <td>{account.parentAccount?.name || '-'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: account.isActive ? '#28a745' : '#6c757d',
                      color: 'white'
                    }}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {hasRole(['admin', 'manager']) && (
                      <>
                        <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-info">
                          Transactions
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

  const renderTransactions = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>💳 Transactions</h3>
        {hasRole(['admin', 'manager']) && (
          <button className="btn btn-primary" onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}>
            ➕ Add Transaction
          </button>
        )}
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Account</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(transactions || []).map(transaction => (
                <tr key={transaction._id}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: transaction.type === 'income' ? '#28a745' : '#dc3545',
                      color: 'white'
                    }}>
                      {transaction.type}
                    </span>
                  </td>
                  <td>{transaction.description}</td>
                  <td>{transaction.account?.name}</td>
                  <td>{transaction.category}</td>
                  <td style={{ 
                    color: transaction.type === 'income' ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount?.toLocaleString()}
                  </td>
                  <td>{transaction.reference}</td>
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

  const renderBudgets = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>📊 Budget Management</h3>
        {hasRole(['admin', 'manager']) && (
          <button className="btn btn-primary" onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}>
            ➕ Create Budget
          </button>
        )}
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Budget Name</th>
                <th>Department</th>
                <th>Period</th>
                <th>Total Amount</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(budgets || []).map(budget => {
                const spent = budget.spent || 0;
                const remaining = budget.totalAmount - spent;
                const progress = (spent / budget.totalAmount) * 100;
                
                return (
                  <tr key={budget._id}>
                    <td>{budget.name}</td>
                    <td>{budget.department}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        backgroundColor: '#17a2b8', color: 'white'
                      }}>
                        {budget.period}
                      </span>
                    </td>
                    <td>${budget.totalAmount?.toLocaleString()}</td>
                    <td style={{ color: 'red' }}>${spent.toLocaleString()}</td>
                    <td style={{ color: remaining >= 0 ? 'green' : 'red' }}>
                      ${remaining.toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '100px', height: '10px', backgroundColor: '#e9ecef', 
                          borderRadius: '5px', overflow: 'hidden' 
                        }}>
                          <div style={{ 
                            width: `${Math.min(progress, 100)}%`, height: '100%',
                            backgroundColor: progress > 90 ? '#dc3545' : progress > 70 ? '#ffc107' : '#28a745'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem' }}>{progress.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      {hasRole(['admin', 'manager']) && (
                        <>
                          <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-info">
                            Details
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderExpenses = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>💸 Expense Management</h3>
        {hasRole(['admin', 'manager']) && (
          <button className="btn btn-primary" onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}>
            ➕ Add Expense
          </button>
        )}
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Receipt</th>
                <th>Approved By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(expenses || []).map(expense => (
                <tr key={expense._id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: '#6f42c1', color: 'white'
                    }}>
                      {expense.type}
                    </span>
                  </td>
                  <td>{expense.description}</td>
                  <td style={{ color: 'red', fontWeight: 'bold' }}>
                    ${expense.amount?.toLocaleString()}
                  </td>
                  <td>{expense.receipt ? '✓' : '-'}</td>
                  <td>{expense.approvedBy?.name || 'Pending'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: expense.status === 'approved' ? '#28a745' : '#ffc107',
                      color: 'white'
                    }}>
                      {expense.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    {hasRole(['admin', 'manager']) && (
                      <>
                        <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-success">
                          Approve
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

  const renderInvoices = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>🧾 Invoice Management</h3>
        {hasRole(['admin', 'manager']) && (
          <button className="btn btn-primary" onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}>
            ➕ Create Invoice
          </button>
        )}
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(invoices || []).map(invoice => (
                <tr key={invoice._id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.customer?.companyName}</td>
                  <td style={{ color: 'green', fontWeight: 'bold' }}>
                    ${invoice.amount?.toLocaleString()}
                  </td>
                  <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
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
                  <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td>
                    {hasRole(['admin', 'manager']) && (
                      <>
                        <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-success">
                          Send
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

  const renderAnalytics = () => {
    const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];
    
    return (
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          📊 Financial Analytics Dashboard
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
              <span style={{ fontSize: '2rem' }}>💸</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Expenses</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  ${analytics.totalExpenses?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📈</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Net Profit</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  ${((analytics.totalRevenue || 0) - (analytics.totalExpenses || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>🏦</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Cash Balance</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  ${analytics.cashBalance?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4>📈 Monthly Revenue vs Expenses</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyFinancials || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, '']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#28a745" strokeWidth={3} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#dc3545" strokeWidth={3} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4>🥧 Expense Categories</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.expenseCategories || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, amount }) => `${_id}: $${amount?.toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {(analytics.expenseCategories || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4>📊 Account Balances</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.accountBalances || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Balance']} />
                <Legend />
                <Bar dataKey="balance" fill="#3498db" name="Balance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4>💳 Transaction Volume</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.transactionVolume || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2ecc71" name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Financial Management System</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'accounts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('accounts')}
        >
          🏦 Accounts
        </button>
        <button 
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('transactions')}
        >
          💳 Transactions
        </button>
        <button 
          className={`btn ${activeTab === 'budgets' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('budgets')}
        >
          📊 Budgets
        </button>
        <button 
          className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('expenses')}
        >
          💸 Expenses
        </button>
        <button 
          className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('invoices')}
        >
          🧾 Invoices
        </button>
        <button 
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      {activeTab === 'accounts' && renderAccounts()}
      {activeTab === 'transactions' && renderTransactions()}
      {activeTab === 'budgets' && renderBudgets()}
      {activeTab === 'expenses' && renderExpenses()}
      {activeTab === 'invoices' && renderInvoices()}
      {activeTab === 'analytics' && renderAnalytics()}
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={
        activeTab === 'accounts' ? (editingItem ? 'Edit Account' : 'Add Account') :
        activeTab === 'transactions' ? 'Add Transaction' :
        activeTab === 'budgets' ? 'Create Budget' :
        activeTab === 'expenses' ? 'Add Expense' :
        activeTab === 'invoices' ? 'Create Invoice' : 'Form'
      }>
        <form onSubmit={handleSubmit}>
          {activeTab === 'accounts' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Account Name:</label>
                  <input type="text" value={formData.accountName} 
                    onChange={(e) => setFormData({...formData, accountName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Account Code:</label>
                  <input type="text" value={formData.accountCode} 
                    onChange={(e) => setFormData({...formData, accountCode: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Account Type:</label>
                  <select value={formData.accountType} 
                    onChange={(e) => setFormData({...formData, accountType: e.target.value})}>
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                    <option value="equity">Equity</option>
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Opening Balance:</label>
                  <input type="number" step="0.01" value={formData.balance} 
                    onChange={(e) => setFormData({...formData, balance: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
            </>
          )}
          
          {activeTab === 'transactions' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Transaction Type:</label>
                  <select value={formData.transactionType} 
                    onChange={(e) => setFormData({...formData, transactionType: e.target.value})}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount:</label>
                  <input type="number" step="0.01" value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Account:</label>
                <select value={formData.account} 
                  onChange={(e) => setFormData({...formData, account: e.target.value})} required>
                  <option value="">Select Account</option>
                  {(accounts || []).map(account => (
                    <option key={account._id} value={account._id}>
                      {account.name} ({account.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category:</label>
                  <input type="text" value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Transaction Date:</label>
                  <input type="date" value={formData.transactionDate} 
                    onChange={(e) => setFormData({...formData, transactionDate: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Reference:</label>
                <input type="text" value={formData.reference} 
                  onChange={(e) => setFormData({...formData, reference: e.target.value})} />
              </div>
            </>
          )}
          
          {activeTab === 'budgets' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Budget Name:</label>
                  <input type="text" value={formData.budgetName} 
                    onChange={(e) => setFormData({...formData, budgetName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Department:</label>
                  <input type="text" value={formData.department} 
                    onChange={(e) => setFormData({...formData, department: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Period:</label>
                  <select value={formData.period} 
                    onChange={(e) => setFormData({...formData, period: e.target.value})}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Total Amount:</label>
                  <input type="number" step="0.01" value={formData.totalAmount} 
                    onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} required />
                </div>
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
            </>
          )}
          
          {activeTab === 'expenses' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Expense Type:</label>
                  <select value={formData.expenseType} 
                    onChange={(e) => setFormData({...formData, expenseType: e.target.value})}>
                    <option value="office">Office</option>
                    <option value="travel">Travel</option>
                    <option value="meals">Meals</option>
                    <option value="supplies">Supplies</option>
                    <option value="utilities">Utilities</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount:</label>
                  <input type="number" step="0.01" value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expense Date:</label>
                  <input type="date" value={formData.expenseDate} 
                    onChange={(e) => setFormData({...formData, expenseDate: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Receipt:</label>
                  <input type="text" value={formData.receipt} 
                    onChange={(e) => setFormData({...formData, receipt: e.target.value})} 
                    placeholder="Receipt number or file" />
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'invoices' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Invoice Number:</label>
                  <input type="text" value={formData.invoiceNumber} 
                    onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Customer:</label>
                  <input type="text" value={formData.customer} 
                    onChange={(e) => setFormData({...formData, customer: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount:</label>
                  <input type="number" step="0.01" value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Due Date:</label>
                  <input type="date" value={formData.dueDate} 
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
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

export default FinanceManagement;