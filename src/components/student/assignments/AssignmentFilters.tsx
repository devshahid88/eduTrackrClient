import React, { FC } from 'react';
import PropTypes from 'prop-types';

// Add interfaces at the top
interface Attachment {
  name: string;
  url: string;
}

interface Submission {
  _id: string;
  studentId?: string;
  submittedAt: string;
  isLate?: boolean;
  grade?: number;
  feedback?: string;
  attachments?: Attachment[];
}

interface Teacher {
  _id: string;
  name?: string;
  username?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  createdAt?: string;
  maxMarks: number;
  submissions?: Submission[];
  courseName?: string;
  departmentName?: string;
  teacherId?: Teacher;
  submissionFormat?: string;
  attachments?: Attachment[];
  allowLateSubmission?: boolean;
  [key: string]: any;
}

interface AssignmentFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  courses: any[];
  departments: any[];
  courseNameMap?: Map<string, string>;
  departmentNameMap?: Map<string, string>;
  isStudent?: boolean;
}

const AssignmentFilters :FC<AssignmentFiltersProps>= ({
  filters,
  setFilters,
  courses = [],
  departments = [],
  courseNameMap = new Map(),
  departmentNameMap = new Map(),
  isStudent = true,
}) => {
  console.log('AssignmentFilters props:', { filters, courses, departments, isStudent });

  const handleFilterChange = (filterName, value) => {
    console.log('Filter changed:', { filterName, value });
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      course: 'all',
      department: 'all',
      status: 'all',
      sortBy: 'dueDate',
    });
  };

  const hasActiveFilters = filters.course !== 'all' || filters.department !== 'all' || filters.status !== 'all';

  const removeFilter = (filterName) => {
    handleFilterChange(filterName, 'all');
  };

  const getFilterDisplayName = (filterType, value) => {
    switch (filterType) {
      case 'course':
        return `Course: ${courseNameMap?.get(value) || value || 'Unknown'}`;
      case 'department':
        return `Department: ${departmentNameMap?.get(value) || value || 'Unknown'}`;
      case 'status':
        return `Status: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
      default:
        return value;
    }
  };

  const statusOptions = isStudent
    ? [
        { value: 'all', label: 'All Assignments' },
        { value: 'pending', label: 'Pending' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'upcoming', label: 'Upcoming' },
      ]
    : [
        { value: 'all', label: 'All Assignments' },
        { value: 'active', label: 'Active' },
        { value: 'expired', label: 'Expired' },
      ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'title', label: 'Title' },
  ];

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
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
        <span className="text-sm font-medium text-gray-700 mr-2">Quick Filters:</span>
        
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleFilterChange('status', option.value)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              filters.status === option.value
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center space-x-1">
              <div className={`w-2 h-2 ${option.value === 'pending' ? 'bg-blue-500' : option.value === 'submitted' ? 'bg-green-500' : option.value === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'} rounded-full`}></div>
              <span>{option.label}</span>
            </span>
          </button>
        ))}
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
                filters.status === 'pending' 
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : filters.status === 'submitted'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : filters.status === 'overdue'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
              }`}>
                {getFilterDisplayName('status', filters.status)}
                <button
                  onClick={() => removeFilter('status')}
                  className={`ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full focus:outline-none ${
                    filters.status === 'pending' 
                      ? 'hover:bg-blue-200'
                      : filters.status === 'submitted'
                      ? 'hover:bg-green-200'
                      : filters.status === 'overdue'
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

// AssignmentFilters.propTypes = {
//   filters: PropTypes.shape({
//     course: PropTypes.string,
//     department: PropTypes.string,
//     status: PropTypes.string,
//     sortBy: PropTypes.string,
//   }).isRequired,
//   setFilters: PropTypes.func.isRequired,
//   courses: PropTypes.arrayOf(PropTypes.shape({
//     _id: PropTypes.string,
//     name: PropTypes.string
//   })),
//   departments: PropTypes.arrayOf(PropTypes.shape({
//     _id: PropTypes.string,
//     name: PropTypes.string
//   })),
//   courseNameMap: PropTypes.instanceOf(Map),
//   departmentNameMap: PropTypes.instanceOf(Map),
//   isStudent: PropTypes.bool,
// };

export default AssignmentFilters;