import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Finance = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('accounts');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    accountCode: '', accountName: '', accountType: 'asset',
    date: '', description: '', entries: [{ account: '', debit: 0, credit: 0 }],
    name: '', year: new Date().getFullYear(), items: [{ account: '', budgetedAmount: 0 }]
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      switch (activeTab) {
        case 'accounts':
          const accountsRes = await axios.get(`http://localhost:5000/api/finance/accounts?page=${currentPage}`, { headers });
          setAccounts(accountsRes.data.accounts);
          setTotalPages(accountsRes.data.totalPages);
          break;
        case 'transactions':
          const transactionsRes = await axios.get(`http://localhost:5000/api/finance/transactions?page=${currentPage}`, { headers });
          setTransactions(transactionsRes.data.transactions);
          setTotalPages(transactionsRes.data.totalPages);
          break;
        case 'budgets':
          const budgetsRes = await axios.get(`http://localhost:5000/api/finance/budgets?page=${currentPage}`, { headers });
          setBudgets(budgetsRes.data.budgets);
          setTotalPages(budgetsRes.data.totalPages);
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
      
      switch (activeTab) {
        case 'accounts':
          endpoint = 'http://localhost:5000/api/finance/accounts';
          break;
        case 'transactions':
          endpoint = 'http://localhost:5000/api/finance/transactions';
          break;
        case 'budgets':
          endpoint = 'http://localhost:5000/api/finance/budgets';
          break;
      }
      
      await axios.post(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowModal(false);
      setFormData({
        accountCode: '', accountName: '', accountType: 'asset',
        date: '', description: '', entries: [{ account: '', debit: 0, credit: 0 }],
        name: '', year: new Date().getFullYear(), items: [{ account: '', budgetedAmount: 0 }]
      });
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to submit'));
    }
  };

  const renderAccounts = () => (
    <div className="card">
      <h3>Chart of Accounts</h3>
      {hasRole(['admin', 'manager']) && (
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Account
        </button>
      )}
      
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Account Code</th>
                  <th>Account Name</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(account => (
                  <tr key={account._id}>
                    <td>{account.accountCode}</td>
                    <td>{account.accountName}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        backgroundColor: '#17a2b8', color: 'white'
                      }}>
                        {account.accountType}
                      </span>
                    </td>
                    <td>${account.balance.toLocaleString()}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        backgroundColor: account.isActive ? '#28a745' : '#dc3545',
                        color: 'white'
                      }}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );

  const renderTransactions = () => (
    <div className="card">
      <h3>Journal Entries</h3>
      {hasRole(['admin', 'manager']) && (
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Transaction
        </button>
      )}
      
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction #</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction._id}>
                    <td>{transaction.transactionNumber}</td>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.description}</td>
                    <td>${transaction.totalAmount.toLocaleString()}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        backgroundColor: transaction.status === 'posted' ? '#28a745' : '#ffc107',
                        color: 'white'
                      }}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>{transaction.createdBy?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );

  const renderBudgets = () => (
    <div className="card">
      <h3>Budget Management</h3>
      {hasRole(['admin', 'manager']) && (
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Budget
        </button>
      )}
      
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Budget Name</th>
                  <th>Year</th>
                  <th>Department</th>
                  <th>Total Budget</th>
                  <th>Total Actual</th>
                  <th>Variance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map(budget => (
                  <tr key={budget._id}>
                    <td>{budget.name}</td>
                    <td>{budget.year}</td>
                    <td>{budget.department || 'All'}</td>
                    <td>${budget.totalBudget.toLocaleString()}</td>
                    <td>${budget.totalActual.toLocaleString()}</td>
                    <td style={{ color: (budget.totalBudget - budget.totalActual) >= 0 ? 'green' : 'red' }}>
                      ${(budget.totalBudget - budget.totalActual).toLocaleString()}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        backgroundColor: budget.status === 'active' ? '#28a745' : '#6c757d',
                        color: 'white'
                      }}>
                        {budget.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );

  const renderAnalytics = () => {
    const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6'];
    
    return (
      <div>
        <h3>💰 Finance Analytics</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4>Account Types Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.accountStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics.accountStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4>Transaction Status</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.transactionStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3498db" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Finance Management</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'accounts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('accounts'); setCurrentPage(1); }}
        >
          📊 Accounts
        </button>
        <button 
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('transactions'); setCurrentPage(1); }}
        >
          📝 Transactions
        </button>
        <button 
          className={`btn ${activeTab === 'budgets' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('budgets'); setCurrentPage(1); }}
        >
          💼 Budgets
        </button>
        {hasRole(['admin', 'manager']) && (
          <button 
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
        )}
      </div>

      {activeTab === 'accounts' && renderAccounts()}
      {activeTab === 'transactions' && renderTransactions()}
      {activeTab === 'budgets' && renderBudgets()}
      {activeTab === 'analytics' && renderAnalytics()}
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={
        activeTab === 'accounts' ? 'Add Account' :
        activeTab === 'transactions' ? 'Add Transaction' :
        activeTab === 'budgets' ? 'Create Budget' : 'Form'
      }>
        <form onSubmit={handleSubmit}>
          {activeTab === 'accounts' && (
            <>
              <div className="form-group">
                <label>Account Code:</label>
                <input type="text" value={formData.accountCode} 
                  onChange={(e) => setFormData({...formData, accountCode: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Account Name:</label>
                <input type="text" value={formData.accountName} 
                  onChange={(e) => setFormData({...formData, accountName: e.target.value})} required />
              </div>
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
            </>
          )}
          
          {activeTab === 'transactions' && (
            <>
              <div className="form-group">
                <label>Date:</label>
                <input type="date" value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <input type="text" value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Total Amount:</label>
                <input type="number" value={formData.totalAmount} 
                  onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} required />
              </div>
            </>
          )}
          
          {activeTab === 'budgets' && (
            <>
              <div className="form-group">
                <label>Budget Name:</label>
                <input type="text" value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Year:</label>
                <input type="number" value={formData.year} 
                  onChange={(e) => setFormData({...formData, year: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Total Budget:</label>
                <input type="number" value={formData.totalBudget} 
                  onChange={(e) => setFormData({...formData, totalBudget: e.target.value})} required />
              </div>
            </>
          )}
          
          <button type="submit" className="btn btn-success">
            {activeTab === 'accounts' ? 'Add Account' :
             activeTab === 'transactions' ? 'Add Transaction' :
             activeTab === 'budgets' ? 'Create Budget' : 'Submit'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Finance;