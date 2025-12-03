import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

interface User {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  role: string;
  status?: 'active' | 'pending' | 'inactive' | string;
}

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

const DashboardPagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center space-x-1 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md ${
          currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <i className="ti ti-chevron-left text-sm"></i>
      </button>

      <span className="px-3 py-2 text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-md ${
          currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <i className="ti ti-chevron-right text-sm"></i>
      </button>
    </div>
  );
};

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const usersPerPage: number = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/students/');
        const userData = response.data?.data?.users || response.data?.data;

        if (Array.isArray(userData)) {
          setUsers(userData);
        } else {
          setError('Unexpected data format received from server');
        }
      } catch (err) {
        console.error('Error fetching recent users:', err);
        setError('Failed to load recent users');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUsers();
  }, []);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handleViewUser = (userId: string) => {
    navigate('/admin/users');
  };

  const handleEditUser = (userId: string) => {
    navigate('/admin/users');
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/students/${userId}`);
        setUsers(users.filter(user => (user._id || user.id) !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleViewAll = () => {
    navigate('/admin/users');
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="mt-8 bg-white rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-6 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
        <button onClick={handleViewAll} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <span>View All</span>
          <i className="ti ti-arrow-right text-sm" />
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No users found</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Role'].map(header => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentUsers.map(user => (
                  <tr key={user._id || user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <DashboardPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserTable;
