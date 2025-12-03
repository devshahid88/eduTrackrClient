import React, { ChangeEvent, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  message: string;
  file: File | null;
  isUploading: boolean;
  uploadProgress: number;
  onMessageChange: (text: string) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onTyping: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message, file, isUploading, uploadProgress,
  onMessageChange, onFileChange, onSend, onTyping
}) => (
  <div className="bg-white border-t border-gray-200 px-6 py-4">
    <div className="flex items-end space-x-3">
      <label htmlFor="file-upload" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full cursor-pointer">
        <Paperclip className="w-5 h-5" />
      </label>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
        onChange={onFileChange}
        disabled={isUploading}
      />
      <textarea
        value={message}
        onChange={e => { onMessageChange(e.target.value); onTyping(); }}
        onKeyPress={(e: KeyboardEvent) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onSend())}
        placeholder="Type a message..."
        className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500"
        rows={1}
        disabled={isUploading}
      />
      <button onClick={onSend} disabled={(!message.trim() && !file) || isUploading}
        className={`p-3 rounded-full transition ${
          (message.trim()||file)&&!isUploading
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
    {file && <p className="mt-2 text-xs text-gray-600">File: {file.name}</p>}
    {isUploading && (
      <div className="mt-2">
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div className="h-2 bg-blue-600 rounded-full" style={{width:`${uploadProgress}%`}}/>
        </div>
        <p className="text-xs text-gray-600 mt-1">Uploading: {uploadProgress}%</p>
      </div>
    )}
  </div>
);
export default MessageInput;