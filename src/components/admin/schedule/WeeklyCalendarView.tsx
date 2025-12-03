import React, { useState, useMemo } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { WeeklyCalendarViewProps } from '../../../types/components/admin';
import { DayOfWeek } from '../../../types/features/schedule-management';
import { useScheduleManagement } from '../../../hooks/useScheduleManagement';
import { 
  generateTimeSlots, 
  getSchedulesForSlot, 
  getDepartmentColorClass,
  getScheduleDetails,
  isClassStart,
  calculateTimeSlotSpan 
} from '../../../utils/scheduleUtils';
import ScheduleStats from './ScheduleStats';
import CalendarTable from './CalendarTable';
import ScheduleModal from './ScheduleModal';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ 
  className = '',
  timeSlotConfig = { startHour: 8, endHour: 18, intervalMinutes: 30 },
  onScheduleClick
}) => {
  // Use our custom hook for all schedule management
  const {
    schedules,
    departments,
    courses,
    teachers,
    loading,
    error,
    getScheduleStats
  } = useScheduleManagement();

  // Local state
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate time slots using utility function
  const timeSlots = useMemo(() => 
    generateTimeSlots(
      timeSlotConfig.startHour, 
      timeSlotConfig.endHour, 
      timeSlotConfig.intervalMinutes
    ), 
    [timeSlotConfig]
  );

  // Get filtered schedules based on selected department
  const filteredSchedules = useMemo(() => {
    if (!selectedDepartment) return schedules;
    
    return schedules.filter(schedule => {
      const deptId = typeof schedule.departmentId === 'string'
        ? schedule.departmentId
        : schedule.departmentId?._id;
      return deptId === selectedDepartment;
    });
  }, [schedules, selectedDepartment]);

  // Get schedule statistics
  const stats = useMemo(() => 
    getScheduleStats(), 
    [getScheduleStats]
  );

  // Handle department filter change
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
  };

  // Clear department filter
  const handleClearFilter = () => {
    setSelectedDepartment('');
  };

  // Handle schedule click
  const handleScheduleClick = (schedule: any) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
    onScheduleClick?.(schedule);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-red-500 p-4">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Error loading schedule data
          </div>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        {/* Header with Title and Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Weekly Schedule</h2>
          
          {/* Department Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-grow">
              <label htmlFor="department-filter" className="sr-only">
                Filter by Department
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="department-filter"
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  className="pl-10 w-full sm:w-64 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedDepartment && (
              <button
                onClick={handleClearFilter}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Schedule Statistics */}
        <ScheduleStats 
          stats={stats}
          departments={departments}
          courses={courses}
          className="mb-6"
        />

        {/* Calendar Table */}
        <CalendarTable
          schedules={filteredSchedules}
          departments={departments}
          courses={courses}
          teachers={teachers}
          daysOfWeek={DAYS_OF_WEEK}
          timeSlots={timeSlots}
          selectedDepartment={selectedDepartment}
          onScheduleClick={handleScheduleClick}
        />

        {/* Empty State */}
        {schedules.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
            <p className="text-gray-500">
              Schedules will appear here once they are created
            </p>
          </div>
        )}
      </div>

      {/* Schedule Detail Modal */}
      {isModalOpen && selectedSchedule && (
        <ScheduleModal
          schedule={selectedSchedule}
          departments={departments}
          courses={courses}
          teachers={teachers}
          onClose={handleCloseModal}
          isOpen={isModalOpen}
        />
      )}
    </>
  );
};

export default WeeklyCalendarView;
