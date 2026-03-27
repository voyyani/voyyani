import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsive, usePrefersReducedMotion } from '../utils/responsiveHelpers';

/**
 * ResponsiveTable - Reusable responsive table component
 *
 * Features:
 * - Desktop: Sticky header table with horizontal scroll
 * - Mobile/Tablet: Card grid layout (each row as stacked card)
 * - Bulk selection with checkboxes
 * - Configurable columns with visibility control
 * - Touch-friendly row interactions
 * - Smooth animations with Framer Motion
 *
 * Props:
 * - columns: Array<{ key, label, render?, visibleFrom?, width?, sortable? }>
 * - data: Array<any> - table rows
 * - rowKey: string - unique identifier key
 * - onRowClick?: function
 * - isSelectable?: boolean - enable checkboxes
 * - selectedRows?: Set - selected row IDs
 * - onSelectionChange?: function - callback on selection change
 * - isLoading?: boolean
 * - emptyState?: React.ReactNode
 * - className?: string
 */
const ResponsiveTable = ({
  columns = [],
  data = [],
  rowKey = 'id',
  onRowClick,
  isSelectable = true,
  selectedRows = new Set(),
  onSelectionChange,
  isLoading = false,
  emptyState,
  className = '',
}) => {
  const { isMobile, isTablet } = useResponsive();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Calculate all selected state
  const allSelected = useMemo(
    () => data.length > 0 && selectedRows.size === data.length,
    [data.length, selectedRows.size]
  );

  const someSelected = useMemo(
    () => selectedRows.size > 0 && selectedRows.size < data.length,
    [selectedRows.size, data.length]
  );

  // Handle select all
  const handleSelectAll = (checked) => {
    if (!onSelectionChange) return;

    const newSelected = new Set(selectedRows);
    if (checked) {
      data.forEach(row => newSelected.add(row[rowKey]));
    } else {
      newSelected.clear();
    }
    onSelectionChange(newSelected);
  };

  // Handle single row selection
  const handleSelectRow = (id, checked) => {
    if (!onSelectionChange) return;

    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    onSelectionChange(newSelected);
  };

  // Get visible columns based on breakpoint
  const visibleColumns = useMemo(() => {
    return columns.filter(col => {
      if (!col.visibleFrom) return true;
      // Check if current breakpoint is >= visibleFrom breakpoint
      const breakpoints = { xs: 0, sm: 1, md: 2, lg: 3, xl: 4, '2xl': 5 };
      const currentBreakpointValue = (isMobile ? 0 : isTablet ? 2 : 3);
      const colBreakpointValue = breakpoints[col.visibleFrom] || 0;
      return currentBreakpointValue >= colBreakpointValue;
    });
  }, [columns, isMobile, isTablet]);

  if (isLoading) {
    return (
      <div className={`bg-white/5 backdrop-blur border border-white/10 rounded-lg overflow-hidden ${className}`}>
        <div className="p-8 text-center text-gray-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#61DAFB]" />
          <p className="text-sm mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white/5 backdrop-blur border border-white/10 rounded-lg overflow-hidden ${className}`}>
        <div className="p-8 text-center text-gray-400">
          {emptyState || (
            <>
              <p className="text-lg mb-2">No data found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Desktop Table View
  const tableView = (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            {isSelectable && (
              <th className="px-4 py-4 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input && someSelected) {
                      input.indeterminate = true;
                    }
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                  aria-label="Select all rows"
                />
              </th>
            )}
            {visibleColumns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-4 text-left text-xs sm:text-sm font-semibold text-gray-300 ${
                  col.width ? `w-${col.width}` : ''
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {data.map((row, index) => (
              <motion.tr
                key={row[rowKey]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.2, delay: index * 0.05 }
                }
                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => onRowClick?.(row)}
              >
                {isSelectable && (
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row[rowKey])}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectRow(row[rowKey], e.target.checked);
                      }}
                      className="w-4 h-4 cursor-pointer"
                      aria-label={`Select row ${row[rowKey]}`}
                    />
                  </td>
                )}
                {visibleColumns.map((col) => (
                  <td key={col.key} className="px-4 py-4 text-sm text-gray-200 truncate max-w-xs">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );

  // Mobile/Tablet Card View
  const cardView = (
    <div className="md:hidden space-y-2 p-3 sm:p-4">
      <AnimatePresence>
        {data.map((row, index) => (
          <motion.div
            key={row[rowKey]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.2, delay: index * 0.05 }
            }
            className="bg-white/5 border border-white/5 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-colors space-y-2 cursor-pointer"
            onClick={() => onRowClick?.(row)}
          >
            {/* Header row with selection and primary content */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {isSelectable && (
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row[rowKey])}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectRow(row[rowKey], e.target.checked);
                    }}
                    className="w-4 h-4 cursor-pointer mr-2 inline-block"
                    aria-label={`Select row ${row[rowKey]}`}
                  />
                )}
                <span className="text-white font-medium text-sm">
                  {visibleColumns.length > 0 && visibleColumns[0].render
                    ? visibleColumns[0].render(row[visibleColumns[0].key], row)
                    : row[visibleColumns[0]?.key]}
                </span>
              </div>
            </div>

            {/* Body - all visible columns */}
            <div className="space-y-2 text-xs sm:text-sm text-gray-300">
              {visibleColumns.slice(1).map((col) => (
                <div key={col.key} className="flex items-start justify-between">
                  <span className="text-gray-500 font-semibold">{col.label}:</span>
                  <span className="text-right">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <div className={`bg-white/5 backdrop-blur border border-white/10 rounded-lg overflow-hidden ${className}`}>
      {tableView}
      {cardView}
    </div>
  );
};

export default ResponsiveTable;
