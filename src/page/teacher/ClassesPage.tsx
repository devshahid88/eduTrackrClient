import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { 
  MdSchool, 
  MdCalendarToday, 
  MdVideocam, 
  MdPlayCircleFilled,
  MdAccessTime,
  MdRoom
} from "react-icons/md";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";
import VideoCall from "../../components/common/VideoCall";
import { RootState } from "../../redux/store";

const ClassesPage: React.FC = () => {
  const authState = useSelector((state: RootState) => state.auth);

  const [teacherSchedules, setTeacherSchedules] = useState<any[]>([]);
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      const teacherId = authState?.user?.id;
      const accessToken = authState?.accessToken;

      if (!teacherId || !accessToken) {
        toast.error("Please login to view your schedule.");
        return;
      }

      try {
        setIsLoading(true);

        const teacherRes = await axios.get(`/api/teachers/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setTeacherInfo(teacherRes.data.data);

        const scheduleRes = await axios.get(
          `/api/schedules/teacher/${teacherId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        setTeacherSchedules(scheduleRes.data.data || []);
      } catch (err: any) {
        toast.error("Failed to load schedules");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [authState]);

  const handleEndLiveClass = async (scheduleId: string) => {
    try {
      const res = await axios.post(
        `/api/schedules/${scheduleId}/stop`,
        {},
        { headers: { Authorization: `Bearer ${authState.accessToken}` } }
      );
      
      if (res.data.success) {
        toast.success("Live class ended successfully");
        setTeacherSchedules(prev =>
          prev.map(s =>
            s._id === scheduleId ? { ...s, isLive: false } : s
          )
        );
      }
    } catch (error: any) {
      console.error('Stop Class Error:', error);
      const msg = error.response?.data?.message || error.message || "Failed to end live class";
      toast.error(`Termination Failed: ${msg}`);
    }
  };

  const handleJoinClass = (schedule: any) => {
    setCurrentChannel(`class_${schedule._id}`);
    setIsVideoCallActive(true);
  };

  const handleStartLiveClass = async (scheduleId: string) => {
    try {
      const res = await axios.post(
        `/api/schedules/${scheduleId}/start`,
        {},
        { headers: { Authorization: `Bearer ${authState.accessToken}` } }
      );

      if (res.data.success) {
        toast.success("Live class started successfully");
        setTeacherSchedules(prev =>
          prev.map(s =>
            s._id === scheduleId ? { ...s, isLive: true } : s
          )
        );
      }
    } catch {
      toast.error("Failed to start live class");
    }
  };

  const handleLeaveVideoCall = () => {
    setIsVideoCallActive(false);
    setCurrentChannel(null);
  };

  const schedulesByDay = teacherSchedules.reduce((acc: any, s: any) => {
    acc[s.day] = acc[s.day] || [];
    acc[s.day].push(s);
    return acc;
  }, {});

  Object.keys(schedulesByDay).forEach(day =>
    schedulesByDay[day].sort((a: any, b: any) =>
      a.startTime.localeCompare(b.startTime)
    )
  );

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const formatTime = (time: string) => {
    if (!time) return "N/A";
    const [h, m] = time.split(":");
    const hour = Number(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-gray-500 animate-pulse font-medium text-sm">Preparing your weekly schedule...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Teaching Schedule</h1>
          {teacherInfo && (
            <div className="flex items-center gap-3 mt-2">
               <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {teacherInfo.departmentId?.name || "Academic"} Faculty
               </span>
               <p className="text-gray-500 font-medium tracking-tight">
                  Lectures and live sessions for {teacherInfo.firstname} {teacherInfo.lastname}
               </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <MdCalendarToday className="text-blue-600" />
            <span className="text-sm font-bold text-gray-700">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {teacherSchedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-4 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-4">🗓️</div>
          <h2 className="text-2xl font-black text-gray-900">No Classes Assigned</h2>
          <p className="text-gray-500 max-w-sm font-medium">Your teaching calendar is currently clear. Assignments will appear here once scheduled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {daysOfWeek.map(day => (
            <div key={day} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col group overflow-hidden">
               {/* Day Header */}
               <div className="px-8 py-6 bg-gray-900 text-white flex items-center justify-between group-hover:bg-blue-600 transition-colors duration-500">
                  <h3 className="text-xl font-black tracking-tight">{day}</h3>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                     {schedulesByDay[day]?.length || 0} Sessions
                  </div>
               </div>

               {/* Sessions List */}
               <div className="p-8 space-y-8 flex-1">
                {schedulesByDay[day]?.length ? (
                  schedulesByDay[day].map((s: any) => (
                    <div
                      key={s._id}
                      className="relative pl-6 space-y-4"
                    >
                       {/* Timeline vertical bar */}
                       <div className={`absolute left-0 top-0 w-1.5 h-full rounded-full transition-colors ${s.isLive ? "bg-emerald-500 animate-pulse" : "bg-gray-100"}`}></div>
                       
                       <div>
                          <h4 className="text-lg font-black text-gray-900 tracking-tight leading-snug">
                            {s.courseId?.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 mt-2">
                             <div className="flex items-center gap-1.5 text-gray-400">
                                <MdAccessTime className="text-blue-500" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">{formatTime(s.startTime)} - {formatTime(s.endTime)}</span>
                             </div>
                             {s.room && (
                               <div className="flex items-center gap-1.5 text-gray-400">
                                  <MdRoom className="text-emerald-500" />
                                  <span className="text-[11px] font-bold uppercase tracking-wider">Room {s.room}</span>
                               </div>
                             )}
                          </div>
                       </div>

                       <div className="flex items-center gap-3">
                        {!s.isLive ? (
                          <button
                            onClick={() => handleStartLiveClass(s._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
                          >
                            <MdPlayCircleFilled className="text-base" />
                            Go Live
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest">In Session</span>
                             </div>
                             <button
                               onClick={() => handleEndLiveClass(s._id)}
                               className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                             >
                               End Class
                             </button>
                          </div>
                        )}
                        
                        <button
                          disabled={!s.isLive}
                          onClick={() => handleJoinClass(s)}
                          className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                            s.isLive
                              ? "bg-white border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                              : "bg-gray-50 text-gray-300 border-2 border-transparent"
                          }`}
                        >
                          <MdVideocam className="text-base" />
                          Join Hall
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-20 italic space-y-2">
                     <MdSchool className="text-4xl" />
                     <p className="text-xs font-black uppercase tracking-widest">No Sessions</p>
                  </div>
                )}
               </div>
            </div>
          ))}
        </div>
      )}

      {isVideoCallActive && currentChannel && (
        <VideoCall
          channelName={currentChannel}
          onLeave={handleLeaveVideoCall}
        />
      )}
    </div>
  );
};

export default ClassesPage;
