import React, { useState, useRef, useEffect } from 'react';
import './ActionDropdown.scss';

const ActionDropdown = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="action-dropdown" ref={dropdownRef}>
      <button 
        className="action-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        ⋮
      </button>
      {isOpen && (
        <div className="action-dropdown-menu">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`action-dropdown-item ${action.className || ''}`}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              disabled={action.disabled}
            >
              {action.icon && <span className="action-icon">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
