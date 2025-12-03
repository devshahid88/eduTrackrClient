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
  teacherId?: Teacher;
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
}

const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({ isOpen, onClose, assignment, onStartSubmission }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!assignment) return null;

  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isOverdue = dueDate < now && !assignment.submissions?.length;
  const isDueSoon =
    dueDate <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) &&
    dueDate > now &&
    !assignment.submissions?.length;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onStartSubmission(assignment);
    } finally {
      setIsSubmitting(false);
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
          <div className="fixed inset-0 bg-black bg-opacity-30" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                    Assignment Details
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {/* Title and Status */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {assignment.title}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {assignment.courseName || ''} • {assignment.departmentName || ''}
                      </span>
                      {assignment.submissions?.length && assignment.submissions.length > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Submitted
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Overdue
                        </span>
                      ) : isDueSoon ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Due Soon
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {assignment.description}
                    </p>
                  </div>

                  {/* Instructions */}
                  {assignment.instructions && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Instructions
                      </h3>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {assignment.instructions}
                      </p>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </h3>
                      <p className="text-gray-600">
                        {dueDate.toLocaleDateString()} at{' '}
                        {dueDate.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Maximum Marks
                      </h3>
                      <p className="text-gray-600">{assignment.maxMarks} points</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Teacher
                      </h3>
                      <p className="text-gray-600">
                        {assignment.teacherId?.name || assignment.teacherId?.username || 'Unknown Teacher'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Submission Format
                      </h3>
                      <p className="text-gray-600">{assignment.submissionFormat}</p>
                    </div>
                  </div>

                  {/* Attachments */}
                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Attachments
                      </h3>
                      <div className="space-y-2">
                        {assignment.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <svg
                              className="w-5 h-5 text-gray-500 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                            <span className="text-sm text-gray-700">
                              {attachment.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submission Status */}
                  {assignment.submissions && assignment.submissions.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-green-800 mb-2">
                        Submission Status
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm text-green-700">
                          Submitted on:{' '}
                          {assignment.submissions[0]?.submittedAt ? new Date(
                            assignment.submissions[0].submittedAt
                          ).toLocaleString() : 'N/A'}
                        </p>
                        {assignment.submissions[0]?.grade !== undefined && (
                          <p className="text-sm text-green-700">
                            Grade: {assignment.submissions[0].grade}/
                            {assignment.maxMarks}
                          </p>
                        )}
                        {assignment.submissions[0]?.feedback && (
                          <div>
                            <p className="text-sm font-medium text-green-800 mb-1">
                              Feedback:
                            </p>
                            <p className="text-sm text-green-700">
                              {assignment.submissions[0].feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>

                  {(!assignment.submissions || assignment.submissions.length === 0) && !isOverdue && (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                    </button>
                  )}

                  {(!assignment.submissions || assignment.submissions.length === 0) && isOverdue && assignment.allowLateSubmission && (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Late'}
                    </button>
                  )}
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