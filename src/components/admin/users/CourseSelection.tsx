import React, { useState } from 'react';
import { Search, BookOpen, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Course } from '../../../types/features/schedule-management';

interface CourseSelectionProps {
  courses: Course[];
  selectedCourses: string[];
  onCourseToggle: (courseId: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  maxHeight?: string;
  showSearch?: boolean;
  required?: boolean;
  title?: string;
  subtitle?: string;
}

const CourseSelection: React.FC<CourseSelectionProps> = ({
  courses,
  selectedCourses,
  onCourseToggle,
  disabled = false,
  error,
  className = '',
  maxHeight = 'max-h-40',
  showSearch = true,
  required = false,
  title = 'Courses',
  subtitle
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle course toggle
  const handleCourseToggle = (courseId: string) => {
    if (!disabled) {
      onCourseToggle(courseId);
    }
  };

  // Handle select all/none
  const handleSelectAll = () => {
    if (disabled) return;
    
    const allVisible = filteredCourses.every(course => 
      selectedCourses.includes(course._id)
    );
    
    if (allVisible) {
      // Deselect all visible courses
      filteredCourses.forEach(course => {
        if (selectedCourses.includes(course._id)) {
          onCourseToggle(course._id);
        }
      });
    } else {
      // Select all visible courses
      filteredCourses.forEach(course => {
        if (!selectedCourses.includes(course._id)) {
          onCourseToggle(course._id);
        }
      });
    }
  };

  const allVisibleSelected = filteredCourses.length > 0 && 
    filteredCourses.every(course => selectedCourses.includes(course._id));
  
  const someVisibleSelected = filteredCourses.some(course => 
    selectedCourses.includes(course._id)
  );

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Search and Controls */}
      {(showSearch || courses.length > 5) && (
        <div className="mb-3 space-y-2">
          {/* Search Input */}
          {showSearch && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={disabled}
                className={`pl-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${
                  disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>
          )}

          {/* Select All/None Button */}
          {filteredCourses.length > 1 && (
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={disabled}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                disabled 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
              }`}
            >
              {allVisibleSelected ? 'Deselect All' : 'Select All'}
              {searchTerm && ` (${filteredCourses.length} shown)`}
            </button>
          )}
        </div>
      )}

      {/* Course List */}
      <div className={`border rounded-md p-3 ${maxHeight} overflow-y-auto ${
        disabled ? 'bg-gray-50' : 'bg-white'
      } ${error ? 'border-red-300' : 'border-gray-300'}`}>
        
        {/* Selected count indicator */}
        {selectedCourses.length > 0 && (
          <div className="mb-2 pb-2 border-b border-gray-200">
            <div className="flex items-center text-xs text-green-600">
              <CheckCircle2 size={14} className="mr-1" />
              {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
            </div>
          </div>
        )}

        {/* Courses */}
        {filteredCourses.length > 0 ? (
          <div className="space-y-2">
            {filteredCourses.map((course) => {
              const isSelected = selectedCourses.includes(course._id);
              return (
                <div
                  key={course._id}
                  className={`flex items-start space-x-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50' : ''
                  } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  onClick={() => handleCourseToggle(course._id)}
                >
                  {/* Checkbox */}
                  <div className="flex items-center pt-0.5">
                    {isSelected ? (
                      <CheckCircle2 
                        size={18} 
                        className={`${disabled ? 'text-gray-400' : 'text-blue-600'}`} 
                      />
                    ) : (
                      <Circle 
                        size={18} 
                        className={`${disabled ? 'text-gray-300' : 'text-gray-400'}`} 
                      />
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <BookOpen size={14} className="text-gray-500 flex-shrink-0" />
                      <span className={`text-sm font-medium truncate ${
                        disabled ? 'text-gray-400' : 'text-gray-900'
                      }`}>
                        {course.code}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${
                      disabled ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {course.name}
                    </p>
                    {/* Course metadata */}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        disabled 
                          ? 'bg-gray-200 text-gray-400' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        Semester {course.semester}
                      </span>
                      {course.credits && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          disabled 
                            ? 'bg-gray-200 text-gray-400' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {course.credits} credits
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty states */
          <div className="text-center py-8 text-gray-500">
            {courses.length === 0 ? (
              <div className="space-y-2">
                <BookOpen size={24} className="mx-auto text-gray-300" />
                <p className="text-sm">
                  {disabled 
                    ? 'Please select department and semester first'
                    : 'No courses available for selected criteria'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Search size={24} className="mx-auto text-gray-300" />
                <p className="text-sm">
                  No courses found matching "{searchTerm}"
                </p>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center text-xs text-red-500">
          <AlertCircle size={14} className="mr-1 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Helper text */}
      {!error && !disabled && courses.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          {selectedCourses.length === 0 
            ? 'Select at least one course' 
            : `${selectedCourses.length} of ${courses.length} courses selected`
          }
        </p>
      )}
    </div>
  );
};

export default CourseSelection;
