import React, { useState, useEffect } from 'react';
import axios from "../../api/axiosInstance";
import CourseTable from "../../components/admin/courses/CourseTable";
import AddCourseModal from "../../components/admin/courses/AddCourseModal";
import EditCourseModal from "../../components/admin/courses/EditCourseModal";
import ViewCourseModal from "../../components/admin/courses/ViewCourseModal";
import DeleteCourseModal from "../../components/admin/courses/DeleteCourseModal";
import Pagination from "../../components/admin/users/Pagination";
import { toast } from 'react-hot-toast';
import { 
  MdSchool, 
  MdAdd, 
  MdSearch, 
  MdErrorOutline,
  MdFilterList,
  MdLayers
} from 'react-icons/md';

// Interface definitions
interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  credits?: number;
  department: Department;
  departmentId: string;
  duration?: string;
  semester?: number;
  year?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type ModalType = 'add' | 'edit' | 'view' | 'delete' | null;

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [coursesPerPage, setCoursesPerPage] = useState<number>(10);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<Course[]>>('/api/courses');
      setCourses(response.data.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (): Promise<void> => {
    try {
      const response = await axios.get<ApiResponse<Department[]>>('/api/departments');
      setDepartments(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching departments:', err);
      toast.error('Failed to fetch departments');
    }
  };

  const handleAdd = (): void => {
    setSelectedCourse(null);
    setModalType('add');
  };

  const handleEdit = (course: Course): void => {
    setSelectedCourse(course);
    setModalType('edit');
  };

  const handleView = (course: Course): void => {
    setSelectedCourse(course);
    setModalType('view');
  };

  const handleDelete = (course: Course): void => {
    setSelectedCourse(course);
    setModalType('delete');
  };

  const handleCloseModal = (): void => {
    setSelectedCourse(null);
    setModalType(null);
  };

  const handleSaveCourse = async (courseData: Partial<Course>): Promise<void> => {
    try {
      let response: { data: ApiResponse<Course> };
      
      if (courseData._id) {
        // Update existing course
        response = await axios.put<ApiResponse<Course>>(`/api/courses/${courseData._id}`, courseData);
        if (response.data && response.data.success) {
          setCourses(prevCourses => 
            prevCourses.map(course => 
              course._id === courseData._id ? response.data.data : course
            )
          );
          toast.success('Course updated successfully!');
        }
      } else {
        // Create new course
        response = await axios.post<ApiResponse<Course>>('/api/courses/create', courseData);
        if (response.data && response.data.success) {
          setCourses(prevCourses => [...prevCourses, response.data.data]);
          toast.success('Course added successfully!');
        }
      }

      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving course:', err);
      toast.error(err.response?.data?.message || 'Failed to save course');
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedCourse) return;
    try {
      const response = await axios.delete<ApiResponse<null>>(`/api/courses/${selectedCourse._id}`);
      
      if (response.data && response.data.success) {
        setCourses(prevCourses => 
          prevCourses.filter(course => course._id !== selectedCourse._id)
        );
        toast.success('Course deleted successfully!');
        handleCloseModal();
      }
    } catch (err: any) {
      console.error('Error deleting course:', err);
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const filteredCourses: Course[] = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCourse: number = currentPage * coursesPerPage;
  const indexOfFirstCourse: number = indexOfLastCourse - coursesPerPage;
  const currentCourses: Course[] = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages: number = Math.ceil(filteredCourses.length / coursesPerPage);

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setCoursesPerPage(Number(e.target.value));
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
              <div className="p-3 bg-gray-900 rounded-2xl text-blue-400 shadow-2xl shadow-blue-500/20">
                 <MdSchool className="text-2xl" />
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Program Registry</span>
                 <div className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black border border-blue-100">{courses.length} Modules</div>
              </div>
           </div>
           <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none">Educational Courses</h1>
              <p className="text-gray-400 font-bold mt-2">Manage academic programs, credit structures, and syllabus nodes.</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white px-8 py-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 group">
              <div className="flex flex-col">
                 <label htmlFor="rowsPerPage" className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5 px-1">Network Load</label>
                 <select
                   id="rowsPerPage"
                   value={coursesPerPage}
                   onChange={handleRowsPerPageChange}
                   className="bg-transparent border-none text-xs font-black text-gray-900 focus:ring-0 cursor-pointer p-0"
                 >
                   <option value={5}>05 Modules</option>
                   <option value={10}>10 Modules</option>
                   <option value={20}>20 Modules</option>
                   <option value={50}>50 Modules</option>
                 </select>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-2xl shadow-indigo-200 hover:scale-105 transition-all active:scale-95 text-xs truncate"
              >
                <MdAdd className="text-lg" />
                New Module
              </button>
           </div>
        </div>
      </div>

      {/* Floating Filter Hub */}
      <div className="px-2">
         <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors"></div>
            <div className="flex-1 relative">
               <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-hover:text-indigo-500 transition-colors" />
               <input
                 type="text"
                 placeholder="Search by Course Name, Code, or Faculty Origin..."
                 value={searchTerm}
                 onChange={handleSearchChange}
                 className="w-full pl-16 pr-8 py-5 bg-gray-50/50 border-gray-100 rounded-3xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
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

         <CourseTable
            courses={currentCourses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            loading={loading}
         />
         
         {!loading && filteredCourses.length > 0 && (
           <div className="mt-12 bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               totalItems={filteredCourses.length}
               itemsPerPage={coursesPerPage}
               onPageChange={setCurrentPage}
               onItemsPerPageChange={setCoursesPerPage}
               variant="minimal"
             />
           </div>
         )}
      </div>

      {modalType === 'add' && (
        <AddCourseModal
          departments={departments}
          onClose={handleCloseModal}
          onSave={handleSaveCourse}
        />
      )}
      {modalType === 'edit' && selectedCourse && (
        <EditCourseModal
          course={selectedCourse}
          departments={departments}
          onClose={handleCloseModal}
          onSave={handleSaveCourse}
        />
      )}
      {modalType === 'view' && selectedCourse && (
        <ViewCourseModal
          course={selectedCourse}
          onClose={handleCloseModal}
        />
      )}
      {modalType === 'delete' && selectedCourse && (
        <DeleteCourseModal
          course={selectedCourse}
          onClose={handleCloseModal}
          onDeleteSuccess={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default AdminCourses;