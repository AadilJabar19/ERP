import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui';
import { exportToCSV, exportToExcel, exportToJSON } from '../utils/exportUtils';
import '../styles/components/ExportMenu.scss';

const ExportMenu = ({ 
  data = [], 
  filename = 'export',
  selectedItems = [],
  allData = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExport = (format) => {
    const exportData = selectedItems.length > 0 
      ? allData.filter(item => selectedItems.includes(item._id))
      : data;

    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}`;

    switch (format) {
      case 'csv':
        exportToCSV(exportData, `${fullFilename}.csv`);
        break;
      case 'excel':
        exportToExcel(exportData, `${fullFilename}.xlsx`);
        break;
      case 'json':
        exportToJSON(exportData, `${fullFilename}.json`);
        break;
      default:
        exportToCSV(exportData, `${fullFilename}.csv`);
    }

    setIsOpen(false);
  };

  return (
    <div className="export-menu" ref={menuRef}>
      <Button 
        variant="success" 
        icon="📥" 
        onClick={() => setIsOpen(!isOpen)}
      >
        Export {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
      </Button>

      {isOpen && (
        <div className="export-dropdown">
          <div className="export-dropdown-header">
            <span>Export Format</span>
          </div>
          <button 
            className="export-option"
            onClick={() => handleExport('csv')}
          >
            <span className="export-icon">📄</span>
            <div className="export-details">
              <div className="export-title">CSV</div>
              <div className="export-desc">Comma-separated values</div>
            </div>
          </button>
          <button 
            className="export-option"
            onClick={() => handleExport('excel')}
          >
            <span className="export-icon">📊</span>
            <div className="export-details">
              <div className="export-title">Excel</div>
              <div className="export-desc">Microsoft Excel format</div>
            </div>
          </button>
          <button 
            className="export-option"
            onClick={() => handleExport('json')}
          >
            <span className="export-icon">🔧</span>
            <div className="export-details">
              <div className="export-title">JSON</div>
              <div className="export-desc">JavaScript Object Notation</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
