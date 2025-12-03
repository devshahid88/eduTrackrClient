import React from 'react';

const DeleteDepartmentModal = ({ department, onClose, onDeleteSuccess }) => {
  const handleDelete = () => {
    onDeleteSuccess(department._id);  // Trigger the parent’s delete handler
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Department</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete the department "{department.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDepartmentModal;
