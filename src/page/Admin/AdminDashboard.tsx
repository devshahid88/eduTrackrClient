import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  MdPeople, 
  MdSchool, 
  MdAdminPanelSettings, 
  MdTrendingUp, 
  MdMoreVert,
  MdAdd,
  MdBarChart,
  MdNotifications,
  MdComputer,
  MdDns
} from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import axios from "../../api/axiosInstance";
import UserTable from "../../components/admin/Dashboard/UserTable";
import toast from "react-hot-toast";

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [courseCount, setCourseCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [departmentData, setDepartmentData] = useState<any[]>([]);

  const auth = useSelector((state: any) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [studentRes, adminRes, teacherRes, coursesRes, assignmentsRes, departmentsRes] = await Promise.all([
          axios.get("/api/students"),
          axios.get("/api/admins"),
          axios.get("/api/teachers"),
          axios.get("/api/courses"),
          axios.get("/api/assignments"),
          axios.get("/api/departments")
        ]);

        const allUsers = [
          ...(studentRes.data.data || []).map((u: any) => ({ ...u, role: 'student' })),
          ...(adminRes.data.data || []).map((u: any) => ({ ...u, role: 'admin' })),
          ...(teacherRes.data.data || []).map((u: any) => ({ ...u, role: 'teacher' }))
        ];

        setUsers(allUsers);
        setCourseCount(coursesRes.data.data?.length || 0);
        setAssignmentCount(assignmentsRes.data.data?.length || 0);
        
        // Map department enrollment
        const depts = departmentsRes.data.data || [];
        const students = studentRes.data.data || [];
        const deptEnrollment = depts.map((d: any) => ({
          name: d.name,
          count: students.filter((s: any) => s.departmentId === d._id || s.departmentName === d.name).length
        })).filter((d: any) => d.count > 0);

        setDepartmentData(deptEnrollment);
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
        toast.error("Failed to load live data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------------- DATA AGGREGATION ---------------- */

  const userStats = useMemo(() => {
    const studentCount = users.filter(u => u.role === 'student').length;
    const teacherCount = users.filter(u => u.role === 'teacher').length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    return {
      total: users.length,
      students: studentCount,
      teachers: teacherCount,
      admins: adminCount
    };
  }, [users]);

  const growthData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const registrationsByMonth: { [key: string]: number } = {};

    // Initialize all months up to current with 0
    const currentMonth = new Date().getMonth();
    for (let i = 0; i <= currentMonth; i++) {
      registrationsByMonth[months[i]] = 0;
    }

    users.forEach(user => {
      const date = new Date(user.createdAt);
      if (date.getFullYear() === currentYear) {
        const month = months[date.getMonth()];
        if (registrationsByMonth[month] !== undefined) {
          registrationsByMonth[month]++;
        }
      }
    });

    // Accumulate for a "Total Users" growth chart
    let total = 0;
    return Object.keys(registrationsByMonth).map(month => {
      total += registrationsByMonth[month];
      return { name: month, users: total };
    });
  }, [users]);

  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

  /* ---------------- COMPONENTS ---------------- */

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-gray-500 font-bold animate-pulse">Initializing Control Center...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-1000">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Overview</h1>
          <p className="text-gray-500 font-medium mt-1">Real-time platform metrics and management.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              Download Report
           </button>
           <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 font-black hover:scale-105 transition-transform active:scale-95">
              System Health
           </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <AdminStatCard 
           icon={<MdPeople />} 
           label="Total Users" 
           value={userStats.total} 
           trend="+12% growth" 
           color="blue"
         />
         <AdminStatCard 
           icon={<MdSchool />} 
           label="Active Students" 
           value={userStats.students} 
           trend="Overall enrollment" 
           color="emerald"
         />
         <AdminStatCard 
           icon={<MdAdminPanelSettings />} 
           label="Teachers" 
           value={userStats.teachers} 
           trend="Academic staff" 
           color="indigo"
         />
         <AdminStatCard 
           icon={<MdComputer />} 
           label="Active Courses" 
           value={courseCount} 
           trend="Resource usage" 
           color="amber"
         />
      </div>

      {/* Advanced Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <h3 className="text-2xl font-black text-gray-900">User Growth</h3>
                 <p className="text-gray-400 font-bold text-sm">Platform expansion over time</p>
              </div>
              <MdTrendingUp className="text-3xl text-emerald-500" />
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorUsers)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Department Enrollment Chart */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col items-center justify-center">
           <h3 className="text-xl font-black text-gray-900 mb-8 self-start">Enrollment</h3>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={departmentData.length > 0 ? departmentData : [{name: 'Empty', count: 1}]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-8 space-y-2 w-full">
              {departmentData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm font-bold">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-gray-600">{d.name}</span>
                   </div>
                   <span className="text-gray-900">{d.count} Students</span>
                </div>
              ))}
           </div>
        </div>

      </div>

      {/* Distribution & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* System Updates */}
         <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white shadow-2xl">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-black">System Updates</h3>
               <MdDns className="text-blue-400 text-3xl" />
            </div>
            <div className="space-y-8">
               <ActivityItem 
                 icon={<MdNotifications className="text-amber-400" />} 
                 title="System Cache Cleared" 
                 desc="Automatic maintenance completed at 3:00 AM." 
                 time="3h ago" 
               />
               <ActivityItem 
                 icon={<MdAdd className="text-emerald-400" />} 
                 title="New Department Added" 
                 desc="Cybersecurity department initiated by Admin." 
                 time="8h ago" 
               />
               <ActivityItem 
                 icon={<MdPeople className="text-blue-400" />} 
                 title="Teacher Onboarding" 
                 desc="5 new faculty members added to faculty database." 
                 time="1d ago" 
               />
            </div>
         </div>

         {/* Platform Integrity & Health */}
         <div className="bg-white p-10 rounded-[2.5rem] border border-gray-50 flex flex-col">
            <h3 className="text-2xl font-black text-gray-900 mb-10">Platform Health</h3>
            <div className="space-y-6 flex-1">
               <HealthItem label="API Gateway" status="operational" />
               <HealthItem label="Database Cluster" status="operational" />
               <HealthItem label="File Storage (S3)" status="operational" />
               <HealthItem label="Auth Service" status="operational" />
               <HealthItem label="AI Engine" status="degraded" />
            </div>
            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Status</span>
               <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-tighter">99.9% Uptime</span>
            </div>
         </div>
      </div>

      {/* Quick Access Grid */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-50 mt-10">
         <h3 className="text-2xl font-black text-gray-900 mb-10">Management Hub</h3>
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickHubCard icon={<MdPeople />} label="Users" sub={`${userStats.total} total members`} color="blue" />
            <QuickHubCard icon={<MdSchool />} label="Courses" sub={`${courseCount} active programs`} color="emerald" />
            <QuickHubCard icon={<MdBarChart />} label="Assignments" sub={`${assignmentCount} tasks issued`} color="indigo" />
            <QuickHubCard icon={<MdAdminPanelSettings />} label="Security" sub="Firewall & Access" color="amber" />
         </div>
      </div>

      {/* User Table Section */}
      <div className="pt-10">
        <div className="flex items-center justify-between mb-10 px-4">
           <h3 className="text-3xl font-black text-gray-900 tracking-tight">Recent Users</h3>
           <button className="text-blue-600 font-black text-sm uppercase tracking-widest hover:underline">View All Users</button>
        </div>
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-4">
          <UserTable />
        </div>
      </div>
    </div>
  );
};

