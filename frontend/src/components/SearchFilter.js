import React from 'react';
import '../styles/components/SearchFilter.scss';

const SearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  filterOptions, 
  selectedFilter, 
  setSelectedFilter,
  placeholder = "Search..."
}) => (
  <div className="search-filter-container">
    <div className="search-input-wrapper">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
    </div>
    {filterOptions && (
      <select
        value={selectedFilter}
        onChange={(e) => setSelectedFilter(e.target.value)}
        className="filter-select"
      >
        <option value="">All {filterOptions[0]?.label?.includes('Department') ? 'Departments' : 'Items'}</option>
        {filterOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    )}
  </div>
);

export default SearchFilter;