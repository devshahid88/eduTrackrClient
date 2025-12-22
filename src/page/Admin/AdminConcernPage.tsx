
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ConcernTable from '../../components/admin/concerns/ConcernTable';
import AddConcernModal from '../../components/admin/concerns/AddConcernModal';
import EditConcernModal from '../../components/admin/concerns/EditConcernModal';
import ViewConcernModal from '../../components/admin/concerns/ViewConcernModal';
import Pagination from '../../components/admin/users/Pagination';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  id?: string;
  role: 'student' | 'teacher' | 'admin';
  username: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
}

// interface Concern {
//   _id: string;
//   title: string;
//   description: string;
//   type: 'Academic' | 'Administrative';
//   raisedBy: User;
//   role: 'student' | 'teacher';
//   status: 'Pending' | 'In Progress' | 'Solved' | 'Rejected';
//   feedback?: string;
//   createdAt: string;
// }

type Concern = any;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type ModalType = 'add' | 'edit' | 'view' | null;

const AdminConcernPage: React.FC = () => {
  const authState = useSelector((state: { auth: AuthState }) => state.auth);
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [concernsPerPage, setConcernsPerPage] = useState<number>(10);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedConcern, setSelectedConcern] = useState<Concern | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchConcerns = async () => {
      const accessToken = authState?.accessToken;

      if (!accessToken) {
        console.log('Missing auth token');
        toast.error('Please log in to view concerns.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse<Concern[]>>('/api/concerns', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('All Concerns:', response.data.data);
        if (response.data.success) {
          setConcerns(response.data.data);
          console.log('Concerns loaded successfully:', response.data.data);
          setError(null);
        } else {
          setError('Failed to load concerns.');
          toast.error('Failed to load concerns.');
        }
      } catch (error: any) {
        console.error('Error fetching concerns:', error.response?.data || error.message);
        setError(`Failed to load concerns: ${error.response?.data?.message || error.message}`);
        toast.error(`Failed to load concerns: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcerns();
  }, [authState]);

  const handleAdd = () => {
    setSelectedConcern(null);
    setModalType('add');
  };

  const handleEdit = (concern: Concern) => {
    setSelectedConcern(concern);
    setModalType('edit');
  };

  const handleView = (concern: Concern) => {
    setSelectedConcern(concern);
    setModalType('view');
  };

  const handleCloseModal = () => {
    setSelectedConcern(null);
    setModalType(null);
  };

  const handleSaveConcern = async (concernData: Partial<Concern>) => {
    const accessToken = authState?.accessToken;
    const userId = authState?.user?._id || authState?.user?.id;

    try {
      let response: { data: ApiResponse<Concern> };
      console.log('Saving concern:', concernData);
      if (concernData._id) {
        response = await axios.patch<ApiResponse<Concern>>(
          `/api/concerns/${concernData._id}`,
          concernData,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (response.data.success) {
          setConcerns(
            concerns.map((concern) =>
              concern._id === concernData._id ? response.data.data : concern
            )
          );
          toast.success('Concern updated successfully.');
        }
      } else {
        response = await axios.post<ApiResponse<Concern>>(
          '/api/concerns',
          { ...concernData, raisedBy: userId, role: 'admin' },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (response.data.success) {
          setConcerns([...concerns, response.data.data]);
          toast.success('Concern raised successfully.');
        }
      }
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving concern:', error.response?.data || error.message);
      toast.error(`Failed to save concern: ${error.response?.data?.message || error.message}`);
    }
  };

  const filteredConcerns = concerns.filter(
    (concern) =>
      concern.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concern.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concern.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concern.raisedBy?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastConcern = currentPage * concernsPerPage;
  const indexOfFirstConcern = indexOfLastConcern - concernsPerPage;
  const currentConcerns = filteredConcerns.slice(indexOfFirstConcern, indexOfLastConcern);
  const totalPages = Math.ceil(filteredConcerns.length / concernsPerPage);

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConcernsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };



  const isAdmin = authState?.user?.role === 'admin';

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[100vw] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">Manage Concerns</h1>
            <p className="text-sm sm:text-base text-gray-500">View and manage all academic and administrative concerns</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <label htmlFor="rowsPerPage" className="text-sm text-gray-600 mr-2">
                Rows:
              </label>
              <select
                id="rowsPerPage"
                value={concernsPerPage}
                onChange={handleRowsPerPageChange}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            {!isAdmin && (
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                + Raise Concern
              </button>
            )}
          </div>
        </div>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search concerns by title, type, status, or raised by..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <ConcernTable
              concerns={currentConcerns}
              onEdit={handleEdit}
              onView={handleView}
            />
            {filteredConcerns.length > 0 && (
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
        {modalType === 'add' && (
          <AddConcernModal isOpen={!!selectedConcern} onClose={handleCloseModal} onSubmit={handleSaveConcern} />
        )}
        {modalType === 'edit' && selectedConcern && (
          <EditConcernModal
            concern={selectedConcern}
            onClose={handleCloseModal}
            onSave={handleSaveConcern}
          />
        )}
        {modalType === 'view' && selectedConcern && (
          <ViewConcernModal concern={selectedConcern} onClose={handleCloseModal} />
        )}
      </div>
    </>
  );
};

export default AdminConcernPage;
