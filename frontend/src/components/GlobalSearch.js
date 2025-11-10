import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import '../styles/components/GlobalSearch.scss';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Search function with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/search?q=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResults(response.data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (result) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
  };

  const getResultIcon = (type) => {
    const icons = {
      module: '🧭',
      employee: '👤',
      customer: '🏢',
      product: '📦',
      project: '📁',
      lead: '🎯',
      invoice: '🧾',
      order: '📋',
      event: '📅',
      default: '📄'
    };
    return icons[type] || icons.default;
  };

  return (
    <>
      <button 
        className="global-search-trigger"
        onClick={() => setIsOpen(true)}
      >
        <SearchIcon className="search-icon" />
        <span className="search-text">Search...</span>
        <span className="search-shortcut">⌘K</span>
      </button>

      {isOpen && (
        <div className="global-search-overlay">
          <div className="global-search-modal" ref={searchRef}>
            <div className="search-input-wrapper">
              <SearchIcon className="search-icon-large" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search across all modules..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="global-search-input"
              />
              {loading && <AccessTimeIcon className="search-loading" />}
            </div>

            <div className="search-results">
              {query && !loading && results.length === 0 && (
                <div className="search-empty">
                  <SearchIcon className="empty-icon" />
                  <p>No results found for "{query}"</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="results-list">
                  {results.map((result, index) => (
                    <button
                      key={index}
                      className="result-item"
                      onClick={() => handleResultClick(result)}
                    >
                      <span className="result-icon">{getResultIcon(result.type)}</span>
                      <div className="result-content">
                        <div className="result-title">{result.title}</div>
                        <div className="result-description">{result.description}</div>
                      </div>
                      <span className="result-type">{result.type}</span>
                    </button>
                  ))}
                </div>
              )}

              {!query && (
                <div className="search-suggestions">
                  <div className="search-filters">
                    <button 
                      className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`filter-btn ${selectedFilter === 'employees' ? 'active' : ''}`}
                      onClick={() => setSelectedFilter('employees')}
                    >
                      👥 Employees
                    </button>
                    <button 
                      className={`filter-btn ${selectedFilter === 'products' ? 'active' : ''}`}
                      onClick={() => setSelectedFilter('products')}
                    >
                      📦 Products
                    </button>
                    <button 
                      className={`filter-btn ${selectedFilter === 'customers' ? 'active' : ''}`}
                      onClick={() => setSelectedFilter('customers')}
                    >
                      🏢 Customers
                    </button>
                  </div>
                  
                  <div className="suggestion-title">Quick Links</div>
                  <button className="suggestion-item" onClick={() => navigate('/dashboard')}>
                    <span>📊</span> Dashboard
                  </button>
                  <button className="suggestion-item" onClick={() => navigate('/hrm')}>
                    <span>👥</span> HRM
                  </button>
                  <button className="suggestion-item" onClick={() => navigate('/inventory')}>
                    <span>📦</span> Inventory
                  </button>
                  <button className="suggestion-item" onClick={() => navigate('/sales')}>
                    <span>💰</span> Sales
                  </button>
                </div>
              )}
            </div>

            <div className="search-footer">
              <div className="search-tips">
                <kbd>↑↓</kbd> Navigate
                <kbd>↵</kbd> Select
                <kbd>ESC</kbd> Close
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
