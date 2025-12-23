import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/student/Common/Sidebar';

const StudentLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={closeSidebar}
      />

      {/* Desktop Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 bg-white w-64 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform ease-in-out duration-300`}
      >
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full ml-0 md:ml-64 relative overflow-hidden">
         {/* 
            StudentDashboard used a custom div for mobile header + generic header for desktop.
            But generic Header supports mobile menu button via onMenuClick.
            We will use generic Header for both, enabling the menu button.
         */}
        <Header role="student" onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 lg:p-8">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
