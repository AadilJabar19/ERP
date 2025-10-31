import React from 'react';
import './Card.scss';

const Card = ({ 
  children, 
  title, 
  subtitle,
  actions,
  hoverable = false,
  padding = 'md',
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`card ${hoverable ? 'card-hoverable' : ''} card-padding-${padding} ${className}`}
      {...props}
    >
      {(title || actions) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
