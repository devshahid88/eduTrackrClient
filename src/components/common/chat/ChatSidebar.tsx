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
  directory: Array<{ _id?: string; id?: string; username: string; department: string; firstname: string; lastname: string; role?: string }>;
  initiateChat: (userId: string) => void;
  onSwitch: (chatId: string, contact: { id: string; name: string }) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  socketConnected: boolean;
  currentDeptId: string;
  userRole: 'Student' | 'Teacher';
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  unreadCounts,
  activeChatId,
  onSelect,
  loading,
  error,
  directory,
  initiateChat,
  onSwitch,
  sidebarOpen,
  setSidebarOpen,
  socketConnected,
  currentDeptId,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredDirectory = directory.filter(t => 
    (t.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (`${t.firstname} ${t.lastname}`.toLowerCase()).includes(searchTerm.toLowerCase())
  );

  const yourDeptUsers = filteredDirectory.filter(t => t.department === currentDeptId);
  const otherDeptUsers = filteredDirectory.filter(t => t.department !== currentDeptId);

  const directoryLabel = userRole === 'Student' ? 'Teacher Directory' : 'Student Directory';
  const placeholderLabel = userRole === 'Student' ? 'Search teachers...' : 'Search students...';

  return (
    <div className={`bg-white border-r border-gray-100 transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-0'
      } overflow-hidden flex flex-col shadow-xl z-20`}>
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Messages</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              {socketConnected ? 'Server Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder={placeholderLabel}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400 font-medium shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-500">Finding your contacts...</p>
          </div>
        )}
        
        {error && (
          <div className="m-4 p-4 bg-red-50 rounded-xl border border-red-100 text-center">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Connection Error</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!loading && (
          <div className="pb-6">
            {/* Recent Chats Section */}
            {chats?.length > 0 && !searchTerm && (
              <div className="mb-4">
                <div className="px-6 py-4 flex items-center justify-between">
                  <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Recent Conversations</h2>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{chats.length}</span>
                </div>
                <div className="space-y-0.5 px-3">
                  {chats.map(chat => {
                    const unread = unreadCounts[chat.chatId] || 0;
                    return (
                      <div
                        key={chat.chatId}
                        onClick={() => onSwitch(chat.chatId, {
                          id: chat.contact._id || (chat.contact as any).id,
                          name: chat.contact.username
                        })}
                        className={`group p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                          activeChatId === chat.chatId
                            ? 'bg-blue-50/80 shadow-sm'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold bg-white border border-gray-100 shadow-sm group-hover:scale-105 transition-transform ${activeChatId === chat.chatId ? 'border-blue-200' : ''}`}>
                              {chat.contact.username?.[0]?.toUpperCase() || '👤'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500 shadow-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className={`text-sm font-bold truncate ${activeChatId === chat.chatId ? 'text-blue-900' : 'text-gray-900'}`}>
                                {chat.contact.username}
                              </p>
                              <span className="text-[10px] font-medium text-gray-400">
                                {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className={`text-xs truncate ${unread > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                {chat.lastMessage}
                              </p>
                              {unread > 0 && (
                                <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow-lg shadow-blue-200">
                                  {unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Directory Section */}
            <div>
              <div className="px-6 py-4">
                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">{directoryLabel}</h2>
              </div>
              
              {/* Your Department */}
              {yourDeptUsers.length > 0 && (
                <div className="mb-4">
                  <p className="px-6 py-1 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">From Your Department</p>
                  <div className="space-y-0.5 px-3">
                    {yourDeptUsers.map(user => (
                      <div
                        key={user._id || user.id}
                        onClick={() => initiateChat((user._id || user.id)!)}
                        className="group flex items-center p-3 rounded-2xl hover:bg-blue-50/40 cursor-pointer transition-all border border-transparent hover:border-blue-100/50"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-100 group-hover:bg-white group-hover:scale-105 transition-all">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div className="ml-3.5 flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate tracking-tight">{user.username}</p>
                          <p className="text-[10px] font-semibold text-gray-400 truncate uppercase mt-0.5">Verified Account</p>
                        </div>
                        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Search className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Departments */}
              {otherDeptUsers.length > 0 && (
                <div>
                  <p className="px-6 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Other Departments</p>
                  <div className="space-y-0.5 px-3">
                    {otherDeptUsers.map(user => (
                      <div
                        key={user._id || user.id}
                        onClick={() => initiateChat((user._id || user.id)!)}
                        className="group flex items-center p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-sm font-bold border border-gray-200 group-hover:bg-white group-hover:scale-105 transition-all">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div className="ml-3.5 flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-700 truncate group-hover:text-gray-900">{user.username}</p>
                          <p className="text-[10px] font-semibold text-gray-400 truncate uppercase mt-0.5 tracking-tighter">Verified Instructor</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredDirectory.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 rounded-3xl m-4 border border-dashed border-gray-200">
                  <Search className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-sm font-bold text-gray-400">No results matched your search</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;

