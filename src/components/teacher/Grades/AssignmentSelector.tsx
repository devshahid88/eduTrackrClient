import React from 'react';

const AssignmentSelector = ({ assignments, selectedAssignment, onSelect, isLoading }) => {
  return (
    <div className="w-full max-w-md">
      <label
        htmlFor="assignment"
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        Select Assignment
      </label>
      <select
        id="assignment"
        value={selectedAssignment?._id || ''}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isLoading}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all duration-200 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Select an assignment"
      >
        <option value="">Select an assignment</option>
        {assignments.map((assignment) => (
          <option key={assignment._id} value={assignment._id}>
            {assignment.title} - {assignment.course?.name}
          </option>
        ))}
      </select>

      {selectedAssignment && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-700">
            Course: <span className="text-gray-900">{selectedAssignment.course?.name}</span>
          </p>
          <p className="text-sm font-medium text-gray-700 mt-2">
            Due Date:{' '}
            <span className="text-gray-900">
              {new Date(selectedAssignment.dueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignmentSelector;