import React, { useState, useEffect } from 'react';
import axios from "../../api/axiosInstance";
import Sidebar from "../../components/admin/Commen/Sidebar";
import Header from "../../components/admin/Commen/Header";
import CourseTable from "../../components/admin/courses/CourseTable";
import AddCourseModal from "../../components/admin/courses/AddCourseModal";
import EditCourseModal from "../../components/admin/courses/EditCourseModal";
import ViewCourseModal from "../../components/admin/courses/ViewCourseModal";
import DeleteCourseModal from "../../components/admin/courses/DeleteCourseModal";
import Pagination from "../../components/admin/users/Pagination";
import { toast } from 'react-hot-toast';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

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
        <Sidebar activePage="courses" onClose={closeSidebar} />
      </div>

      <div className="flex-1 flex flex-col">
        <Header
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">Course Management</h1>
              <p className="text-sm sm:text-base text-gray-500">Manage academic courses</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <label htmlFor="rowsPerPage" className="text-sm text-gray-600 mr-2">
                  Rows:
                </label>
                <select
                  id="rowsPerPage"
                  value={coursesPerPage}
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
                + Add Course
              </button>
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search courses..."
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
              <CourseTable
                courses={currentCourses}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
              
              {filteredCourses.length > 0 && (
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
        </main>
      </div>
    </div>
  );
};

export default AdminCourses;