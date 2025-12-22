import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import StatsCard from '../../components/student/Dashboard/StatsCard';
import UpcomingAssignments from '../../components/student/Dashboard/UpcomingAssignments';
import TodaySchedule from '../../components/student/Dashboard/TodaySchedule';
import AssignmentDetailModal from '../../components/student/assignments/AssignmentDetailModal';
import { MdSchool, MdAssignment, MdTrendingUp } from 'react-icons/md';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const authState = useSelector((state: any) => state.auth);
  const studentId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!studentId || !accessToken) {
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

          const assignmentsResponse = await axios.get(
            `/api/assignments/department/${student.departmentId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          const schedulesResponse = await axios.get(
            `/api/schedules/department/${student.departmentId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (assignmentsResponse.data.success && schedulesResponse.data.success) {
            const assignments = assignmentsResponse.data.data;
            const schedules = schedulesResponse.data.data;

            const pendingAssignments = assignments.filter(
              (a:any) => !a.submissions?.some((s:any) => s.studentId === studentId) && new Date(a.dueDate) >= new Date()
            ).length;

            const activeCourses = new Set(schedules.map((s:any) => s.courseId?._id)).size;

            setStats([
              {
                title: 'Active Courses',
                value: activeCourses,
                trend: 'up',
                trendValue: `${activeCourses} this semester`,
                icon: MdSchool,
              },
              {
                title: 'Pending Assignments',
                value: pendingAssignments,
                trend: 'up',
                trendValue: `${pendingAssignments} due`,
                icon: MdAssignment,
              },
              // {
              //   title: 'GPA',
              //   value: 'N/A',
              //   trend: 'up',
              //   trendValue: 'Current semester',
              //   icon: MdTrendingUp,
              // },
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [studentId, accessToken]);

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setIsDetailModalOpen(true);
  };

  const handleStartSubmission = (assignment) => {
    // Navigate to assignments page for submission
    window.location.href = `/student/assignments/${assignment._id}`;
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse h-32"></div>
                ))
            : stats.map((stat, index) => <StatsCard key={index} {...stat} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Assignments */}
          <div className="lg:col-span-2">
            {/* <UpcomingAssignments
              studentId={studentId}
              accessToken={accessToken}
              onView={handleViewAssignment}
              onStart={handleStartSubmission}
            /> */}
            <UpcomingAssignments
              onView={handleViewAssignment}
            />
            </div>

          {/* Today's Schedule */}
          <div>
            {/* <TodaySchedule studentId={studentId} accessToken={accessToken} /> */}
            <TodaySchedule  />
                </div>
              </div>

        {/* Assignment Detail Modal */}
        {selectedAssignment && (
          <AssignmentDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            assignment={selectedAssignment}
            onStartSubmission={handleStartSubmission}
          />
        )}
      </div>
    </>
  );
};

export default Dashboard;