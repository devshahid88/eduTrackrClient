import React from 'react';
import { Clock } from 'lucide-react';
import { ScheduleCardProps } from '../../../types/components/admin';

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  scheduleDetails,
  colorClass,
  onClick,
  className = ''
}) => {
  return (
    <div
      className={`p-3 border rounded-md cursor-pointer hover:shadow-md transition-all duration-200 ${colorClass} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="space-y-1">
        <div className="text-sm font-semibold truncate">
          {scheduleDetails.courseCode}
        </div>
        <div className="text-xs truncate text-gray-600">
          {scheduleDetails.teacherName}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Clock size={12} className="mr-1" />
          {scheduleDetails.timeRange}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;
