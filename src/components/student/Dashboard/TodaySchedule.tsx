import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { MdLocationOn, MdAccessTime } from 'react-icons/md';
import { ScheduleItem } from '../../../types/features/dashboard';

const TodaySchedule: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = useSelector((state: any) => state.auth);
  const studentId = auth.user.id as string;
  const token = auth.accessToken as string;
console.log('Auth:', auth);
  useEffect(() => {
    const fetch = async () => {
      if (!studentId || !token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      try {
        const { data: stuRes } = await axiosInstance.get<{ success: boolean; data: { departmentId: string } }>(
          `/api/students/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!stuRes.success) throw new Error('Failed to load student');
        const deptId = stuRes.data.departmentId;

        const { data: schRes } = await axiosInstance.get<{ success: boolean; data: any[] }>(
          `/api/schedules/department/${deptId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!schRes.success) throw new Error('Failed to load schedule');

        const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const now = new Date();
        const items: ScheduleItem[] = schRes.data
          .filter(item => item.day === todayName)
          .map(item => ({
            _id: item._id,
            course: item.courseId?.name || 'N/A',
            courseCode: item.courseId?.code,
            startTime: item.startTime,
            endTime: item.endTime,
            location: item.room || 'TBA',
            instructor: item.teacherId?.username || 'TBA',
            credits: item.courseId?.credits,
            status: 'Upcoming' as 'Upcoming'
          }))
          .sort((a, b) => {
            const [ah, am] = a.startTime.split(':').map(Number);
            const [bh, bm] = b.startTime.split(':').map(Number);
            return ah * 60 + am - (bh * 60 + bm);
          });
        setSchedule(items);
      } catch (err: any) {
        setError(err.message || 'Failed to load schedule');
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [studentId, token]);

  const getStatusColor = (st: string) => ({
    Upcoming: 'bg-green-100 text-green-800',
    Ongoing: 'bg-blue-100 text-blue-800',
    Completed: 'bg-gray-100 text-gray-800'
  }[st] || 'bg-gray-100 text-gray-800');

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6">Today's Schedule</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-t-2 border-blue-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6">Today's Schedule</h2>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Today's Schedule</h2>
        <a href="/student/classpage" className="text-sm text-blue-600 hover:text-blue-700">
          View Full Schedule
        </a>
      </div>
      <div className="space-y-4">
        {schedule.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No classes scheduled for today</div>
        ) : (
          schedule.map(item => (
            <div
              key={item._id}
              className="flex items-start p-4 rounded-lg border hover:border-blue-200"
            >
              <div className="w-16 text-center">
                <div className="text-sm font-medium">{item.startTime}</div>
                <div className="text-xs text-gray-500">{item.endTime}</div>
              </div>
              <div className="flex-1 ml-4">
                <h3 className="text-sm font-medium">{item.course}</h3>
                {item.courseCode && <p className="text-xs text-blue-700">Course ID: {item.courseCode}</p>}
                <p className="flex items-center text-sm text-gray-500 mt-1">
                  <MdLocationOn className="mr-1" /> {item.location}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>👤 {item.instructor}</span>
                  {item.credits && <span>📚 {item.credits} Credits</span>}
                </div>
              </div>
              <span className={`ml-4 px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodaySchedule;
