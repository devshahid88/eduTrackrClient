// ScheduleSection.tsx
import React, { useState, MouseEvent } from 'react';

export type ViewMode = 'day' | 'week';
export type ScheduleStatus ='upcoming' | 'ongoing' | 'completed';

export interface ScheduleItem {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  status: ScheduleStatus;
  students?: number;
}

interface ScheduleSectionProps {
  schedule?: ScheduleItem[];
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({ schedule = [] }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  const formatTime = (time: string): string =>
    new Date(time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const getDaySchedule = (): ScheduleItem[] =>
    schedule.filter(item => {
      const itemDate = new Date(item.startTime);
      return itemDate.toDateString() === selectedDate.toDateString();
    });

  const getWeekSchedule = (): ScheduleItem[] => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return schedule.filter(item => {
      const itemDate = new Date(item.startTime);
      return itemDate >= weekStart && itemDate <= weekEnd;
    });
  };

  const currentSchedule = viewMode === 'day' ? getDaySchedule() : getWeekSchedule();

  const handleViewModeClick = (mode: ViewMode) => () => {
    setViewMode(mode);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
        <div className="flex items-center gap-2">
          {(['day', 'week'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={handleViewModeClick(mode)}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === mode
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {currentSchedule.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No classes scheduled for {viewMode === 'day' ? 'today' : 'this week'}
          </div>
        ) : (
          currentSchedule.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-sm font-medium text-gray-900">
                  {formatTime(item.startTime)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(item.endTime)}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.location}</p>
                {item.students !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    {item.students} students enrolled
                  </p>
                )}
              </div>
              <div className="ml-4">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'upcoming'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'ongoing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduleSection;
