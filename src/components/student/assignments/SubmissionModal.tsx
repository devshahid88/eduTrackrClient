/* ─────────────────────────────────────────────────────────
   SUBMISSION MODAL – FULLY-TYPED REACT + TAILWIND (TSX)
   Location suggestion: src/components/studentassignment/SubmissionModal.tsx
   ───────────────────────────────────────────────────────── */

import React, { useState, DragEvent, ChangeEvent, FormEvent } from 'react';
import {
  File as FileIcon,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';

/* ───── Feature-level Types (import from your central type file if already defined) ───── */

export interface Attachment {
  name: string;
  url: string;
  size?: number;
}

export interface SubmissionPayload {
  submissionText: string;
  files: File[];
}

export interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onSubmit: (assignmentId: string, payload: SubmissionPayload) => Promise<void>;
}

export interface Submission {
  _id: string;
  studentId?: string;
  submittedAt: string;
  isLate?: boolean;
  grade?: number;
  feedback?: string;
  attachments?: Attachment[];
}

export interface Teacher {
  _id: string;
  name?: string;
  username?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  createdAt?: string;
  maxMarks: number;
  maxPoints?: number;
  submissions?: Submission[];
  courseName?: string;
  courseId?: { name?: string };
  departmentName?: string;
  teacherId?: Teacher;
  submissionFormat?: string;
  attachments?: Attachment[];
  allowLateSubmission?: boolean;
  [key: string]: unknown;
}

/* ───── Utility helpers ───── */

const BYTES_IN_KIB = 1_024;
const SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB'] as const;

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 Bytes';
  const exponent = Math.floor(Math.log(bytes) / Math.log(BYTES_IN_KIB));
  const size = (bytes / BYTES_IN_KIB ** exponent).toFixed(2);
  return `${size} ${SIZE_UNITS[exponent]}`;
};

/* ───── Component ───── */

const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onSubmit
}) => {
  const [submissionText, setSubmissionText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !assignment) return null;

  /* ─── Derived flags ─── */
  const dueDate = new Date(assignment.dueDate);
  const overdue = dueDate < new Date();

  /* ─── Handlers ─── */
  const addFiles = (incoming: FileList | File[]) => {
    const newFiles = Array.from(incoming);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const removeFile = (idx: number) =>
    setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!submissionText.trim() && files.length === 0) {
      window.alert('Please provide either text or at least one file.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(assignment._id, { submissionText: submissionText.trim(), files });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── JSX ─── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Submit Assignment</h2>
            <p className="mt-1 text-gray-600">{assignment.title}</p>
          </div>
          <button
            type="button"
            className="text-gray-400 transition hover:text-gray-600"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close submission modal"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Info Box */}
          <section className="rounded-lg bg-gray-50 p-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Course:</span>
                <span className="ml-2 text-gray-600">
                  {assignment.courseId?.name ?? 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Points:</span>
                <span className="ml-2 text-gray-600">
                  {assignment.maxMarks ?? assignment.maxPoints ?? 0}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Due Date:</span>
                <span
                  className={`ml-2 ${
                    overdue ? 'font-medium text-red-600' : 'text-gray-600'
                  }`}
                >
                  {dueDate.toLocaleDateString()} @
                  {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span
                  className={`ml-2 font-medium ${
                    overdue ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {overdue ? 'Overdue' : 'On Time'}
                </span>
              </div>
            </div>
          </section>

          {/* Overdue Warning */}
          {overdue && (
            <section className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="flex items-center text-red-800">
                <AlertCircle className="mr-2 h-5 w-5" />
                This assignment is overdue. Late submissions may be penalized.
              </p>
            </section>
          )}

          {/* Text Submission */}
          <section>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Submission Text
            </label>
            <textarea
              className="w-full resize-vertical rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              rows={8}
              placeholder="Enter your work here..."
              value={submissionText}
              onChange={e => setSubmissionText(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Character count: {submissionText.length}
            </p>
          </section>

          {/* File Upload */}
          <section>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Attach Files (optional)
            </label>
            <div
              className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                disabled={isSubmitting}
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>{' '}
                  or drag &amp; drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, TXT, PNG, JPG, GIF up to 10&nbsp;MB each
                </p>
              </label>
            </div>
          </section>

          {/* Selected Files */}
          {files.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-medium text-gray-700">Selected Files</h4>
              <ul className="space-y-2">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}_${i}`}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex items-center space-x-2">
                      <FileIcon className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      disabled={isSubmitting}
                      aria-label="Remove file"
                      className="rounded p-1 text-red-600 transition hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Submission Guidelines */}
          <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-blue-800">Guidelines</h4>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>• Address all assignment requirements.</li>
              <li>• Proofread for spelling &amp; grammar.</li>
              <li>• Name files clearly and use correct format.</li>
              <li>• You cannot edit once submitted.</li>
            </ul>
          </section>

          {/* Footer Buttons */}
          <footer className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || (!submissionText.trim() && files.length === 0)
              }
              className={`rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                overdue
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </span>
              ) : overdue ? (
                'Submit Late'
              ) : (
                'Submit Assignment'
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default SubmissionModal;
