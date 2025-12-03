import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosInstance';
import TeacherSideBar from '../common/Sidebar';
import Header from '../common/Header';
import StatsCard from './StatsCard';
import ScheduleSection from './ScheduleSection';
import SubmissionsSection from './SubmissionsSection';
import DeadlinesSection from './DeadlinesSection';
import PerformanceChart from './PerformanceChart';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeClasses: 0,
      totalStudents: 0,
      pendingAssignments: 0,
      newMessages: 0
    },
    schedule: [],
    submissions: [],
    deadlines: [],
    performance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/teacher/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { 
      title: 'Active Classes', 
      value: dashboardData.stats.activeClasses, 
      icon: '📚',
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      title: 'Total Students', 
      value: dashboardData.stats.totalStudents, 
      icon: '👥',
      color: 'bg-green-50 text-green-600'
    },
    { 
      title: 'Pending Assignments', 
      value: dashboardData.stats.pendingAssignments, 
      icon: '📝',
      color: 'bg-yellow-50 text-yellow-600'
    },
    { 
      title: 'New Messages', 
      value: dashboardData.stats.newMessages, 
      icon: '💬',
      color: 'bg-purple-50 text-purple-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <TeacherSideBar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-7xl mx-auto">
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <TeacherSideBar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-7xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                {error}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your classes today.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50 transition-colors">
                  View Schedule
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Assignment
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ScheduleSection schedule={dashboardData.schedule} />
              <SubmissionsSection submissions={dashboardData.submissions} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeadlinesSection deadlines={dashboardData.deadlines} />
              <PerformanceChart data={dashboardData.performance} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard; 