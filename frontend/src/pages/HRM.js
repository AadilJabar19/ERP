import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import Modal from '../components/Modal';
import BulkActions from '../components/BulkActions';
import CSVUpload from '../components/CSVUpload';
import ActionDropdown from '../components/ActionDropdown';
import { Button } from '../components/ui';
import useBulkActions from '../hooks/useBulkActions';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/pages/HRM.scss';

const HRM = () => {
  const { hasRole, user } = useAuth();
  

  const { success, error, showConfirm } = useToast();
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [users, setUsers] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showConvertEmployeeModal, setShowConvertEmployeeModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [analytics, setAnalytics] = useState({});
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [convertData, setConvertData] = useState({ employeeId: '', department: '', position: '', baseSalary: '' });
  const [convertEmployeeData, setConvertEmployeeData] = useState({ password: '', role: 'employee' });
  const { selectedItems = [], selectAll, handleSelectAll, handleSelectItem, clearSelection } = useBulkActions();
  const [formData, setFormData] = useState({
    // Employee form
    employeeId: '', 
    personalInfo: { firstName: '', lastName: '', email: '', dateOfBirth: '', gender: '', maritalStatus: '' },
    contactInfo: { phone: '', address: '', emergencyContact: { name: '', phone: '', relationship: '' } }, 
    employment: { department: '', position: '', baseSalary: '', employmentType: 'full-time', workSchedule: 'standard', manager: '' },
    // Leave form
    leaveType: 'annual', startDate: '', endDate: '', reason: '',
    // Training form
    title: '', category: 'technical', type: 'online', duration: '', maxParticipants: 20,
    // Performance form
    reviewType: 'annual', 
    reviewPeriod: { startDate: '', endDate: '' }, 
    overallRating: 5,
    goals: [{ description: '', status: 'pending', dueDate: '' }],
    competencies: [{ name: '', rating: 5, comments: '' }],
    // Payroll form
    payPeriod: { startDate: '', endDate: '' }, 
    baseSalary: '', overtime: 0, bonuses: 0, deductions: 0, comments: ''
  });

  useEffect(() => {
    fetchData();
    if (activeTab === 'employees') {
      fetchDepartments();
    }
  }, [activeTab]);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hrm/departments', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setDepartments(response.data || []);
    } catch (error) {
      // Handle error silently
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
        case 'employees':
          if (editingEmployee) {
            endpoint = `http://localhost:5000/api/hrm/employees/${editingEmployee._id}`;
            method = 'put';
          } else {
            endpoint = 'http://localhost:5000/api/hrm/employees';
          }
          data = {
            employeeId: formData.employeeId,
            personalInfo: {
              firstName: formData.personalInfo.firstName,
              lastName: formData.personalInfo.lastName
            },
            contactInfo: {
              email: formData.personalInfo.email,
              phone: formData.contactInfo.phone || ''
            },
            employment: {
              department: formData.employment.department,
              position: formData.employment.position
            },
            compensation: {
              baseSalary: parseFloat(formData.employment.baseSalary) || 0
            }
          };
          break;
        case 'leaves':
          endpoint = 'http://localhost:5000/api/hrm/leaves';
          const days = Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24));
          data = { ...formData, totalDays: days };
          break;
        case 'training':
          endpoint = 'http://localhost:5000/api/hrm/training';
          data = formData;
          break;
        case 'performance':
          endpoint = 'http://localhost:5000/api/hrm/performance';
          data = {
            employee: selectedEmployee?._id,
            reviewType: formData.reviewType,
            reviewPeriod: formData.reviewPeriod,
            overallRating: formData.overallRating,
            comments: formData.comments
          };
          break;
        case 'payroll':
          endpoint = 'http://localhost:5000/api/payroll';
          data = {
            employee: selectedEmployee?._id,
            payPeriod: formData.payPeriod,
            earnings: {
              baseSalary: parseFloat(formData.baseSalary) || 0,
              overtime: parseFloat(formData.overtime) || 0,
              bonuses: parseFloat(formData.bonuses) || 0
            },
            deductions: parseFloat(formData.deductions) || 0
          };
          break;
      }
      
      if (method === 'put') {
        await axios.put(endpoint, data, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
      } else {
        await axios.post(endpoint, data, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
      }
      
      setShowModal(false);
      setShowPerformanceModal(false);
      setShowPayrollModal(false);
      setEditingEmployee(null);
      setSelectedEmployee(null);
      setFormData({
        employeeId: '', 
        personalInfo: { firstName: '', lastName: '', email: '' },
        contactInfo: { phone: '' }, 
        employment: { department: '', position: '', baseSalary: '' },
        leaveType: 'annual', startDate: '', endDate: '', reason: '',
        title: '', category: 'technical', type: 'online', duration: '', maxParticipants: 20,
        reviewType: 'annual', overallRating: 5, 
        reviewPeriod: { startDate: '', endDate: '' },
        baseSalary: '', overtime: 0, bonuses: 0, deductions: 0, 
        payPeriod: { startDate: '', endDate: '' }, comments: ''
      });
      fetchData();
    } catch (err) {
      error('Error: ' + (err.response?.data?.message || 'Failed to submit'));
    }
  };

  const handleApproveLeave = async (leaveId, approved) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/hrm/leaves/${leaveId}/approve`, 
        { approved }, 
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      fetchData();
    } catch (error) {
      // Handle error silently
    }
  };

  const handleConvertToEmployee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/hrm/users/${selectedUser._id}/convert-to-employee`, 
        convertData,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setShowConvertModal(false);
      setConvertData({ employeeId: '', department: '', position: '', baseSalary: '' });
      fetchData();
      success('User converted to employee successfully!');
    } catch (err) {
      error('Error: ' + (err.response?.data?.message || 'Failed to convert user'));
    }
  };

  const handleConvertToUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/hrm/employees/${selectedEmployee._id}/convert-to-user`, 
        convertEmployeeData,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setShowConvertEmployeeModal(false);
      setConvertEmployeeData({ password: '', role: 'employee' });
      setSelectedEmployee(null);
      fetchData();
      success('Employee converted to ERP user successfully!');
    } catch (err) {
      error('Error: ' + (err.response?.data?.message || 'Failed to convert employee'));
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employeeId: employee?.employeeId || '',
      personalInfo: {
        firstName: employee?.personalInfo?.firstName || '',
        lastName: employee?.personalInfo?.lastName || '',
        email: employee?.contactInfo?.email || ''
      },
      contactInfo: {
        phone: employee?.contactInfo?.phone || ''
      },
      employment: {
        department: employee?.employment?.department || '',
        position: employee?.employment?.position || '',
        baseSalary: employee?.compensation?.baseSalary || ''
      }
    });
    setShowModal(true);
  };

  const handleDeleteEmployee = async (id, employeeName) => {
    showConfirm(
      'Delete Employee',
      `Are you sure you want to delete ${employeeName}? This action cannot be undone.`,
      async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/hrm/employees/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          success('Employee deleted successfully');
          fetchData();
        } catch (err) {
          error('Error deleting employee');
        }
      }
    );
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    showConfirm(
      'Bulk Delete',
      `Are you sure you want to delete ${selectedItems.length} selected items? This action cannot be undone.`,
      async () => {
        try {
          const token = localStorage.getItem('token');
          await Promise.all(selectedItems.map(id => 
            axios.delete(`http://localhost:5000/api/hrm/employees/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true
            })
          ));
          success(`${selectedItems.length} items deleted successfully`);
          clearSelection();
          fetchData();
        } catch (err) {
          error('Error deleting items');
        }
      }
    );
  };

  const handleCSVUpload = async (csvData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/hrm/employees/bulk', {
        employees: csvData
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      success(`Successfully imported ${csvData.length} employees`);
      setShowCSVModal(false);
      fetchData();
    } catch (err) {
      error('Error importing employees: ' + (err.response?.data?.message || 'Failed to import'));
    }
  };

  const getCSVTemplate = () => {
    return [
      {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        department: 'IT',
        position: 'Software Developer',
        baseSalary: '75000'
      }
    ];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      switch (activeTab) {
        case 'employees':
          const empRes = await axios.get('http://localhost:5000/api/hrm/employees', { headers, withCredentials: true });
          setEmployees(empRes.data.employees || []);
          break;
        case 'leaves':
          const leaveRes = await axios.get('http://localhost:5000/api/hrm/leaves', { headers, withCredentials: true });
          setLeaves(leaveRes.data || []);
          break;
        case 'training':
          const trainRes = await axios.get('http://localhost:5000/api/hrm/training', { headers, withCredentials: true });
          setTrainings(trainRes.data || []);
          break;
        case 'users':
          const usersRes = await axios.get('http://localhost:5000/api/hrm/users', { headers, withCredentials: true });
          setUsers(usersRes.data.users || []);
          break;
        case 'analytics':
          const analyticsRes = await axios.get('http://localhost:5000/api/hrm/analytics', { headers, withCredentials: true });
          setAnalytics(analyticsRes.data || {});
          break;
        case 'performance':
          const perfRes = await axios.get('http://localhost:5000/api/hrm/performance', { headers, withCredentials: true });
          setPerformances(perfRes.data || []);
          break;
        case 'payroll':
          const payrollRes = await axios.get('http://localhost:5000/api/payroll', { headers, withCredentials: true });
          setPayrolls(payrollRes.data.payrolls || []);
          break;
        case 'departments':
          const deptRes = await axios.get('http://localhost:5000/api/hrm/departments', { headers, withCredentials: true });
          setDepartments(deptRes.data || []);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      error('Failed to load data: ' + (error.response?.data?.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  const renderEmployees = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Employee Management</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {hasRole(['admin', 'manager']) && (
            <Button variant="primary" onClick={() => {
              setEditingEmployee(null);
              setFormData({
                employeeId: '', 
                personalInfo: { firstName: '', lastName: '', email: '' },
                contactInfo: { phone: '' }, 
                employment: { department: '', position: '', baseSalary: '' },
                reviewPeriod: { startDate: '', endDate: '' },
                payPeriod: { startDate: '', endDate: '' }
              });
              setShowModal(true);
            }}>
              Add Employee
            </Button>
          )}
          <Button variant="info" icon="📤" onClick={() => setShowCSVModal(true)}>
            Import CSV
          </Button>
          {selectedItems.length > 0 && (
            <ActionDropdown
              actions={[
                {
                  label: `Edit (${selectedItems.length})`,
                  icon: '✏️',
                  onClick: () => {
                    if (selectedItems.length === 1) {
                      const emp = employees.find(e => e._id === selectedItems[0]);
                      handleEditEmployee(emp);
                    } else {
                      error('Please select only one item to edit');
                    }
                  },
                  className: 'primary',
                  disabled: selectedItems.length !== 1
                },
                {
                  label: `Delete (${selectedItems.length})`,
                  icon: '🗑️',
                  onClick: handleBulkDelete,
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
      
      <SearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e, employees)}
                  />
                </th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Employment Type</th>
                <th>Hire Date</th>
                <th>Status</th>
                <th>User Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.filter(emp => 
                emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(employee => (
                <tr key={employee._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(employee._id)}
                      onChange={(e) => handleSelectItem(e, employee._id)}
                    />
                  </td>
                  <td>{employee.employeeId}</td>
                  <td>{employee.fullName}</td>
                  <td>{employee.employment?.department}</td>
                  <td>{employee.employment?.position}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: employee.employment?.employmentType === 'full-time' ? '#28a745' : '#6c757d',
                      color: 'white'
                    }}>
                      {employee.employment?.employmentType}
                    </span>
                  </td>
                  <td>{new Date(employee.employment?.hireDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: employee.status === 'active' ? '#28a745' : '#dc3545',
                      color: 'white'
                    }}>
                      {employee.status}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: employee.userId ? '#28a745' : '#6c757d',
                      color: 'white'
                    }}>
                      {employee.userId ? 'Has ERP Access' : 'No ERP Access'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderLeaves = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Leave Management</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Apply Leave
          </button>
          {selectedItems.length > 0 && hasRole(['admin', 'manager']) && (
            <ActionDropdown
              actions={[
                {
                  label: `Approve (${selectedItems.length})`,
                  icon: '✅',
                  onClick: () => {
                    selectedItems.forEach(id => handleApproveLeave(id, true));
                    clearSelection();
                  },
                  className: 'success'
                },
                {
                  label: `Reject (${selectedItems.length})`,
                  icon: '❌',
                  onClick: () => {
                    selectedItems.forEach(id => handleApproveLeave(id, false));
                    clearSelection();
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
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e, leaves)}
                  />
                </th>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Status</th>
                <th>Applied Date</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(leave._id)}
                      onChange={(e) => handleSelectItem(e, leave._id)}
                    />
                  </td>
                  <td>{leave.employee?.personalInfo?.firstName} {leave.employee?.personalInfo?.lastName}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: '#17a2b8', color: 'white'
                    }}>
                      {leave.leaveType}
                    </span>
                  </td>
                  <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                  <td>{leave.totalDays}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: leave.status === 'approved' ? '#28a745' : 
                                     leave.status === 'rejected' ? '#dc3545' : '#ffc107',
                      color: 'white'
                    }}>
                      {leave.status}
                    </span>
                  </td>
                  <td>{new Date(leave.appliedDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderTraining = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Training & Development</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {hasRole(['admin', 'manager']) && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Create Training
            </button>
          )}
          {selectedItems.length > 0 && (
            <ActionDropdown
              actions={[
                {
                  label: `Enroll (${selectedItems.length})`,
                  icon: '🎓',
                  onClick: () => {
                    success(`Enrolled in ${selectedItems.length} training(s)`);
                    clearSelection();
                  },
                  className: 'primary'
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
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e, trainings)}
                  />
                </th>
                <th>Training Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Start Date</th>
                <th>Participants</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map(training => (
                <tr key={training._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(training._id)}
                      onChange={(e) => handleSelectItem(e, training._id)}
                    />
                  </td>
                  <td>{training.title}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: '#6f42c1', color: 'white'
                    }}>
                      {training.category}
                    </span>
                  </td>
                  <td>{training.type}</td>
                  <td>{training.duration}h</td>
                  <td>{new Date(training.startDate).toLocaleDateString()}</td>
                  <td>{training.participants?.length || 0}/{training.maxParticipants}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: training.status === 'active' ? '#28a745' : '#6c757d',
                      color: 'white'
                    }}>
                      {training.status}
                    </span>
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
    
    const departmentData = analytics.departmentStats?.map(dept => ({
      name: dept._id,
      employees: dept.count,
      avgSalary: dept.avgSalary || 0
    })) || [];
    
    const leaveData = analytics.leaveStats?.map(leave => ({
      name: leave._id,
      count: leave.count
    })) || [];
    
    const trainingData = analytics.trainingStats?.map(training => ({
      name: training._id,
      count: training.count
    })) || [];
    
    return (
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          👥 HRM Analytics Dashboard
        </h3>
        
        <div className="grid-stats" style={{ marginBottom: '30px' }}>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>👥</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Employees</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>{analytics.totalEmployees || 0}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📋</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Pending Leaves</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.leaveStats?.find(s => s._id === 'pending')?.count || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>🎓</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Active Trainings</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.trainingStats?.find(s => s._id === 'active')?.count || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>🏢</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Departments</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.departmentStats?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📊 Department Distribution
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="employees" fill="#3498db" name="Employees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              🥧 Leave Status Distribution
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaveData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {leaveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📈 Training Programs
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2ecc71" name="Programs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              💰 Average Salary by Department
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Avg Salary']} />
                <Legend />
                <Line type="monotone" dataKey="avgSalary" stroke="#e74c3c" strokeWidth={3} name="Avg Salary" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformance = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Performance Reviews</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {hasRole(['admin', 'manager']) && (
            <button className="btn btn-primary" onClick={() => {
              setShowPerformanceModal(true);
              setFormData({...formData, reviewType: 'annual', overallRating: 5, reviewPeriod: { startDate: '', endDate: '' }});
            }}>
              Create Performance Review
            </button>
          )}
          {selectedItems.length > 0 && (
            <ActionDropdown
              actions={[
                {
                  label: `View (${selectedItems.length})`,
                  icon: '👁️',
                  onClick: () => {
                    success(`Viewing ${selectedItems.length} review(s)`);
                    clearSelection();
                  },
                  className: 'primary'
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
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e, performances)}
                  />
                </th>
                <th>Employee</th>
                <th>Review Type</th>
                <th>Period</th>
                <th>Overall Rating</th>
                <th>Status</th>
                <th>Reviewer</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(performances || []).map(perf => (
                <tr key={perf._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(perf._id)}
                      onChange={(e) => handleSelectItem(e, perf._id)}
                    />
                  </td>
                  <td>{perf.employee?.personalInfo?.firstName} {perf.employee?.personalInfo?.lastName}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: '#17a2b8', color: 'white'
                    }}>
                      {perf.reviewType}
                    </span>
                  </td>
                  <td>{perf.reviewPeriod?.startDate ? new Date(perf.reviewPeriod.startDate).toLocaleDateString() : 'N/A'} - {perf.reviewPeriod?.endDate ? new Date(perf.reviewPeriod.endDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: perf.overallRating >= 4 ? '#28a745' : perf.overallRating >= 3 ? '#ffc107' : '#dc3545',
                      color: 'white'
                    }}>
                      {perf.overallRating}/5
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: perf.status === 'completed' ? '#28a745' : '#ffc107',
                      color: 'white'
                    }}>
                      {perf.status}
                    </span>
                  </td>
                  <td>{perf.reviewer?.personalInfo?.firstName} {perf.reviewer?.personalInfo?.lastName}</td>
                  <td>{new Date(perf.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderPayroll = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Payroll Management</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {hasRole(['admin', 'manager']) && (
            <button className="btn btn-primary" onClick={() => {
              setShowPayrollModal(true);
              setFormData({...formData, baseSalary: '', overtime: 0, bonuses: 0, deductions: 0, payPeriod: { startDate: '', endDate: '' }});
            }}>
              Process Payroll
            </button>
          )}
          {selectedItems.length > 0 && (
            <ActionDropdown
              actions={[
                {
                  label: `Download PDF (${selectedItems.length})`,
                  icon: '📥',
                  onClick: () => {
                    success(`Downloading ${selectedItems.length} payslip(s)`);
                    clearSelection();
                  },
                  className: 'primary'
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
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e, payrolls)}
                  />
                </th>
                <th>Employee</th>
                <th>Pay Period</th>
                <th>Base Salary</th>
                <th>Overtime</th>
                <th>Bonuses</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(payrolls || []).map(payroll => (
                <tr key={payroll._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(payroll._id)}
                      onChange={(e) => handleSelectItem(e, payroll._id)}
                    />
                  </td>
                  <td>{payroll.employee?.personalInfo?.firstName} {payroll.employee?.personalInfo?.lastName}</td>
                  <td>{payroll.payPeriod?.startDate ? new Date(payroll.payPeriod.startDate).toLocaleDateString() : 'N/A'} - {payroll.payPeriod?.endDate ? new Date(payroll.payPeriod.endDate).toLocaleDateString() : 'N/A'}</td>
                  <td>${payroll.earnings?.baseSalary?.toLocaleString()}</td>
                  <td>${payroll.earnings?.overtime?.toLocaleString()}</td>
                  <td>${payroll.earnings?.bonuses?.toLocaleString()}</td>
                  <td>${payroll.totalDeductions?.toLocaleString()}</td>
                  <td>
                    <strong style={{ color: '#28a745' }}>${payroll.netPay?.toLocaleString()}</strong>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: payroll.status === 'paid' ? '#28a745' : '#ffc107',
                      color: 'white'
                    }}>
                      {payroll.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderDepartments = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Department Management</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {hasRole(['admin']) && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Add Department
            </button>
          )}
          {selectedItems.length > 0 && hasRole(['admin']) && (
            <ActionDropdown
              actions={[
                {
                  label: `Edit (${selectedItems.length})`,
                  icon: '✏️',
                  onClick: () => {
                    if (selectedItems.length === 1) {
                      success(`Editing department`);
                    } else {
                      error('Please select only one department to edit');
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
                      'Delete Departments',
                      `Are you sure you want to delete ${selectedItems.length} department(s)?`,
                      async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await Promise.all(selectedItems.map(id => 
                            axios.delete(`http://localhost:5000/api/hrm/departments/${id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                              withCredentials: true
                            })
                          ));
                          success('Departments deleted successfully');
                          clearSelection();
                          fetchData();
                        } catch (err) {
                          error('Error deleting departments: ' + (err.response?.data?.message || 'Failed to delete departments'));
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
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e, departments)}
                  />
                </th>
                <th>Department Name</th>
                <th>Code</th>
                <th>Manager</th>
                <th>Employees</th>
                <th>Budget</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(dept._id)}
                      onChange={(e) => handleSelectItem(e, dept._id)}
                    />
                  </td>
                  <td>{dept.name}</td>
                  <td>{dept.code}</td>
                  <td>{dept.manager?.personalInfo?.firstName} {dept.manager?.personalInfo?.lastName}</td>
                  <td>{dept.employeeCount || 0}</td>
                  <td>${dept.budget?.toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: dept.status === 'active' ? '#28a745' : '#dc3545',
                      color: 'white'
                    }}>
                      {dept.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0 }}>ERP Users</h3>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Manage ERP system users and convert them to employees</p>
        </div>
        {selectedItems.length > 0 && (
          <ActionDropdown
            actions={[
              {
                label: `Convert to Employee (${selectedItems.length})`,
                icon: '👥',
                onClick: () => {
                  if (selectedItems.length === 1) {
                    const user = users.find(u => u._id === selectedItems[0]);
                    setSelectedUser(user);
                    setShowConvertModal(true);
                  } else {
                    error('Please select only one user to convert');
                  }
                },
                className: 'success',
                disabled: selectedItems.length !== 1
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
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e, users)}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(user._id)}
                      onChange={(e) => handleSelectItem(e, user._id)}
                    />
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: user.role === 'manager' ? '#17a2b8' : '#6c757d',
                      color: 'white'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: user.isActive ? '#28a745' : '#dc3545',
                      color: 'white'
                    }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container">
      <h1 className="page-title">Human Resource Management</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'employees' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('employees')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          👥 Employees
        </button>
        <button 
          className={`btn ${activeTab === 'leaves' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('leaves')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          📋 Leave Management
        </button>
        <button 
          className={`btn ${activeTab === 'training' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('training')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🎓 Training
        </button>
        {hasRole(['admin', 'manager']) && (
          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('users')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            👤 ERP Users
          </button>
        )}
        {hasRole(['admin', 'manager']) && (
          <button 
            className={`btn ${activeTab === 'performance' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('performance')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            ⭐ Performance
          </button>
        )}
        {hasRole(['admin', 'manager']) && (
          <button 
            className={`btn ${activeTab === 'payroll' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('payroll')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            💰 Payroll
          </button>
        )}
        {hasRole(['admin', 'manager']) && (
          <button 
            className={`btn ${activeTab === 'departments' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('departments')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            🏢 Departments
          </button>
        )}
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

      {activeTab === 'employees' && renderEmployees()}
      {activeTab === 'leaves' && renderLeaves()}
      {activeTab === 'training' && renderTraining()}
      {activeTab === 'performance' && renderPerformance()}
      {activeTab === 'payroll' && renderPayroll()}
      {activeTab === 'departments' && renderDepartments()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'analytics' && renderAnalytics()}
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={
        activeTab === 'employees' ? (editingEmployee ? 'Edit Employee' : 'Add Employee') :
        activeTab === 'leaves' ? 'Apply Leave' :
        activeTab === 'training' ? 'Create Training' : 'Form'
      }>
        <form onSubmit={handleSubmit}>
          {activeTab === 'employees' && (
            <>
              <div className="form-group">
                <label>Employee ID:</label>
                <input type="text" value={formData.employeeId} 
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name:</label>
                  <input type="text" value={formData.personalInfo.firstName} 
                    onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, firstName: e.target.value}})} required />
                </div>
                <div className="form-group">
                  <label>Last Name:</label>
                  <input type="text" value={formData.personalInfo.lastName} 
                    onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, lastName: e.target.value}})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" value={formData.personalInfo.email} 
                    onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, email: e.target.value}})} required />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input type="tel" value={formData.contactInfo?.phone || ''} 
                    onChange={(e) => setFormData({...formData, contactInfo: {phone: e.target.value}})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Department:</label>
                  <input type="text" value={formData.employment.department} 
                    onChange={(e) => setFormData({...formData, employment: {...formData.employment, department: e.target.value}})} required />
                </div>
                <div className="form-group">
                  <label>Position:</label>
                  <input type="text" value={formData.employment.position} 
                    onChange={(e) => setFormData({...formData, employment: {...formData.employment, position: e.target.value}})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Base Salary:</label>
                <input type="number" value={formData.employment.baseSalary} 
                  onChange={(e) => setFormData({...formData, employment: {...formData.employment, baseSalary: e.target.value}})} required />
              </div>
            </>
          )}
          
          {activeTab === 'leaves' && (
            <>
              <div className="form-group">
                <label>Leave Type:</label>
                <select value={formData.leaveType} 
                  onChange={(e) => setFormData({...formData, leaveType: e.target.value})}>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                </select>
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
                <label>Reason:</label>
                <textarea value={formData.reason} 
                  onChange={(e) => setFormData({...formData, reason: e.target.value})} required />
              </div>
            </>
          )}
          
          {activeTab === 'training' && (
            <>
              <div className="form-group">
                <label>Training Title:</label>
                <input type="text" value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category:</label>
                  <select value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option value="technical">Technical</option>
                    <option value="soft-skills">Soft Skills</option>
                    <option value="compliance">Compliance</option>
                    <option value="leadership">Leadership</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type:</label>
                  <select value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="online">Online</option>
                    <option value="classroom">Classroom</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Duration (hours):</label>
                <input type="number" value={formData.duration} 
                  onChange={(e) => setFormData({...formData, duration: e.target.value})} required />
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
          
          <button type="submit" className="btn btn-success">
            {activeTab === 'employees' ? (editingEmployee ? 'Update Employee' : 'Add Employee') :
             activeTab === 'leaves' ? 'Apply Leave' :
             activeTab === 'training' ? 'Create Training' : 'Submit'}
          </button>
        </form>
      </Modal>
      
      <Modal isOpen={showPerformanceModal} onClose={() => setShowPerformanceModal(false)} title="Create Performance Review">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Employee:</label>
            <select 
              value={selectedEmployee?._id || ''} 
              onChange={(e) => {
                const emp = employees.find(emp => emp._id === e.target.value);
                setSelectedEmployee(emp);
              }}
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.personalInfo?.firstName} {emp.personalInfo?.lastName} - {emp.employeeId}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Review Type:</label>
              <select value={formData.reviewType} 
                onChange={(e) => setFormData({...formData, reviewType: e.target.value})}>
                <option value="annual">Annual Review</option>
                <option value="quarterly">Quarterly Review</option>
                <option value="probation">Probation Review</option>
                <option value="promotion">Promotion Review</option>
              </select>
            </div>
            <div className="form-group">
              <label>Overall Rating (1-5):</label>
              <input type="number" min="1" max="5" value={formData.overallRating} 
                onChange={(e) => setFormData({...formData, overallRating: parseInt(e.target.value)})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Review Period Start:</label>
              <input type="date" value={formData.reviewPeriod?.startDate || ''} 
                onChange={(e) => setFormData({...formData, reviewPeriod: {...(formData.reviewPeriod || {}), startDate: e.target.value}})} required />
            </div>
            <div className="form-group">
              <label>Review Period End:</label>
              <input type="date" value={formData.reviewPeriod?.endDate || ''} 
                onChange={(e) => setFormData({...formData, reviewPeriod: {...(formData.reviewPeriod || {}), endDate: e.target.value}})} required />
            </div>
          </div>
          <div className="form-group">
            <label>Comments:</label>
            <textarea value={formData.comments || ''} 
              onChange={(e) => setFormData({...formData, comments: e.target.value})} 
              placeholder="Overall performance comments..." />
          </div>
          <button type="submit" className="btn btn-success">
            Create Performance Review
          </button>
        </form>
      </Modal>
      
      <Modal isOpen={showPayrollModal} onClose={() => setShowPayrollModal(false)} title="Process Payroll">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Employee:</label>
            <select 
              value={selectedEmployee?._id || ''} 
              onChange={(e) => {
                const emp = employees.find(emp => emp._id === e.target.value);
                setSelectedEmployee(emp);
                setFormData({...formData, baseSalary: emp?.compensation?.baseSalary || ''});
              }}
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.personalInfo?.firstName} {emp.personalInfo?.lastName} - {emp.employeeId}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Pay Period Start:</label>
              <input type="date" value={formData.payPeriod?.startDate || ''} 
                onChange={(e) => setFormData({...formData, payPeriod: {...(formData.payPeriod || {}), startDate: e.target.value}})} required />
            </div>
            <div className="form-group">
              <label>Pay Period End:</label>
              <input type="date" value={formData.payPeriod?.endDate || ''} 
                onChange={(e) => setFormData({...formData, payPeriod: {...(formData.payPeriod || {}), endDate: e.target.value}})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Base Salary:</label>
              <input type="number" step="0.01" value={formData.baseSalary} 
                onChange={(e) => setFormData({...formData, baseSalary: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Overtime Pay:</label>
              <input type="number" step="0.01" value={formData.overtime} 
                onChange={(e) => setFormData({...formData, overtime: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Bonuses:</label>
              <input type="number" step="0.01" value={formData.bonuses} 
                onChange={(e) => setFormData({...formData, bonuses: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Deductions:</label>
              <input type="number" step="0.01" value={formData.deductions} 
                onChange={(e) => setFormData({...formData, deductions: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn btn-success">
            Process Payroll
          </button>
        </form>
      </Modal>
      
      <Modal isOpen={showConvertModal} onClose={() => setShowConvertModal(false)} title="Convert User to Employee">
        <form onSubmit={handleConvertToEmployee}>
          {selectedUser && (
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>Converting User:</strong> {selectedUser.name} ({selectedUser.email})
            </div>
          )}
          <div className="form-group">
            <label>Employee ID:</label>
            <input 
              type="text" 
              value={convertData.employeeId} 
              onChange={(e) => setConvertData({...convertData, employeeId: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Department:</label>
            <input 
              type="text" 
              value={convertData.department} 
              onChange={(e) => setConvertData({...convertData, department: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Position:</label>
            <input 
              type="text" 
              value={convertData.position} 
              onChange={(e) => setConvertData({...convertData, position: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Base Salary:</label>
            <input 
              type="number" 
              value={convertData.baseSalary} 
              onChange={(e) => setConvertData({...convertData, baseSalary: e.target.value})} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-success">
            Convert to Employee
          </button>
        </form>
      </Modal>
      
      <Modal isOpen={showConvertEmployeeModal} onClose={() => setShowConvertEmployeeModal(false)} title="Convert Employee to ERP User">
        <form onSubmit={handleConvertToUser}>
          {selectedEmployee && (
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>Converting Employee:</strong> {selectedEmployee.fullName} ({selectedEmployee.contactInfo?.email})
            </div>
          )}
          <div className="form-group">
            <label>{"Password:"}:</label>
            <input 
              type="password" 
              value={convertEmployeeData.password} 
              onChange={(e) => setConvertEmployeeData({...convertEmployeeData, password: e.target.value})} 
              required 
              minLength="6"
              placeholder="Enter password for ERP access"
            />
          </div>
          <div className="form-group">
            <label>{"Role:"}:</label>
            <select 
              value={convertEmployeeData.role} 
              onChange={(e) => setConvertEmployeeData({...convertEmployeeData, role: e.target.value})}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success">
            Convert to ERP User
          </button>
        </form>
      </Modal>
      
      <CSVUpload
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onUpload={handleCSVUpload}
        templateData={getCSVTemplate()}
        title="Import Employees"
        description="Upload a CSV file to bulk import employees. Download the template to see the required format."
      />
    </div>
  );
};

export default HRM;