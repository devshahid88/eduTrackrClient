import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ScheduleFiltersProps } from '../../../types/components/admin';
import { DayOfWeek } from '../../../types/features/schedule-management';

const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  filters,
  departments,
  onFilterChange,
  onClearFilters,
  isOpen,
  onToggle
}) => {
  const daysOfWeek: DayOfWeek[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchTerm: e.target.value });
  };

  const handleFilterChange = (key: keyof typeof filters) => 
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFilterChange({ ...filters, [key]: e.target.value });
    };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search schedules..."
            value={filters.searchTerm || ''}
            onChange={handleSearchChange}
            className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={onToggle}
          className={`flex items-center justify-center px-4 py-2 border rounded-md transition-colors ${
            isOpen 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-300 bg-white hover:bg-gray-50'
          }`}
        >
          <Filter size={18} className="mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center justify-center w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department || ''}
                onChange={handleFilterChange('department')}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Day Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day
              </label>
              <select
                value={filters.day || ''}
                onChange={handleFilterChange('day')}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="">All Days</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={onClearFilters}
                disabled={!hasActiveFilters}
                className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                  hasActiveFilters 
                    ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <X size={16} className="mr-1" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleFilters;