const AdminStatCard = ({ icon, label, value, trend, color }: any) => {
  const bg = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:-translate-y-2 transition-transform duration-300">
      <div className={`w-14 h-14 ${bg[color as keyof typeof bg]} rounded-2xl flex items-center justify-center text-3xl mb-6`}>
        {icon}
      </div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-4xl font-black text-gray-900">{value}</h4>
        <span className="text-[10px] font-bold text-gray-400">{trend}</span>
      </div>
    </div>
  );
};

const ActivityItem = ({ icon, title, desc, time }: any) => (
  <div className="flex gap-5 group cursor-pointer">
     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
     </div>
     <div>
        <h4 className="font-bold text-sm tracking-tight">{title}</h4>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
        <p className="text-[10px] font-black text-blue-400 mt-3 uppercase tracking-widest opacity-60">{time}</p>
     </div>
  </div>
);

const HealthItem = ({ label, status }: { label: string, status: 'operational' | 'degraded' | 'down' }) => {
  const colors = {
    operational: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    down: 'bg-red-500'
  };

  return (
    <div className="flex items-center justify-between group">
       <span className="text-sm font-bold text-gray-700">{label}</span>
       <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{status}</span>
          <div className={`w-2.5 h-2.5 rounded-full ${colors[status]} shadow-sm`}></div>
       </div>
    </div>
  );
};

const QuickHubCard = ({ icon, label, sub, color }: any) => {
  const tint = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    indigo: 'text-indigo-600',
    amber: 'text-amber-600'
  };

  return (
    <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-50 hover:bg-white hover:shadow-xl transition-all cursor-pointer group">
       <div className={`text-2xl mb-4 ${tint[color as keyof typeof tint]} group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <h4 className="font-black text-gray-900 text-sm tracking-tight">{label}</h4>
       <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{sub}</p>
    </div>
  );
};

export default AdminDashboard;