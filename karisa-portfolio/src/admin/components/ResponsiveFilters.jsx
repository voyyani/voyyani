import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsive, usePrefersReducedMotion } from '../utils/responsiveHelpers';

/**
 * ResponsiveFilters - Reusable responsive filter controls
 *
 * Features:
 * - Mobile: Vertically stacked with collapsible container
 * - Tablet: 2-column grid
 * - Desktop: Full horizontal row
 * - Active filter count badge
 * - Configurable filter types (text, select, multiselect, date-range, chip-group)
 * - Reset all filters button
 * - Touch-friendly heights (44-48px min)
 *
 * Props:
 * - filters: Array<{
 *     key: string,
 *     label: string,
 *     type: 'text' | 'select' | 'multiselect' | 'date-range' | 'chip-group',
 *     options?: Array<{ value, label, icon? }>,
 *     value: any,
 *     onChange: function,
 *     placeholder?: string,
 *     clearable?: boolean,
 *   }>
 * - onReset?: function
 * - onApply?: function
 * - collapsibleOnMobile?: boolean (default: true)
 * - className?: string
 */
const ResponsiveFilters = ({
  filters = [],
  onReset,
  onApply,
  collapsibleOnMobile = true,
  className = '',
}) => {
  const { isMobile, isTablet } = useResponsive();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isExpanded, setIsExpanded] = useState(!collapsibleOnMobile);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return filters.filter(f => {
      if (Array.isArray(f.value)) return f.value.length > 0;
      if (typeof f.value === 'string') return f.value !== '' && f.value !== 'all';
      if (typeof f.value === 'number') return f.value !== 0;
      return !!f.value;
    }).length;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const handleReset = () => {
    onReset?.();
    setIsExpanded(false);
  };

  // Determine grid layout
  const gridClassName = isMobile
    ? 'flex flex-col gap-2'
    : isTablet
    ? 'grid grid-cols-2 gap-3'
    : 'grid grid-cols-auto-fit gap-3 auto-flow-dense';

  // Render individual filter control
  const renderFilterControl = (filter, index) => {
    const inputBaseClass =
      'px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#61DAFB]/50 text-sm sm:text-base min-h-11 sm:min-h-12 transition-all';

    const isActive = Array.isArray(filter.value)
      ? filter.value.length > 0
      : filter.value !== '' && filter.value !== 'all' && filter.value !== 0;

    const activeClass = isActive
      ? 'border-[#61DAFB]/50 bg-[#61DAFB]/10'
      : '';

    return (
      <motion.div
        key={filter.key}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { delay: index * 0.05 }
        }
        className="flex-1 min-w-0"
      >
        {filter.type === 'text' && (
          <div className="relative">
            <input
              type="text"
              placeholder={filter.placeholder || filter.label}
              value={filter.value || ''}
              onChange={(e) => filter.onChange(e.target.value)}
              className={`w-full ${inputBaseClass} ${activeClass}`}
              aria-label={filter.label}
            />
            {filter.clearable && filter.value && (
              <button
                onClick={() => filter.onChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                aria-label={`Clear ${filter.label}`}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {filter.type === 'select' && (
          <select
            value={filter.value || 'all'}
            onChange={(e) => filter.onChange(e.target.value)}
            className={`w-full ${inputBaseClass} ${activeClass} cursor-pointer`}
            aria-label={filter.label}
          >
            <option value="all" className="bg-[#0a1929]">
              {filter.placeholder || `All ${filter.label}`}
            </option>
            {filter.options?.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0a1929]">
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {filter.type === 'multiselect' && (
          <div className="space-y-2">
            <label className="text-sm text-gray-400">{filter.label}</label>
            <div className="flex gap-2 flex-wrap">
              {filter.options?.map((opt) => {
                const isSelected = Array.isArray(filter.value)
                  ? filter.value.includes(opt.value)
                  : false;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      const newValue = Array.isArray(filter.value)
                        ? filter.value.includes(opt.value)
                          ? filter.value.filter(v => v !== opt.value)
                          : [...filter.value, opt.value]
                        : [opt.value];
                      filter.onChange(newValue);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-[#61DAFB] text-[#0a1929]'
                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {opt.icon && <span className="mr-1">{opt.icon}</span>}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filter.type === 'date-range' && (
          <div className="space-y-2">
            <label className="text-sm text-gray-400">{filter.label}</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filter.value?.from || ''}
                onChange={(e) =>
                  filter.onChange({ ...filter.value, from: e.target.value })
                }
                className={`${inputBaseClass} text-xs`}
                aria-label={`${filter.label} from`}
              />
              <input
                type="date"
                value={filter.value?.to || ''}
                onChange={(e) =>
                  filter.onChange({ ...filter.value, to: e.target.value })
                }
                className={`${inputBaseClass} text-xs`}
                aria-label={`${filter.label} to`}
              />
            </div>
          </div>
        )}

        {filter.type === 'chip-group' && (
          <div className="space-y-2">
            <label className="text-sm text-gray-400">{filter.label}</label>
            <div className="flex gap-2 flex-wrap">
              {filter.options?.map((opt) => {
                const isSelected = filter.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => filter.onChange(opt.value)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-[#61DAFB] text-[#0a1929]'
                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // Mobile collapsible version
  if (isMobile && collapsibleOnMobile) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">🔍 Filters</span>
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <span className={`text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {/* Expanded Filters */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-2"
            >
              <div className={`${gridClassName} p-3 bg-white/5 border border-white/10 rounded-lg`}>
                {filters.map((filter, index) => renderFilterControl(filter, index))}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={handleReset}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors text-sm font-medium min-h-11"
                  >
                    Reset
                  </button>
                )}
                {onApply && (
                  <button
                    onClick={() => {
                      onApply();
                      setIsExpanded(false);
                    }}
                    className="flex-1 px-4 py-3 bg-[#61DAFB] text-[#0a1929] rounded-lg hover:bg-[#61DAFB]/90 transition-colors text-sm font-semibold min-h-11"
                  >
                    Apply
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Desktop/Tablet version (always expanded)
  return (
    <motion.div
      className={`${gridClassName} ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {filters.map((filter, index) => renderFilterControl(filter, index))}

      {/* Action Buttons */}
      <motion.div
        className="flex gap-2 md:col-span-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: (filters.length * 0.05) + 0.1 }}
      >
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors text-sm font-medium min-h-11"
          >
            Reset Filters
          </button>
        )}
        {onApply && (
          <button
            onClick={onApply}
            className="px-4 py-3 bg-[#61DAFB] text-[#0a1929] rounded-lg hover:bg-[#61DAFB]/90 transition-colors text-sm font-semibold min-h-11"
          >
            Apply Filters
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ResponsiveFilters;
