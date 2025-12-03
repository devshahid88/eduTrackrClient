import React, { useState } from 'react';
import NotificationPage from '../../components/common/NotificationPage';
import Header from '../../components/common/Header';
import StudentSideBar from '../../components/student/Common/Sidebar';

const NotificationsPage: React.FC = () => {
  // State to control mobile sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handler to toggle sidebar open/close
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
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
        <StudentSideBar />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0">
        {/* Mobile header with hamburger button */}
        <div className="md:hidden flex items-center justify-between bg-white shadow p-4">
          <button
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
          >
            {/* You can use an icon like MdMenu here if you import react-icons */}
            <svg
              className="h-6 w-6 text-gray-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* You can keep header text/logo or just your Header component */}
          <Header role="student" />
        </div>

        {/* Desktop header */}
        <div className="hidden md:block">
          <Header role="student" />
        </div>

        {/* Page main content */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 p-6">
          <NotificationPage />
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
