import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, startIndex, endIndex, itemsPerPage, onItemsPerPageChange }) => {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
      padding: '10px 0',
      borderTop: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Showing {startIndex} to {endIndex} of {totalItems}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <button
          className="btn btn-secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ fontSize: '12px', padding: '5px 10px' }}
        >
          Previous
        </button>

        {startPage > 1 && (
          <>
            <button
              className="btn btn-secondary"
              onClick={() => onPageChange(1)}
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              1
            </button>
            {startPage > 2 && <span style={{ padding: '0 5px' }}>...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            className={`btn ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onPageChange(page)}
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span style={{ padding: '0 5px' }}>...</span>}
            <button
              className="btn btn-secondary"
              onClick={() => onPageChange(totalPages)}
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className="btn btn-secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ fontSize: '12px', padding: '5px 10px' }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;