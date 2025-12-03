// src/components/student/chat/ChatWindow.tsx
import React from 'react';
import { ChatMessage } from '../../../types/features/chat';
import { MessageBubble } from './MessageBubble';
import { MessageInput }  from './MessageInput';

interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSend: (text: string, file?: File) => void;
  onDelete: (messageId: string) => void;
  onReact:  (msgId: string, emoji: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages, isTyping, onSend, onDelete, onReact
}) => {
  // scroll logic, rendering, input, etc.
  return (
    <div className="flex-1 flex flex-col">
      {/* … */}
    </div>
  );
};

export default ChatWindow;
