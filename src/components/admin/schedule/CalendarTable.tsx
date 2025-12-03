import React from 'react';
import { Schedule, Department, Course, Teacher, DayOfWeek } from '../../../types/features/schedule-management';
import { 
  getSchedulesForSlot, 
  getDepartmentColorClass,
  getScheduleDetails,
  isClassStart,
  calculateTimeSlotSpan 
} from '../../../utils/scheduleUtils';
import ScheduleCard from './ScheduleCard';

interface CalendarTableProps {
  schedules: Schedule[];
  departments: Department[];
  courses: Course[];
  teachers: Teacher[];
  daysOfWeek: DayOfWeek[];
  timeSlots: string[];
  selectedDepartment: string;
  onScheduleClick: (schedule: Schedule) => void;
}

const CalendarTable: React.FC<CalendarTableProps> = ({
  schedules,
  departments,
  courses,
  teachers,
  daysOfWeek,
  timeSlots,
  selectedDepartment,
  onScheduleClick
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b bg-gray-50">
              Time
            </th>
            {daysOfWeek.map((day) => (
              <th
                key={day}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b bg-gray-50"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {timeSlots.map((timeSlot, index) => (
            <tr key={timeSlot} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200 font-medium">
                {timeSlot}
              </td>
              {daysOfWeek.map((day) => {
                const schedulesForSlot = getSchedulesForSlot(
                  schedules, 
                  day, 
                  timeSlot, 
                  selectedDepartment
                );
                
                if (schedulesForSlot.length === 0) {
                  return (
                    <td 
                      key={`${day}-${timeSlot}`} 
                      className="border border-gray-100 px-2 py-3 h-16"
                    />
                  );
                }

                const startingClasses = schedulesForSlot.filter((schedule) => 
                  isClassStart(schedule, timeSlot)
                );
                
                if (startingClasses.length === 0) {
                  return (
                    <td 
                      key={`${day}-${timeSlot}`} 
                      className="border border-gray-100"
                    />
                  );
                }

                return (
                  <td 
                    key={`${day}-${timeSlot}`} 
                    className="border border-gray-100 px-2 py-2 relative"
                  >
                    {startingClasses.map((schedule) => {
                      const rowSpan = calculateTimeSlotSpan(schedule.startTime, schedule.endTime);
                      const colorClass = getDepartmentColorClass(schedule.departmentId, departments);
                      const details = getScheduleDetails(schedule, courses, teachers, departments);
                      
                      return (
                        <ScheduleCard
                          key={schedule._id || `${day}-${timeSlot}-${details.courseCode}`}
                          schedule={schedule}
                          scheduleDetails={details}
                          colorClass={colorClass}
                          onClick={() => onScheduleClick(schedule)}
                          className="absolute top-1 left-1 right-1"
                          style={{
                            minHeight: `${rowSpan * 4}rem`,
                            zIndex: 1,
                          }}
                        />
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
  );
};

export default CalendarTable;
