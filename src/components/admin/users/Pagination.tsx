import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, SkipBack, SkipForward } from 'lucide-react';
import { PaginationProps, PaginationInfo, PageSizeOption } from '../../../types';

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  onItemsPerPageChange,
  showItemsPerPage = false,
  showPageInfo = true,
  showJumpToPage = false,
  className = '',
  size = 'md',
  variant = 'default',
  maxPagesToShow = 5,
  loading = false,
  disabled = false
}) => {
  const [jumpToPageValue, setJumpToPageValue] = useState<string>('');

  // Default page size options
  const defaultPageSizeOptions: PageSizeOption[] = [
    { value: 5, label: '5 per page' },
    { value: 10, label: '10 per page' },
    { value: 20, label: '20 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' }
  ];

  // Calculate pagination info
  const paginationInfo: PaginationInfo = useMemo(() => {
    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }, [currentPage, totalPages, totalItems, itemsPerPage]);

  // Generate page numbers with smart ellipsis
  const generatePageNumbers = useMemo(() => {
    const pageNumbers: (number | string)[] = [];
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3);
      
      // Adjust if we're near the beginning
      if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
        endPage = Math.min(maxPagesToShow - 1, totalPages - 1);
        startPage = 2;
      }
      
      // Adjust if we're near the end
      if (currentPage > totalPages - Math.ceil(maxPagesToShow / 2)) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);
        endPage = totalPages - 1;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page if there's more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  }, [currentPage, totalPages, maxPagesToShow]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !loading && !disabled) {
      onPageChange(page);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    if (onItemsPerPageChange && !loading && !disabled) {
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  // Handle jump to page
  const handleJumpToPage = () => {
    const page = parseInt(jumpToPageValue);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setJumpToPageValue('');
    }
  };

  // Size classes
  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 text-xs',
      select: 'text-xs px-2 py-1',
      input: 'text-xs px-2 py-1 w-16'
    },
    md: {
      button: 'px-3 py-2 text-sm',
      select: 'text-sm px-3 py-2',
      input: 'text-sm px-3 py-2 w-20'
    },
    lg: {
      button: 'px-4 py-3 text-base',
      select: 'text-base px-4 py-3',
      input: 'text-base px-4 py-3 w-24'
    }
  };

  // Variant classes
  const variantClasses = {
    default: {
      button: 'border border-gray-300 bg-white hover:bg-gray-50',
      active: 'bg-blue-600 text-white border-blue-600',
      disabled: 'text-gray-400 cursor-not-allowed bg-gray-50'
    },
    outlined: {
      button: 'border-2 border-gray-300 bg-transparent hover:border-blue-500',
      active: 'border-blue-600 bg-blue-600 text-white',
      disabled: 'text-gray-400 cursor-not-allowed border-gray-200'
    },
    minimal: {
      button: 'border-none bg-transparent hover:bg-gray-100',
      active: 'bg-blue-600 text-white',
      disabled: 'text-gray-400 cursor-not-allowed'
    }
  };

  const currentSizeClasses = sizeClasses[size];
  const currentVariantClasses = variantClasses[variant];

  // Don't render if no pages
  if (totalPages <= 1) {
    return showPageInfo && totalItems > 0 ? (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="text-sm text-gray-600">
          {totalItems} item{totalItems !== 1 ? 's' : ''}
        </span>
      </div>
    ) : null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Items per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            disabled={loading || disabled}
            className={`rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              currentSizeClasses.select
            } ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {defaultPageSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main pagination controls */}
      <div className="flex items-center space-x-1">
        {/* First page button */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={!paginationInfo.hasPreviousPage || loading || disabled}
          className={`rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            currentSizeClasses.button
          } ${
            !paginationInfo.hasPreviousPage || loading || disabled
              ? currentVariantClasses.disabled
              : currentVariantClasses.button
          }`}
          aria-label="Go to first page"
          title="First page"
        >
          <SkipBack size={16} />
        </button>

        {/* Previous button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!paginationInfo.hasPreviousPage || loading || disabled}
          className={`rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            currentSizeClasses.button
          } ${
            !paginationInfo.hasPreviousPage || loading || disabled
              ? currentVariantClasses.disabled
              : currentVariantClasses.button
          }`}
          aria-label="Go to previous page"
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {generatePageNumbers.map((number, idx) => (
          <button
            key={idx}
            onClick={() => typeof number === 'number' && handlePageChange(number)}
            disabled={number === '...' || loading || disabled}
            className={`rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              currentSizeClasses.button
            } ${
              number === currentPage
                ? currentVariantClasses.active
                : number === '...'
                ? 'text-gray-400 cursor-default border-none bg-transparent'
                : loading || disabled
                ? currentVariantClasses.disabled
                : currentVariantClasses.button
            }`}
            aria-label={
              typeof number === 'number' 
                ? `Go to page ${number}` 
                : 'More pages'
            }
            aria-current={number === currentPage ? 'page' : undefined}
          >
            {number === '...' ? <MoreHorizontal size={16} /> : number}
          </button>
        ))}

        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!paginationInfo.hasNextPage || loading || disabled}
          className={`rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            currentSizeClasses.button
          } ${
            !paginationInfo.hasNextPage || loading || disabled
              ? currentVariantClasses.disabled
              : currentVariantClasses.button
          }`}
          aria-label="Go to next page"
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last page button */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={!paginationInfo.hasNextPage || loading || disabled}
          className={`rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            currentSizeClasses.button
          } ${
            !paginationInfo.hasNextPage || loading || disabled
              ? currentVariantClasses.disabled
              : currentVariantClasses.button
          }`}
          aria-label="Go to last page"
          title="Last page"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Jump to page */}
      {showJumpToPage && (
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Go to:</label>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={jumpToPageValue}
            onChange={(e) => setJumpToPageValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleJumpToPage();
              }
            }}
            disabled={loading || disabled}
            className={`rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              currentSizeClasses.input
            } ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Page"
          />
          <button
            onClick={handleJumpToPage}
            disabled={loading || disabled}
            className={`rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              currentSizeClasses.button
            } ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Go
          </button>
        </div>
      )}

      {/* Page info */}
      {showPageInfo && (
        <div className="text-sm text-gray-600">
          {totalItems > 0 ? (
            <>
              Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {totalItems} items
              {loading && <span className="ml-2 text-blue-600">Loading...</span>}
            </>
          ) : (
            <span>No items found</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Pagination;
