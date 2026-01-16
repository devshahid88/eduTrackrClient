import React from 'react';
import { ChatMessage } from '../../../types/features/chat';
import { format } from 'date-fns';
import { Check, CheckCheck, MoreHorizontal, Reply, Trash2, Heart } from 'lucide-react';

interface PremiumMessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  onDelete?: (id: string) => void;
  onReact?: (id: string, emoji: string) => void;
  onReply?: (message: ChatMessage) => void;
}

export const PremiumMessageBubble: React.FC<PremiumMessageBubbleProps> = ({
  message,
  isOwn,
  onDelete,
  onReact,
  onReply
}) => {
  const [showActions, setShowActions] = React.useState(false);

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-6 group transition-all duration-300 relative px-4`}>
     
      <div className={`flex items-end gap-2.5 max-w-[85%] sm:max-w-[70%] relative ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Message Actions (Visible on hover) */}
        <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 ${isOwn ? '-left-20' : '-right-20 animate-in slide-in-from-left-2'}`}>
          <button 
            onClick={() => onReply?.(message)}
            className="p-2 bg-white border border-gray-100 rounded-full shadow-lg text-gray-400 hover:text-blue-600 hover:scale-110 transition-all"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
          {!isOwn && (
             <button 
                onClick={() => onReact?.(message._id, '❤️')}
                className="p-2 bg-white border border-gray-100 rounded-full shadow-lg text-gray-400 hover:text-pink-600 hover:scale-110 transition-all"
              >
              <Heart className="w-3.5 h-3.5" />
            </button>
          )}
          {isOwn && (
            <button 
              onClick={() => onDelete?.(message._id)}
              className="p-2 bg-white border border-gray-100 rounded-full shadow-lg text-gray-400 hover:text-red-600 hover:scale-110 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* The Bubble */}
        <div className={`relative px-4 py-3 rounded-[24px] shadow-sm transition-all ${
          message.isDeleted ? 'bg-gray-100 text-gray-400 italic' :
          isOwn 
            ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-200/50' 
            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
          }`}>
          
          {message.isDeleted ? (
            <p className="text-[13px] tracking-tight flex items-center gap-1.5 opacity-60">
               🚫 This message was deleted
            </p>
          ) : (
            <>
            {message.replyTo && (
              <div className={`mb-2 p-2 rounded-xl text-[11px] border-l-3 backdrop-blur-sm ${
                  isOwn ? 'bg-white/10 border-white/40 text-white/90' : 'bg-gray-50 border-gray-300 text-gray-500'
              }`}>
                 <p className="font-bold uppercase tracking-wider mb-0.5 opacity-60">Replying to message</p>
                 <p className="line-clamp-1">{typeof message.replyTo === 'object' ? (message.replyTo as any).message : 'Message reference unavailable'}</p>
              </div>
            )}

            {message.mediaUrl && (
              <div className="mb-2.5 overflow-hidden rounded-2xl bg-gray-100/10">
                {message.mediaType === 'image' ? (
                  <img 
                    src={message.mediaUrl} 
                    alt="Attachment" 
                    className="max-w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                  />
                ) : (
                  <div className={`p-3 flex items-center gap-3 ${isOwn ? 'bg-white/10' : 'bg-gray-50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOwn ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
                      📄
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate">File Attachment</p>
                      <a href={message.mediaUrl} target="_blank" className={`text-[10px] font-black uppercase tracking-widest ${isOwn ? 'text-white' : 'text-blue-600 hover:underline'}`}>Download</a>
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-[14px] leading-relaxed font-medium">
              {message.message}
            </p>
            </>
          )}

          <div className={`flex items-center gap-1.5 mt-2 opacity-60 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[9px] font-bold uppercase tracking-tighter">
                {format(new Date(message.timestamp), 'h:mm a')}
            </span>
            {isOwn && <CheckCheck className="w-3 h-3" />}
          </div>
          
          {/* Reaction Overlay */}
          {message.reactions && message.reactions.length > 0 && (
             <div className={`absolute -bottom-2.5 ${isOwn ? 'left-0' : 'right-0'} flex -space-x-1 group/reaction`}>
                {Array.from(new Set(message.reactions.map(r => r.reaction))).slice(0, 3).map((r, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-white border border-gray-100 shadow-lg flex items-center justify-center text-[10px] scale-110 hover:scale-125 transition-transform z-10">
                    {r}
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
