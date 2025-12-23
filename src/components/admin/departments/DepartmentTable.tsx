import React from 'react';
import { DepartmentTableProps } from '../../../types/components/admin';
import ActionButtons from './ActionButtons';
import StatusBadge from '../StatusBadge';
import { 
  MdCorporateFare, 
  MdCode, 
  MdPerson, 
  MdEmail, 
  MdPhone,
  MdLayers,
  MdCircle
} from 'react-icons/md';

const DepartmentTable: React.FC<DepartmentTableProps> = ({ 
  departments, 
  onEdit, 
  onDelete, 
  onView,
  loading = false,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 ${className}`}>
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Department Hub...</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden ${className} animate-in fade-in slide-in-from-bottom-4 duration-700`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-50">
          <thead>
            <tr className="bg-gray-50/50">
               <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Department Entity</th>
               <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Protocols (Code)</th>
               <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Faculty Lead</th>
               <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Node</th>
               <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
               <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Directives</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {!departments || departments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center opacity-25">
                     <MdCorporateFare className="text-6xl mb-4" />
                     <p className="text-sm font-black uppercase tracking-widest">No Department Entities Detected</p>
                  </div>
                </td>
              </tr>
            ) : (
              departments.map((department) => (
                <tr key={department._id} className="group hover:bg-blue-50/30 transition-all duration-300">
                  <td className="px-8 py-8 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center font-black group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shadow-inner">
                          <MdCorporateFare size={24} />
                       </div>
                       <div>
                          <div className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{department.name}</div>
                          <div className="text-[10px] font-medium text-gray-400">Institutional Faculty Unit</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-8 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 bg-white text-[10px] font-black text-gray-600 shadow-sm uppercase tracking-wider">
                      <MdCode className="text-blue-500" />
                      {department.code}
                    </span>
                  </td>
                  <td className="px-8 py-8 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm font-black text-gray-700">
                       <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                          {department.headOfDepartment?.charAt(0) || <MdPerson />}
                       </div>
                       {department.headOfDepartment}
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="space-y-1.5 min-w-[180px]">
                      <a 
                        href={`mailto:${department.departmentEmail}`}
                        className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <MdEmail className="text-blue-400" />
                        {department.departmentEmail}
                      </a>
                      <a 
                        href={`tel:${department.departmentPhone}`}
                        className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <MdPhone className="text-emerald-400" />
                        {department.departmentPhone}
                      </a>
                    </div>
                  </td>
                  <td className="px-8 py-8 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                      department.active 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' 
                        : 'bg-rose-50 text-rose-600 border-rose-100/50'
                    }`}>
                      <MdCircle className={department.active ? 'animate-pulse' : ''} size={8} />
                      {department.active ? 'Operational' : 'Deactivated'}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <ActionButtons 
                      item={department}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentTable;
