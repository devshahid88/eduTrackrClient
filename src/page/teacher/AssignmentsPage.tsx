import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import CreateAssignmentModal from '../../components/teacher/assignments/CreateAssignmentModal';
import AssignmentCard from '../../components/teacher/assignments/AssignmentCard';
import AssignmentFilters from '../../components/teacher/assignments/AssignmentFilters';
import Pagination from '../../components/common/Pagination';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { RootState } from '../../redux/store';
import { MdMenu } from 'react-icons/md';

interface Course {
  _id: string;
  name: string;
  code?: string;
}
interface Department {
  _id: string;
  name: string;
}
interface Schedule {
  _id: string;
  courseId?: Course;
  departmentId?: Department;
}
interface Submission {
  _id: string;
  studentName?: string;
  submittedAt: string;
  isLate: boolean;
  grade?: number;
  feedback?: string;
  attachments?: { name: string; url: string }[];
}
interface Assignment {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  createdAt: string;
  maxMarks: number;
  submissions?: Submission[];
  courseId: string;
  departmentId: string;
  allowLateSubmission: boolean;
  lateSubmissionPenalty: number;
  submissionFormat: string;
  isGroupAssignment: boolean;
  maxGroupSize: number;
  attachments?: { name: string; url: string }[];
  totalStudents?: number;
}
interface Filters {
  course: string;
  department: string;
  status: string;
  sortBy: string;
}

