/**
 * Export Utilities
 * Handles data export to CSV, Excel, and JSON formats
 */

/**
 * Convert data to CSV format
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Escape commas and quotes
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

/**
 * Convert data to Excel format (using CSV with .xlsx extension for simplicity)
 * For full Excel support, consider using libraries like xlsx or exceljs
 */
export const exportToExcel = (data, filename = 'export.xlsx') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // For now, export as CSV with xlsx extension
  // In production, use a library like 'xlsx' for proper Excel format
  const headers = Object.keys(data[0]);
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, filename);
};

/**
 * Export data as JSON
 */
export const exportToJSON = (data, filename = 'export.json') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadBlob(blob, filename);
};

/**
 * Export selected items
 */
export const exportSelected = (allData, selectedIds, format = 'csv', filename) => {
  const selectedData = allData.filter(item => selectedIds.includes(item._id));
  
  switch (format.toLowerCase()) {
    case 'csv':
      exportToCSV(selectedData, filename || 'selected-export.csv');
      break;
    case 'excel':
    case 'xlsx':
      exportToExcel(selectedData, filename || 'selected-export.xlsx');
      break;
    case 'json':
      exportToJSON(selectedData, filename || 'selected-export.json');
      break;
    default:
      exportToCSV(selectedData, filename || 'selected-export.csv');
  }
};

/**
 * Helper function to download blob
 */
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Flatten nested objects for export
 */
export const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(acc, flattenObject(value, newKey));
    } else if (Array.isArray(value)) {
      acc[newKey] = value.join(', ');
    } else if (value instanceof Date) {
      acc[newKey] = value.toISOString();
    } else {
      acc[newKey] = value;
    }
    
    return acc;
  }, {});
};

/**
 * Prepare data for export by flattening nested objects
 */
export const prepareDataForExport = (data) => {
  return data.map(item => flattenObject(item));
};

/**
 * Export with custom columns
 */
export const exportWithColumns = (data, columns, format = 'csv', filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Filter data to only include specified columns
  const filteredData = data.map(item => {
    const filtered = {};
    columns.forEach(col => {
      filtered[col.label || col.key] = item[col.key];
    });
    return filtered;
  });

  switch (format.toLowerCase()) {
    case 'csv':
      exportToCSV(filteredData, filename || 'export.csv');
      break;
    case 'excel':
    case 'xlsx':
      exportToExcel(filteredData, filename || 'export.xlsx');
      break;
    case 'json':
      exportToJSON(filteredData, filename || 'export.json');
      break;
    default:
      exportToCSV(filteredData, filename || 'export.csv');
  }
};
