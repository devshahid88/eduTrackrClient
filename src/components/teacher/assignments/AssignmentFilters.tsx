import React from 'react';

const AssignmentFilters = ({ filters, setFilters, courses, departments, courseNameMap, departmentNameMap }) => {
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      course: 'all',
      department: 'all',
      status: 'all',
      sortBy: 'dueDate'
    });
  };

  const hasActiveFilters = filters.course !== 'all' || filters.department !== 'all' || filters.status !== 'all';

  const removeFilter = (filterName) => {
    handleFilterChange(filterName, 'all');
  };

  const getFilterDisplayName = (filterType, value) => {
    switch (filterType) {
      case 'course':
        return `Course: ${courseNameMap.get(value) || value}`;
      case 'department':
        return `Department: ${departmentNameMap.get(value) || value}`;
      case 'status':
        return `Status: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
      default:
        return value;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Assignments</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Course Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course
          </label>
          <select
            value={filters.course}
            onChange={(e) => handleFilterChange('course', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Courses</option>
            {courses?.map((courseId) => (
              <option key={courseId} value={courseId}>
                {courseNameMap.get(courseId)}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Departments</option>
            {departments?.map((departmentId) => (
              <option key={departmentId} value={departmentId}>
                {departmentNameMap.get(departmentId)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Assignments</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="due-soon">Due Soon</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="dueDate">Due Date</option>
            <option value="createdAt">Created Date</option>
            <option value="title">Title (A-Z)</option>
            <option value="submissions">Most Submissions</option>
            <option value="maxMarks">Highest Marks</option>
          </select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
        <span className="text-sm font-medium text-gray-700 mr-2">Quick Filters:</span>
        
        <button
          onClick={() => handleFilterChange('status', 'active')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            filters.status === 'active'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Active</span>
          </span>
        </button>

        <button
          onClick={() => handleFilterChange('status', 'expired')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            filters.status === 'expired'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Expired</span>
          </span>
        </button>

        <button
          onClick={() => handleFilterChange('status', 'due-soon')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            filters.status === 'due-soon'
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Due Soon</span>
          </span>
        </button>

        <button
          onClick={() => handleFilterChange('sortBy', 'submissions')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            filters.sortBy === 'submissions'
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span>Top Submissions</span>
          </span>
        </button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            <span className="text-xs text-gray-500">
              {Object.values(filters).filter(value => value !== 'all' && value !== 'dueDate').length} active
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.course !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {getFilterDisplayName('course', filters.course)}
                <button
                  onClick={() => removeFilter('course')}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </span>
            )}
            
            {filters.department !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                {getFilterDisplayName('department', filters.department)}
                <button
                  onClick={() => removeFilter('department')}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200 focus:outline-none"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </span>
            )}
            
            {filters.status !== 'all' && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                filters.status === 'active' 
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : filters.status === 'expired'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
              }`}>
                {getFilterDisplayName('status', filters.status)}
                <button
                  onClick={() => removeFilter('status')}
                  className={`ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full focus:outline-none ${
                    filters.status === 'active' 
                      ? 'hover:bg-green-200'
                      : filters.status === 'expired'
                      ? 'hover:bg-red-200'
                      : 'hover:bg-yellow-200'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentFilters;