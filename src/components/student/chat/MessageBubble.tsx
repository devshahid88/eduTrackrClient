import React from 'react';
import { Trash2 } from 'lucide-react';
import { ChatMessage } from '../../../types/features/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isSender: boolean;
  onDelete: (messageId: string) => void;
  onReact: ( messageId: string, emoji: string ) => void;
  replyTo: ChatMessage | null;
  onReply: (msg: ChatMessage) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message, isSender, onDelete, onReact, replyTo, onReply
}) => {
  const { _id, message: text, mediaUrl, isError, isDeleted, reactions, timestamp } = message;
  const senderClass = isSender ? 'justify-end' : 'justify-start';
  const bubbleClass = isSender
    ? 'bg-blue-600 text-white rounded-br-none'
    : 'bg-white text-gray-900 border rounded-bl-none';

  return (
    <div className={`flex ${senderClass} mb-4`}>
      <div className="max-w-md">
        {replyTo && (
          <div className="p-2 mb-1 bg-gray-100 rounded-t-md text-xs">
            Replying to: { replyTo.message || '[media]' }
          </div>
        )}
        <div className={`${bubbleClass} px-4 py-2 rounded-2xl`}>
          {isDeleted ? (
            <em className="text-sm italic">Message deleted</em>
          ) : text ? (
            <p className="text-sm">{text}</p>
          ) : mediaUrl ? (
            <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              View file
            </a>
          ) : null}
        </div>
        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
          <span>{new Date(timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
          {!isDeleted && (
            <>
              <button onClick={() => onReply(message)} className="hover:underline">Reply</button>
              <button onClick={() => onDelete(_id)} className="text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        {reactions && reactions.length > 0 && (
          <div className="mt-1 flex space-x-1">
            {reactions.map((r,i) => <span key={i}>{r.reaction}</span>)}
          </div>
        )}
      </div>
    </div>
  );
};
export default MessageBubble;