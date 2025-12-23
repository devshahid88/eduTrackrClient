import React, { useState, useEffect } from 'react';
import axios from "../../api/axiosInstance";
import DepartmentTable from "../../components/admin/departments/DepartmentTable";
import AddDepartmentModal from "../../components/admin/departments/AddDepartmentModal";
import EditDepartmentModal from "../../components/admin/departments/EditDepartmentModal";
import ViewDepartmentModal from "../../components/admin/departments/ViewDepartmentModal";
import DeleteDepartmentModal from "../../components/admin/departments/DeleteDepartmentModal";
import Pagination from "../../components/admin/users/Pagination";
import { toast } from 'react-hot-toast';
import { 
  MdCorporateFare, 
  MdAdd, 
  MdSearch, 
  MdErrorOutline,
  MdFilterList,
  MdLayers
} from 'react-icons/md';

// Interface definitions
import type { Department } from "../../types/features/department-management";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type ModalType = 'add' | 'edit' | 'view' | 'delete' | null;

// Interfaces for child component props
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

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Branded Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-2">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-900 rounded-2xl text-emerald-400 shadow-2xl shadow-emerald-500/20">
                 <MdCorporateFare className="text-2xl" />
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Module Registry</span>
                 <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black border border-emerald-100">{departments.length} Units</div>
              </div>
           </div>
           <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none">Faculty Management</h1>
              <p className="text-gray-400 font-bold mt-2">Oversee institutional structural units and faculty leadership.</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white px-8 py-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 group">
              <div className="flex flex-col">
                 <label htmlFor="rowsPerPage" className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5 px-1">Optimization</label>
                 <select
                   id="rowsPerPage"
                   value={departmentsPerPage}
                   onChange={handleRowsPerPageChange}
                   className="bg-transparent border-none text-xs font-black text-gray-900 focus:ring-0 cursor-pointer p-0"
                 >
                   <option value={5}>05 Units</option>
                   <option value={10}>10 Units</option>
                   <option value={20}>20 Units</option>
                   <option value={50}>50 Units</option>
                 </select>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-200 hover:scale-105 transition-all active:scale-95 text-xs truncate"
              >
                <MdAdd className="text-lg" />
                Initialize Unit
              </button>
           </div>
        </div>
      </div>

      {/* Floating Filter Hub */}
      <div className="px-2">
         <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors"></div>
            <div className="flex-1 relative">
               <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-hover:text-blue-500 transition-colors" />
               <input
                 type="text"
                 placeholder="Search by Department Identity or Protocol Code..."
                 value={searchTerm}
                 onChange={handleSearchChange}
                 className="w-full pl-16 pr-8 py-5 bg-gray-50/50 border-gray-100 rounded-3xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
               />
            </div>
         </div>
      </div>

      {/* Data Visualization Grid */}
      <div className="px-2">
         {error && (
           <div className="bg-rose-50 border border-rose-100 p-6 mb-10 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
             <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                <MdErrorOutline size={24} />
             </div>
             <p className="text-sm font-bold text-rose-700 tracking-tight">{error}</p>
           </div>
         )}

         <DepartmentTable
            departments={currentDepartments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            loading={loading}
         />
         
         {!loading && filteredDepartments.length > 0 && (
           <div className="mt-12 bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               totalItems={filteredDepartments.length}
               itemsPerPage={departmentsPerPage}
               onPageChange={setCurrentPage}
               onItemsPerPageChange={setDepartmentsPerPage}
               variant="minimal"
             />
           </div>
         )}
      </div>

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
    </div>
  );
};

export default AdminDepartments;