import React from 'react';
import { X, Calendar, Clock, User, BookOpen, Building } from 'lucide-react';
import { ScheduleModalProps } from '../../../types/components/admin';
import { getScheduleDetails } from '../../../utils/scheduleUtils';

const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  schedule, 
  departments,
  courses,
  teachers,
  onClose,
  className = ''
}) => {
  if (!schedule) return null;

  const details = getScheduleDetails(schedule, courses, teachers, departments);

  const modalItems = [
    {
      icon: BookOpen,
      iconColor: 'text-blue-600',
      title: details.courseCode,
      subtitle: details.courseName
    },
    {
      icon: User,
      iconColor: 'text-green-600',
      title: 'Instructor',
      subtitle: details.teacherName
    },
    {
      icon: Calendar,
      iconColor: 'text-purple-600',
      title: 'Schedule',
      subtitle: `${schedule.day} • ${details.timeRange}`
    },
    {
      icon: Building,
      iconColor: 'text-orange-600',
      title: 'Department',
      subtitle: details.departmentName
    },
    {
      icon: BookOpen,
      iconColor: 'text-indigo-600',
      title: 'Semester',
      subtitle: details.semester
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Schedule Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {modalItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gray-50 ${item.iconColor}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
