// SubmissionsSection.tsx
import React, { useState, MouseEvent } from 'react';

export type SubmissionStatus = 'pending' | 'graded' | 'late';
 interface Submission {
  assignmentTitle: string;
  studentName: string;
  submittedAt: string;
  status: SubmissionStatus;
  grade?: string;
  feedback?: string;
  fileUrl: string;
}

interface SubmissionsSectionProps {
  submissions?: Submission[];
}

const SubmissionsSection: React.FC<SubmissionsSectionProps> = ({
  submissions = [],
}) => {
  const [filter, setFilter] = useState<'all' | SubmissionStatus>('all');

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const getStatusColor = (status: SubmissionStatus): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string): string =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const handleFilterClick = (
    status: 'all' | SubmissionStatus
  ): MouseEvent<HTMLButtonElement> => {
    setFilter(status);
    return {} as any;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'graded'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleFilterClick(status)}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === status
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No submissions found</div>
        ) : (
          filteredSubmissions.map((sub, idx) => (
            <div
              key={idx}
              className="flex items-start p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    {sub.assignmentTitle}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                      sub.status
                    )}`}
                  >
                    {sub.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span>👤 {sub.studentName}</span>
                  <span>📅 {formatDate(sub.submittedAt)}</span>
                  {sub.grade && <span>📊 Grade: {sub.grade}</span>}
                </div>
                {sub.feedback && (
                  <p className="mt-2 text-sm text-gray-600">{sub.feedback}</p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => window.open(sub.fileUrl, '_blank')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubmissionsSection;
