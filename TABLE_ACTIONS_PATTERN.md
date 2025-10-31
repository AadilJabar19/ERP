# Table Actions Pattern - Implementation Guide

## Pattern Overview
Replace inline action buttons with:
1. Checkboxes for row selection
2. Action dropdown in top-right corner (appears only when items selected)
3. Remove Actions column from table

## Step-by-Step Implementation

### 1. Import ActionDropdown Component
```javascript
import ActionDropdown from '../components/ActionDropdown';
import useBulkActions from '../hooks/useBulkActions';
```

### 2. Add State Management
```javascript
const { selectedItems, selectAll, handleSelectAll, handleSelectItem, clearSelection } = useBulkActions();
```

### 3. Update Table Header Layout
**Before:**
```javascript
<div className="card">
  <h3>Module Name</h3>
  <button onClick={handleAdd}>Add Item</button>
```

**After:**
```javascript
<div className="card">
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
    <h3 style={{ margin: 0 }}>Module Name</h3>
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button onClick={handleAdd}>Add Item</button>
      {selectedItems.length > 0 && (
        <ActionDropdown
          actions={[
            {
              label: `Edit (${selectedItems.length})`,
              icon: '✏️',
              onClick: () => handleEdit(),
              className: 'primary',
              disabled: selectedItems.length !== 1
            },
            {
              label: `Delete (${selectedItems.length})`,
              icon: '🗑️',
              onClick: handleBulkDelete,
              className: 'danger'
            },
            {
              label: 'Clear Selection',
              icon: '✖️',
              onClick: clearSelection
            }
          ]}
        />
      )}
    </div>
  </div>
```

### 4. Add Checkbox Column to Table Header
**Before:**
```javascript
<thead>
  <tr>
    <th>Name</th>
    <th>Status</th>
    <th>Actions</th>
  </tr>
</thead>
```

**After:**
```javascript
<thead>
  <tr>
    <th>
      <input 
        type="checkbox" 
        checked={selectAll}
        onChange={(e) => handleSelectAll(e, items)}
      />
    </th>
    <th>Name</th>
    <th>Status</th>
  </tr>
</thead>
```

### 5. Add Checkbox to Table Rows & Remove Actions Column
**Before:**
```javascript
<tbody>
  {items.map(item => (
    <tr key={item._id}>
      <td>{item.name}</td>
      <td>{item.status}</td>
      <td>
        <button onClick={() => handleEdit(item)}>Edit</button>
        <button onClick={() => handleDelete(item._id)}>Delete</button>
      </td>
    </tr>
  ))}
</tbody>
```

**After:**
```javascript
<tbody>
  {items.map(item => (
    <tr key={item._id}>
      <td>
        <input 
          type="checkbox" 
          checked={selectedItems.includes(item._id)}
          onChange={(e) => handleSelectItem(e, item._id)}
        />
      </td>
      <td>{item.name}</td>
      <td>{item.status}</td>
    </tr>
  ))}
</tbody>
```

## Quick Reference for Each Module

### Inventory Module
**File:** `frontend/src/pages/Inventory.js`
**Tables:** Products, Categories, Warehouses
**Actions:**
- Products: Edit (single), Delete (bulk), Export (bulk)
- Categories: Edit (single), Delete (bulk)
- Warehouses: Edit (single), Delete (bulk)

### Sales Module
**File:** `frontend/src/pages/Sales.js`
**Tables:** Leads, Quotes, Orders
**Actions:**
- Leads: Edit (single), Convert to Quote (single), Delete (bulk)
- Quotes: Edit (single), Convert to Order (single), Delete (bulk)
- Orders: View (single), Cancel (bulk), Export (bulk)

### CRM Module
**File:** `frontend/src/pages/CRM.js`
**Tables:** Customers
**Actions:**
- Customers: Edit (single), Delete (bulk), Export (bulk)

### Projects Module
**File:** `frontend/src/pages/Projects.js`
**Tables:** Projects
**Actions:**
- Projects: Edit (single), Archive (bulk), Delete (bulk)

