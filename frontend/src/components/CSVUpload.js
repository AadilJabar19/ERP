import React, { useState } from 'react';
import Modal from './Modal';

const CSVUpload = ({ isOpen, onClose, onUpload, templateData, title, description }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        alert('CSV file must contain at least a header row and one data row');
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const csvData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });
      
      await onUpload(csvData);
      setFile(null);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    if (!templateData || templateData.length === 0) return;
    
    const headers = Object.keys(templateData[0]);
    const csvContent = headers.join(',') + '\n' + 
      templateData.map(row => headers.map(header => row[header] || '').join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>{description}</p>
          <h4>📋 Instructions:</h4>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Download the CSV template</li>
            <li>Fill in your data following the template format</li>
            <li>Upload the completed CSV file</li>
          </ol>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button 
            className="btn btn-info" 
            onClick={downloadTemplate}
            style={{ marginRight: '10px' }}
          >
            📥 Download Template
          </button>
          <small style={{ color: '#666' }}>
            {templateData && templateData.length > 0 && 
              `Required fields: ${Object.keys(templateData[0]).join(', ')}`
            }
          </small>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Select CSV File:
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              width: '100%'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload CSV'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CSVUpload;