import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { fetchAllSchedules, deleteExistingSchedule } from '../redux/slices/scheduleSlice';
import { 
  Schedule, 
  Department, 
  Course, 
  Teacher, 
  ScheduleStats,
  ScheduleFilters 
} from '../types/features/schedule-management';
import { RootState } from '../redux/store';

export const useScheduleManagement = () => {
  const dispatch = useDispatch();
  const { schedules = [], loading: scheduleLoading, error } = useSelector(
    (state: RootState) => state.schedule
  );

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all required data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch schedules using Redux
      await dispatch(fetchAllSchedules() as any);

      // Fetch related data
      const [deptResponse, courseResponse, teacherResponse] = await Promise.all([
        axiosInstance.get('/api/departments'),
        axiosInstance.get('/api/courses'),
        axiosInstance.get('/api/teachers'),
      ]);

      if (deptResponse.data.success) {
        setDepartments(deptResponse.data.data);
      }
      if (courseResponse.data.success) {
        setCourses(courseResponse.data.data);
      }
      if (teacherResponse.data.success) {
        setTeachers(teacherResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Delete schedule
  const deleteSchedule = useCallback(async (scheduleId: string): Promise<void> => {
    try {
      await dispatch(deleteExistingSchedule(scheduleId) as any);
      toast.success('Schedule deleted successfully');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
      throw error;
    }
  }, [dispatch]);

  // Get schedule statistics
  const getScheduleStats = useCallback((): ScheduleStats => {
    if (!Array.isArray(schedules)) {
      return {
        totalClasses: 0,
        activeDepartments: 0,
        activeCourses: 0,
        activeTeachers: 0,
        classesByDay: {} as Record<string, number>,
        classesByDepartment: {}
      };
    }

    const activeDepartmentIds = new Set();
    const activeCourseIds = new Set();
    const activeTeacherIds = new Set();
    const classesByDay: Record<string, number> = {};
    const classesByDepartment: Record<string, number> = {};

    schedules.forEach((schedule: Schedule) => {
      // Count unique entities
      const deptId = typeof schedule.departmentId === 'string' 
        ? schedule.departmentId 
        : schedule.departmentId?._id;
      const courseId = typeof schedule.courseId === 'string' 
        ? schedule.courseId 
        : schedule.courseId?._id;
      const teacherId = typeof schedule.teacherId === 'string' 
        ? schedule.teacherId 
        : schedule.teacherId?._id;

      if (deptId) activeDepartmentIds.add(deptId);
      if (courseId) activeCourseIds.add(courseId);
      if (teacherId) activeTeacherIds.add(teacherId);

      // Count by day
      classesByDay[schedule.day] = (classesByDay[schedule.day] || 0) + 1;

      // Count by department
      const deptName = typeof schedule.departmentId === 'string' 
        ? departments.find(d => d._id === schedule.departmentId)?.name || 'Unknown'
        : schedule.departmentId?.name || 'Unknown';
      classesByDepartment[deptName] = (classesByDepartment[deptName] || 0) + 1;
    });

    return {
      totalClasses: schedules.length,
      activeDepartments: activeDepartmentIds.size,
      activeCourses: activeCourseIds.size,
      activeTeachers: activeTeacherIds.size,
      classesByDay,
      classesByDepartment
    };
  }, [schedules, departments]);

  // Filter schedules
  const filterSchedules = useCallback((filters: ScheduleFilters): Schedule[] => {
    if (!Array.isArray(schedules)) return [];

    return schedules.filter((schedule: Schedule) => {
      // Department filter
      if (filters.department) {
        const deptId = typeof schedule.departmentId === 'string' 
          ? schedule.departmentId 
          : schedule.departmentId?._id;
        if (deptId !== filters.department) return false;
      }

      // Day filter
      if (filters.day && schedule.day !== filters.day) return false;

      // Semester filter
      if (filters.semester) {
        const semester = typeof schedule.courseId === 'string'
          ? courses.find(c => c._id === schedule.courseId)?.semester
          : schedule.courseId?.semester;
        if (semester !== filters.semester) return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const courseName = typeof schedule.courseId === 'string'
          ? courses.find(c => c._id === schedule.courseId)?.name || ''
          : schedule.courseId?.name || '';
        const courseCode = typeof schedule.courseId === 'string'
          ? courses.find(c => c._id === schedule.courseId)?.code || ''
          : schedule.courseId?.code || '';
        const teacherName = typeof schedule.teacherId === 'string'
          ? teachers.find(t => t._id === schedule.teacherId)
          : schedule.teacherId;
        const fullTeacherName = teacherName 
          ? `${teacherName.firstname} ${teacherName.lastname}`.toLowerCase()
          : '';

        const matchesSearch = courseName.toLowerCase().includes(term) ||
                             courseCode.toLowerCase().includes(term) ||
                             fullTeacherName.includes(term);
        
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [schedules, courses, teachers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    schedules,
    departments,
    courses,
    teachers,
    loading: loading || scheduleLoading,
    error,
    deleteSchedule,
    getScheduleStats,
    filterSchedules,
    refetchData: fetchData
  };
};
