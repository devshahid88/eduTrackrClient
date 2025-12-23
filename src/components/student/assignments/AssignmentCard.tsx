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
    <div className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden ${className}`}>
      {/* Visual Header */}
      <div className={`h-2 text-white overflow-hidden flex`}>
          <div className={`flex-1 ${
              assignmentStatus.variant === 'success' ? 'bg-emerald-500' :
              assignmentStatus.variant === 'danger' ? 'bg-red-500' :
              assignmentStatus.variant === 'warning' ? 'bg-amber-500' :
              'bg-blue-500'
          }`} />
      </div>

      <div className="p-8 flex flex-col flex-1">
          {/* Top Row: Meta & Status */}
          <div className="flex items-start justify-between mb-6 gap-4">
              <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 truncate max-w-[150px]">
                      {assignment.courseName || 'General'}
                  </span>
                  <StatusBadge />
              </div>
              <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 border-4 border-white flex items-center justify-center text-xs font-black text-gray-400">
                      {teacherName.charAt(0)}
                  </div>
              </div>
          </div>

          {/* Title & Description */}
          <div className="mb-6">
              <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-3 line-clamp-2">
                  {assignment.title}
              </h3>
              <p className="text-sm font-medium text-gray-500 line-clamp-3 leading-relaxed">
                  {assignment.description || 'No description provided.'}
              </p>
          </div>

          {/* Details Grid */}
          <div className="mt-auto pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Max Score</span>
                  <div className="flex items-center gap-2">
                       <FileText className="w-3.5 h-3.5 text-blue-400" />
                       <span className="text-sm font-black text-gray-800">{assignment.maxMarks || 100}</span>
                  </div>
              </div>
              <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Deadline</span>
                  <div className="flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5 text-amber-400" />
                       <span className="text-sm font-black text-gray-800">
                           {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </span>
                  </div>
              </div>
          </div>

          {/* Submission Banner (If submitted) */}
          {assignment.submissions && assignment.submissions.length > 0 && (
            <div className="mt-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-50 flex items-center justify-between">
                <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block leading-none mb-1">Status</span>
                    <span className="text-xs font-bold text-emerald-900">Successfully Submitted</span>
                </div>
                {assignment.submissions && assignment.submissions[0]?.grade !== undefined && (
                    <div className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                        {assignment.submissions[0].grade} / {assignment.maxMarks}
                    </div>
                )}
            </div>
          )}

          {/* Footer Actions */}
          {showActions && (
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => onView(assignment)}
                className="flex-1 py-3 bg-white border border-gray-100 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Details
              </button>

              {canSubmitAssignment(assignment) && (
                <button
                  onClick={() => onSubmit(assignment)}
                  className={`flex-1 py-3 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 ${
                    submissionConfig.variant === 'danger' ? 'bg-red-500 shadow-red-100' : 'bg-blue-600 shadow-blue-100'
                  }`}
                >
                  {submissionConfig.text}
                </button>
              )}
              
              {assignment.submissions && assignment.submissions.length > 0 && (
                <button
                  onClick={() => onView(assignment)}
                  className="flex-1 py-3 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
                >
                  Feedback
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default AssignmentCard;