### Attendance Module
**File:** `frontend/src/pages/Attendance.js`
**Tables:** Attendance Records
**Actions:**
- Records: View Details (single), Export (bulk)

### Calendar Module
**File:** `frontend/src/pages/Calendar.js`
**Tables:** Events
**Actions:**
- Events: Edit (single), Delete (bulk), Export (bulk)

### Finance Module
**File:** `frontend/src/pages/Finance.js`
**Tables:** Invoices, Expenses
**Actions:**
- Invoices: Edit (single), Mark Paid (bulk), Delete (bulk), Download PDF (bulk)
- Expenses: Edit (single), Approve (bulk), Delete (bulk)

## Common Action Patterns

### Single Item Actions (Edit, View)
```javascript
{
  label: `Edit (${selectedItems.length})`,
  icon: '✏️',
  onClick: () => {
    if (selectedItems.length === 1) {
      const item = items.find(i => i._id === selectedItems[0]);
      handleEdit(item);
    } else {
      error('Please select only one item to edit');
    }
  },
  className: 'primary',
  disabled: selectedItems.length !== 1
}
```

### Bulk Actions (Delete, Export)
```javascript
{
  label: `Delete (${selectedItems.length})`,
  icon: '🗑️',
  onClick: () => {
    showConfirm(
      'Delete Items',
      `Delete ${selectedItems.length} item(s)?`,
      async () => {
        await handleBulkDelete(selectedItems);
        clearSelection();
      }
    );
  },
  className: 'danger'
}
```

### Status Change Actions (Approve, Reject)
```javascript
{
  label: `Approve (${selectedItems.length})`,
  icon: '✅',
  onClick: async () => {
    await Promise.all(selectedItems.map(id => handleApprove(id)));
    clearSelection();
    success(`Approved ${selectedItems.length} item(s)`);
  },
  className: 'success'
}
```

## Icon Reference
- Edit: ✏️
- Delete: 🗑️
- View: 👁️
- Approve: ✅
- Reject: ❌
- Export: 📥
- Download: 📄
- Archive: 📦
- Clear: ✖️
- Convert: 🔄
- Send: 📧

## Testing Checklist
- [ ] Checkbox in header selects/deselects all rows
- [ ] Individual checkboxes work correctly
- [ ] Action dropdown appears only when items selected
- [ ] Action dropdown shows correct count
- [ ] Single-item actions disabled when multiple selected
- [ ] Bulk actions work for multiple items
- [ ] Clear selection works
- [ ] Actions column removed from table
- [ ] Layout looks clean and professional

## Example: Complete Implementation

```javascript
import React, { useState, useEffect } from 'react';
import ActionDropdown from '../components/ActionDropdown';
import useBulkActions from '../hooks/useBulkActions';

const MyModule = () => {
  const [items, setItems] = useState([]);
  const { selectedItems, selectAll, handleSelectAll, handleSelectItem, clearSelection } = useBulkActions();

  const handleBulkDelete = async () => {
    // Delete logic
    clearSelection();
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>My Module</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleAdd}>Add Item</button>
          {selectedItems.length > 0 && (
            <ActionDropdown
              actions={[
                {
                  label: `Edit (${selectedItems.length})`,
                  icon: '✏️',
                  onClick: () => handleEdit(),
                  className: 'primary',
                  disabled: selectedItems.length !== 1
                },
                {
                  label: `Delete (${selectedItems.length})`,
                  icon: '🗑️',
                  onClick: handleBulkDelete,
                  className: 'danger'
                },
                {
                  label: 'Clear Selection',
                  icon: '✖️',
                  onClick: clearSelection
                }
              ]}
            />
          )}
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                checked={selectAll}
                onChange={(e) => handleSelectAll(e, items)}
              />
            </th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item._id}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(item._id)}
                  onChange={(e) => handleSelectItem(e, item._id)}
                />
              </td>
              <td>{item.name}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyModule;
```

---

**Note:** Apply this pattern consistently across all modules for a uniform user experience.
