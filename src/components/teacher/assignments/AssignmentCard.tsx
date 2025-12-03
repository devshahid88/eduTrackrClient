import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Define TypeScript interfaces directly in AssignmentCard.tsx
interface Submission {
  _id: string;
  studentName?: string;
  submittedAt: string;
  isLate: boolean;
  grade?: number;
  feedback?: string;
  submissionContent?: {
    text: string;
    files: { name: string; url: string }[];
  };
  attachments?: { name: string; url: string }[]; // For backward compatibility
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
  courseName: string;
  departmentName: string;
  teacherName?: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onUpdate: (assignmentId: string, updatedData: Partial<Assignment> & { submissionId?: string; grade?: number; feedback?: string }) => void;
  onDelete: (assignmentId: string) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onUpdate, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate assignment status
  const getDaysUntilDue = () => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isExpired = daysUntilDue < 0;
  const isNearDue = daysUntilDue <= 3 && daysUntilDue >= 0;

  // Get status badge
  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      );
    } else if (isNearDue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Due Soon
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle quick actions
  const handleExtendDeadline = () => {
    const newDueDate = new Date(assignment.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 7); // Extend by 7 days
    onUpdate(assignment._id, { dueDate: newDueDate.toISOString() });
  };

  // Calculate submission statistics
  const totalSubmissions = assignment.submissions?.length || 0;
  const submissionRate = assignment.totalStudents
    ? Math.round((totalSubmissions / assignment.totalStudents) * 100)
    : 0;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
        isExpired ? 'border-red-200' : isNearDue ? 'border-yellow-200' : 'border-gray-200'
      }`}
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{assignment.title}</h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span className="font-medium text-blue-600">{assignment.courseName}</span>
              <span>•</span>
              <span>{assignment.departmentName}</span>
            </div>
          </div>
          <div className="ml-4 flex items-center space-x-2">{getStatusBadge()}</div>
        </div>

        {/* Assignment Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Due: {formatDate(assignment.dueDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Max: {assignment.maxMarks} marks</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{assignment.description}</p>

        {/* Submission Stats */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Submissions</span>
            <span className="text-sm font-bold text-blue-600">{totalSubmissions}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(submissionRate, 5)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{submissionRate}% submitted</span>
            <span>{assignment.totalStudents || 0} students</span>
          </div>
        </div>

        {/* Assignment Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {assignment.isGroupAssignment && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
              Group (Max {assignment.maxGroupSize})
            </span>
          )}
          {assignment.allowLateSubmission && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
              Late Allowed (-{assignment.lateSubmissionPenalty}%)
            </span>
          )}
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
            {assignment.submissionFormat}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link
            to={`/teacher/assignments/${assignment._id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            <span>View Submissions</span>
          </Link>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center space-x-1"
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
            <span>Details</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {!isExpired && (
            <button
              onClick={handleExtendDeadline}
              className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200 transition-colors"
            >
              Extend (+7 days)
            </button>
          )}
          <button
            onClick={() => onDelete(assignment._id)}
            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-3">
            {assignment.instructions && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Instructions:</h4>
                <p className="text-sm text-gray-600">{assignment.instructions}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <span className="text-gray-600 ml-2">{formatDate(assignment.createdAt)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Time Left:</span>
                <span
                  className={`ml-2 font-medium ${
                    isExpired ? 'text-red-600' : isNearDue ? 'text-yellow-600' : 'text-green-600'
                  }`}
                >
                  {isExpired ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                </span>
              </div>
            </div>
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Attachments:</h4>
                <div className="flex flex-wrap gap-2">
                  {assignment.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      📎 {attachment.name || `Attachment ${index + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;