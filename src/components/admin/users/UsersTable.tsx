import React from 'react';
import ActionButtons from './ActionButtons';
import { 
  MdPerson, 
  MdEmail, 
  MdWork, 
  MdCircle,
  MdShield,
  MdFingerprint
} from 'react-icons/md';

const UserTable = ({ users, onEdit, onDelete, onView }) => {
  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-20 flex flex-col items-center justify-center text-center opacity-30">
        <MdPerson size={64} className="text-gray-400 mb-4" />
        <p className="text-sm font-black uppercase tracking-widest text-gray-500">No Target Personas Identified</p>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch(role?.toLowerCase()) {
      case 'student': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'teacher': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'admin': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-50">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Personnel Identity</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Security Credentials</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Platform Role</th>
              <th className="px-8 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Directives</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {users.map((user, index) => (
              <tr
                key={user._id || index}
                className="group hover:bg-blue-50/30 transition-all duration-300"
              >
                <td className="px-8 py-8 whitespace-nowrap">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center font-black group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shadow-inner relative overflow-hidden">
                         <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <div className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                         </div>
                         <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                            <MdFingerprint className="text-blue-400 text-xs" />
                            PID-{user._id?.slice(-6).toUpperCase() || 'EXTERNAL'}
                         </div>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-8 whitespace-nowrap">
                   <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <MdEmail className="text-blue-400" />
                      {user.email}
                   </div>
                </td>
                <td className="px-8 py-8 whitespace-nowrap">
                   <span className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-2 w-fit ${getRoleColor(user.role)}`}>
                      <MdShield className="text-xs" />
                      {user.role}
                   </span>
                </td>
                <td className="px-8 py-8 text-center">
                  <ActionButtons
                    user={user}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
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

export default UserTable;
