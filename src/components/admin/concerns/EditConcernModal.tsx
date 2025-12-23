import React, { useState } from 'react';
import { EditConcernModalProps } from '../../../types/components/admin';
import { ConcernStatus } from '../../../types/features/concern-management';

const EditConcernModal: React.FC<EditConcernModalProps> = ({ concern, onClose, onSave }) => {
  const [status, setStatus] = useState<ConcernStatus>(
    concern.status === 'pending' || concern.status === 'in_progress' ? 'solved' : concern.status
  );
  const [feedback, setFeedback] = useState<string>(concern.feedback || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    
    try {
      await onSave({ 
        _id: concern._id, 
        status, 
        feedback: feedback.trim() || undefined 
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save concern');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Concern Status & Feedback</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={status}
              onChange={e => setStatus(e.target.value as ConcernStatus)}
              required
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="solved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback {status === 'rejected' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={3}
              placeholder="Enter feedback (required for rejected concerns)"
              required={status === 'rejected'}
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditConcernModal;
