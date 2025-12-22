import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/student/Common/Sidebar';

const StudentLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={closeSidebar}
      />

      {/* Desktop Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white w-64 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform ease-in-out duration-300`}
      >
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64 min-h-screen">
         {/* 
            StudentDashboard used a custom div for mobile header + generic header for desktop.
            But generic Header supports mobile menu button via onMenuClick.
            We will use generic Header for both, enabling the menu button.
         */}
        <Header role="student" onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto no-scrollbar p-8">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
