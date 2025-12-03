import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import StudentSideBar from '../../components/student/Common/Sidebar';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import VideoCall from '../../components/common/VideoCall';
import { RootState } from '../../redux/store';
import { MdMenu } from 'react-icons/md';

const StudentClassesPage: React.FC = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const [studentSchedules, setStudentSchedules] = useState<any[]>([]);
  const [studentDepartment, setStudentDepartment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);

  // Sidebar mobile state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      {/* Sidebar, slide on mobile, fixed on desktop */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:shadow-none
        `}
        aria-label="Sidebar"
      >
        <StudentSideBar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header with menu button */}
        <div className="md:hidden flex items-center justify-between bg-white shadow p-4">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            aria-label="Open sidebar"
            className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
          >
            <MdMenu size={30} />
          </button>
          <Header role="student" />
        </div>
        {/* Desktop header */}
        <div className="hidden md:block">
          <Header role="student" />
        </div>

        <main className="flex-1 overflow-y-auto no-scrollbar bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
            {/* Timetable header */}
            <div className="mb-8">
              <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                    My Timetable
                  </h1>
                  {studentDepartment && (
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-gray-600">
                        Department: <span className="font-semibold text-blue-600">{studentDepartment.departmentName || 'N/A'}</span>
                      </p>
                      {studentDepartment.code && (
                        <p className="text-gray-600">
                          Code: <span className="font-medium text-gray-800">{studentDepartment.code}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <p className="text-sm text-gray-500">Academic Schedule</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date().toLocaleDateString('en-US',
                      { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' }
                    )}
                  </p>
                </div>
              </div>
            </div>
            {/* Timetable grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-lg text-gray-600">Loading your timetable...</p>
              </div>
            ) : daysOfWeek.map((day) =>
              schedulesByDay[day] && schedulesByDay[day].length > 0 && (
                <div key={day} className="mb-8">
                  <h2 className="text-lg sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-800">{day}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {schedulesByDay[day].map((schedule: any) => (
                      <div key={schedule._id} className="bg-white rounded-lg shadow-md p-5 sm:p-6">
                        <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">{schedule.courseId?.name || 'N/A'}</h3>
                        <p className="text-gray-600 mb-1 sm:mb-2">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </p>
                        <p className="text-gray-500 mb-2 sm:mb-4">
                          Teacher: {schedule.teacherId?.name || 'N/A'}
                        </p>
                        <button
                          onClick={() => handleJoinClass(schedule)}
                          disabled={!isClassActive(schedule)}
                          className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                            isClassActive(schedule)
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isClassActive(schedule) ? 'Join Live Class' : 'Class Not Live'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </main>
        {isVideoCallActive && currentChannel && (
          <VideoCall
            channelName={currentChannel}
            onLeave={handleLeaveVideoCall}
            // isStudent={true}
          />
        )}
      </div>
    </div>
  );
};

export default StudentClassesPage;
