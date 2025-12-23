import React from 'react';
import { 
  MdVisibility, 
  MdEdit, 
  MdDeleteForever,
  MdOpenInNew,
  MdLayers,
  MdHistory
} from 'react-icons/md';
import { ActionButtonsProps } from '../../../types/components/admin';

const ActionButtons = <T,>({ 
  item, 
  onEdit, 
  onDelete, 
  onView, 
  className = '' 
}: ActionButtonsProps<T>) => {
  return (
    <div className={`flex items-center justify-end space-x-2 ${className}`}>
      {/* View Button */}
      <button
        onClick={() => onView(item)}
        className="p-2.5 text-blue-500 hover:text-white hover:bg-blue-600 bg-blue-50/50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm group border border-blue-100/50"
        title="View Profile"
      >
        <MdVisibility size={18} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Edit Button */}
      <button
        onClick={() => onEdit(item)}
        className="p-2.5 text-indigo-500 hover:text-white hover:bg-indigo-600 bg-indigo-50/50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm group border border-indigo-100/50"
        title="Modify Entry"
      >
        <MdEdit size={18} className="group-hover:-rotate-12 transition-transform" />
      </button>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(item)}
        className="p-2.5 text-rose-500 hover:text-white hover:bg-rose-600 bg-rose-50/50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm group border border-rose-100/50"
        title="Terminate"
      >
        <MdDeleteForever size={18} className="group-hover:scale-125 transition-transform" />
      </button>
    </div>
  );
};

export default ActionButtons;
