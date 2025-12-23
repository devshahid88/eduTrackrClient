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
    <div className="p-8 space-y-8">
      {/* Top Filter Bar */}
      <div className="flex flex-col lg:flex-row items-end gap-6">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Course Select */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
              Course
            </label>
            <select
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-gray-700 appearance-none"
            >
              <option value="all">All Courses</option>
              {courses?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-gray-700 appearance-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Select */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-gray-700 appearance-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="h-12 px-6 flex items-center justify-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-50 rounded-2xl transition-colors whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Clear Filters
          </button>
        )}
      </div>

      {/* Quick Access Pills */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-50">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Quick Tags:</span>
        {statusOptions.slice(1).map((option) => (
          <button
            key={option.value}
            onClick={() => handleFilterChange('status', option.value)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filters.status === option.value
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105'
                : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
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