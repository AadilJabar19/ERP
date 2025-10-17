import { useState } from 'react';

const useBulkActions = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (e, data) => {
    const checked = e?.target?.checked || false;
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(data.map(item => item._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (e, id) => {
    const checked = e?.target?.checked || false;
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id));
      setSelectAll(false);
    }
  };

  const isAllSelected = (data) => {
    return data.length > 0 && selectedItems.length === data.length;
  };

  const handleBulkDelete = async (type, endpoint, refreshCallback) => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} ${type}?`)) {
      try {
        const token = localStorage.getItem('token');
        await Promise.all(
          selectedItems.map(id => 
            fetch(`${endpoint}/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        clearSelection();
        refreshCallback();
      } catch (error) {
        console.error('Error deleting items:', error);
        alert('Error deleting items');
      }
    }
  };

  const clearSelection = () => {
    setSelectedItems([]);
    setSelectAll(false);
  };

  return {
    selectedItems,
    selectAll,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
    isAllSelected,
    handleBulkDelete
  };
};

export default useBulkActions;