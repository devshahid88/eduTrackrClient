import React, { useMemo } from 'react';
import { 
  generateTimeSlots, 
  getSchedulesForSlot, 
  calculateTimeSlotSpan,
  getScheduleDetails
} from '../../../utils/scheduleUtils';
import { DayOfWeek, Schedule } from '../../../types/features/schedule-management';

interface StudentCalendarViewProps {
  schedules: Schedule[];
  courses: any[];
  teachers: any[];
  departments: any[];
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const StudentCalendarView: React.FC<StudentCalendarViewProps> = ({ 
  schedules, 
  courses, 
  teachers, 
  departments 
}) => {
  const timeSlots = useMemo(() => generateTimeSlots(8, 18, 30), []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 border-r border-gray-100 uppercase">Time</th>
              {DAYS.map(day => (
                <th key={day} className="py-4 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[150px] border-r border-gray-100 last:border-r-0">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, index) => (
              <tr key={slot} className="border-b border-gray-50 last:border-b-0 group">
                <td className="py-3 px-3 text-xs font-medium text-gray-400 text-right bg-gray-50/30 border-r border-gray-100">
                  {slot}
                </td>
                {DAYS.map(day => {
                  const slotSchedules = getSchedulesForSlot(schedules, day, slot);
                  const isStarting = slotSchedules.find(s => s.startTime === slot);

                  return (
                    <td key={`${day}-${slot}`} className="p-1 border-r border-gray-100 last:border-r-0 relative min-h-[60px] group-hover:bg-gray-50/50 transition-colors">
                      {isStarting && slotSchedules.map(schedule => {
                        const details = getScheduleDetails(schedule, courses, teachers, departments);
                        const span = calculateTimeSlotSpan(schedule.startTime, schedule.endTime);
                        
                        return (
                          <div
                            key={schedule._id}
                            className="absolute inset-x-1 z-10 p-3 rounded-lg border shadow-sm transition-all hover:shadow-md hover:scale-[1.02] cursor-default bg-blue-50 border-blue-200 text-blue-800"
                            style={{ 
                              height: `calc(${span * 100}% - 8px)`,
                              top: '4px'
                            }}
                          >
                            <div className="flex flex-col h-full overflow-hidden">
                              <span className="font-bold text-xs truncate mb-1">{details.courseName}</span>
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-[10px] bg-blue-100 px-1 py-0.5 rounded font-medium">{details.courseCode}</span>
                              </div>
                              <span className="text-[10px] text-blue-600 font-medium mt-auto flex items-center gap-1">
                                👤 {details.teacherName}
                              </span>
                              <span className="text-[10px] text-blue-500 flex items-center gap-1">
                                🕒 {details.timeRange}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentCalendarView;
