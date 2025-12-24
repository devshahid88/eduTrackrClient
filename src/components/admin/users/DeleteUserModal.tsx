import axiosInstance from '../../../api/axiosInstance';
import { Toaster, toast } from 'react-hot-toast';

const DeleteUserModal = ({ user, onClose, onDeleteSuccess }) => {

  const handleDelete = async () => {
    try {
      const userId = user._id || user.id;
      let apiUrl = '';
  
      if (user.role === 'Student') {
        apiUrl = `/api/students/${userId}`;
      } else if (user.role === 'Teacher') {
        apiUrl = `/api/teachers/${userId}`;
      } else if (user.role === 'Admin') {
        apiUrl = `/api/admins/${userId}`;
      }
  
      const response = await axiosInstance.delete(apiUrl);
  
      toast.success(response.data?.message || 'User deleted successfully');
      onDeleteSuccess(userId);  // Notify parent
      onClose();  // Close modal
    } catch (error:any) {
      console.error('Delete error:', error.message);
      toast.error(error.message || 'An error occurred while deleting user');
    }
  };
  

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Delete User</h3>
          <div className="mt-2 px-7 py-3">
            <p>Are you sure you want to delete this user?</p>
            <p className="mt-2 text-gray-700 font-medium">{user.username}</p>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
