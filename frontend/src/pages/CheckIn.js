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
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
        ⏱️ Employee Check-In/Out
      </h1>
      
      <div className="card" style={{ 
        maxWidth: '500px', 
        margin: '0 auto',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          📅 Quick Attendance Portal
        </h3>
        
        <form>
          <div className="form-group">
            <label style={{ color: 'white', fontWeight: 'bold' }}>Employee ID:</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter your Employee ID"
              style={{ 
                fontSize: '1.2rem', 
                padding: '15px', 
                textAlign: 'center',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                backdropFilter: 'blur(10px)'
              }}
              disabled={isLoading}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
            <button 
              type="button"
              className="btn" 
              onClick={handleCheckIn}
              disabled={isLoading}
              style={{ 
                flex: 1, 
                padding: '15px', 
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(46, 204, 113, 0.4)'
              }}
            >
              {isLoading ? '⏳ Processing...' : '✅ Check In'}
            </button>
            <button 
              type="button"
              className="btn" 
              onClick={handleCheckOut}
              disabled={isLoading}
              style={{ 
                flex: 1, 
                padding: '15px', 
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(52, 152, 219, 0.4)'
              }}
            >
              {isLoading ? '⏳ Processing...' : '⏹️ Check Out'}
            </button>
          </div>
        </form>
        
        {message && (
          <div style={{ 
            marginTop: '25px', 
            padding: '15px', 
            borderRadius: '8px',
            background: message.includes('successful') 
              ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)' 
              : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            {message.includes('successful') ? '✅' : '❌'} {message}
          </div>
        )}
        
        <div style={{ 
          marginTop: '25px', 
          padding: '15px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            🕰️ Current Time: {new Date().toLocaleString()}
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
            📍 Make sure to check in when you arrive and check out when you leave
          </p>
        </div>
      </div>
      
      <div style={{ 
        maxWidth: '500px', 
        margin: '20px auto 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '15px'
      }}>
        <div className="card" style={{ 
          margin: 0,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>✅</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Check In</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Start your day</div>
        </div>
        <div className="card" style={{ 
          margin: 0,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>⏹️</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Check Out</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>End your day</div>
        </div>
        <div className="card" style={{ 
          margin: 0,
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📈</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Track Time</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Monitor hours</div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;