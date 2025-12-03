import React, { useState, useEffect } from 'react';
import axios from "../../api/axiosInstance";
import Sidebar from "../../components/admin/Commen/Sidebar";
import Header from "../../components/admin/Commen/Header";
import DepartmentTable from "../../components/admin/departments/DepartmentTable";
import AddDepartmentModal from "../../components/admin/departments/AddDepartmentModal";
import EditDepartmentModal from "../../components/admin/departments/EditDepartmentModal";
import ViewDepartmentModal from "../../components/admin/departments/ViewDepartmentModal";
import DeleteDepartmentModal from "../../components/admin/departments/DeleteDepartmentModal";
import Pagination from "../../components/admin/users/Pagination";
import { toast } from 'react-hot-toast';

// Interface definitions
import type { Department } from "../../types/features/department-management";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type ModalType = 'add' | 'edit' | 'view' | 'delete' | null;

// Interfaces for child component props
interface SidebarProps {
  activePage: string;
  onClose?: () => void; // Optional to align with Dashboard.tsx and fix Sidebar error
}

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

interface DepartmentTableProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  onView: (department: Department) => void;
}

interface AddDepartmentModalProps {
  onClose: () => void;
  onSave: (departmentData: Partial<Department>) => Promise<void>;
}

interface EditDepartmentModalProps {
  department: Department;
  onClose: () => void;
  onSave: (departmentData: Partial<Department>) => Promise<void>;
}

interface ViewDepartmentModalProps {
  department: Department;
  onClose: () => void;
}

interface DeleteDepartmentModalProps {
  department: Department;
  onClose: () => void;
  onDeleteSuccess: () => Promise<void>;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const AdminDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentsPerPage, setDepartmentsPerPage] = useState<number>(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<Department[]>>('/api/departments');
      setDepartments(response.data.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching departments:', err);
      setError('Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (): void => {
    setSelectedDepartment(null);
    setModalType('add');
  };

  const handleEdit = (department: Department): void => {
    setSelectedDepartment(department);
    setModalType('edit');
  };

  const handleView = (department: Department): void => {
    setSelectedDepartment(department);
    setModalType('view');
  };

  const handleDelete = (department: Department): void => {
    setSelectedDepartment(department);
    setModalType('delete');
  };

  const handleCloseModal = (): void => {
    setSelectedDepartment(null);
    setModalType(null);
  };

  const handleSaveDepartment = async (departmentData: Partial<Department>): Promise<void> => {
    try {
      let response: { data: ApiResponse<Department> };
      
      if (departmentData._id) {
        // Update existing department
        response = await axios.put<ApiResponse<Department>>(`/api/departments/${departmentData._id}`, departmentData);
        if (response.data && response.data.success) {
          setDepartments(prevDepartments => 
            prevDepartments.map(dept => 
              dept._id === departmentData._id ? response.data.data : dept
            )
          );
          toast.success('Department updated successfully!');
        }
      } else {
        // Create new department
        response = await axios.post<ApiResponse<Department>>('/api/departments/create', departmentData);
        if (response.data && response.data.success) {
          setDepartments(prevDepartments => [...prevDepartments, response.data.data]);
          toast.success('Department added successfully!');
        }
      }

      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving department:', err);
      toast.error(err.response?.data?.message || 'Failed to save department');
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedDepartment) return;
    try {
      const response = await axios.delete<ApiResponse<null>>(`/api/departments/${selectedDepartment._id}`);
      
      if (response.data && response.data.success) {
        setDepartments(prevDepartments => 
          prevDepartments.filter(dept => dept._id !== selectedDepartment._id)
        );
        toast.success('Department deleted successfully!');
        handleCloseModal();
      }
    } catch (err: any) {
      console.error('Error deleting department:', err);
      toast.error(err.response?.data?.message || 'Failed to delete department');
    }
  };

  const filteredDepartments: Department[] = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastDepartment: number = currentPage * departmentsPerPage;
  const indexOfFirstDepartment: number = indexOfLastDepartment - departmentsPerPage;
  const currentDepartments: Department[] = filteredDepartments.slice(indexOfFirstDepartment, indexOfLastDepartment);
  const totalPages: number = Math.ceil(filteredDepartments.length / departmentsPerPage);

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setDepartmentsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = (): void => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#F5F7FB] to-white">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:static lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
         activePage="departments" onClose={closeSidebar} />
      </div>

      <div className="flex-1 flex flex-col">
        <Header
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-64">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">Department Management</h1>
              <p className="text-sm sm:text-base text-gray-500">Manage academic departments</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <label htmlFor="rowsPerPage" className="text-sm text-gray-600 mr-2">
                  Rows:
                </label>
                <select
                  id="rowsPerPage"
                  value={departmentsPerPage}
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                + Add Department
              </button>
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search departments..."
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

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <DepartmentTable
                departments={currentDepartments}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
              
              {filteredDepartments.length > 0 && (
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
            <AddDepartmentModal
              onClose={handleCloseModal}
              onSave={handleSaveDepartment}
            />
          )}
          {modalType === 'edit' && selectedDepartment && (
            <EditDepartmentModal
              department={selectedDepartment}
              onClose={handleCloseModal}
              onSave={handleSaveDepartment}
            />
          )}
          {modalType === 'view' && selectedDepartment && (
            <ViewDepartmentModal
              department={selectedDepartment}
              onClose={handleCloseModal}
            />
          )}
          {modalType === 'delete' && selectedDepartment && (
            <DeleteDepartmentModal
              department={selectedDepartment}
              onClose={handleCloseModal}
              onDeleteSuccess={handleConfirmDelete}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDepartments;