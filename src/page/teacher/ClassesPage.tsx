import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import VideoCall from '../../components/common/VideoCall';
import { RootState } from '../../redux/store';
import { MdMenu } from 'react-icons/md';

const ClassesPage: React.FC = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  // Responsive sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data state
  const [teacherSchedules, setTeacherSchedules] = useState<any[]>([]);
  const [studentCounts, setStudentCounts] = useState<any>({});
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);

  useEffect(() => {
    setIsVideoCallActive(false);
    setCurrentChannel(null);

    const fetchTeacherData = async () => {
      const teacherId = authState?.user?.id || authState?.user?.id;
      const accessToken = authState?.accessToken;

      if (!teacherId || !accessToken) {
        toast.error('Please log in to view your schedule.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const teacherResponse = await axios.get(`/api/teachers/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (teacherResponse.data.success) {
          setTeacherInfo(teacherResponse.data.data);
        }

        const schedulesResponse = await axios.get(`/api/schedules/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (schedulesResponse.data.success) {
          setTeacherSchedules(schedulesResponse.data.data);

          const counts: any = {};
          for (const schedule of schedulesResponse.data.data) {
            if (schedule.departmentId?._id && !counts[schedule.departmentId._id]) {
              try {
                const studentsResponse = await axios.get(
                  `/api/students/department/${schedule.departmentId._id}`,
                  { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                if (studentsResponse.data.success) {
                  counts[schedule.departmentId._id] = studentsResponse.data.data.length;
                }
              } catch (error: any) {
                counts[schedule.departmentId._id] = 0;
              }
            }
          }
          setStudentCounts(counts);
        } else {
          toast.error('Failed to load schedule data');
        }
      } catch (error: any) {
        toast.error(`Failed to load schedule: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [authState]);

  const handleJoinClass = (schedule: any) => {
    if (!schedule._id) {
      toast.error('Invalid class ID');
      return;
    }
    setCurrentChannel(`class_${schedule._id}`);
    setIsVideoCallActive(true);
  };

  const handleStartLiveClass = async (scheduleId: string) => {
    try {
      const response = await axios.post(
        `/api/schedules/${scheduleId}/start`,
        {},
        { headers: { Authorization: `Bearer ${authState.accessToken}` } }
      );
      if (response.data.success) {
        toast.success('Live class started');
        setTeacherSchedules((prev) =>
          prev.map((s) => (s._id === scheduleId ? { ...s, isLive: true } : s))
        );
      } else {
        toast.error('Failed to start live class');
      }
    } catch (error: any) {
      toast.error(`Failed to start: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleLeaveVideoCall = () => {
    setIsVideoCallActive(false);
    setCurrentChannel(null);
  };

  const schedulesByDay = teacherSchedules.reduce((acc: any, schedule: any) => {
    if (!acc[schedule.day]) {
      acc[schedule.day] = [];
    }
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

  const isClassActive = (schedule: any) => {
    return schedule.isLive || false;
  };

  // Sidebar handlers
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}
      {/* Sidebar: slide-in on mobile, fixed on desktop */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:shadow-none
        `}
        aria-label="Sidebar"
      >
        <TeacherSideBar />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden ml-0 ">
        {/* Mobile header with hamburger menu */}
        <div className="md:hidden flex items-center justify-between bg-white shadow p-4">
          <button
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
          >
            <MdMenu size={30} />
          </button>
          <Header role="teacher" />
        </div>
        {/* Desktop header */}
        <div className="hidden md:block">
          <Header role="teacher" />
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Teaching Schedule</h1>
                  {teacherInfo && (
                    <div className="flex flex-wrap items-center space-x-4 gap-1">
                      <p className="text-gray-600">
                        Instructor:{' '}
                        <span className="font-semibold text-blue-600">
                          {teacherInfo.username || 'N/A'}
                        </span>
                      </p>
                      {teacherInfo.email && (
                        <p className="text-gray-600">
                          Email:{' '}
                          <span className="font-medium text-gray-800">
                            {teacherInfo.email}
                          </span>
                        </p>
                      )}
                      {teacherInfo.departmentId?.name && (
                        <p className="text-gray-600">
                          Department:{' '}
                          <span className="font-medium text-gray-800">
                            {teacherInfo.departmentId.name}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Teaching Schedule</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'Asia/Kolkata',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-lg text-gray-600">Loading your teaching schedule...</p>
              </div>
            ) : teacherSchedules.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Assigned</h3>
                <p className="text-gray-600">No teaching schedules found at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {daysOfWeek.map((day) => (
                  <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center justify-between">
                        {day}
                        <span className="text-sm font-normal text-green-100">
                          {schedulesByDay[day]?.length || 0} classes
                        </span>
                      </h3>
                    </div>
                    <div className="p-6">
                      {schedulesByDay[day]?.length > 0 ? (
                        <div className="space-y-4">
                          {schedulesByDay[day].map((schedule: any, index: number) => {
                            const isActive = isClassActive(schedule);
                            return (
                              <div
                                key={schedule._id}
                                className={`border-l-4 ${isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'} rounded-r-lg p-4 hover:shadow-md transition-shadow duration-200`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900 leading-tight">
                                      {schedule.courseId?.name || 'Course Name Not Available'}
                                    </h4>
                                    {schedule.courseId?.code && (
                                      <p className="text-sm font-medium text-blue-700 mt-1">
                                        Course ID: {schedule.courseId.code}
                                      </p>
                                    )}
                                  </div>
                                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Period {index + 1}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                  <div className="flex items-center text-sm text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span className="font-medium">
                                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    <span className="font-medium">Room: {schedule.room || 'TBA'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-200 mb-3">
                                  <div className="flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h5"></path>
                                    </svg>
                                    <span className="text-gray-600">Department:</span>
                                    <span className="font-semibold text-gray-800 ml-1">{schedule.departmentId?.name || 'Not Assigned'}</span>
                                  </div>
                                  {/* If you want to show student count, uncomment this:
                                  <div className="flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                    </svg>
                                    <span className="font-bold text-purple-700">{studentCounts[schedule.departmentId?._id] || 0} Students</span>
                                  </div>
                                  */}
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                  <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Live Class:</span>
                                    {isActive && (
                                      <div className="flex items-center space-x-2">
                                        <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-green-700">Live Now</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex space-x-2">
                                    {!isActive && (
                                      <button
                                        onClick={() => handleStartLiveClass(schedule._id)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                      >
                                        Start Live Class
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleJoinClass(schedule)}
                                      disabled={!isActive}
                                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white transition-colors duration-200 ${
                                        isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                                      }`}
                                    >
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                      </svg>
                                      Join Live Class
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <p className="mt-2 text-gray-500 font-medium">No classes scheduled</p>
                          <p className="text-xs text-gray-400">Free day for preparation!</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && teacherSchedules.length > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{teacherSchedules.length}</div>
                    <div className="text-sm text-gray-600">Total Classes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {new Set(teacherSchedules.map((s) => s.courseId?.code)).size}
                    </div>
                    <div className="text-sm text-gray-600">Unique Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {new Set(teacherSchedules.map((s) => s.departmentId?.name)).size}
                    </div>
                    <div className="text-sm text-gray-600">Departments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {Object.keys(schedulesByDay).filter((day) => schedulesByDay[day].length > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">Teaching Days</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        {isVideoCallActive && currentChannel && (
          <VideoCall channelName={currentChannel} onLeave={handleLeaveVideoCall} />
        )}
      </div>
    </div>
  );
};

export default ClassesPage;
