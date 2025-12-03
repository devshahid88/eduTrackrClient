import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MdMenu, MdSchool, MdPeople, MdAssignment, MdCalendarToday } from 'react-icons/md';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import Header from '../../components/common/Header';
import { RootState } from '../../redux/store';

const TeacherDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const authState = useSelector((state: RootState) => state.auth);
  const teacherId = authState?.user?.id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!teacherId || !accessToken) {
        console.error('Missing teacherId or accessToken:', { teacherId, hasToken: !!accessToken });
        toast.error('Authentication error. Please log in again.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch teacher info
        console.log('Fetching teacher info for ID:', teacherId);
        const teacherResponse = await axios.get(`/api/teachers/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('Teacher API response:', teacherResponse.data);

        if (teacherResponse.data.success) {
          setTeacherInfo(teacherResponse.data.data);
        } else {
          throw new Error(`Failed to fetch teacher info: ${teacherResponse.data.message || 'Unknown error'}`);
        }

        // Fetch student count for teacher's department
        const departmentName = teacherResponse.data.data?.departmentId?.name || teacherResponse.data.data?.departmentName;
        if (departmentName) {
          console.log(`Fetching all students to filter by departmentName: ${departmentName}`);
          const studentsResponse = await axios.get('/api/students/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          console.log('Students API response:', studentsResponse.data);

          if (studentsResponse.data.success) {
            const allStudents = studentsResponse.data.data || [];
            const filteredByDept = allStudents.filter(
              (student: any) => student.departmentName?.toLowerCase() === departmentName.toLowerCase()
            );
            setStudentCount(filteredByDept.length);
            console.log(`Set student count to ${filteredByDept.length} for department ${departmentName}`);
          } else {
            console.warn(`No students found: ${studentsResponse.data.message || 'No data'}`);
            setStudentCount(0);
          }
        } else {
          console.warn('No departmentName found for teacher:', teacherResponse.data.data);
          setStudentCount(0);
        }

        // Fetch teacher schedules
        console.log('Fetching schedules for teacher ID:', teacherId);
        const schedulesResponse = await axios.get(`/api/schedules/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('Schedules API response:', schedulesResponse.data);

        if (schedulesResponse.data.success) {
          const schedules = schedulesResponse.data.data || [];
          // Filter for today's schedule
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const todaySched = schedules
            .filter((s: any) => s.day === today)
            .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
          setTodaySchedules(todaySched);
          console.log(`Today's schedules (${today}):`, todaySched.length);

          // Count unique courses across all schedules
          const uniqueCourses = [...new Set(schedules.map((s: any) => s.courseId?._id).filter(Boolean))];
          setCourseCount(uniqueCourses.length);
          console.log(`Set course count to ${uniqueCourses.length}`);
        } else {
          throw new Error(`Failed to fetch schedules: ${schedulesResponse.data.message || 'Unknown error'}`);
        }

        // Fetch recent assignments
        console.log('Fetching recent assignments for teacher ID:', teacherId);
        const assignmentsResponse = await axios.get(`/api/assignments/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('Assignments API response:', assignmentsResponse.data);

        if (assignmentsResponse.data.success) {
          const sortedAssignments = assignmentsResponse.data.data
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          setRecentAssignments(sortedAssignments);
          console.log(`Set ${sortedAssignments.length} recent assignments`);
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error.message);
        toast.error('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [teacherId, accessToken]);

  // Group assignments by course
  const assignmentsByCourse: any = recentAssignments.reduce((acc: any, assignment: any) => {
    const courseId = typeof assignment.courseId === 'object' ? assignment.courseId?._id : assignment.courseId;
    const courseName = typeof assignment.courseId === 'object' ? assignment.courseId?.name : 'Unknown Course';
    if (!acc[courseId]) {
      acc[courseId] = { name: courseName, assignments: [] };
    }
    acc[courseId].assignments.push(assignment);
    return acc;
  }, {});

  // Fallback avatar for teacher profile
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    (teacherInfo?.firstname || '') + ' ' + (teacherInfo?.lastname || '')
  )}&background=35828C&color=fff&size=128`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white w-64 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <TeacherSideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        {/* Mobile Header */}
        <div className="flex items-center justify-between bg-white shadow-md p-4 md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MdMenu size={30} className="text-gray-700" />
          </button>
          <Header role="teacher" />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <Header role="teacher" />
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {teacherInfo?.firstname || 'Teacher'}
              </h1>
              <p className="text-gray-600">Here's an overview of your teaching activities.</p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <MdPeople className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900">{studentCount}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <MdSchool className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Courses Taught</p>
                      <p className="text-2xl font-bold text-gray-900">{courseCount}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <MdAssignment className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Recent Assignments</p>
                      <p className="text-2xl font-bold text-gray-900">{recentAssignments.length}</p>
                    </div>
                  </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Teacher Profile & Recent Assignments */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Teacher Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          className="h-16 w-16 rounded-full object-cover border-2 border-blue-100"
                          src={teacherInfo?.profileImage || fallbackAvatar}
                          alt="Teacher Profile"
                          onError={(e) => (e.currentTarget.src = fallbackAvatar)}
                        />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {teacherInfo?.firstname} {teacherInfo?.lastname}
                          </h3>
                          <p className="text-sm text-gray-600">{teacherInfo?.email}</p>
                          <p className="text-sm text-gray-600">
                            Department: {teacherInfo?.departmentId?.name || teacherInfo?.departmentName || 'Not assigned'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Assignments */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Assignments</h3>
                        <span className="text-sm text-gray-500">
                          {recentAssignments.length} recent
                        </span>
                      </div>
                      {recentAssignments.length === 0 ? (
                        <div className="text-center py-8">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="mt-2 text-gray-500">No recent assignments created.</p>
                        </div>
                      ) : (
                        Object.values(assignmentsByCourse).map((course: any) => (
                          <div key={course.name} className="mb-6">
                            <h4 className="text-md font-semibold text-gray-800 mb-3">{course.name}</h4>
                            <div className="space-y-4">
                              {course.assignments.map((assignment: any) => (
                                <div
                                  key={assignment._id}
                                  className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-900">{assignment.title}</h5>
                                      <p className="text-xs text-gray-600">
                                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <span
                                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                        new Date(assignment.dueDate) >= new Date()
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {new Date(assignment.dueDate) >= new Date() ? 'Active' : 'Expired'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Today's Schedule */}
                  <div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Today's Schedule</h3>
                        <MdCalendarToday className="w-5 h-5 text-gray-500" />
                      </div>
                      {todaySchedules.length === 0 ? (
                        <div className="text-center py-8">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="mt-2 text-gray-500">No classes scheduled today.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {todaySchedules.map((schedule: any) => (
                            <div
                              key={schedule._id}
                              className="border-l-4 border-green-500 bg-green-50 rounded-r-lg p-4"
                            >
                              <h4 className="text-sm font-medium text-gray-900">
                                {schedule.courseId?.name || 'Course Name Not Available'}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {schedule.startTime} - {schedule.endTime}
                              </p>
                              <p className="text-xs text-gray-600">
                                Department: {schedule.departmentId?.name || schedule.departmentName || 'Not Assigned'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;