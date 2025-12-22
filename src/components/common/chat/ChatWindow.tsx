import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../../../types/features/chat';
import { PremiumMessageBubble } from './PremiumMessageBubble';
import { MessageInput }  from './MessageInput';
import { User, Phone, Video, Search, MoreHorizontal, Info } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping: boolean;
  message: string;
  file: File | null;
  isUploading: boolean;
  uploadProgress: number;
  onMessageChange: (text: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onTyping: () => void;
  onDelete: (messageId: string) => void;
  onReact:  (msgId: string, emoji: string) => void;
  activeContact?: { id: string; name: string };
  currentUserId: string;
  userRole: 'Student' | 'Teacher';
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages, 
  isTyping,
  message,
  file,
  isUploading,
  uploadProgress,
  onMessageChange,
  onFileChange,
  onSend,
  onTyping,
  onDelete, 
  onReact,
  activeContact,
  currentUserId,
  userRole
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!activeContact) {
    const welcomeTitle = userRole === 'Student' ? 'Welcome to your Education Hub' : 'Welcome to Teacher Dashboard';
    const welcomeDesc = userRole === 'Student' 
      ? 'Select a mentor from the sidebar to start a real-time learning conversation.'
      : 'Select a student from the sidebar to provide guidance and answer questions.';

    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 scale-150" />
            <div className="relative w-24 h-24 bg-white rounded-[40px] shadow-2xl flex items-center justify-center border border-gray-100">
                <span className="text-4xl">👋</span>
            </div>
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{welcomeTitle}</h2>
        <p className="text-gray-500 font-medium max-w-xs text-center leading-relaxed">
            {welcomeDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 border border-blue-200">
                {activeContact.name[0].toUpperCase()}
             </div>
             <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500 shadow-sm" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 leading-tight tracking-tight">{activeContact.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded-md">Online Now</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
              <Phone className="w-5 h-5" />
           </button>
           <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
              <Video className="w-5 h-5" />
           </button>
           <div className="w-px h-6 bg-gray-100 mx-2" />
           <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
              <Info className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 py-8 bg-gray-50/30 space-y-2 custom-scrollbar"
      >
        <div className="flex flex-col min-h-full justify-end">
            <div className="flex flex-col items-center justify-center mb-12 opacity-50">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                    <User className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Journaling your path since December 2025</p>
                <div className="w-px h-8 bg-gradient-to-b from-gray-200 to-transparent mt-4" />
            </div>

            {messages.map((msg, idx) => (
              <PremiumMessageBubble
                key={msg._id || idx}
                message={msg}
                isOwn={String(msg.sender) === currentUserId}
                onDelete={onDelete}
                onReact={onReact}
              />
            ))}
            
            {isTyping && (
              <div className="px-6 mb-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 w-fit flex items-center gap-1.5 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{activeContact.name.split(' ')[0]} is typing...</span>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Input */}
      <div className="p-6 bg-white">
        <MessageInput
          message={message}
          file={file}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onMessageChange={onMessageChange}
          onFileChange={onFileChange}
          onSend={onSend}
          onTyping={onTyping}
        />
      </div>
    </div>
  );
};

export default ChatWindow;