const AssignmentsPage: React.FC = () => {
  // State for mobile sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teacherSchedules, setTeacherSchedules] = useState<Schedule[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<Filters>({
    course: 'all',
    department: 'all',
    status: 'all',
    sortBy: 'dueDate',
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const teacherId = authState?.user?.id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  // Fetch teacher's schedules
  useEffect(() => {
    const fetchTeacherSchedules = async () => {
      if (!teacherId || !accessToken) {
        toast.error('Please log in to view schedules');
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`/api/schedules/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.data.success) {
          setTeacherSchedules(response.data.data);
        } else {
          toast.error('Failed to load teacher schedules');
        }
      } catch (error: any) {
        toast.error('Failed to load teacher schedules');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeacherSchedules();
  }, [teacherId, accessToken]);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!teacherId || !accessToken) {
        toast.error('Please log in to view assignments');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/assignments/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.data.success) {
          setAssignments(response.data.data);
        } else {
          toast.error('Failed to load assignments');
        }
      } catch (error: any) {
        toast.error('Failed to load assignments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignments();
  }, [teacherId, accessToken]);

  // Handle assignment creation
  const handleCreateAssignment = async (formData: FormData) => {
    try {
      const response = await axios.post('/api/assignments', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        setAssignments((prev) => [response.data.data, ...prev]);
        setIsCreateModalOpen(false);
        toast.success('Assignment created successfully!');
      } else {
        toast.error('Failed to create assignment');
      }
    } catch (error: any) {
      toast.error('Failed to create assignment');
    }
  };

  // Handle assignment update
  const handleUpdateAssignment = async (
    assignmentId: string,
    updatedData: Partial<Assignment> & { submissionId?: string; grade?: number; feedback?: string }
  ) => {
    try {
      const response = await axios.put(`/api/assignments/${assignmentId}`, updatedData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.data.success) {
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment._id === assignmentId ? response.data.data : assignment
          )
        );
        toast.success('Assignment updated successfully!');
      } else {
        toast.error('Failed to update assignment');
      }
    } catch (error: any) {
      toast.error('Failed to update assignment');
    }
  };

  // Handle assignment deletion
  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const response = await axios.delete(`/api/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.data.success) {
        setAssignments((prev) => prev.filter((assignment) => assignment._id !== assignmentId));
        toast.success('Assignment deleted successfully!');
      } else {
        toast.error('Failed to delete assignment');
      }
    } catch (error: any) {
      toast.error('Failed to delete assignment');
    }
  };

  // For filters and maps
  const courseNameMap = new Map<string, string>(
    teacherSchedules
      .filter((s): s is Schedule & { courseId: Course } => !!s.courseId && !!s.courseId._id && !!s.courseId.name)
      .map((s) => [s.courseId._id, s.courseId.name])
  );
  const departmentNameMap = new Map<string, string>(
    teacherSchedules
      .filter((s): s is Schedule & { departmentId: Department } => !!s.departmentId && !!s.departmentId._id && !!s.departmentId.name)
      .map((s) => [s.departmentId._id, s.departmentId.name])
  );

  // Unique courses and departments
  const uniqueCourses = teacherSchedules.length
    ? [...new Set(teacherSchedules.filter((s): s is Schedule & { courseId: Course } => !!s.courseId && !!s.courseId._id).map((s) => s.courseId._id))]
    : [];
  const uniqueDepartments = teacherSchedules.length
    ? [...new Set(teacherSchedules.filter((s): s is Schedule & { departmentId: Department } => !!s.departmentId && !!s.departmentId._id).map((s) => s.departmentId._id))]
    : [];

  // Map assignments to include courseName and departmentName
  const enrichedAssignments = assignments.map((assignment) => ({
    ...assignment,
    courseName: courseNameMap.get(assignment.courseId) || 'Unknown Course',
    departmentName: departmentNameMap.get(assignment.departmentId) || 'Unknown Department',
  }));

  // Filter and sort assignments
  const filteredAssignments = enrichedAssignments
    .filter((assignment) => {
      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      if (isNaN(dueDate.getTime())) return false;
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (filters.course !== 'all' && assignment.courseId !== filters.course) return false;
      if (filters.department !== 'all' && assignment.departmentId !== filters.department) return false;
      if (filters.status !== 'all') {
        if (filters.status === 'active' && dueDate < now) return false;
        if (filters.status === 'expired' && dueDate >= now) return false;
        if (filters.status === 'due-soon' && (daysUntilDue > 3 || daysUntilDue < 0)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a[filters.sortBy as keyof Assignment] as string);
      const dateB = new Date(b[filters.sortBy as keyof Assignment] as string);
      switch (filters.sortBy) {
        case 'dueDate':
        case 'createdAt':
          return dateA.getTime() - dateB.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'submissions':
          return (b.submissions?.length || 0) - (a.submissions?.length || 0);
        case 'maxMarks':
          return b.maxMarks - a.maxMarks;
        default:
          return 0;
      }
    });

  // Pagination
  const totalItems = filteredAssignments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Stats
  const activeAssignments = assignments.filter((a) => {
    const dueDate = new Date(a.dueDate);
    return !isNaN(dueDate.getTime()) && dueDate >= new Date();
  }).length;
  const expiredAssignments = assignments.filter((a) => {
    const dueDate = new Date(a.dueDate);
    return !isNaN(dueDate.getTime()) && dueDate < new Date();
  }).length;
  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0);

  // Responsive sidebar handlers
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:shadow-none
        `}
        aria-label="Sidebar"
      >
        <TeacherSideBar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 ">
        {/* Mobile header with hamburger */}
        <div className="md:hidden flex items-center justify-between bg-white shadow p-4">
          <button
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
          >
            <MdMenu size={30} />
          </button>
          <Header role="teacher" />
        </div>
        {/* Desktop header */}
        <div className="hidden md:block">
          <Header role="teacher" />
        </div>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignment Management</h1>
                  <p className="text-gray-600">Create and manage assignments for your courses</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span>Create Assignment</span>
                </button>
              </div>
            </div>
            {teacherSchedules.length === 0 && !isLoading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Schedules Found</h3>
                <p className="text-gray-600">
                  You need to be assigned to courses and departments to create assignments. Please contact your administrator.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{activeAssignments}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Expired Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{expiredAssignments}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{totalSubmissions}</p>
                  </div>
                </div>
              </div>
            </div>
            {teacherSchedules.length > 0 && (
              <AssignmentFilters
                filters={filters}
                setFilters={setFilters}
                courses={uniqueCourses}
                departments={uniqueDepartments}
                courseNameMap={courseNameMap}
                departmentNameMap={departmentNameMap}
              />
            )}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-lg text-gray-600">Loading assignments...</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignments Found</h3>
                <p className="text-gray-600 mb-6">
                  {assignments.length === 0
                    ? "You haven't created any assignments yet. Create your first assignment to get started."
                    : 'No assignments match your current filters. Try adjusting your search criteria.'}
                </p>
                {assignments.length === 0 && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Create Your First Assignment
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment._id}
                      assignment={assignment}
                      onUpdate={handleUpdateAssignment}
                      onDelete={handleDeleteAssignment}
                    />
                  ))}
                </div>
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      {isCreateModalOpen && (
        <CreateAssignmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateAssignment}
          teacherSchedules={teacherSchedules}
          teacherId={teacherId}
        />
      )}
    </div>
  );
};

export default AssignmentsPage;
