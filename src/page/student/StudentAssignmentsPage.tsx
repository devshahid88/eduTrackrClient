import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AssignmentCard from '../../components/student/assignments/AssignmentCard';
import AssignmentFilters from '../../components/student/assignments/AssignmentFilters';
import AssignmentDetailModal from '../../components/student/assignments/AssignmentDetailModal';
import SubmissionModal from '../../components/student/assignments/SubmissionModal';
import Pagination from '../../components/common/Pagination';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { RootState } from '../../redux/store';

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

  // Handle submission deletion
  const handleDeleteSubmission = async (assignmentId: string) => {
    try {
      const response = await axios.delete(
        `/api/assignments/${assignmentId}/submission/${studentId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data.success) {
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment._id === assignmentId
              ? {
                  ...assignment,
                  hasSubmitted: false,
                  submissions: [],
                }
              : assignment
          )
        );
        toast.success('Submission deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete submission');
      }
    } catch (error: any) {
      console.error('Error deleting submission:', error);
      toast.error(error.response?.data?.message || 'Failed to delete submission');
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
    <div className="container mx-auto px-4 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Assignments</h1>
          <p className="text-gray-500 font-medium mt-1">Track your progress and submit pending tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total</span>
            <span className="text-lg font-black text-blue-600 leading-none">{filteredAssignments.length}</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <AssignmentFilters
          filters={filters}
          setFilters={setFilters}
          courses={uniqueCourses}
          departments={uniqueDepartments}
          isStudent={true}
        />
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white h-64 rounded-[2.5rem] border border-gray-100 animate-pulse"
            ></div>
          ))}
        </div>
      ) : filteredAssignments.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
            {currentAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                onView={() => handleViewAssignment(assignment)}
                onStartSubmission={() => handleStartSubmission(assignment)}
                onSubmit={() => handleStartSubmission(assignment)}
                className="hover:-translate-y-2 transition-transform duration-300"
                showActions={true}
              />
            ))}
          </div>
          
          <div className="flex justify-center pt-8">
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-4">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-4">
            📚
          </div>
          <h2 className="text-2xl font-black text-gray-900">No Assignments Found</h2>
          <p className="text-gray-500 max-w-sm font-medium">
            We couldn't find any assignments matching your current filters. Try relaxing your search criteria.
          </p>
          <button 
            onClick={() => setFilters({ course: 'all', department: 'all', status: 'all', sortBy: 'dueDate' })}
            className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedAssignment && (
        <>
          <AssignmentDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            assignment={selectedAssignment}
            onStartSubmission={() => handleStartSubmission(selectedAssignment)}
            onDeleteSubmission={handleDeleteSubmission}
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
  );
};

export default StudentAssignmentsPage;
