import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

interface Attachment {
  name: string;
  url: string;
}

interface Submission {
  _id: string;
  studentId?: string;
  submittedAt: string;
  isLate?: boolean;
  grade?: number;
  feedback?: string;
  attachments?: Attachment[];
  submissionContent?: {
    text?: string;
    files: string[] | any[];
  };
}

interface Teacher {
  _id: string;
  name?: string;
  username?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  createdAt?: string;
  maxMarks: number;
  submissions?: Submission[];
  courseName?: string;
  departmentName?: string;
  teacherId?: Teacher | string;
  teacherName?: string;
  submissionFormat?: string;
  attachments?: Attachment[];
  allowLateSubmission?: boolean;
  [key: string]: any; // fallback for any extra fields
}

interface AssignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onStartSubmission: (assignment: Assignment) => Promise<void> | void;
  onDeleteSubmission?: (assignmentId: string) => Promise<void>;
}

const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  assignment, 
  onStartSubmission,
  onDeleteSubmission 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!assignment) return null;

  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isOverdue = dueDate < now && !assignment.submissions?.length;
  const isDueSoon =
    dueDate <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) &&
    dueDate > now &&
    !assignment.submissions?.length;

  const submission = assignment.submissions?.[0]; // StudentAssignmentsPage filters for current student
  const isGraded = submission?.grade !== undefined && submission?.grade !== null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onStartSubmission(assignment);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your submission?')) return;
    setIsDeleting(true);
    try {
      if (onDeleteSubmission) await onDeleteSubmission(assignment._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all border border-gray-100">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                        Assignment
                      </span>
                      {assignment.courseName && (
                        <span className="text-sm text-gray-400 font-medium">
                          • {assignment.courseName}
                        </span>
                      )}
                    </div>
                    <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                      {assignment.title}
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-8">
                  {/* Status Bar */}
                  <div className="flex flex-wrap gap-4 items-center py-4 border-y border-gray-50">
                    <div className="flex items-center gap-2">
                       {submission ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Submitted
                        </span>
                      ) : isOverdue ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Overdue
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="h-4 w-px bg-gray-200"></div>
                    <div className="text-sm">
                       <span className="text-gray-500">Due:</span>{' '}
                       <span className="font-semibold text-gray-700">
                         {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <div className="h-4 w-px bg-gray-200"></div>
                    <div className="text-sm">
                       <span className="text-gray-500">Points:</span>{' '}
                       <span className="font-semibold text-gray-700">{assignment.maxMarks}</span>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                      <section>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h4>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                          {assignment.description || 'No description provided.'}
                        </p>
                      </section>

                      {assignment.instructions && (
                        <section>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Instructions</h4>
                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-amber-900 text-sm leading-relaxed whitespace-pre-wrap">
                              {assignment.instructions}
                            </p>
                          </div>
                        </section>
                      )}
                    </div>

                    <div className="space-y-6">
                      <section>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Teacher</h4>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                             {(() => {
                                const tName = assignment.teacherName || 
                                              (typeof assignment.teacherId === 'object' ? (assignment.teacherId?.name || assignment.teacherId?.username) : '') || 
                                              'U';
                                return tName[0].toUpperCase();
                             })()}
                          </div>
                          <div className="text-sm">
                            <p className="font-bold text-gray-900">
                               {(() => {
                                  return assignment.teacherName || 
                                         (typeof assignment.teacherId === 'object' ? (assignment.teacherId?.name || assignment.teacherId?.username) : '') || 
                                         'Unknown Teacher';
                               })()}
                            </p>
                            <p className="text-gray-500 text-xs">Lead Instructor</p>
                          </div>
                        </div>
                      </section>

                      {assignment.attachments && assignment.attachments.length > 0 && (
                        <section>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Resources</h4>
                          <div className="space-y-2">
                            {assignment.attachments.map((attachment, index) => (
                              <a
                                key={index}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-100 transition-all group"
                              >
                                <svg className="w-4 h-4 text-blue-500 mr-2 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span className="text-xs font-medium text-gray-700 truncate">
                                  {attachment.name}
                                </span>
                              </a>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </div>

                  {/* My Submission Section */}
                  {submission && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-900">My Submission</h4>
                        <p className="text-xs text-gray-400">
                          Submitted on {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                        {submission.submissionContent?.text && (
                          <div>
                             <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Content</h5>
                             <p className="text-sm text-gray-700 leading-relaxed">
                               {submission.submissionContent?.text}
                             </p>
                          </div>
                        )}

                        {(submission.submissionContent?.files?.length ?? 0) > 0 && (
                          <div>
                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Attached Files</h5>
                            <div className="flex flex-wrap gap-2">
                              {submission.submissionContent?.files?.map((file: any, idx: number) => (
                                <a 
                                  key={idx} 
                                  href={typeof file === 'string' ? file : file.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-medium text-blue-600 hover:text-blue-800 hover:border-blue-100 transition-all shadow-sm"
                                >
                                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {typeof file === 'string' ? `File ${idx + 1}` : file.name || `File ${idx + 1}`}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {isGraded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                               <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Grade</h5>
                               <p className="text-xl font-black text-blue-600">
                                 {submission.grade} <span className="text-gray-300 text-sm">/ {assignment.maxMarks}</span>
                               </p>
                            </div>
                            {submission.feedback && (
                              <div className="md:col-span-3">
                                 <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Teacher Feedback</h5>
                                 <p className="text-sm text-gray-600 italic">"{submission.feedback}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    {submission && !isGraded && (
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Submission
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Close
                    </button>

                    {!submission && !isOverdue && (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Processing...' : 'Submit Now'}
                      </button>
                    )}

                    {!submission && isOverdue && assignment.allowLateSubmission && (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Processing...' : 'Submit Late'}
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AssignmentDetailModal;