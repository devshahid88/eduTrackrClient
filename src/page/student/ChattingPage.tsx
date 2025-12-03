import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import StudentSideBar from '../../components/student/Common/Sidebar';
import ChatStudent from '../../components/student/chat/ChatStudent';
import toast from 'react-hot-toast';
import { MdMenu } from 'react-icons/md';

const ChattingPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
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

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0">
        {/* Mobile header with hamburger menu */}
        <div className="md:hidden flex items-center justify-between bg-white shadow p-4">
          <button
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
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

        {/* Chat content */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-gray-50">
          <ChatStudent />
        </main>
      </div>
    </div>
  );
};

export default ChattingPage;
