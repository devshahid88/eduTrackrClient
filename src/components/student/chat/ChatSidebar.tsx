import React from 'react';
import { ChatListItem } from '../../../types/features/chat';
import { Search, Menu } from 'lucide-react';


interface ChatSidebarProps {
  chats: ChatListItem[];
  unreadCounts: Record<string, number>;
  activeChatId?: string;
  onSelect: (chatId: string, name: string) => void;
  loading: boolean;
  error?: string;
  teachers: Array<{ _id: string; username: string }>;
  initiateChat: (teacherId: string) => void;
  switchToTeacher: (chatId: string, teacher: { id: string; name: string }) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  socketConnected: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  unreadCounts,
  activeChatId,
  onSelect,
  loading,
  error,
  teachers,
  initiateChat,
  switchToTeacher,
  sidebarOpen,
  setSidebarOpen,
  socketConnected
}) => (
  <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      sidebarOpen ? 'w-80' : 'w-0'
    } overflow-hidden flex flex-col`}>
    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">Teachers</h1>
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            socketConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
          title={socketConnected ? 'Connected' : 'Disconnected'}
        />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
    <div className="p-4 border-b border-gray-200">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search teachers..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    <div className="flex-1 overflow-y-auto">
      {loading && <p className="p-4 text-gray-600">Loading...</p>}
      {error && <p className="p-4 text-red-600 text-sm">{error}</p>}

      {!loading && teachers.length > 0 && (
        <>
          <h2 className="p-4 font-semibold text-gray-900">Available Teachers</h2>
          {teachers.map(teacher => {
            const id = teacher._id;
            return (
              <div
                key={id}
                onClick={() => initiateChat(id)}
                className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    👩‍🏫
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {teacher.username}
                    </p>
                    <p className="text-xs text-blue-600 truncate">Teacher</p>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {!loading && chats?.length > 0 && (
        <>
          <h2 className="p-4 font-semibold text-gray-900">Recent Chats</h2>
          {chats.map(chat => (
            <div
              key={chat.chatId}
              onClick={() => switchToTeacher(chat.chatId, {
                id: chat.contact._id,
                name: chat.contact.username
              })}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeChatId === chat.chatId
                  ? 'bg-blue-50 border-r-4 border-r-blue-600'
                  : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                  👩‍🏫
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 truncate">
                        {chat.contact.username}
                      </p>
                      <p className="text-xs text-blue-600 truncate">Teacher</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(chat.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {!loading && !error && teachers.length === 0 && (
        <p className="p-4 text-gray-600">No teachers available in your department</p>
      )}
    </div>
  </div>
);
export default ChatSidebar;