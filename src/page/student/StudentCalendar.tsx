import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance';
import { RootState } from '../../redux/store';
import { toast } from 'react-hot-toast';
import StudentCalendarView from '../../components/student/calendar/StudentCalendarView';
import { MdCalendarToday, MdRefresh } from 'react-icons/md';

const StudentCalendar: React.FC = () => {
  const authState = useSelector((state: RootState) => state.auth);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const studentId = authState?.user?.id;
    const accessToken = authState?.accessToken;

    if (!studentId || !accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Get student details to find departmentId
      const studentResponse = await axiosInstance.get(`/api/students/${studentId}`);
      if (!studentResponse.data.success) throw new Error('Failed to load student data');
      
      const departmentId = studentResponse.data.data.departmentId;

      // 2. Fetch all required data in parallel
      const [schRes, depRes, couRes, teaRes] = await Promise.all([
        axiosInstance.get(`/api/schedules/department/${departmentId}`),
        axiosInstance.get('/api/departments'),
        axiosInstance.get('/api/courses'),
        axiosInstance.get('/api/teachers')
      ]);

      if (schRes.data.success) setSchedules(schRes.data.data);
      if (depRes.data.success) setDepartments(depRes.data.data);
      if (couRes.data.success) setCourses(couRes.data.data);
      if (teaRes.data.success) setTeachers(teaRes.data.data);

    } catch (error: any) {
      console.error('Error loading calendar data:', error);
      toast.error('Failed to load classes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authState]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
            <MdCalendarToday className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Weekly Calendar</h1>
            <p className="text-sm text-gray-500 font-medium">Your academic timetable at a glance</p>
          </div>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm"
        >
          <MdRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-500 font-medium animate-pulse">Building your schedule...</p>
        </div>
      ) : schedules.length > 0 ? (
        <StudentCalendarView 
          schedules={schedules}
          courses={courses}
          teachers={teachers}
          departments={departments}
        />
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdCalendarToday className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No classes found</h3>
          <p className="text-gray-500 max-w-xs mx-auto">It looks like there aren't any classes scheduled for your department yet.</p>
        </div>
      )}
    </div>
  );
};

export default StudentCalendar;
