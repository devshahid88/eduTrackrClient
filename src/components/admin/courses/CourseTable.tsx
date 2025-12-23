import React from 'react';
import { 
  MdEdit, 
  MdDeleteForever, 
  MdVisibility, 
  MdSchool, 
  MdCode, 
  MdLayers,
  MdDateRange,
  MdCircle
} from 'react-icons/md';
import ActionButtons from '../departments/ActionButtons';

const CourseTable = ({ courses, onEdit, onDelete, onView, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Querying Course Matrix...</p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-20 flex flex-col items-center justify-center text-center opacity-30">
        <MdSchool size={64} className="text-gray-400 mb-4" />
        <p className="text-sm font-black uppercase tracking-widest text-gray-500">No Course Modules Identified</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-50">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Module Code
              </th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Educational Unit
              </th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Faculty Node
              </th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Semester
              </th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Integrity
              </th>
              <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Directives
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {courses.map((course) => (
              <tr key={course._id} className="group hover:bg-blue-50/30 transition-all duration-300">
                <td className="px-8 py-8 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shadow-inner">
                        <MdCode size={20} />
                     </div>
                     <span className="text-sm font-black text-gray-900 font-mono tracking-tight group-hover:text-blue-600 transition-colors">
                       {course.code}
                     </span>
                  </div>
                </td>
                <td className="px-8 py-8 whitespace-nowrap">
                   <div className="space-y-1">
                      <div className="text-sm font-black text-gray-800">{course.name}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified Syllabus</div>
                   </div>
                </td>
                <td className="px-8 py-8 whitespace-nowrap">
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50/50 text-indigo-600 rounded-xl border border-indigo-100/50 text-[10px] font-black uppercase tracking-widest">
                      <MdLayers className="text-xs" />
                      {course.departmentName || 'Global'}
                   </div>
                </td>
                <td className="px-8 py-8 whitespace-nowrap">
                   <div className="flex items-center gap-2 text-xs font-black text-gray-500">
                      <MdDateRange className="text-blue-400" />
                      Level {course.semester}
                   </div>
                </td>
                <td className="px-8 py-8 whitespace-nowrap">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                    course.active
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50 shadow-sm'
                      : 'bg-rose-50 text-rose-600 border-rose-100/50 shadow-sm'
                  }`}>
                    <MdCircle className={course.active ? 'animate-pulse' : ''} size={8} />
                    {course.active ? 'Active' : 'Offline'}
                  </div>
                </td>
                <td className="px-8 py-8 text-right">
                  <ActionButtons 
                    item={course}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseTable; 