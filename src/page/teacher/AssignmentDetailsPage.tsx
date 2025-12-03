import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import { MdMenu } from 'react-icons/md';

// Your interfaces here
interface FileEntry {
  name: string;
  url: string;
}

interface Submission {
  _id: string;
  studentId?: string;
  studentName?: string;
  submittedAt: string;
  isLate: boolean;
  grade?: number;
  submissionContent: {
    text: string;
    files: (string | FileEntry)[];
  };
  assignmentId?: string;
}

interface Assignment {
  _id: string;
  id?: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  createdAt: string;
  maxMarks: number;
  submissions?: Submission[];
  courseId: string;
  departmentId: string;
  teacherId?: string;
  allowLateSubmission: boolean;
  lateSubmissionPenalty: number;
  submissionFormat: string;
  isGroupAssignment: boolean;
  maxGroupSize: number;
  attachments?: { name: string; url: string }[];
  totalStudents?: number;
  courseName: string;
  departmentName: string;
  teacherName?: string;
  [key: string]: any;
}

interface AuthState {
  user?: { _id?: string; id?: string };
  accessToken?: string;
}

const AssignmentDetailsPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const authState = useSelector((state: { auth: AuthState }) => state.auth);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [grades, setGrades] = useState<{ [key: string]: string }>({});
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);

  // Responsive sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const teacherId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  const handleFileClick = (url: string, name: string) => {
    // Analytics or tracking could be added here
    // window.open(url, '_blank'); // optionally open file
    console.log(`File clicked: ${name} at ${url}`);
  };

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!teacherId || !accessToken || !assignmentId) {
        toast.error('Please log in to view assignment details');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/assignments/${assignmentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.data.success) {
          const fetchedAssignment = response.data.data;
          setAssignment(fetchedAssignment);
          const initialGrades: { [key: string]: string } = {};
          fetchedAssignment.submissions?.forEach((submission: Submission) => {
            initialGrades[submission.studentId || submission._id] = submission.grade?.toString() || '';
          });
          setGrades(initialGrades);
        } else {
          toast.error('Failed to load assignment details');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load assignment details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId, teacherId, accessToken]);

  const normalizeFileEntry = (files: (string | FileEntry)[]): FileEntry | null => {
    if (!files || files.length === 0) return null;
    const preferred = files.find(f => typeof f === 'string' && f.startsWith('http')) || files[0];
    if (!preferred) return null;
    if (typeof preferred === 'string') {
      const fileName = preferred.split('/').pop()?.split('?')[0] || `attachment-${Date.now()}.pdf`;
      const fileUrl = preferred.startsWith('http')
        ? preferred
        : `https://res.cloudinary.com/djpom2k/image/upload/${preferred}.pdf`;
      return { name: fileName, url: fileUrl };
    }
    return { name: preferred.name, url: preferred.url };
  };

  const handleGradeChange = (studentId: string, grade: string) => {
    const maxMarks = assignment?.maxMarks ?? 100;
    let value = grade;
    if (grade !== '') {
      let n = parseInt(grade) || 0;
      if (n < 0) n = 0;
      if (n > maxMarks) n = maxMarks;
      value = n.toString();
    }
    setGrades(prev => ({ ...prev, [studentId]: value }));
  };

  const submitGrades = async (gradesToSubmit: { studentId: string; grade: number }[]) => {
    if (!assignmentId) {
      toast.error('Invalid assignment ID');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/api/assignments/${assignmentId}/grade`,
        { grades: gradesToSubmit },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (response.data.success) {
        toast.success('Grades submitted');
        setAssignment(prev => {
          if (!prev) return prev;
          return { 
            ...prev, 
            submissions: prev.submissions?.map(sub => {
              const gradeEntry = gradesToSubmit.find(g => g.studentId === (sub.studentId || sub._id));
              return gradeEntry ? { ...sub, grade: gradeEntry.grade } : sub;
            })
          };
        });
      } else {
        toast.error('Failed to submit grades');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit grades');
    } finally {
      setIsSubmitting(false);
      setGradingSubmissionId(null);
    }
  };

  const handleSubmitGrade = (submissionId: string, grade: string) => {
    if (!assignment || !submissionId || grade === '') {
      toast.error('Please enter a valid grade');
      return;
    }
    const val = parseInt(grade);
    if (isNaN(val) || val < 0 || val > (assignment.maxMarks || 100)) {
      toast.error(`Grade must be between 0 and ${assignment.maxMarks}`);
      return;
    }
    const studentId = assignment.submissions?.find(s => s._id === submissionId)?.studentId || submissionId;
    submitGrades([{ studentId, grade: val }]);
  };

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (isLoading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (!assignment) {
    return <div className="text-center py-20">Assignment not found.</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:shadow-none`}
        aria-label="Sidebar"
      >
        <TeacherSideBar />
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center justify-between bg-white border-b shadow p-4">
          <button
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            className="p-2 rounded-md focus:outline-none focus:ring hover:bg-gray-200"
          >
            <MdMenu size={28} />
          </button>
          <Header role="teacher" />

        </div>
        <div className="hidden md:block">
          <Header role="teacher" />

        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 p-6 ">
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Assignments
          </button>
          <h1 className="text-3xl font-bold mb-3">{assignment.title}</h1>
          <p className="mb-6 text-gray-700">{assignment.description}</p>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">Student</th>
                  <th className="p-3 border">Submitted At</th>
                  <th className="p-3 border">Late</th>
                  <th className="p-3 border">Grade</th>
                  <th className="p-3 border">Content</th>
                  <th className="p-3 border">Attachment</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignment.submissions?.map(submission => {
                  const normalizedFile = normalizeFileEntry(submission.submissionContent.files);
                  const studentId = submission.studentId || submission._id;
                  const isEditing = gradingSubmissionId === submission._id;
                  return (
                    <tr key={submission._id} className="border-t">
                      <td className="p-3 border">{submission.studentName || 'Unknown'}</td>
                      <td className="p-3 border">{new Date(submission.submittedAt).toLocaleString()}</td>
                      <td className="p-3 border">{submission.isLate ? 'Yes' : 'No'}</td>
                      <td className="p-3 border">{submission.grade ?? 'Not graded'}</td>
                      <td className="p-3 border">{submission.submissionContent.text}</td>
                      <td className="p-3 border">
                        {normalizedFile ? (
                          <a
                            href={normalizedFile.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={e => {
                              e.preventDefault();
                              handleFileClick(normalizedFile.url, normalizedFile.name);
                            }}
                          >
                            {normalizedFile.name}
                          </a>
                        ) : (
                          'No file'
                        )}
                      </td>
                      <td className="p-3 border">
                        {isEditing ? (
                          <div>
                            <input
                              type="number"
                              min={0}
                              max={assignment.maxMarks}
                              value={grades[studentId] ?? ''}
                              onChange={e => handleGradeChange(studentId, e.target.value)}
                              className="border rounded py-1 px-2 w-20"
                            />
                            <div className="mt-2 space-x-2">
                              <button
                                className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                                disabled={isSubmitting}
                                onClick={() => handleSubmitGrade(submission._id, grades[studentId] ?? '')}
                              >
                                Submit
                              </button>
                              <button
                                className="bg-gray-500 text-white px-3 py-1 rounded"
                                onClick={() => setGradingSubmissionId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setGradingSubmissionId(submission._id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            {submission.grade !== undefined ? 'Edit Grade' : 'Grade'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssignmentDetailsPage;
