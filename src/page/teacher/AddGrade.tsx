import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import AssignmentSelector from '../../components/teacher/Grades/AssignmentSelector';
import GradeEntryTable from '../../components/teacher/Grades/GradeEntryTable';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { RootState } from '../../redux/store';
import { MdMenu } from 'react-icons/md';

const AddGrade: React.FC = () => {
  const authState = useSelector((state: RootState) => state.auth);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Sidebar state for mobile responsiveness
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const teacherId = authState?.user?.id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  // Fetch teacher's assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!teacherId || !accessToken) {
        toast.error('Please log in to access assignments.');
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`/api/assignments/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.data.success) {
          setAssignments(response.data.data);
        } else {
          toast.error(response.data.message || 'Failed to load assignments.');
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message || 'Unable to load assignments due to a server error.';
        toast.error(message);
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error('Unauthorized access. Please log in again.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignments();
  }, [teacherId, accessToken]);

  const handleAssignmentSelect = (assignmentId: string) => {
    if (!assignmentId) {
      setSelectedAssignment(null);
      setStudents([]);
      setGrades({});
      return;
    }
    setIsLoadingStudents(true);
    const assignment = assignments.find((a) => a._id === assignmentId);
    setSelectedAssignment(assignment);

    // Derive students from submissions
    const submittedStudents = assignment?.submissions?.map((submission: any) => ({
      _id: submission.studentId,
      studentName: submission.studentName || 'Unknown',
      studentId: submission.studentId,
      studentsubmittedAt: submission.submittedAt || 'Unknown',
      submission: {
        content: submission.submissionContent?.text || '',
        files: submission.submissionContent?.files || [],
        submittedAt: submission.submittedAt || null,
      },
    })) || [];
    setStudents(submittedStudents);

    // Initialize grades
    const initialGrades: any = {};
    submittedStudents.forEach((student: any) => {
      const submission = assignment?.submissions?.find(
        (sub: any) => sub.studentId === student._id
      );
      initialGrades[student._id] = submission?.grade?.toString() || '';
    });
    setGrades(initialGrades);

    setIsLoadingStudents(false);
  };

  const handleGradeChange = (studentId: string, grade: string) => {
    const value = grade === '' ? '' : Math.max(0, Math.min(100, parseInt(grade) || 0));
    setGrades((prev: any) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const submitGrades = async (gradesToSubmit: any[]) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/api/assignments/${selectedAssignment._id}/grade`,
        { grades: gradesToSubmit },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Grades submitted successfully!');
        // Refresh assignments and students/grades state
        const responseAssignments = await axios.get(`/api/assignments/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (responseAssignments.data.success) {
          setAssignments(responseAssignments.data.data);
          handleAssignmentSelect(selectedAssignment._id);
        }
      } else {
        toast.error(response.data.message || 'Failed to submit grades.');
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Failed to submit grades due to a server error.';
      toast.error(message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Unauthorized access. Please log in again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitGrades = async () => {
    if (!selectedAssignment) {
      toast.error('Please select an assignment.');
      return;
    }
    // Validate grades
    const invalidGrades = Object.entries(grades).filter(
      ([_, grade]) => grade !== '' && (Number(grade) < 0 || Number(grade) > 100)
    );
    if (invalidGrades.length > 0) {
      toast.error('All grades must be between 0 and 100.');
      return;
    }
    const gradesToSubmit = Object.entries(grades)
      .filter(([_, grade]) => grade !== '')
      .map(([studentId, grade]) => ({
        studentId,
        grade: parseInt(grade as string),
      }));
    if (gradesToSubmit.length === 0) {
      toast.error('Please enter at least one grade to submit.');
      return;
    }
    toast(
      (t) => (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-md mx-auto">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Grade Submission
              </div>
              <div className="text-sm text-gray-600 mb-4 leading-relaxed">
                Are you sure you want to submit these grades? This action cannot be undone and will be visible to students immediately.
              </div>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    submitGrades(gradesToSubmit);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                >
                  Submit Grades
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: 0,
        position: 'top-center',
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: '0',
        },
      }
    );
  };

  // Sidebar handlers
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}
      {/* Sidebar: slide-in on mobile, fixed on desktop */}
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
        {/* Mobile header with hamburger menu */}
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Add Grades</h1>
              <p className="mt-2 text-gray-600 text-lg">
                Select an assignment and enter grades for students who have submitted.
              </p>
            </div>

            {/* Assignment Selection */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600 text-lg">Loading assignments...</span>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-6">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2 text-gray-500 text-lg">
                    No assignments available for grading.
                  </p>
                </div>
              ) : (
                <AssignmentSelector
                  assignments={assignments}
                  selectedAssignment={selectedAssignment}
                  onSelect={handleAssignmentSelect}
                  isLoading={isLoading}
                />
              )}
            </div>

            {/* Grade Entry Table */}
            {selectedAssignment && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {selectedAssignment.title}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Course: {selectedAssignment.courseName}
                  </p>
                  <p className="text-gray-600 text-lg">
                    Submissions: {selectedAssignment.submissions?.length || 0} /{' '}
                    {selectedAssignment.totalStudents || 0}
                  </p>
                </div>
                {isLoadingStudents ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                    <span className="ml-3 text-gray-600 text-lg">Loading students...</span>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <p className="mt-2 text-gray-500 text-lg">
                      No students have submitted this assignment yet.
                    </p>
                  </div>
                ) : (
                  <>
                    <GradeEntryTable
                      students={students}
                      grades={grades}
                      onGradeChange={handleGradeChange}
                    />
                    <div className="mt-6 flex justify-end sticky bottom-0 bg-white py-4">
                      <button
                        onClick={handleSubmitGrades}
                        disabled={isSubmitting || !Object.values(grades).some((g) => g !== '')}
                        className={`px-6 py-3 rounded-lg text-white font-semibold text-lg transition-all duration-200 ${
                          isSubmitting || !Object.values(grades).some((g) => g !== '')
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        }`}
                        aria-label="Submit grades"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                            Submitting...
                          </span>
                        ) : (
                          'Submit Grades'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddGrade;
