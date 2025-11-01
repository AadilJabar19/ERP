import React from 'react';
import Button from './Button';
import '../../styles/components/EmptyState.scss';

const EmptyState = ({ 
  icon = '📭',
  title = 'No data found',
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && (
        <Button 
          variant="primary"
          onClick={action.onClick}
          icon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
