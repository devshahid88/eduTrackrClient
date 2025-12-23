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
    <div className="max-w-[1600px] mx-auto px-4 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Branded Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-2">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-900 rounded-2xl text-indigo-400 shadow-2xl shadow-indigo-500/20">
                 <Calendar className="w-6 h-6" />
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Temporal Matrix</span>
                 <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black border border-indigo-100">Live Grid</div>
              </div>
           </div>
           <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none">Schedule Operations</h1>
              <p className="text-gray-400 font-bold mt-2">Orchestrate institutional time slots and faculty session distributions.</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* View mode selector */}
           <div className="bg-white p-1.5 rounded-3xl border border-gray-100 shadow-sm flex items-center">
             <button
               onClick={() => setViewMode('table')}
               className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                 viewMode === 'table' 
                   ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' 
                   : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
               }`}
             >
               <ListFilter size={16} />
               Grid View
             </button>
             <button
               onClick={() => setViewMode('weekly')}
               className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                 viewMode === 'weekly' 
                   ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' 
                   : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
               }`}
             >
               <Calendar size={16} />
               Matrix View
             </button>
           </div>
        </div>
      </div>

      {/* Form for adding a new schedule - Integrated as a Quick Launch Card */}
      <div className="px-2">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group relative">
           <div className="absolute top-0 left-0 w-2 h-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors"></div>
           <div className="p-10">
              <ScheduleForm onScheduleAdded={handleScheduleAdded} />
           </div>
        </div>
      </div>

      {/* Different View Modes */}
      <div className="px-2 min-h-[600px] transition-all duration-500 ease-in-out">
        {viewMode === 'table' ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <ScheduleTable
              departments={departments}
              schedules={schedules}
              selectedDepartment={selectedDepartment}
              onEdit={(schedule: any) => console.log('Edit schedule:', schedule)}
              onDelete={(scheduleId: any) => console.log('Delete schedule:', scheduleId)}
            />
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <WeeklyCalendarView schedules={schedules} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSchedule;
