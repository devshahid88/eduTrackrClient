import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  MdSchool,
  MdPeople,
  MdAssignment,
  MdCalendarToday,
} from "react-icons/md";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { RootState } from "../../redux/store";

const TeacherDashboard = () => {
  const authState = useSelector((state: RootState) => state.auth);
  const teacherId = authState?.user?.id;
  const accessToken = authState?.accessToken;

  const [isLoading, setIsLoading] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!teacherId || !accessToken) {
        toast.error("Authentication error. Please login again.");
        return;
      }

      try {
        setIsLoading(true);

        // Teacher info
        const teacherRes = await axios.get(`/api/teachers/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setTeacherInfo(teacherRes.data.data);

        // Students count (by department)
        const deptName =
          teacherRes.data.data?.departmentId?.name ||
          teacherRes.data.data?.departmentName;

        if (deptName) {
          const studentsRes = await axios.get("/api/students", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const count = studentsRes.data.data.filter(
            (s: any) =>
              s.departmentName?.toLowerCase() === deptName.toLowerCase()
          ).length;
          setStudentCount(count);
        }

        // Schedules
        const scheduleRes = await axios.get(
          `/api/schedules/teacher/${teacherId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const schedules = scheduleRes.data.data || [];
        const today = new Date().toLocaleDateString("en-US", {
          weekday: "long",
        });

        setTodaySchedules(
          schedules
            .filter((s: any) => s.day === today)
            .sort((a: any, b: any) =>
              a.startTime.localeCompare(b.startTime)
            )
        );

        setCourseCount(
          new Set(
            schedules.map((s: any) => s.courseId?._id).filter(Boolean)
          ).size
        );

        // Recent assignments
        const assignmentsRes = await axios.get(
          `/api/assignments/teacher/${teacherId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        setRecentAssignments(
          assignmentsRes.data.data
            .sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 5)
        );
      } catch (err) {
        toast.error("Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [teacherId, accessToken]);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${teacherInfo?.firstname || ""} ${teacherInfo?.lastname || ""}`
  )}&background=2563EB&color=fff`;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {teacherInfo?.firstname}
        </h1>
        <p className="text-gray-600">
          Overview of your teaching activities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<MdPeople />} label="Students" value={studentCount} />
        <StatCard icon={<MdSchool />} label="Courses" value={courseCount} />
        <StatCard
          icon={<MdAssignment />}
          label="Assignments"
          value={recentAssignments.length}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile + Assignments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-4">
              <img
                src={teacherInfo?.profileImage || fallbackAvatar}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {teacherInfo?.firstname} {teacherInfo?.lastname}
                </h3>
                <p className="text-sm text-gray-600">
                  {teacherInfo?.email}
                </p>
                <p className="text-sm text-gray-600">
                  {teacherInfo?.departmentId?.name || "No department"}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Assignments */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-4">Recent Assignments</h3>
            {recentAssignments.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No assignments created yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentAssignments.map((a: any) => (
                  <div
                    key={a._id}
                    className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded"
                  >
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-gray-600">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today Schedule */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Today’s Schedule</h3>
            <MdCalendarToday />
          </div>

          {todaySchedules.length === 0 ? (
            <p className="text-sm text-gray-500">
              No classes scheduled today.
            </p>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map((s: any) => (
                <div
                  key={s._id}
                  className="bg-green-50 border-l-4 border-green-500 p-3 rounded"
                >
                  <p className="text-sm font-medium">
                    {s.courseId?.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {s.startTime} - {s.endTime}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
    <div className="p-3 bg-blue-100 rounded-lg text-blue-600 text-xl">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default TeacherDashboard;
