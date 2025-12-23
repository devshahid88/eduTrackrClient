import React, { useState, useMemo } from 'react';
import { 
  MdCalendarMonth, 
  MdFilterList, 
  MdAccessTime, 
  MdLocationOn,
  MdSchool,
  MdLayers,
  MdNavigateBefore,
  MdNavigateNext
} from 'react-icons/md';
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
  const {
    schedules,
    departments,
    courses,
    teachers,
    loading,
    error,
    getScheduleStats
  } = useScheduleManagement();

  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const timeSlots = useMemo(() => 
    generateTimeSlots(
      timeSlotConfig.startHour, 
      timeSlotConfig.endHour, 
      timeSlotConfig.intervalMinutes
    ), 
    [timeSlotConfig]
  );

  const filteredSchedules = useMemo(() => {
    if (!selectedDepartment) return schedules;
    return schedules.filter(schedule => {
      const deptId = typeof schedule.departmentId === 'string'
        ? schedule.departmentId
        : schedule.departmentId?._id;
      return deptId === selectedDepartment;
    });
  }, [schedules, selectedDepartment]);

  const stats = useMemo(() => getScheduleStats(), [getScheduleStats]);

  const handleScheduleClick = (schedule: any) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
    onScheduleClick?.(schedule);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] p-24 flex flex-col items-center justify-center gap-6 shadow-sm border border-gray-100">
         <div className="animate-spin h-16 w-16 border-[5px] border-indigo-600/10 border-t-indigo-600 rounded-full" />
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Projecting Time Matrix...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-10 ${className}`}>
        {/* Statistics HUD */}
        <ScheduleStats 
          stats={stats}
          departments={departments}
          courses={courses}
          className="animate-in fade-in slide-in-from-top-4 duration-700"
        />

        {/* Calendar Control Hub */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                   <MdCalendarMonth size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">Weekly Temporal Grid</h3>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Synchronized System Schedule</p>
                </div>
             </div>

             <div className="flex items-center gap-3">
                <div className="relative group">
                   <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors pointer-events-none" />
                   <select
                     value={selectedDepartment}
                     onChange={(e) => setSelectedDepartment(e.target.value)}
                     className="pl-12 pr-10 py-3 bg-gray-50 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none cursor-pointer min-w-[200px] transition-all"
                   >
                     <option value="">All Operational Units</option>
                     {departments.map((dept) => (
                       <option key={dept._id} value={dept._id}>{dept.name}</option>
                     ))}
                   </select>
                </div>
             </div>
          </div>

          <div className="p-4">
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
          </div>

          {schedules.length === 0 && (
            <div className="p-24 text-center opacity-20">
               <MdCalendarMonth size={64} className="mx-auto mb-4" />
               <p className="text-sm font-black uppercase tracking-widest">No Temporal Matrix Data</p>
            </div>
          )}
        </div>

      {isModalOpen && selectedSchedule && (
        <ScheduleModal
          schedule={selectedSchedule}
          departments={departments}
          courses={courses}
          teachers={teachers}
          onClose={() => { setIsModalOpen(false); setSelectedSchedule(null); }}
          isOpen={isModalOpen}
        />
      )}
    </div>
  );
};

export default WeeklyCalendarView;
