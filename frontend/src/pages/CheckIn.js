import React, { useState } from 'react';
import axios from 'axios';

const CheckIn = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      setMessage('Please enter your Employee ID');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/checkin', 
        { employeeId: employeeId.trim() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Check-in successful!');
      setEmployeeId('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-in failed');
    }
    setIsLoading(false);
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      setMessage('Please enter your Employee ID');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/checkout', 
        { employeeId: employeeId.trim() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Check-out successful!');
      setEmployeeId('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-out failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Employee Check-In/Out</h1>
      
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h3 style={{ textAlign: 'center' }}>Quick Attendance</h3>
        
        <form>
          <div className="form-group">
            <label>Employee ID:</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter your Employee ID"
              style={{ fontSize: '1.2rem', padding: '15px', textAlign: 'center' }}
              disabled={isLoading}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button"
              className="btn btn-success" 
              onClick={handleCheckIn}
              disabled={isLoading}
              style={{ flex: 1, padding: '15px', fontSize: '1.1rem' }}
            >
              {isLoading ? 'Processing...' : 'Check In'}
            </button>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={handleCheckOut}
              disabled={isLoading}
              style={{ flex: 1, padding: '15px', fontSize: '1.1rem' }}
            >
              {isLoading ? 'Processing...' : 'Check Out'}
            </button>
          </div>
        </form>
        
        {message && (
          <div style={{ 
            marginTop: '20px', 
            padding: '10px', 
            borderRadius: '4px',
            backgroundColor: message.includes('successful') ? '#d4edda' : '#f8d7da',
            color: message.includes('successful') ? '#155724' : '#721c24',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {message}
          </div>
        )}
        
        <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
          <p>Current Time: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;