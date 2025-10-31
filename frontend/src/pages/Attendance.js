import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ActionDropdown from '../components/ActionDropdown';
import useBulkActions from '../hooks/useBulkActions';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Attendance = () => {
  const { hasRole } = useAuth();
  const { success, error, showConfirm } = useToast();
  const { selectedItems, selectAll, handleSelectAll, handleSelectItem, clearSelection } = useBulkActions();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [activeTab, setActiveTab] = useState('attendance');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendance();
      fetchEmployees();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, selectedDate]);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/attendance?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(response.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hrm/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data.employees || response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/attendance/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/checkin', 
        { employeeId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Check-in successful!');
      fetchAttendance();
      setEmployeeId('');
    } catch (error) {
      alert(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/checkout', 
        { employeeId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Check-out successful!');
      fetchAttendance();
      setEmployeeId('');
    } catch (error) {
      alert(error.response?.data?.message || 'Check-out failed');
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const formatHours = (hours) => {
    return hours ? `${hours.toFixed(2)} hrs` : '-';
  };

  const renderAttendance = () => (
    <div>
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          ⏱️ Quick Check-in/Check-out
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>Employee ID:</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter Employee ID"
            />
          </div>
          <button className="btn btn-success" style={{marginTop: '24px'}} onClick={handleCheckIn}>
            ✅ Check In
          </button>
          <button className="btn btn-primary" style={{marginTop: '24px'}} onClick={handleCheckOut}>
            ⏹️ Check Out
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            📅 Attendance Records
          </h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
              <label>Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            {selectedItems.length > 0 && hasRole(['admin', 'manager']) && (
              <ActionDropdown
                actions={[
                  {
                    label: `Export (${selectedItems.length})`,
                    icon: '📥',
                    onClick: () => {
                      success(`Exporting ${selectedItems.length} attendance record(s)`);
                      clearSelection();
                    },
                    className: 'primary'
                  },
                  {
                    label: `Mark Present (${selectedItems.length})`,
                    icon: '✅',
                    onClick: () => {
                      success(`Marked ${selectedItems.length} record(s) as present`);
                      clearSelection();
                    },
                    className: 'success'
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

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e, attendance)}
                  />
                </th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(record => (
                <tr key={record._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(record._id)}
                      onChange={(e) => handleSelectItem(e, record._id)}
                    />
                  </td>
                  <td>{record.employee?.employeeId}</td>
                  <td>{record.employee?.name}</td>
                  <td>{formatTime(record.checkIn)}</td>
                  <td>{record.checkOut ? formatTime(record.checkOut) : 'Not checked out'}</td>
                  <td>{formatHours(record.workingHours)}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      backgroundColor: record.status === 'present' ? '#2ecc71' : 
                                     record.status === 'late' ? '#f39c12' : '#e74c3c',
                      color: 'white'
                    }}>
                      {record.status === 'present' ? '✅' : record.status === 'late' ? '⏰' : '❌'} {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {attendance.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', margin: '20px 0' }}>
            No attendance records found for {selectedDate}
          </p>
        )}
      </div>

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          📊 Daily Summary
        </h3>
        <div className="grid-stats">
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>✅</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Present Today</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {attendance.filter(r => r.status === 'present').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>⏰</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Late Today</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {attendance.filter(r => r.status === 'late').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>👥</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Employees</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {employees.length}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📈</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Attendance Rate</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {employees.length > 0 ? Math.round((attendance.length / employees.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderAnalytics = () => {
    const COLORS = ['#2ecc71', '#f39c12', '#e74c3c', '#3498db', '#9b59b6'];
    
    const statusData = analytics.statusStats?.map(status => ({
      name: status._id,
      count: status.count
    })) || [];
    
    const dailyData = analytics.dailyStats?.map(day => ({
      date: day._id,
      present: day.present || 0,
      late: day.late || 0,
      absent: day.absent || 0
    })) || [];
    
    const departmentData = analytics.departmentStats?.map(dept => ({
      name: dept._id,
      avgHours: dept.avgWorkingHours || 0,
      attendanceRate: dept.attendanceRate || 0
    })) || [];
    
    return (
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          📊 Attendance Analytics Dashboard
        </h3>
        
        <div className="grid-stats" style={{ marginBottom: '30px' }}>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📅</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Records</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>{analytics.totalRecords || 0}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>⏱️</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Avg Working Hours</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>{(analytics.avgWorkingHours || 0).toFixed(1)}h</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📈</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Overall Rate</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>{(analytics.overallAttendanceRate || 0).toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>⏰</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Late Arrivals</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>{analytics.totalLateArrivals || 0}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              🥧 Attendance Status Distribution
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
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📈 Daily Attendance Trends
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#2ecc71" strokeWidth={2} name="Present" />
                <Line type="monotone" dataKey="late" stroke="#f39c12" strokeWidth={2} name="Late" />
                <Line type="monotone" dataKey="absent" stroke="#e74c3c" strokeWidth={2} name="Absent" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              🏢 Department Performance
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendanceRate" fill="#3498db" name="Attendance Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              ⏱️ Average Working Hours by Department
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgHours" fill="#2ecc71" name="Avg Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Attendance Management</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('attendance')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          📅 Attendance
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

      {activeTab === 'attendance' && renderAttendance()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
};

export default Attendance;