import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MdAccessTime, 
  MdGroups, 
  MdPerson, 
  MdAssignment, 
  MdEdit, 
  MdDeleteForever, 
  MdChevronRight,
  MdInfoOutline,
  MdCheckCircle,
  MdFileDownload
} from 'react-icons/md';

interface Submission {
  _id: string;
  studentName?: string;
  submittedAt: string;
  isLate: boolean;
  grade?: number;
  feedback?: string;
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
  courseId: any;
  departmentId: any;
  allowLateSubmission: boolean;
  lateSubmissionPenalty: number;
  submissionFormat: string;
  isGroupAssignment: boolean;
  maxGroupSize: number;
  attachments?: string[];
  totalStudents?: number;
  courseName?: string;
  departmentName?: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onUpdate, onDelete, className = "" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getDaysUntilDue = () => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilDue();
  const isExpired = daysLeft < 0;
  const isCritical = daysLeft >= 0 && daysLeft <= 3;

  const totalSubmissions = assignment.submissions?.length || 0;
  const submissionRate = assignment.totalStudents ? Math.round((totalSubmissions / assignment.totalStudents) * 100) : 0;

  return (
    <div className={`group relative bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col ${className}`}>
      {/* Decorative Top Bar */}
      <div className={`h-2 w-full ${isExpired ? 'bg-rose-500' : isCritical ? 'bg-amber-500' : 'bg-blue-600'}`} />

      <div className="p-8 flex-1 space-y-6">
        {/* Header: Title & Status */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
              {assignment.title}
            </h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{assignment.courseName || "Knowledge Module"}</span>
               <div className="w-1 h-1 rounded-full bg-gray-200" />
               <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{assignment.departmentName || "General Faculty"}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            isExpired ? 'bg-rose-50 text-rose-600' : isCritical ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {isExpired ? 'Terminated' : isCritical ? 'Critical' : 'Operational'}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">
          {assignment.description || "No description provided for this architectural learning task."}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-50 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Max Marks</span>
             <span className="text-lg font-black text-gray-900">{assignment.maxMarks}</span>
          </div>
          <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-50 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Due Date</span>
             <span className="text-xs font-black text-gray-900">{new Date(assignment.dueDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Engagement Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
               <MdGroups className="text-lg text-blue-600" />
               <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Submissions</span>
            </div>
            <div className="text-[10px] font-black">
               <span className="text-blue-600">{totalSubmissions}</span>
               <span className="text-gray-300 mx-1">/</span>
               <span className="text-gray-400">{assignment.totalStudents || "--"}</span>
            </div>
          </div>
          <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
             <div 
               className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
               style={{ width: `${Math.max(submissionRate, 8)}%` }}
             />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
           <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-500 border border-gray-100">
              <MdPerson className="text-sm" /> {assignment.submissionFormat}
           </div>
           {assignment.isGroupAssignment && (
             <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-xl text-[10px] font-bold text-indigo-600 border border-indigo-100">
                <MdGroups className="text-sm" /> Group Task
             </div>
           )}
           {assignment.allowLateSubmission && (
             <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl text-[10px] font-bold text-amber-600 border border-amber-100">
                <MdAccessTime className="text-sm" /> Late Sync OK
             </div>
           )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
        <Link 
          to={`/teacher/assignments/${assignment._id || assignment.id || ''}`}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
        >
          Evaluate Results
          <MdChevronRight className="text-lg" />
        </Link>

        <div className="flex items-center gap-2">
           <button 
             onClick={() => onDelete(assignment._id)}
             className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
             title="Terminate Task"
           >
              <MdDeleteForever size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;