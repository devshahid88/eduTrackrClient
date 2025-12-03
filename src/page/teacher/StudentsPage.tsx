import React, { useState, useEffect } from 'react';
import axios from "../../api/axiosInstance";
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import StudentList from "../../components/teacher/Students/StudentList";
import { MdMenu } from 'react-icons/md';

const StudentsPage = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherDepartment, setTeacherDepartment] = useState('');

  // Responsive sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchTeacherAndStudents = async () => {
      try {
        // 1. Get teacher details
        const teacher = JSON.parse(localStorage.getItem('user') || '{}');
        const department = teacher?.departmentName;

        if (!department) {
          console.error("Teacher department not found");
          return;
        }

        setTeacherDepartment(department);

        // 2. Get student list
        const res = await axios.get('/api/students/');
        const allStudents = res.data.data || [];
        // 3. Filter students by department
        const filteredByDept = allStudents.filter(
          (student: any) => student.departmentName?.toLowerCase() === department.toLowerCase()
        );

        setStudents(filteredByDept);
      } catch (error: any) {
        console.error('Error fetching students:', error.message || error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherAndStudents();
  }, []);

  // Sidebar handlers
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar overlay for mobile */}
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

      {/* Main content */}
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
        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <StudentList
            students={students}
            loading={loading}
            teacherDepartment={teacherDepartment}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </main>
      </div>
    </div>
  );
};

export default StudentsPage;
