
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import Sidebar from '../../components/admin/Commen/Sidebar';
import Header from '../../components/admin/Commen/Header';
import UserTable from '../../components/admin/users/UsersTable';
import Filter from '../../components/admin/users/FilterSection';
import Pagination from '../../components/admin/users/Pagination';
import EditUserModal from '../../components/admin/users/EditUserModal';
import ViewUserModal from '../../components/admin/users/ViewUserModal';
import DeleteUserModal from '../../components/admin/users/DeleteUserModal';
import AddUserModal from '../../components/admin/users/AddUserModal';
import { toast } from 'react-hot-toast';

// Interface definitions
interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
 role: 'Student' | 'Teacher' | 'Admin'; 
  firstName?: string;
  lastName?: string;
  password?: string;
  isActive?: boolean;
  courses?: string[];
  isBlock?: boolean;
  profileImage?: string;
  
  
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type ModalType = 'add' | 'edit' | 'view' | 'delete' | null;

interface FilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  roleOptions?: string[];
  className?: string;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usersPerPage, setUsersPerPage] = useState<number>(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const roleOptions: string[] = ['All', 'Admin', 'Teacher', 'Student'];

useEffect(() => {
  fetchAllUsers();
}, [searchTerm, selectedRole]);

  // components/admin/users/AdminUserManagement.tsx
const fetchAllUsers = async (): Promise<void> => {
  setLoading(true);
  try {
    const response = await axios.get<ApiResponse<User[]>>("/api/admins/search", {
      params: {
        searchTerm: searchTerm.trim(), // optional: trim whitespace
        role: selectedRole,            // always send the role, including "All"
      },
    });

    if (response.data.success) {
      setUsers(response.data.data || []);
      console.log("Fetched users:", response.data.data);
      setError(null);
    } else {
      throw new Error(response.data.message || "Failed to fetch users");
    }
  } catch (err: any) {
    console.error("Error fetching users:", err);
    setError("Failed to fetch users.");
  } finally {
    setLoading(false);
  }
};

  const getEndpointByRole = (role: string): string => {
    switch (role) {
      case 'Admin':
        return '/api/admins';
      case 'Teacher':
        return '/api/teachers';
      case 'Student':
        return '/api/students';
      default:
        return '/api/students';
    }
  };

  const handleAdd = (): void => {
    setSelectedUser({
      username: '',
      email: '',
      role: 'Student',
      password: '',
      firstName: '',
      lastName: '',
      isActive: true,
    });
    setModalType('add');
  };

  const handleEdit = (user: User): void => {
    setSelectedUser({ ...user });
    setModalType('edit');
  };

  const handleView = (user: User): void => {
    setSelectedUser(user);
    setModalType('view');
  };

  const handleDelete = (user: User): void => {
    setSelectedUser(user);
    setModalType('delete');
  };

  const handleCloseModal = (): void => {
    setSelectedUser(null);
    setModalType(null);
  };

  const handleConfirmDelete = async (id: string): Promise<void> => {
    if (!selectedUser) return;
    try {
      const endpoint = getEndpointByRole(selectedUser.role);
      const userId = selectedUser._id || selectedUser.id;
      const response = await axios.delete<ApiResponse<null>>(`${endpoint}/${userId}`);

      if (response.data?.success) {
        setUsers((prevUsers) =>
          prevUsers.filter((u) => {
            const currentUserId = u._id || u.id;
            return currentUserId !== userId;
          })
        );
        toast.success('User deleted successfully!');
        handleCloseModal();
      } else {
        throw new Error(response.data?.message || 'Failed to delete user');
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSaveUser = async (userData: User): Promise<void> => {
    try {
      const endpoint = getEndpointByRole(userData.role);
      const userId = userData._id || userData.id;

      let response: { data: ApiResponse<User> };
      if (userId) {
        response = await axios.put<ApiResponse<User>>(`${endpoint}/${userId}`, userData, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        response = await axios.post<ApiResponse<User>>(`${endpoint}/create`, userData, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (response.data?.success) {
        const updatedUser = { ...response.data.data, _id: userId || response.data.data._id, id: userId || response.data.data.id };
        setUsers((prevUsers) => {
          const isExistingUser = prevUsers.some((u) => (u._id || u.id) === userId);
          if (isExistingUser) {
            return prevUsers.map((u) => ((u._id || u.id) === userId ? updatedUser : u));
          } else {
            return [...prevUsers, updatedUser];
          }
        });
        toast.success(userId ? 'User updated successfully!' : 'User added successfully!');
        handleCloseModal();
      } else {
        throw new Error(response.data?.message || 'Failed to save user');
      }
    } catch (err: any) {
      console.error('Error saving user:', err);
      toast.error(err.response?.data?.message || 'Failed to save user. Please try again.');
    }
  };

  const filteredUsers: User[] = users.filter((user) =>
    (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedRole === 'All' || user.role === selectedRole)
  );

  const totalPages: number = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers: User[] = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleClearFilters = (): void => {
    setSearchTerm('');
    setSelectedRole('All');
  };


  return (
    <>
      {/* Google Fonts and Tabler Icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.30.0/tabler-icons.min.css"
        rel="stylesheet"
      />

     <div className="flex min-h-screen bg-gradient-to-b from-[#F5F7FB] to-white">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:static lg:transform-none ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <Sidebar activePage="users" onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-2">User Management</h1>
            <p className="text-sm sm:text-base text-gray-500 mb-6">
              Manage platform users, search and filter by role.
            </p>

            {/* Filter and Add User Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <Filter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                roleOptions={roleOptions}
                classOptions={['All', 'Admin', 'Teacher', 'Student']}
                className="w-full sm:w-auto"
                
              />

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center">
                  <label htmlFor="rowsPerPage" className="text-sm text-gray-600 mr-2">
                    Rows:
                  </label>
                  <select
                    id="rowsPerPage"
                    value={usersPerPage}
                    onChange={handleRowsPerPageChange}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <button
                  onClick={handleAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition w-full sm:w-auto"
                >
                  + Add User
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r">
                <div className="flex items-center">
                  <i className="ti ti-alert-circle text-red-400 text-lg mr-2"></i>
                  <div>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                    <p className="text-red-600 text-xs mt-1">
                      Please try refreshing or contact support.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* User Table */}
                {filteredUsers.length === 0 ? (
                  <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center">
                    <p className="text-gray-600 mb-4">
                      No users found matching your filters.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <UserTable
                    users={paginatedUsers}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                  />
                )}

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {/* Modals */}
        {modalType === 'edit' && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={handleCloseModal}
            onSave={handleSaveUser}
          />
        )}
        {modalType === 'view' && selectedUser && (
          <ViewUserModal user={selectedUser} onClose={handleCloseModal} />
        )}
        {modalType === 'delete' && selectedUser && (
          <DeleteUserModal
            user={selectedUser}
            onClose={handleCloseModal}
            onDeleteSuccess={handleConfirmDelete}
          />
        )}
        {modalType === 'add' && (
          <AddUserModal onClose={handleCloseModal} onSave={handleSaveUser}  />
        )}
      </div>
    </>
  );
};

export default AdminUserManagement;
