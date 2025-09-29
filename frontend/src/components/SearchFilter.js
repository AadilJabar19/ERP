import React from 'react';

const SearchFilter = ({ searchTerm, setSearchTerm, filterOptions, selectedFilter, setSelectedFilter }) => (
  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
    <input
      type="text"
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{ flex: 1, minWidth: '200px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
    />
    {filterOptions && (
      <select
        value={selectedFilter}
        onChange={(e) => setSelectedFilter(e.target.value)}
        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
      >
        <option value="">All</option>
        {filterOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    )}
  </div>
);

export default SearchFilter;