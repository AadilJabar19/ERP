import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import BulkActions from '../components/BulkActions';
import CSVUpload from '../components/CSVUpload';
import { Button } from '../components/ui';
import useBulkActions from '../hooks/useBulkActions';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/pages/AttendanceSystem.scss';

const AttendanceSystem = () => {
  const { hasRole, user } = useAuth();
  const [activeTab, setActiveTab] = useState('records');
  
  // Bulk actions hook
  const recordsBulk = useBulkActions();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCSVModal, setShowCSVModal] = useState(false);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      switch (activeTab) {
        case 'records':
          const recordsRes = await axios.get('http://localhost:5000/api/attendance', { headers });
          setAttendanceRecords(recordsRes.data || []);
          break;
        case 'employees':
          const empRes = await axios.get('http://localhost:5000/api/hrm/employees', { headers });
          setEmployees(empRes.data.employees || []);
          break;
        case 'analytics':
          const analyticsRes = await axios.get('http://localhost:5000/api/attendance/analytics', { headers });
          setAnalytics(analyticsRes.data);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/checkin', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Checked in successfully!');
      fetchData();
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to check in'));
    }
  };

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/checkout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Checked out successfully!');
      fetchData();
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to check out'));
    }
  };

  const getTodayAttendance = () => {
    const today = new Date().toDateString();
    return attendanceRecords.find(record => 
      new Date(record.date).toDateString() === today && 
      record.employee._id === user._id
    );
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut) - new Date(checkIn);
    return (diff / (1000 * 60 * 60)).toFixed(2);
  };

  const getAttendanceStatus = (record) => {
    if (!record.checkIn) return 'absent';
    if (!record.checkOut) return 'present';
    
    const checkInTime = new Date(record.checkIn);
    const standardStart = new Date(record.checkIn);
    standardStart.setHours(9, 0, 0, 0);
    
    if (checkInTime > standardStart) return 'late';
    return 'on-time';
  };

  const handleCSVUpload = async (csvData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/bulk', {
        records: csvData
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert(`Successfully imported ${csvData.length} attendance records`);
      setShowCSVModal(false);
      fetchData();
    } catch (error) {
      console.error('Error importing attendance records:', error);
      alert('Error importing records: ' + (error.response?.data?.message || 'Failed to import'));
    }
  };

  const getCSVTemplate = () => {
    return [{
      employeeId: 'EMP001',
      date: '2024-01-15',
      checkIn: '09:00',
      checkOut: '17:00',
      location: 'Office'
    }];
  };

  const renderQuickActions = () => {
    const todayRecord = getTodayAttendance();
    
    return (
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>⏰ Quick Actions</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {currentTime.toLocaleTimeString()}
          </div>
          <div style={{ color: '#666' }}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {!todayRecord?.checkIn ? (
            <button className="btn btn-success" onClick={handleCheckIn}>
              ✅ Check In
            </button>
          ) : !todayRecord?.checkOut ? (
            <button className="btn btn-danger" onClick={handleCheckOut}>
              🚪 Check Out
            </button>
          ) : (
            <div style={{ padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px', color: '#155724' }}>
              ✅ You have completed your work day
            </div>
          )}
        </div>
        
        {todayRecord && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h4>Today's Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div>
                <strong>Check In:</strong><br />
                {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : 'Not checked in'}
              </div>
              <div>
                <strong>Check Out:</strong><br />
                {todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : 'Not checked out'}
              </div>
              <div>
                <strong>Working Hours:</strong><br />
                {calculateWorkingHours(todayRecord.checkIn, todayRecord.checkOut)} hours
              </div>
              <div>
                <strong>Status:</strong><br />
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  backgroundColor: 
                    getAttendanceStatus(todayRecord) === 'on-time' ? '#28a745' :
                    getAttendanceStatus(todayRecord) === 'late' ? '#ffc107' :
                    getAttendanceStatus(todayRecord) === 'present' ? '#17a2b8' : '#dc3545',
                  color: 'white'
                }}>
                  {getAttendanceStatus(todayRecord)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAttendanceRecords = () => (
    <div className="card">
      <h3>📋 Attendance Records</h3>
      
      <div className="attendance-filters">
        <div className="filter-row">
          <SearchFilter 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            placeholder="Search by employee name..."
          />
          
          <input 
            type="date" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="date-filter"
          />
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="on-time">On Time</option>
          </select>
        </div>
        
        <div className="action-row">
          {recordsBulk.selectedItems.length > 0 && (
            <BulkActions
              selectedCount={recordsBulk.selectedItems.length}
              onBulkDelete={() => recordsBulk.handleBulkDelete('records', 'http://localhost:5000/api/attendance', fetchData)}
              onClearSelection={recordsBulk.clearSelection}
            />
          )}
          <Button 
            variant="info" 
            icon="📤" 
            onClick={() => setShowCSVModal(true)}
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
                    checked={recordsBulk.isAllSelected(attendanceRecords)}
                    onChange={(e) => recordsBulk.handleSelectAll(e, attendanceRecords)}
                  />
                </th>
                <th>Date</th>
                <th>Employee</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords
                .filter(record => {
                  const matchesSearch = record.employee?.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      record.employee?.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesDate = !dateFilter || new Date(record.date).toDateString() === new Date(dateFilter).toDateString();
                  const matchesStatus = !statusFilter || getAttendanceStatus(record) === statusFilter;
                  return matchesSearch && matchesDate && matchesStatus;
                })
                .map(record => (
                <tr key={record._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={recordsBulk.selectedItems.includes(record._id)}
                      onChange={(e) => recordsBulk.handleSelectItem(e, record._id)}
                    />
                  </td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.employee?.personalInfo?.firstName} {record.employee?.personalInfo?.lastName}</td>
                  <td>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</td>
                  <td>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</td>
                  <td>{calculateWorkingHours(record.checkIn, record.checkOut)} hours</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      backgroundColor: 
                        getAttendanceStatus(record) === 'on-time' ? '#28a745' :
                        getAttendanceStatus(record) === 'late' ? '#ffc107' :
                        getAttendanceStatus(record) === 'present' ? '#17a2b8' : '#dc3545',
                      color: 'white'
                    }}>
                      {getAttendanceStatus(record)}
                    </span>
                  </td>
                  <td>{record.location || 'Office'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderEmployeeAttendance = () => (
    <div className="card">
      <h3>👥 Employee Attendance Summary</h3>
      
      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Present Days</th>
                <th>Absent Days</th>
                <th>Late Days</th>
                <th>Avg Working Hours</th>
                <th>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => {
                const employeeRecords = attendanceRecords.filter(r => r.employee._id === employee._id);
                const presentDays = employeeRecords.filter(r => r.checkIn).length;
                const absentDays = employeeRecords.filter(r => !r.checkIn).length;
                const lateDays = employeeRecords.filter(r => getAttendanceStatus(r) === 'late').length;
                const totalHours = employeeRecords.reduce((sum, r) => sum + parseFloat(calculateWorkingHours(r.checkIn, r.checkOut) || 0), 0);
                const avgHours = employeeRecords.length > 0 ? (totalHours / employeeRecords.length).toFixed(2) : 0;
                const attendanceRate = employeeRecords.length > 0 ? ((presentDays / employeeRecords.length) * 100).toFixed(1) : 0;
                
                return (
                  <tr key={employee._id}>
                    <td>{employee.personalInfo?.firstName} {employee.personalInfo?.lastName}</td>
                    <td>{employee.employment?.department}</td>
                    <td style={{ color: '#28a745', fontWeight: 'bold' }}>{presentDays}</td>
                    <td style={{ color: '#dc3545', fontWeight: 'bold' }}>{absentDays}</td>
                    <td style={{ color: '#ffc107', fontWeight: 'bold' }}>{lateDays}</td>
                    <td>{avgHours} hrs</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '60px', height: '8px', backgroundColor: '#e9ecef', 
                          borderRadius: '4px', overflow: 'hidden' 
                        }}>
                          <div style={{ 
                            width: `${attendanceRate}%`, height: '100%',
                            backgroundColor: attendanceRate >= 90 ? '#28a745' : attendanceRate >= 75 ? '#ffc107' : '#dc3545'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{attendanceRate}%</span>
                      </div>
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

  const renderAnalytics = () => {
    const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71'];
    
    return (
      <div>
        <h3 style={{ marginBottom: '30px' }}>📊 Attendance Analytics</h3>
        
        <div className="grid-stats" style={{ marginBottom: '30px' }}>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>👥</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Employees</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.totalEmployees || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>✅</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Present Today</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.presentToday || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>⏰</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Avg Working Hours</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.avgWorkingHours || 0}h
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📈</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Attendance Rate</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.attendanceRate || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4>📈 Daily Attendance Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#28a745" strokeWidth={3} name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#dc3545" strokeWidth={3} name="Absent" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4>🥧 Attendance Status Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(analytics.statusDistribution || []).map((entry, index) => (
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
      <h1 className="page-title">Attendance Management System</h1>
      
      {renderQuickActions()}
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'records' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('records')}
        >
          📋 Records
        </button>
        {hasRole(['admin', 'manager']) && (
          <button 
            className={`btn ${activeTab === 'employees' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('employees')}
          >
            👥 Employee Summary
          </button>
        )}
        {hasRole(['admin', 'manager']) && (
          <button 
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
        )}
      </div>

      {activeTab === 'records' && renderAttendanceRecords()}
      {activeTab === 'employees' && renderEmployeeAttendance()}
      {activeTab === 'analytics' && renderAnalytics()}
      
      <CSVUpload
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onUpload={handleCSVUpload}
        templateData={getCSVTemplate()}
        title="Import Attendance Records"
        description="Upload a CSV file to bulk import attendance records. Download the template to see the required format."
      />
    </div>
  );
};

export default AttendanceSystem;