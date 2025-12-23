import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "../components/common/Header";
import TeacherSideBar from "../components/teacher/common/Sidebar";


const TeacherLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Fixed on desktop now */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg
          transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <TeacherSideBar onClose={closeSidebar} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full ml-0 md:ml-64 relative overflow-hidden">
        <Header role="teacher" onMenuClick={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 no-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
