import React from 'react';
import { MdVisibility, MdCheckCircle, MdPerson, MdTimer, MdInfoOutline, MdWarningAmber, MdSupportAgent } from 'react-icons/md';

import { Concern } from '../../../types/features/concern-management';

interface ConcernTableProps {
  concerns: Concern[];
  onEdit: (concern: Concern) => void;
  onView: (concern: Concern) => void;
}

const ConcernTable: React.FC<ConcernTableProps> = ({ concerns, onEdit, onView }) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = (status || '').toLowerCase();
    switch (normalizedStatus) {
      case 'pending': return { label: 'Pending Alignment', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', icon: <MdTimer /> };
      case 'in_progress': 
      case 'in-progress': return { label: 'In Pipeline', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', icon: <MdInfoOutline /> };
      case 'solved': return { label: 'Finalized', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <MdCheckCircle /> };
      case 'rejected': return { label: 'Terminated', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', icon: <MdWarningAmber /> };
      default: return { label: status || 'Unknown', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100', icon: <MdInfoOutline /> };
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-50">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Concern Directive</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">System Status</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Raised By</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Telemetry Ref</th>
              <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Procedures</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {concerns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-32 text-center opacity-25">
                   <MdSupportAgent size={64} className="mx-auto mb-4" />
                   <p className="text-sm font-black uppercase tracking-widest text-gray-500">No Support Directives Detected</p>
                </td>
              </tr>
            ) : (
              concerns.map((concern) => {
                const status = getStatusConfig(concern.status);
                return (
                  <tr key={concern._id} className="group hover:bg-rose-50/20 transition-all duration-300">
                    <td className="px-8 py-8 whitespace-nowrap">
                      <div className="max-w-xs">
                        <div className="text-sm font-black text-gray-900 group-hover:text-rose-600 transition-colors truncate">{concern.title}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{concern.type} Priority</div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-8 whitespace-nowrap">
                       <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${status.bg} ${status.color} rounded-xl border ${status.border} text-[10px] font-black uppercase tracking-widest`}>
                          {status.icon}
                          {status.label}
                       </div>
                    </td>
                    
                    <td className="px-8 py-8 whitespace-nowrap">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                             <MdPerson size={16} />
                          </div>
                          <div>
                             <div className="text-xs font-black text-gray-700">{concern.createdBy?.username || 'System Agent'}</div>
                             <div className="text-[9px] font-bold text-gray-400 uppercase">{concern.createdByRole || concern.createdBy?.role} Instance</div>
                          </div>
                       </div>
                    </td>
                    
                    <td className="px-8 py-8 whitespace-nowrap">
                       <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-tighter">
                          HEX: {((concern.id || concern._id || 'UNKNOWN') as string).slice(-6).toUpperCase()}
                       </div>
                    </td>
                    
                    <td className="px-8 py-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button
                           onClick={() => onEdit(concern)}
                           className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all duration-300 shadow-xl shadow-gray-200 hover:shadow-emerald-100"
                         >
                           Resolve
                         </button>
                         <button
                           onClick={() => onView(concern)}
                           className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300 border border-transparent hover:border-rose-100"
                         >
                           <MdVisibility size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConcernTable;