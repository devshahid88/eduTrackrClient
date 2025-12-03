import React from 'react';
import { DeleteConfirmationModalProps } from '../../../types/components/admin';

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  department, 
  onClose, 
  onConfirm,
  loading = false 
}) => {
  if (!department) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm(department._id);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <i className="ti ti-alert-triangle text-red-600 text-xl" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Department</h3>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the department{' '}
            <span className="font-semibold">"{department.name}"</span>?{' '}
            This action cannot be undone and may affect related courses and users.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="ti ti-loader animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Department'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
