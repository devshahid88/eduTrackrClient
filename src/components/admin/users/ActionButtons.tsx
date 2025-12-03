import React from 'react';

const ActionButtons = ({ user, onEdit, onView, onDelete }) => {
  return (
    <div className="flex justify-center space-x-2">
      <button
        onClick={() => onView(user)}
        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
        title="View"
      >
        <i className="ti ti-eye text-lg"></i>
      </button>
      <button
        onClick={() => onEdit(user)}
        className="p-1 text-green-600 hover:text-green-800 transition-colors"
        title="Edit"
      >
        <i className="ti ti-edit text-lg"></i>
      </button>
      <button
        onClick={() => onDelete(user)}
        className="p-1 text-red-600 hover:text-red-800 transition-colors"
        title="Delete"
      >
        <i className="ti ti-trash text-lg"></i>
      </button>
    </div>
  );
};

export default ActionButtons;