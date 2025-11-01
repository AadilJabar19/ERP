import React, { forwardRef } from 'react';
import '../../styles/components/Input.scss';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  icon,
  fullWidth = false,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className={`input-wrapper ${fullWidth ? 'input-full-width' : ''} ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {props.required && <span className="input-required">*</span>}
        </label>
      )}
      <div className={`input-container ${error ? 'input-error' : ''} ${icon ? 'input-with-icon' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input 
          ref={ref}
          className="input-field"
          {...props}
        />
      </div>
      {error && <span className="input-error-text">{error}</span>}
      {helperText && !error && <span className="input-helper-text">{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
