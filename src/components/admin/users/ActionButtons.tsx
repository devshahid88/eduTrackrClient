import React from 'react';
import { 
  MdVisibility, 
  MdEdit, 
  MdDeleteForever
} from 'react-icons/md';

const ActionButtons = ({ user, onEdit, onDelete, onView }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      {/* View Button */}
      <button
        onClick={() => onView(user)}
        className="p-2.5 text-blue-500 hover:text-white hover:bg-blue-600 bg-blue-50/50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm group border border-blue-100/50"
        title="View Identity"
      >
        <MdVisibility size={18} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Edit Button */}
      <button
        onClick={() => onEdit(user)}
        className="p-2.5 text-indigo-500 hover:text-white hover:bg-indigo-600 bg-indigo-50/50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm group border border-indigo-100/50"
        title="Modify Credentials"
      >
        <MdEdit size={18} className="group-hover:-rotate-12 transition-transform" />
      </button>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(user)}
        className="p-2.5 text-rose-500 hover:text-white hover:bg-rose-600 bg-rose-50/50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm group border border-rose-100/50"
        title="Terminate Access"
      >
        <MdDeleteForever size={18} className="group-hover:scale-125 transition-transform" />
      </button>
    </div>
  );
};

export default ActionButtons;