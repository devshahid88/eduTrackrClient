import React, { ChangeEvent, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { ChatMessage } from '../../../types/features/chat';

interface MessageInputProps {
  message: string;
  file: File | null;
  isUploading: boolean;
  uploadProgress: number;
  onMessageChange: (text: string) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onTyping: () => void;
  replyingTo: ChatMessage | null;
  onCancelReply: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message, file, isUploading, uploadProgress,
  onMessageChange, onFileChange, onSend, onTyping,
  replyingTo, onCancelReply
}) => (
  <div className="bg-white border-t border-gray-200">
    {replyingTo && (
      <div className="px-6 py-2 bg-gray-50 flex items-center justify-between animate-in slide-in-from-bottom-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-1 h-8 bg-blue-500 rounded-full" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Replying to message</p>
            <p className="text-xs text-gray-500 truncate">{replyingTo.message}</p>
          </div>
        </div>
        <button 
          onClick={onCancelReply}
          className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
        >
          <Smile className="w-4 h-4 text-gray-400 rotate-45" /> {/* Using Smile rotated as a close icon skip for now if X not avail */}
        </button>
      </div>
    )}
    <form 
      className="px-6 py-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
    >
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
        onKeyPress={(e: KeyboardEvent) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Type a message..."
        className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500"
        rows={1}
        disabled={isUploading}
      />
      <button 
        type="submit"
        disabled={(!message.trim() && !file) || isUploading}
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
    </form>
  </div>
);
export default MessageInput;