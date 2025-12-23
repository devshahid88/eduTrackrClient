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
    <div className="container mx-auto px-4 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Academic Calendar</h1>
          <p className="text-gray-500 font-medium mt-1">Your weekly schedule and class updates.</p>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={fetchData}
                disabled={isLoading}
                className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95 group"
            >
                <MdRefresh className={`w-6 h-6 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <div className="bg-white px-6 py-3 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1 h-full bg-blue-500" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Classes</span>
                    <span className="text-lg font-black text-gray-800 leading-none mt-1">{schedules.length}</span>
                </div>
            </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-8 border-blue-50 rounded-full"></div>
            <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-gray-900">Synchronizing Schedule...</p>
            <p className="text-gray-500 font-medium">Please wait while we prepare your academic week.</p>
          </div>
        </div>
      ) : schedules.length > 0 ? (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8 lg:p-12 overflow-hidden">
            <StudentCalendarView 
                schedules={schedules}
                courses={courses}
                teachers={teachers}
                departments={departments}
            />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 px-4 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-4">
            🗓️
          </div>
          <h2 className="text-2xl font-black text-gray-900">No Classes Scheduled</h2>
          <p className="text-gray-500 max-w-sm font-medium">
            We couldn't find any classes for your department this week. Check back later or contact your administrator.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentCalendar;
