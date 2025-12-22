import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
        toast.success("Live class started");
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          My Teaching Schedule
        </h1>
        {teacherInfo && (
          <p className="text-gray-600 mt-1">
            {teacherInfo.firstname} {teacherInfo.lastname} ·{" "}
            {teacherInfo.departmentId?.name}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : teacherSchedules.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border text-center">
          <p className="text-gray-600">No classes assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {daysOfWeek.map(day => (
            <div key={day} className="bg-white rounded-xl border shadow-sm">
              <div className="bg-green-600 px-6 py-4 text-white font-semibold">
                {day}
              </div>

              <div className="p-6 space-y-4">
                {schedulesByDay[day]?.length ? (
                  schedulesByDay[day].map((s: any, i: number) => (
                    <div
                      key={s._id}
                      className={`p-4 rounded border-l-4 ${
                        s.isLive
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <h4 className="font-semibold">
                        {s.courseId?.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatTime(s.startTime)} -{" "}
                        {formatTime(s.endTime)}
                      </p>

                      <div className="flex justify-between mt-3">
                        {!s.isLive && (
                          <button
                            onClick={() => handleStartLiveClass(s._id)}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded"
                          >
                            Start Live
                          </button>
                        )}
                        <button
                          disabled={!s.isLive}
                          onClick={() => handleJoinClass(s)}
                          className={`text-xs px-3 py-1 rounded ${
                            s.isLive
                              ? "bg-green-600 text-white"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No classes today
                  </p>
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
