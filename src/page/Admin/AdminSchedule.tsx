import React, { useState } from 'react';
import ScheduleForm from '../../components/admin/schedule/ScheduleForm';
import ScheduleTable from '../../components/admin/schedule/ScheduleTable';
import WeeklyCalendarView from '../../components/admin/schedule/WeeklyCalendarView';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ListFilter, Calendar } from 'lucide-react';

const AdminSchedule: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'weekly'>('table');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const handleScheduleAdded = (newSchedule: any) => {
    setSchedules((prev) => [...prev, newSchedule]);
  };

  return (
    <>
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
    </>
  );
};

export default AdminSchedule;
