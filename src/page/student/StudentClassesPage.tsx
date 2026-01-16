import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import VideoCall from '../../components/common/VideoCall';
import { RootState } from '../../redux/store';

const StudentClassesPage: React.FC = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const [studentSchedules, setStudentSchedules] = useState<any[]>([]);
  const [studentDepartment, setStudentDepartment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);

  useEffect(() => {
    setIsVideoCallActive(false);
    setCurrentChannel(null);

    const fetchStudentSchedules = async () => {
      const studentId = authState?.user?.id || authState?.user?.id;
      const accessToken = authState?.accessToken;
      if (!studentId || !accessToken) {
        toast.error('Please log in to view your timetable.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (studentResponse.data.success) {
          const student = studentResponse.data.data;
          setStudentDepartment(student);
          if (student.departmentId) {
            const schedulesResponse = await axios.get(
              `/api/schedules/department/${student.departmentId}`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (schedulesResponse.data.success) {
              setStudentSchedules(schedulesResponse.data.data);
            } else {
              toast.error('Failed to load schedule data');
            }
          } else {
            toast.error('Student department not found');
          }
        } else {
          toast.error('Failed to load student information');
        }
      } catch (error: any) {
        toast.error(`Failed to load schedule: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudentSchedules();
  }, [authState]);

  const handleJoinClass = (schedule: any) => {
    if (!schedule._id) {
      toast.error('Invalid class ID');
      return;
    }
    console.log('[DEBUG] Joining Class:', { scheduleId: schedule._id, channel: `class_${schedule._id}` });
    setCurrentChannel(`class_${schedule._id}`);
    setIsVideoCallActive(true);
  };

  const handleLeaveVideoCall = () => {
    setIsVideoCallActive(false);
    setCurrentChannel(null);
  };

  const schedulesByDay = studentSchedules.reduce((acc: any, schedule: any) => {
    if (!acc[schedule.day]) acc[schedule.day] = [];
    acc[schedule.day].push(schedule);
    return acc;
  }, {});
  Object.keys(schedulesByDay).forEach((day) => {
    schedulesByDay[day].sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const formatTime = (time: string) => {
    if (!time) return 'N/A';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (error) {
      return time;
    }
  };
  const isClassActive = (schedule: any) => schedule.isLive || false;

  // RESPONSIVE SIDEBAR: Both mobile (menu overlay) and desktop (fixed left)

  return (
    <div className="container mx-auto px-4 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Academic Timetable</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg tracking-widest border border-blue-100 italic">
               {studentDepartment?.departmentName || 'General'}
            </span>
            <span className="text-gray-400 font-bold text-sm">•</span>
            <p className="text-gray-500 font-medium text-sm">Synchronized with your department schedule.</p>
          </div>
        </div>
        <div className="bg-white px-6 py-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                📅
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today is</span>
                <span className="text-sm font-black text-gray-800">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
            </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="bg-white h-48 rounded-[2.5rem] border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-16">
          {daysOfWeek.map((day) =>
            schedulesByDay[day] && schedulesByDay[day].length > 0 && (
              <div key={day} className="px-2">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">{day}</h2>
                    <div className="h-px flex-1 bg-gray-100" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{schedulesByDay[day].length} Classes</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {schedulesByDay[day].map((schedule: any) => {
                    const active = isClassActive(schedule);
                    return (
                      <div key={schedule._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
                        <div className={`h-2 ${active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-100'}`} />
                        
                        <div className="p-8 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                                        {schedule.courseCode || schedule.courseId?.code || 'CRS-101'}
                                    </span>
                                    <h3 className="text-xl font-black text-gray-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                                        {schedule.courseName || schedule.courseId?.name || 'Unknown Class'}
                                    </h3>
                                </div>
                                {active && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                        Live
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-gray-500">
                                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-xs">🕒</div>
                                    <span className="text-sm font-bold tracking-tight">
                                        {formatTime(schedule.startTime)} — {formatTime(schedule.endTime)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-xs">👤</div>
                                    <span className="text-xs font-medium uppercase tracking-widest italic">{schedule.teacherName || schedule.teacherId?.name || 'TBA'}</span>
                                </div>
                            </div>

                            <button
                              onClick={() => handleJoinClass(schedule)}
                              className={`mt-auto w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                                active
                                  ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
                                  : 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed shadow-none'
                              }`}
                            >
                              {active ? 'Enter Live Session' : 'Session Not Started'}
                            </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {isVideoCallActive && currentChannel && (
        <VideoCall channelName={currentChannel} onLeave={handleLeaveVideoCall} />
      )}
    </div>
  );
};

export default StudentClassesPage;
