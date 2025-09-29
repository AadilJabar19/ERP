import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import Modal from '../components/Modal';

const HRM = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState({});
  const [formData, setFormData] = useState({
    // Employee form
    employeeId: '', personalInfo: { firstName: '', lastName: '', email: '' },
    contactInfo: { phone: '' }, employment: { department: '', position: '', baseSalary: '' },
    // Leave form
    leaveType: 'annual', startDate: '', endDate: '', reason: '',
    // Training form
    title: '', category: 'technical', type: 'online', duration: '', startDate: '', endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let data = {};
      
      switch (activeTab) {
        case 'employees':
          endpoint = 'http://localhost:5000/api/hrm/employees';
          data = {
            employeeId: formData.employeeId,
            personalInfo: {
              firstName: formData.personalInfo.firstName,
              lastName: formData.personalInfo.lastName
            },
            contactInfo: {
              email: formData.personalInfo.email,
              phone: formData.contactInfo.phone
            },
            employment: {
              department: formData.employment.department,
              position: formData.employment.position
            },
            compensation: {
              baseSalary: parseFloat(formData.employment.baseSalary)
            }
          };
          console.log('Sending employee data:', data);
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
      }
      
      await axios.post(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowModal(false);
      setFormData({
        employeeId: '', personalInfo: { firstName: '', lastName: '', email: '' },
        contactInfo: { phone: '' }, employment: { department: '', position: '', baseSalary: '' },
        leaveType: 'annual', startDate: '', endDate: '', reason: '',
        title: '', category: 'technical', type: 'online', duration: '', startDate: '', endDate: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to submit'));
    }
  };

  const handleApproveLeave = async (leaveId, approved) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/hrm/leaves/${leaveId}/approve`, 
        { approved }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error('Error updating leave:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      switch (activeTab) {
        case 'employees':
          const empRes = await axios.get('http://localhost:5000/api/hrm/employees', { headers });
          setEmployees(empRes.data.employees);
          break;
        case 'leaves':
          const leaveRes = await axios.get('http://localhost:5000/api/hrm/leaves', { headers });
          setLeaves(leaveRes.data);
          break;
        case 'training':
          const trainRes = await axios.get('http://localhost:5000/api/hrm/training', { headers });
          setTrainings(trainRes.data);
          break;
        case 'analytics':
          const analyticsRes = await axios.get('http://localhost:5000/api/hrm/analytics', { headers });
          setAnalytics(analyticsRes.data);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmployees = () => (
    <div className="card">
      <h3>Employee Management</h3>
      {hasRole(['admin', 'manager']) && (
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Employee
        </button>
      )}
      
      <SearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Employment Type</th>
                <th>Hire Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.filter(emp => 
                emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(employee => (
                <tr key={employee._id}>
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

  const renderLeaves = () => (
    <div className="card">
      <h3>Leave Management</h3>
      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        Apply Leave
      </button>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave._id}>
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
                  <td>
                    {hasRole(['admin', 'manager']) && leave.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-sm btn-success" 
                          style={{ marginRight: '5px' }}
                          onClick={() => handleApproveLeave(leave._id, true)}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleApproveLeave(leave._id, false)}
                        >
                          Reject
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

  const renderTraining = () => (
    <div className="card">
      <h3>Training & Development</h3>
      {hasRole(['admin', 'manager']) && (
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Training
        </button>
      )}
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Training Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Start Date</th>
                <th>Participants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map(training => (
                <tr key={training._id}>
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
                  <td>
                    <button className="btn btn-sm btn-primary">Enroll</button>
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
      <h3>HRM Analytics</h3>
      <div className="grid-stats">
        <div className="card" style={{ margin: 0 }}>
          <h4>Total Employees</h4>
          <p style={{ fontSize: '2rem', color: '#3498db' }}>{analytics.totalEmployees || 0}</p>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <h4>Pending Leaves</h4>
          <p style={{ fontSize: '2rem', color: '#ffc107' }}>
            {analytics.leaveStats?.find(s => s._id === 'pending')?.count || 0}
          </p>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <h4>Active Trainings</h4>
          <p style={{ fontSize: '2rem', color: '#28a745' }}>
            {analytics.trainingStats?.find(s => s._id === 'active')?.count || 0}
          </p>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <h4>Departments</h4>
          <p style={{ fontSize: '2rem', color: '#6f42c1' }}>
            {analytics.departmentStats?.length || 0}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <h1 className="page-title">Human Resource Management</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'employees' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('employees')}
          style={{ marginRight: '10px' }}
        >
          Employees
        </button>
        <button 
          className={`btn ${activeTab === 'leaves' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('leaves')}
          style={{ marginRight: '10px' }}
        >
          Leave Management
        </button>
        <button 
          className={`btn ${activeTab === 'training' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('training')}
          style={{ marginRight: '10px' }}
        >
          Training
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

      {activeTab === 'employees' && renderEmployees()}
      {activeTab === 'leaves' && renderLeaves()}
      {activeTab === 'training' && renderTraining()}
      {activeTab === 'analytics' && renderAnalytics()}
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={
        activeTab === 'employees' ? 'Add Employee' :
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
            {activeTab === 'employees' ? 'Add Employee' :
             activeTab === 'leaves' ? 'Apply Leave' :
             activeTab === 'training' ? 'Create Training' : 'Submit'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default HRM;