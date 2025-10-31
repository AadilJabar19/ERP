import React from 'react';

const BulkActions = ({ 
  selectedItems = [], 
  onBulkDelete, 
  onBulkExport, 
  onBulkEdit,
  customActions = [] 
}) => {
  if (!selectedItems || selectedItems.length === 0) return null;

  return (
    <div style={{ 
      display: 'flex', 
      gap: '10px', 
      alignItems: 'center',
      padding: '10px',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
      marginBottom: '10px'
    }}>
      <span style={{ color: '#666', fontWeight: 'bold' }}>
        {selectedItems?.length || 0} selected
      </span>
      
      {onBulkDelete && (
        <button 
          className="btn btn-danger btn-sm" 
          onClick={onBulkDelete}
        >
          Delete Selected
        </button>
      )}
      
      {onBulkExport && (
        <button 
          className="btn btn-success btn-sm" 
          onClick={onBulkExport}
        >
          Export Selected
        </button>
      )}
      
      {onBulkEdit && (
        <button 
          className="btn btn-warning btn-sm" 
          onClick={onBulkEdit}
        >
          Edit Selected
        </button>
      )}
      
      {customActions.map((action, index) => (
        <button 
          key={index}
          className={`btn btn-${action.variant || 'secondary'} btn-sm`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default BulkActions;