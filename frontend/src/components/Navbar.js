import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ModuleGroup = ({ title, icon, children, isOpen, onToggle }) => (
  <li className="module-group">
    <button className="module-toggle" onClick={onToggle}>
      <span>{icon} {title}</span>
      <span className={`arrow ${isOpen ? 'arrow-down' : 'arrow-right'}`}>▶</span>
    </button>
    {isOpen && (
      <ul className="sub-modules">
        {children}
      </ul>
    )}
  </li>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openModules, setOpenModules] = useState({});
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const toggleModule = (module) => {
    setOpenModules(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [module]: !prev[module]
    }));
  };

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
        <div className="user-info">
          <Link to="/profile-system" onClick={() => setIsOpen(false)} className="user-profile-link">
            <div className="user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" />
              ) : (
                <span>{user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
              )}
            </div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">({user.role})</div>
              {user.lastLogin && (
                <div className="last-login">
                  Last login: {new Date(user.lastLogin).toLocaleDateString()}
                </div>
              )}
            </div>
          </Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/" onClick={() => setIsOpen(false)}>📊 Dashboard</Link></li>
          
          <ModuleGroup 
            title="Human Resources" 
            icon="👥" 
            isOpen={openModules.hr} 
            onToggle={() => toggleModule('hr')}
          >
            <li><Link to="/hrm" onClick={() => setIsOpen(false)}>Employee Management</Link></li>
            <li><Link to="/attendance-system" onClick={() => setIsOpen(false)}>Attendance System</Link></li>
            <li><Link to="/checkin" onClick={() => setIsOpen(false)}>Check-In/Out</Link></li>
          </ModuleGroup>

          <ModuleGroup 
            title="Operations" 
            icon="📦" 
            isOpen={openModules.ops} 
            onToggle={() => toggleModule('ops')}
          >
            <li><Link to="/inventory-mgmt" onClick={() => setIsOpen(false)}>Inventory Management</Link></li>
            {hasRole(['admin', 'manager']) && (
              <li><Link to="/procurement" onClick={() => setIsOpen(false)}>Procurement</Link></li>
            )}
            {hasRole(['admin', 'manager']) && (
              <li><Link to="/manufacturing" onClick={() => setIsOpen(false)}>Manufacturing</Link></li>
            )}
          </ModuleGroup>

          <ModuleGroup 
            title="Sales & CRM" 
            icon="💰" 
            isOpen={openModules.sales} 
            onToggle={() => toggleModule('sales')}
          >
            <li><Link to="/sales-mgmt" onClick={() => setIsOpen(false)}>Sales Management</Link></li>
            <li><Link to="/crm-system" onClick={() => setIsOpen(false)}>CRM System</Link></li>
          </ModuleGroup>

          {hasRole(['admin', 'manager']) && (
            <ModuleGroup 
              title="Finance" 
              icon="💳" 
              isOpen={openModules.finance} 
              onToggle={() => toggleModule('finance')}
            >
              <li><Link to="/finance-mgmt" onClick={() => setIsOpen(false)}>Finance Management</Link></li>
            </ModuleGroup>
          )}

          {hasRole(['admin', 'manager']) && (
            <ModuleGroup 
              title="Project Management" 
              icon="📋" 
              isOpen={openModules.projects} 
              onToggle={() => toggleModule('projects')}
            >
              <li><Link to="/projects" onClick={() => setIsOpen(false)}>Projects</Link></li>
            </ModuleGroup>
          )}

          <ModuleGroup 
            title="Tools & Utilities" 
            icon="🛠️" 
            isOpen={openModules.tools} 
            onToggle={() => toggleModule('tools')}
          >
            <li><Link to="/calendar-system" onClick={() => setIsOpen(false)}>Calendar</Link></li>
            <li><Link to="/helpdesk" onClick={() => setIsOpen(false)}>Helpdesk</Link></li>
            <li><Link to="/ai-assistant" onClick={() => setIsOpen(false)}>AI Assistant</Link></li>
            {hasRole(['admin', 'manager']) && (
              <li><Link to="/ai-insights" onClick={() => setIsOpen(false)}>AI Insights</Link></li>
            )}
          </ModuleGroup>

          {hasRole(['admin']) && (
            <ModuleGroup 
              title="Administration" 
              icon="🔧" 
              isOpen={openModules.admin} 
              onToggle={() => toggleModule('admin')}
            >
              <li><Link to="/admin-panel" onClick={() => setIsOpen(false)}>Admin Panel</Link></li>
              <li><Link to="/system-config" onClick={() => setIsOpen(false)}>System Config</Link></li>
              <li><Link to="/integrations" onClick={() => setIsOpen(false)}>Integrations</Link></li>
            </ModuleGroup>
          )}

          <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ecf0f1', padding: '15px 20px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>🚪 Logout</button></li>
        </ul>
      </nav>
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Navbar;