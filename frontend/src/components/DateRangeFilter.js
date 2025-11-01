import React, { useState } from 'react';
import { Button } from './ui';
import '../styles/components/DateRangeFilter.scss';

const DateRangeFilter = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  onClear,
  label = "Date Range"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleQuickSelect = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    onStartDateChange(start.toISOString().split('T')[0]);
    onEndDateChange(end.toISOString().split('T')[0]);
  };

  const handleClear = () => {
    onStartDateChange('');
    onEndDateChange('');
    if (onClear) onClear();
  };

  const hasDateRange = startDate || endDate;

  return (
    <div className="date-range-filter">
      <button 
        className={`date-range-toggle ${hasDateRange ? 'active' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="date-icon">📅</span>
        <span className="date-label">
          {hasDateRange 
            ? `${startDate || '...'} - ${endDate || '...'}` 
            : label
          }
        </span>
        <span className={`arrow ${isExpanded ? 'up' : 'down'}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="date-range-dropdown">
          <div className="date-range-inputs">
            <div className="date-input-group">
              <label>From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                max={endDate || undefined}
              />
            </div>
            <div className="date-input-group">
              <label>To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={startDate || undefined}
              />
            </div>
          </div>

          <div className="quick-select">
            <div className="quick-select-label">Quick Select:</div>
            <div className="quick-select-buttons">
              <button onClick={() => handleQuickSelect(7)}>Last 7 days</button>
              <button onClick={() => handleQuickSelect(30)}>Last 30 days</button>
              <button onClick={() => handleQuickSelect(90)}>Last 90 days</button>
              <button onClick={() => handleQuickSelect(365)}>Last year</button>
            </div>
          </div>

          <div className="date-range-actions">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setIsExpanded(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
