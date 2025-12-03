import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import StudentSideBar from '../../components/student/Common/Sidebar';
import AssignmentCard from '../../components/student/assignments/AssignmentCard';
import AssignmentFilters from '../../components/student/assignments/AssignmentFilters';
import AssignmentDetailModal from '../../components/student/assignments/AssignmentDetailModal';
import SubmissionModal from '../../components/student/assignments/SubmissionModal';
import Pagination from '../../components/common/Pagination';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { RootState } from '../../redux/store';
import { MdMenu } from 'react-icons/md';

const StudentAssignmentsPage: React.FC = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [studentSchedules, setStudentSchedules] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    course: 'all',
    department: 'all',
    status: 'all',
    sortBy: 'dueDate',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mobile sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const studentId = authState?.user?.id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  // Fetch student's schedules for course/department options
  useEffect(() => {
    const fetchStudentSchedules = async () => {
      if (!studentId || !accessToken) return;

      try {
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (studentResponse.data.success) {
          const student = studentResponse.data.data;
          if (student.departmentId) {
            const schedulesResponse = await axios.get(
              `/api/schedules/department/${student.departmentId}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            if (schedulesResponse.data.success) {
              setStudentSchedules(schedulesResponse.data.data);
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching student schedules:', error);
      }
    };

    fetchStudentSchedules();
  }, [studentId, accessToken]);

  // Fetch assignments for student
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!studentId || !accessToken) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (studentResponse.data.success) {
          const student = studentResponse.data.data;

          if (student.departmentId) {
            const assignmentsResponse = await axios.get(
              `/api/assignments/department/${student.departmentId}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            if (assignmentsResponse.data.success) {
              // Map assignments to include hasSubmitted and isActive flags
              const updatedAssignments = assignmentsResponse.data.data.map((assignment: any) => ({
                ...assignment,
                id: assignment._id, // For AssignmentCard prop compat
                hasSubmitted:
                  assignment.submissions?.some(
                    (submission: any) => submission.studentId === studentId
                  ) || false,
                submissions:
                  assignment.submissions?.filter(
                    (submission: any) => submission.studentId === studentId
                  ) || [],
                isActive: assignment.dueDate ? new Date(assignment.dueDate) >= new Date() : false,
              }));
              setAssignments(updatedAssignments);
            } else {
              toast.error('Failed to load assignments');
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching assignments:', error);
        toast.error(error.response?.data?.message || 'Failed to load assignments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [studentId, accessToken]);

  // Handle student assignment submission
  const handleSubmitAssignment = async (assignmentId: string, submissionData: any) => {
    try {
      const formData = new FormData();
      formData.append('studentId', studentId || '');
      formData.append(
        'studentName',
        `${authState.user?.firstname || ''} ${authState.user?.lastname || ''}`.trim() || 'Unknown'
      );
      formData.append('hasSubmissionText', String(!!submissionData.submissionText?.trim()));
      formData.append('fileCount', String(submissionData.files?.length || 0));

      if (submissionData.submissionText?.trim()) {
        formData.append('submissionText', submissionData.submissionText.trim());
      }

      if (submissionData.files?.length > 0) {
        formData.append(
          'fileNames',
          JSON.stringify(submissionData.files.map((f: any) => f.name))
        );
        submissionData.files.forEach((file: any) => {
          formData.append('files', file);
        });
      }

      const response = await axios.post(
        `/api/assignments/${assignmentId}/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment._id === assignmentId
              ? {
                  ...assignment,
                  hasSubmitted: true,
                  submissions: [
                    response.data.data,
                    ...(assignment.submissions || []),
                  ],
                }
              : assignment
          )
        );
        setIsSubmissionModalOpen(false);
        setSelectedAssignment(null);
        toast.success('Assignment submitted successfully!');
      } else {
        toast.error(response.data.message || 'Failed to submit assignment');
      }
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    }
  };

  // Open assignment detail modal
  const handleViewAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsDetailModalOpen(true);
  };

  // Open submission modal
  const handleStartSubmission = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsSubmissionModalOpen(true);
  };

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter((assignment) => {
      if (filters.course !== 'all' && assignment.courseId?._id !== filters.course) {
        return false;
      }
      if (filters.department !== 'all' && assignment.departmentId?._id !== filters.department) {
        return false;
      }
      if (filters.status !== 'all') {
        const now = new Date();
        const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;

        switch (filters.status) {
          case 'pending':
            return (!assignment.submissions || assignment.submissions.length === 0) && dueDate && dueDate >= now;
          case 'submitted':
            return assignment.submissions && assignment.submissions.length > 0;
          case 'overdue':
            return (!assignment.submissions || assignment.submissions.length === 0) && dueDate && dueDate < now;
          case 'upcoming':
            return (!assignment.submissions || assignment.submissions.length === 0) && dueDate && dueDate >= now;
          default:
            return true;
        }
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'dueDate':
          return a.dueDate && b.dueDate
            ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            : 0;
        case 'createdAt':
          return a.createdAt && b.createdAt
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : 0;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Pagination calculations
  const totalItems = filteredAssignments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentAssignments = filteredAssignments.slice(startIndex, endIndex);

  // Reset to first page on filter/items change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, itemsPerPage]);

  // Ensure currentPage is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Derive unique filter options from schedules
  const uniqueCourses = [
    ...new Map(
      studentSchedules
        .map((s: any) => s.courseId)
        .filter((courseId): courseId is { _id: string; name?: string } => !!courseId)
        .map((c) => [c._id, c])
    ).values(),
  ];
  const uniqueDepartments = [
    ...new Map(
      studentSchedules
        .map((s: any) => s.departmentId)
        .filter((departmentId): departmentId is { _id: string } => !!departmentId)
        .map((d) => [d._id, d])
    ).values(),
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar, fixed on desktop, sliding on mobile */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:shadow-none
        `}
        aria-label="Sidebar"
      >
        <StudentSideBar />
      </aside>

      {/* Main content container */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0">
        {/* Mobile header with hamburger menu */}
        <div className="md:hidden flex items-center justify-between bg-white shadow p-4">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            aria-label="Open sidebar"
            className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
          >
            <MdMenu size={30} />
          </button>
          <Header role="student" />
        </div>
        {/* Desktop header */}
        <div className="hidden md:block">
          <Header role="student" />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
              <p className="text-gray-600">View and submit your course assignments</p>
            </div>

            <AssignmentFilters
              filters={filters}
              setFilters={setFilters}
              courses={uniqueCourses}
              departments={uniqueDepartments}
              isStudent={true}
            />

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-md animate-pulse h-48"
                  ></div>
                ))}
              </div>
            ) : filteredAssignments.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {currentAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment._id}
                      assignment={assignment}
                      onView={() => handleViewAssignment(assignment)}
                      onStartSubmission={() => handleStartSubmission(assignment)}
                      onSubmit={() => handleStartSubmission(assignment)} // Required prop
                      className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                      showActions={true}
                      compact={false}
                    />
                  ))}
                </div>
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold">No assignments found.</h2>
                <p className="text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
              </div>
            )}
          </div>
        </main>

        {/* Modals */}
        {selectedAssignment && (
          <>
            <AssignmentDetailModal
              isOpen={isDetailModalOpen}
              onClose={() => setIsDetailModalOpen(false)}
              assignment={selectedAssignment}
              onStartSubmission={() => handleStartSubmission(selectedAssignment)}
            />
            <SubmissionModal
              isOpen={isSubmissionModalOpen}
              onClose={() => setIsSubmissionModalOpen(false)}
              assignment={selectedAssignment}
              onSubmit={handleSubmitAssignment}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default StudentAssignmentsPage;
