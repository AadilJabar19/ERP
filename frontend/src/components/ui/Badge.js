import React from 'react';
import '../../styles/components/Badge.scss';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${dot ? 'badge-dot' : ''} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
