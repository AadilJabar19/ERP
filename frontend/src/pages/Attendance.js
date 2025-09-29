import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { hasRole } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/attendance?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
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

  return (
    <div className="page-container">
      <h1 className="page-title">Attendance Management</h1>
      
      <div className="card">
        <h3>Quick Check-in/Check-out</h3>
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
            Check In
          </button>
          <button className="btn btn-primary" style={{marginTop: '24px'}} onClick={handleCheckOut}>
            Check Out
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Attendance Records</h3>
          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <label>Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
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
                      {record.status}
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
        <h3>Attendance Summary</h3>
        <div className="grid-stats">
          <div className="card" style={{ margin: 0 }}>
            <h4>Present Today</h4>
            <p style={{ fontSize: '1.5rem', color: '#2ecc71' }}>
              {attendance.filter(r => r.status === 'present').length}
            </p>
          </div>
          <div className="card" style={{ margin: 0 }}>
            <h4>Late Today</h4>
            <p style={{ fontSize: '1.5rem', color: '#f39c12' }}>
              {attendance.filter(r => r.status === 'late').length}
            </p>
          </div>
          <div className="card" style={{ margin: 0 }}>
            <h4>Total Employees</h4>
            <p style={{ fontSize: '1.5rem', color: '#3498db' }}>
              {employees.length}
            </p>
          </div>
          <div className="card" style={{ margin: 0 }}>
            <h4>Attendance Rate</h4>
            <p style={{ fontSize: '1.5rem', color: '#9b59b6' }}>
              {employees.length > 0 ? Math.round((attendance.length / employees.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;