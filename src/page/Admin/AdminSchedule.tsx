import React, { useState } from 'react';
import Sidebar from '../../components/admin/Commen/Sidebar';
import Header from '../../components/admin/Commen/Header';
import ScheduleForm from '../../components/admin/schedule/ScheduleForm';
import ScheduleTable from '../../components/admin/schedule/ScheduleTable';
import WeeklyCalendarView from '../../components/admin/schedule/WeeklyCalendarView';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ListFilter, Calendar } from 'lucide-react';
import { MdMenu } from 'react-icons/md';

const AdminSchedule: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'weekly'>('table');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const handleScheduleAdded = (newSchedule: any) => {
    setSchedules((prev) => [...prev, newSchedule]);
  };

  // Handlers for sidebar toggle
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#F5F7FB] to-white">
      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
        aria-hidden={!isSidebarOpen}
      />

      {/* Sidebar - mobile and desktop */}
   {/* Sidebar - mobile and desktop */}
<aside
  className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:fixed lg:inset-y-0
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  `}
  style={{ height: '100vh' }}
>
  <div className="h-full overflow-y-auto">
    <Sidebar activePage="schedule" onClose={closeSidebar} />
  </div>
</aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white shadow border-b">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded hover:bg-gray-200"
            aria-label="Toggle sidebar menu"
          >
            <MdMenu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-neutral-800">Schedule Management</h1>
          <div style={{ width: 32 }} /> {/* Placeholder for balance */}
        </header>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto ml-0 lg:ml-64 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 ">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-2">Schedule Management</h1>
              <p className="text-sm sm:text-base text-gray-500">
                Create and manage class schedules for each department according to courses
              </p>
            </div>

            {/* View mode selector */}
            <div className="mt-4 sm:mt-0">
              <Tabs
                value={viewMode}
                onValueChange={(value: string) => setViewMode(value as 'table' | 'weekly')}
                className="w-full sm:w-auto"
              >
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="table" className="data-[state=active]:bg-white">
                    <ListFilter size={16} className="mr-2" />
                    Table View
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="data-[state=active]:bg-white">
                    <Calendar size={16} className="mr-2" />
                    Weekly View
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Form for adding a new schedule */}
          <div className="mb-8">
            <ScheduleForm onScheduleAdded={handleScheduleAdded} />
          </div>

          {/* Different View Modes */}
          {viewMode === 'table' && (
            <ScheduleTable
              departments={departments}
              schedules={schedules}
              selectedDepartment={selectedDepartment}
              onEdit={(schedule: any) => console.log('Edit schedule:', schedule)}
              onDelete={(scheduleId: any) => console.log('Delete schedule:', scheduleId)}
            />
          )}

          {viewMode === 'weekly' && <WeeklyCalendarView schedules={schedules} />}
        </main>
      </div>
    </div>
  );
};

export default AdminSchedule;
