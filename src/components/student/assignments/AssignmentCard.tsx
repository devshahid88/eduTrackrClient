import React from 'react';
import { Clock, User, FileText, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { AssignmentCardProps } from '../../../types/components/student';
import { 
  getAssignmentStatus, 
  formatTimeRemaining, 
  getTeacherDisplayName,
  getSubmissionButtonConfig,
  canSubmitAssignment
} from '../../../utils/assignmentUtils';

const AssignmentCard: React.FC<AssignmentCardProps> = ({ 
  assignment, 
  onView, 
  onSubmit,
  className = '',
  showActions = true,
  compact = false
}) => {
  const dueDate = new Date(assignment.dueDate);
  const assignmentStatus = getAssignmentStatus(assignment);
  const timeRemainingText = formatTimeRemaining(assignment);
  const teacherName = getTeacherDisplayName(assignment.teacherId);
  const submissionConfig = getSubmissionButtonConfig(assignment);
  
  // Status badge component
  const StatusBadge = () => {
    const { variant, text } = assignmentStatus;
    
    const variantClasses = {
      success: 'bg-green-100 text-green-800 border-green-200',
      danger: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    const icons = {
      submitted: <BookOpen className="w-3 h-3" />,
      overdue: <AlertCircle className="w-3 h-3" />,
      'due-soon': <Clock className="w-3 h-3" />,
      pending: <FileText className="w-3 h-3" />
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]}`}>
        {icons[assignmentStatus.status]}
        <span className="ml-1">{text}</span>
      </span>
    );
  };
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${compact ? 'p-4' : 'p-6'} ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 mb-1 ${compact ? 'text-base' : 'text-lg'} line-clamp-2`}>
            {assignment.title}
          </h3>
          <div className="flex items-center text-sm text-gray-600 space-x-2">
            {assignment.courseName && (
              <span>{assignment.courseName}</span>
            )}
            {assignment.courseName && assignment.departmentName && (
              <span>•</span>
            )}
            {assignment.departmentName && (
              <span>{assignment.departmentName}</span>
            )}
          </div>
        </div>
        <StatusBadge />
      </div>

      {/* Description */}
      {!compact && (
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {assignment.description}
        </p>
      )}

      {/* Assignment Details */}
      <div className={`space-y-2 mb-4 ${compact ? 'text-xs' : 'text-sm'}`}>
        {/* Teacher */}
        <div className="flex items-center text-gray-600">
          <User className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{teacherName}</span>
        </div>

        {/* Points */}
        <div className="flex items-center text-gray-600">
          <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{assignment.maxMarks || assignment.maxPoints || 0} points</span>
        </div>

        {/* Attachments */}
        {assignment.attachments && assignment.attachments.length > 0 && (
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span>{assignment.attachments.length} attachment{assignment.attachments.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Due Date */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center text-sm">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium text-gray-700">Due: </span>
          <span className="text-gray-600 ml-1">
            {dueDate.toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric',
              year: dueDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            })} at{' '}
            {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Time Remaining */}
      <div className="mb-4">
        <div className={`text-sm font-medium ${
          assignmentStatus.variant === 'success' ? 'text-green-600' :
          assignmentStatus.variant === 'danger' ? 'text-red-600' :
          assignmentStatus.variant === 'warning' ? 'text-yellow-600' :
          'text-blue-600'
        }`}>
          {timeRemainingText}
        </div>
      </div>

      {/* Submission Info */}
      {assignment.submissions && assignment.submissions.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-sm text-green-700">
            <BookOpen className="w-4 h-4 mr-2" />
            <span className="font-medium">Submitted</span>
          </div>
          {assignment.submissions[0]?.grade !== undefined && (
            <div className="mt-1 text-sm text-green-600">
              Grade: {assignment.submissions[0].grade}/{assignment.maxMarks || assignment.maxPoints || 0}
            </div>
          )}
          {assignment.submissions[0]?.feedback && (
            <div className="mt-1 text-sm text-green-600">
              Feedback available
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={() => onView(assignment)}
            className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 ${compact ? 'py-1.5 px-3 text-xs' : 'py-2 px-4 text-sm'}`}
            aria-label={`View details for ${assignment.title}`}
          >
            View Details
          </button>

          {canSubmitAssignment(assignment) && (
            <button
              onClick={() => onSubmit(assignment)}
              disabled={submissionConfig.disabled}
              className={`flex-1 font-medium rounded-lg transition-colors duration-200 ${compact ? 'py-1.5 px-3 text-xs' : 'py-2 px-4 text-sm'} ${
                submissionConfig.variant === 'primary' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                  : submissionConfig.variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50'
                  : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
              } disabled:cursor-not-allowed`}
              aria-label={`${submissionConfig.text} for ${assignment.title}`}
            >
              {submissionConfig.text}
            </button>
          )}

          {assignment.submissions && assignment.submissions.length > 0 && (
            <button
              onClick={() => onView(assignment)}
              className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 ${compact ? 'py-1.5 px-3 text-xs' : 'py-2 px-4 text-sm'}`}
              aria-label={`View submission for ${assignment.title}`}
            >
              View Submission
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;
