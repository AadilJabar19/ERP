import React, { useState } from 'react';
import Modal from './Modal';
import { Button } from './ui';
import '../styles/components/CSVUpload.scss';

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
      <div className="csv-upload-content">
        <div className="csv-upload-description">
          <p className="description-text">{description}</p>
          <div className="instructions">
            <h4>📋 Instructions:</h4>
            <ol>
              <li>Download the CSV template</li>
              <li>Fill in your data following the template format</li>
              <li>Upload the completed CSV file</li>
            </ol>
          </div>
        </div>

        <div className="template-section">
          <Button 
            variant="info" 
            onClick={downloadTemplate}
            icon="📥"
          >
            Download Template
          </Button>
          {templateData && templateData.length > 0 && (
            <small className="required-fields">
              Required fields: {Object.keys(templateData[0]).join(', ')}
            </small>
          )}
        </div>

        <div className="file-upload-section">
          <label className="file-label">
            Select CSV File:
          </label>
          <div className="file-input-wrapper">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="file-input-label">
              {file ? file.name : 'Choose a file...'}
            </label>
          </div>
        </div>

        <div className="csv-upload-actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleUpload}
            disabled={!file || uploading}
            loading={uploading}
            icon={uploading ? null : '📤'}
          >
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CSVUpload;