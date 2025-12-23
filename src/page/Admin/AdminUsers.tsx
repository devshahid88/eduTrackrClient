
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import UserTable from '../../components/admin/users/UsersTable';
import Filter from '../../components/admin/users/FilterSection';
import Pagination from '../../components/admin/users/Pagination';
import EditUserModal from '../../components/admin/users/EditUserModal';
import ViewUserModal from '../../components/admin/users/ViewUserModal';
import DeleteUserModal from '../../components/admin/users/DeleteUserModal';
import AddUserModal from '../../components/admin/users/AddUserModal';
import { toast } from 'react-hot-toast';
import { 
  MdPeople, 
  MdAdd, 
  MdErrorOutline, 
  MdFingerprint, 
  MdPersonSearch 
} from 'react-icons/md';

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

  const roleOptions: string[] = ['All', 'Admin', 'Teacher', 'Student'];

  useEffect(() => {
    fetchAllUsers();
  }, [searchTerm, selectedRole]);

  const fetchAllUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse<User[]>>("/api/admins/search", {
        params: {
          searchTerm: searchTerm.trim(),
          role: selectedRole,
        },
      });

      if (response.data.success) {
        setUsers(response.data.data || []);
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
      case 'Admin': return '/api/admins';
      case 'Teacher': return '/api/teachers';
      case 'Student': return '/api/students';
      default: return '/api/students';
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
    <div className="container mx-auto px-4 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Branded Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-2">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-900 rounded-2xl text-blue-400 shadow-2xl shadow-blue-500/20">
                 <MdPeople className="text-2xl" />
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Personnel Registry</span>
                 <div className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black border border-blue-100">{users.length} Active</div>
              </div>
           </div>
           <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none">Identity Management</h1>
              <p className="text-gray-400 font-bold mt-2">Centralized control for all system actors and role assignments.</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white px-8 py-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 group">
              <div className="flex flex-col">
                 <label htmlFor="rowsPerPage" className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5 px-1">Integrity View</label>
                 <select
                   id="rowsPerPage"
                   value={usersPerPage}
                   onChange={handleRowsPerPageChange}
                   className="bg-transparent border-none text-xs font-black text-gray-900 focus:ring-0 cursor-pointer p-0"
                 >
                   <option value={5}>05 Souls</option>
                   <option value={10}>10 Souls</option>
                   <option value={20}>20 Souls</option>
                   <option value={50}>50 Souls</option>
                 </select>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-200 hover:scale-105 transition-all active:scale-95 text-xs truncate"
              >
                <MdAdd className="text-lg" />
                Initialize Persona
              </button>
           </div>
        </div>
      </div>

      {/* Floating Filter Hub */}
      <div className="px-2">
         <Filter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            roleOptions={roleOptions}
            className="w-full"
         />
      </div>

      {/* Data Visualization Grid */}
      <div className="px-2">
         {error && (
           <div className="bg-rose-50 border border-rose-100 p-6 mb-10 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
             <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                <MdErrorOutline size={24} />
             </div>
             <div>
                <p className="text-sm font-black text-rose-700 tracking-tight leading-none italic">{error}</p>
                <button onClick={handleClearFilters} className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1 hover:underline underline-offset-4">Reset Matrix Filters</button>
             </div>
           </div>
         )}

         {loading ? (
           <div className="bg-white rounded-[2.5rem] p-24 flex flex-col items-center justify-center gap-6 shadow-sm border border-gray-100">
              <div className="relative">
                 <div className="animate-spin h-16 w-16 border-[5px] border-blue-600/10 border-t-blue-600 rounded-full" />
                 <MdFingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-blue-600 animate-pulse" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-1">Decoding Personnel Matrix...</p>
           </div>
         ) : filteredUsers.length === 0 ? (
           <div className="bg-white rounded-[2.5rem] p-24 border border-gray-100 shadow-sm text-center flex flex-col items-center opacity-40">
              <MdPersonSearch size={64} className="text-gray-300 mb-6" />
              <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-2">No Matches in Current Sector</p>
              <button onClick={handleClearFilters} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline underline-offset-4">Recalibrate Filters</button>
           </div>
         ) : (
           <>
              <UserTable
                users={paginatedUsers}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
              />

              <div className="mt-12 bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredUsers.length}
                  itemsPerPage={usersPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setUsersPerPage}
                  variant="minimal"
                />
              </div>
           </>
         )}
      </div>

      {/* Modals */}
      {modalType === 'edit' && selectedUser && (
        <EditUserModal user={selectedUser} onClose={handleCloseModal} onSave={handleSaveUser} />
      )}
      {modalType === 'view' && selectedUser && (
        <ViewUserModal user={selectedUser} onClose={handleCloseModal} />
      )}
      {modalType === 'delete' && selectedUser && (
        <DeleteUserModal user={selectedUser} onClose={handleCloseModal} onDeleteSuccess={handleConfirmDelete} />
      )}
      {modalType === 'add' && (
        <AddUserModal onClose={handleCloseModal} onSave={handleSaveUser}  />
      )}
    </div>
  );
};

export default AdminUserManagement;
