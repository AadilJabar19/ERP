import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  if (!user) {
    return (
      <>
        <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`navbar ${isOpen ? 'navbar-open' : ''}`}>
          <h2>Mini ERP</h2>
          <ul className="nav-links">
            <li><Link to="/login" onClick={() => setIsOpen(false)}>Login</Link></li>
          </ul>
        </nav>
        {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
      </>
    );
  }

  return (
    <>
      <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav className={`navbar ${isOpen ? 'navbar-open' : ''}`}>
        <h2>Mini ERP</h2>
        <div style={{ padding: '10px 20px', fontSize: '0.9rem', color: '#bdc3c7' }}>
          {user.name} ({user.role})
        </div>
        <ul className="nav-links">
          <li><Link to="/" onClick={() => setIsOpen(false)}>Dashboard</Link></li>
          {hasRole(['admin', 'manager']) && (
            <li><Link to="/employees" onClick={() => setIsOpen(false)}>Employees</Link></li>
          )}
          <li><Link to="/hrm" onClick={() => setIsOpen(false)}>HRM</Link></li>
          <li><Link to="/inventory-mgmt" onClick={() => setIsOpen(false)}>Inventory</Link></li>
          <li><Link to="/sales-mgmt" onClick={() => setIsOpen(false)}>Sales</Link></li>
          {hasRole(['admin', 'manager']) && (
            <li><Link to="/projects" onClick={() => setIsOpen(false)}>Projects</Link></li>
          )}
          <li><Link to="/crm" onClick={() => setIsOpen(false)}>CRM</Link></li>
          <li><Link to="/calendar" onClick={() => setIsOpen(false)}>Calendar</Link></li>
          <li><Link to="/checkin" onClick={() => setIsOpen(false)}>Check-In</Link></li>
          {hasRole(['admin', 'manager']) && (
            <li><Link to="/attendance" onClick={() => setIsOpen(false)}>Attendance</Link></li>
          )}
          <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ecf0f1', padding: '15px 20px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>Logout</button></li>
        </ul>
      </nav>
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Navbar;