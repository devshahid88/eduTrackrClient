import { Schedule, Department, Course, Teacher, ScheduleDetails, DayOfWeek } from '../types/features/schedule-management';

// Convert time string (HH:MM) to minutes for comparison
export const convertTimeToMinutes = (timeString: string): number => {
  if (!timeString || typeof timeString !== 'string') return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

// Generate time slots for calendar view
export const generateTimeSlots = (startHour = 8, endHour = 18, intervalMinutes = 30): string[] => {
  const timeSlots: string[] = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const formattedHour = hour.toString().padStart(2, '0');
    timeSlots.push(`${formattedHour}:00`);
    if (hour < endHour) {
      timeSlots.push(`${formattedHour}:30`);
    }
  }
  
  return timeSlots;
};

// Check if this timeslot is the start of a class
export const isClassStart = (schedule: Schedule, timeSlot: string): boolean => {
  return schedule.startTime === timeSlot;
};

// Calculate how many rows (time slots) a class should span
export const calculateTimeSlotSpan = (startTime: string, endTime: string): number => {
  const start = convertTimeToMinutes(startTime);
  const end = convertTimeToMinutes(endTime);
  return Math.ceil((end - start) / 30);
};

// Get schedule details for display
export const getScheduleDetails = (
  schedule: Schedule,
  courses: Course[],
  teachers: Teacher[],
  departments: Department[]
): ScheduleDetails => {
  const course = typeof schedule.courseId === 'string'
    ? courses?.find(c => c._id === schedule.courseId)
    : schedule.courseId;
    
  const teacher = typeof schedule.teacherId === 'string'
    ? teachers?.find(t => t._id === schedule.teacherId)
    : schedule.teacherId;
    
  const department = typeof schedule.departmentId === 'string'
    ? departments?.find(d => d._id === schedule.departmentId)
    : schedule.departmentId;

  return {
    courseCode: schedule.courseCode || course?.code || 'N/A',
    courseName: schedule.courseName || course?.name || 'Unknown Course',
    teacherName: schedule.teacherName || (teacher && typeof teacher === 'object' ? `${teacher.firstname} ${teacher.lastname}` : 'TBA'),
    departmentName: schedule.departmentName || department?.name || 'Unknown Dept',
    semester: schedule.semester || course?.semester || 'N/A',
    timeRange: `${schedule.startTime} - ${schedule.endTime}`
  };
};

// Get CSS class based on department for color coding
export const getDepartmentColorClass = (
  departmentId: string | Department,
  departments: Department[]
): string => {
  const department = typeof departmentId === 'string'
    ? departments.find(d => d._id === departmentId)
    : departmentId;
    
  const departmentName = department?.name || 'Unknown';
  
  const departmentColors: Record<string, string> = {
    'Computer Science': 'bg-blue-50 border-blue-200 text-blue-800',
    'Business Administration': 'bg-green-50 border-green-200 text-green-800',
    'Engineering': 'bg-purple-50 border-purple-200 text-purple-800',
    'Arts & Humanities': 'bg-yellow-50 border-yellow-200 text-yellow-800',
    'Mathematics': 'bg-red-50 border-red-200 text-red-800',
    'Science': 'bg-indigo-50 border-indigo-200 text-indigo-800',
  };
  
  return departmentColors[departmentName] || 'bg-gray-50 border-gray-200 text-gray-800';
};

// Get schedules for a specific day and time slot
export const getSchedulesForSlot = (
  schedules: Schedule[],
  day: DayOfWeek,
  timeSlot: string,
  selectedDepartment?: string
): Schedule[] => {
  if (!Array.isArray(schedules)) return [];
  
  return schedules.filter((schedule) => {
    const isDayMatch = schedule.day === day;
    
    const isDepartmentMatch = !selectedDepartment || 
      (typeof schedule.departmentId === 'string' 
        ? schedule.departmentId === selectedDepartment
        : schedule.departmentId?._id === selectedDepartment);
    
    const slotTime = convertTimeToMinutes(timeSlot);
    const startTime = convertTimeToMinutes(schedule.startTime);
    const endTime = convertTimeToMinutes(schedule.endTime);
    const isTimeMatch = slotTime >= startTime && slotTime < endTime;
    
    return isDayMatch && isDepartmentMatch && isTimeMatch;
  });
};
