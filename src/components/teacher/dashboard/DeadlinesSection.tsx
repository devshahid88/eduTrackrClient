// DeadlinesSection.tsx
import React, { useState, MouseEvent } from 'react';

export type DeadlineStatus = 'all' | 'upcoming' | 'overdue' | 'completed';

export interface Deadline {
  title: string;
  course: string;
  dueDate: string;
  status: Extract<DeadlineStatus, 'upcoming' | 'overdue' | 'completed'>;
  description?: string;
  link: string;
}

interface DeadlinesSectionProps {
  deadlines?: Deadline[];
}

const DeadlinesSection: React.FC<DeadlinesSectionProps> = ({
  deadlines = [],
}) => {
  const [filter, setFilter] = useState<Extract<DeadlineStatus, 'all' | 'upcoming' | 'overdue'>>('all');

  const filteredDeadlines = deadlines.filter((d) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  const getStatusColor = (status: Deadline['status']): string => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string): string => {
    const deadlineDate = new Date(date);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  const getTimeLeft = (date: string): string => {
    const deadlineDate = new Date(date);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    if (diffTime < 0) return 'Overdue';

    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 24) {
      return `${diffHours}h ${diffMinutes}m left`;
    }
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    return `${days}d ${hours}h left`;
  };

  const handleFilterClick = (e: MouseEvent<HTMLButtonElement>) => {
    setFilter(e.currentTarget.dataset.filter as Extract<DeadlineStatus, 'all' | 'upcoming' | 'overdue'>);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
        <div className="flex items-center gap-2">
          {(['all', 'upcoming', 'overdue'] as const).map((f) => (
            <button
              key={f}
              data-filter={f}
              onClick={handleFilterClick}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === f
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredDeadlines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No deadlines found</div>
        ) : (
          filteredDeadlines.map((deadline, idx) => (
            <div
              key={idx}
              className="flex items-start p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    {deadline.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                      deadline.status
                    )}`}
                  >
                    {deadline.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span>📚 {deadline.course}</span>
                  <span>📅 {formatDate(deadline.dueDate)}</span>
                  <span>⏰ {getTimeLeft(deadline.dueDate)}</span>
                </div>
                {deadline.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {deadline.description}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <a
                  href={deadline.link}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DeadlinesSection;
