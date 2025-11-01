import React from 'react';
import { Button, Badge } from './ui';
import '../styles/components/BulkActions.scss';

const BulkActions = ({ 
  selectedCount = 0,
  selectedItems = [],
  onBulkDelete, 
  onBulkExport, 
  onBulkEdit,
  onClearSelection,
  customActions = [] 
}) => {
  const count = selectedCount || selectedItems?.length || 0;
  
  if (count === 0) return null;

  return (
    <div className="bulk-actions">
      <Badge variant="primary" size="md">
        {count} selected
      </Badge>
      
      {onBulkEdit && (
        <Button 
          variant="secondary"
          size="sm"
          onClick={onBulkEdit}
          icon="✏️"
        >
          Edit
        </Button>
      )}
      
      {onBulkExport && (
        <Button 
          variant="success"
          size="sm"
          onClick={onBulkExport}
          icon="📥"
        >
          Export
        </Button>
      )}
      
      {onBulkDelete && (
        <Button 
          variant="danger"
          size="sm"
          onClick={onBulkDelete}
          icon="🗑️"
        >
          Delete
        </Button>
      )}
      
      {customActions.map((action, index) => (
        <Button 
          key={index}
          variant={action.variant || 'secondary'}
          size="sm"
          onClick={action.onClick}
          icon={action.icon}
        >
          {action.label}
        </Button>
      ))}
      
      {onClearSelection && (
        <Button 
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          icon="✖️"
        >
          Clear
        </Button>
      )}
    </div>
  );
};

export default BulkActions;