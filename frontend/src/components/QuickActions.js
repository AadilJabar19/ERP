import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/components/QuickActions.scss';

const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const actions = [
    {
      icon: '👤',
      label: 'Add Employee',
      path: '/hrm',
      color: '#3b82f6',
      roles: ['admin', 'manager']
    },
    {
      icon: '🏢',
      label: 'Add Customer',
      path: '/crm',
      color: '#10b981',
      roles: ['admin', 'manager', 'employee']
    },
    {
      icon: '📦',
      label: 'Add Product',
      path: '/inventory',
      color: '#f59e0b',
      roles: ['admin', 'manager']
    },
    {
      icon: '🎯',
      label: 'Add Lead',
      path: '/sales',
      color: '#8b5cf6',
      roles: ['admin', 'manager', 'employee']
    },
    {
      icon: '📁',
      label: 'Add Project',
      path: '/projects',
      color: '#ec4899',
      roles: ['admin', 'manager']
    },
    {
      icon: '📅',
      label: 'Add Event',
      path: '/calendar',
      color: '#06b6d4',
      roles: ['admin', 'manager', 'employee']
    },
    {
      icon: '🧾',
      label: 'Create Invoice',
      path: '/finance',
      color: '#14b8a6',
      roles: ['admin', 'manager']
    },
    {
      icon: '✅',
      label: 'Check In',
      path: '/attendance',
      color: '#22c55e',
      roles: ['admin', 'manager', 'employee']
    }
  ];

  const filteredActions = actions.filter(action => 
    !action.roles || hasRole(action.roles)
  );

  const handleActionClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className={`quick-actions ${isOpen ? 'open' : ''}`}>
      <button 
        className="quick-actions-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Actions"
      >
        <span className={`trigger-icon ${isOpen ? 'rotate' : ''}`}>
          {isOpen ? '✕' : '⚡'}
        </span>
      </button>

      {isOpen && (
        <div className="quick-actions-menu">
          <div className="quick-actions-header">
            <h3>Quick Actions</h3>
            <p>Create new items quickly</p>
          </div>
          <div className="quick-actions-grid">
            {filteredActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-item"
                onClick={() => handleActionClick(action.path)}
                style={{ '--action-color': action.color }}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="quick-actions-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default QuickActions;
