import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { RootState } from '../../../redux/store';
import axiosInstance from '../../../api/axiosInstance';
import * as chatApi from '../../../api/chat';
import { ChatSidebar } from '../../common/chat/ChatSidebar';
import { ChatWindow } from '../../common/chat/ChatWindow';
import { ChatListItem, ChatMessage } from '../../../types/features/chat';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';

const ChatStudent: React.FC = () => {
  const navigate = useNavigate();
  const authState = useSelector((state: RootState) => state.auth);
  const user = authState?.user as any;
  const userId = user?.id;
  const departmentId = user?.departmentId;
  const accessToken = authState?.accessToken;

  const [message, setMessage] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeTeacher, setActiveTeacher] = useState<{ id: string; name: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typingStatus, setTypingStatus] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Initialize Socket
  useEffect(() => {
    if (!userId || !accessToken) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { 
        token: accessToken,
        userId,
        userModel: 'Student'
      }
    });


    socketRef.current.on('connect', () => {
      setSocketConnected(true);
      console.log('Socket connected');
    });

    socketRef.current.on('disconnect', () => {
      setSocketConnected(false);
      console.log('Socket disconnected');
    });

    socketRef.current.on('receiveMessage', (newMessage: ChatMessage) => {
      if (newMessage.chatId === activeChatId) {
        setMessages(prev => {
          const exists = prev.some(m => (m._id || m.id) === (newMessage._id || newMessage.id));
          return exists ? prev : [...prev, newMessage];
        });
      } else {
        setUnreadCounts(prev => ({
          ...prev,
          [newMessage.chatId]: (prev[newMessage.chatId] || 0) + 1
        }));
      }
      
      // Update chat list last message
      setChatList(prev => prev.map(chat => 
        chat.chatId === newMessage.chatId 
          ? { ...chat, lastMessage: newMessage.message || 'Media', timestamp: newMessage.timestamp }
          : chat
      ));
    });

    socketRef.current.on('typing', (data: { chatId: string; isTyping: boolean }) => {
      if (data.chatId === activeChatId) {
        setTypingStatus(data.isTyping);
      }
    });

    socketRef.current.on('messageDeleted', (data: { messageId: string; chatId: string }) => {
      if (data.chatId === activeChatId) {
        setMessages(prev => prev.map(m => 
          (m._id || m.id) === data.messageId ? { ...m, isDeleted: true } : m
        ));
      }
    });

    socketRef.current.on('reactionAdded', (data: { messageId: string; reaction: string; userId: string; chatId: string }) => {
      if (data.chatId === activeChatId) {
        setMessages(prev => prev.map(m => {
          if ((m._id || m.id) === data.messageId) {
            const reactions = m.reactions || [];
            return { ...m, reactions: [...reactions, { reaction: data.reaction, userId: data.userId }] };
          }
          return m;
        }));
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, accessToken, activeChatId]);

  // Initial Data Load
  useEffect(() => {
    const loadInitialData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [teachersRes, chatListRes] = await Promise.all([
          axiosInstance.get('/api/teachers'),
          chatApi.fetchChatList(userId)
        ]);

        
        setTeachers(teachersRes.data.data || []);
        const chatData = (chatListRes.data as any).data;
        const chats = Array.isArray(chatData) ? chatData : (chatData?.chats || []);
        setChatList(chats);
        
        const counts: Record<string, number> = {};
        chats.forEach(c => {
          if (c.unreadCount) counts[c.chatId] = c.unreadCount;
        });
        setUnreadCounts(counts);
      } catch (err) {
        console.error('Failed to load chat data:', err);
        setError('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [userId]);

  const fetchMessages = async (chatId: string) => {
    if (!userId) return;
    try {
      const res = await chatApi.fetchMessages(chatId, userId);
      setMessages((res.data as any).data || []);
      // Clear unread count for this chat
      setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      toast.error('Failed to load messages');
    }
  };

  const initiateChat = async (teacherId: string) => {
    if (!userId) {
      console.warn('[ChatStudent] Cannot initiate chat: userId missing');
      return;
    }
    
    console.log('[ChatStudent] Initiating chat with teacher:', teacherId, 'by student:', userId);
    try {
      const res = await axiosInstance.post('/api/messages/initiate', {
        teacherId,
        studentId: userId,
        initiatorId: userId,
        receiverId: teacherId,
        initiatorType: 'Student'
      });
      
      const { chatId } = res.data.data;
      console.log('[ChatStudent] Chat initiated successfully, chatId:', chatId);
      const teacher = teachers.find(t => (t._id || t.id) === teacherId);
      
      switchToTeacher(chatId, { 
        id: teacherId, 
        name: teacher ? teacher.username : 'Teacher' 
      });

      // Refresh chat list to include new chat
      const chatListRes = await chatApi.fetchChatList(userId);
      const chatData = (chatListRes.data as any).data;
      const chats = Array.isArray(chatData) ? chatData : (chatData?.chats || []);
      setChatList(chats);
    } catch (err: any) {
      console.error('[ChatStudent] Failed to initiate chat:', err.response?.data || err.message);
      toast.error('Failed to start chat');
    }
  };


  const switchToTeacher = (chatId: string, teacher: { id: string; name: string }) => {
    setActiveChatId(chatId);
    setActiveTeacher(teacher);
    fetchMessages(chatId);
    if (socketRef.current) {
      socketRef.current.emit('join', { chatId });
    }
  };

  const handleSendMessage = async (text?: string, overrideFile?: File) => {
    const messageToSend = text || message;
    const fileToSend = overrideFile || file;

    if ((!messageToSend.trim() && !fileToSend) || !activeChatId || !userId || !activeTeacher) return;

    try {
      let mediaUrl = '';
      if (fileToSend) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('media', fileToSend);
        const uploadRes = await chatApi.uploadMedia(formData, (pct) => setUploadProgress(pct));

        mediaUrl = uploadRes.data.data.url;
        setIsUploading(false);
        setFile(null);
        setUploadProgress(0);
      }

      const messageId = Math.random().toString(36).substring(7); // Temporary ID for optimistic update
      const messageData = {
        _id: messageId,
        chatId: activeChatId,
        sender: userId,
        senderModel: 'Student',
        receiver: activeTeacher.id,
        receiverModel: 'Teacher',
        message: messageToSend.trim(),
        mediaUrl,
        timestamp: new Date().toISOString()
      };

      if (socketConnected) {
        socketRef.current.emit('sendMessage', messageData);
        // Optimistic update
        setMessages(prev => [...prev, messageData as ChatMessage]);
      } else {
        const formData = new FormData();
        Object.entries(messageData).forEach(([key, val]) => formData.append(key, val as any));
        const res = await chatApi.sendHttpMessage(formData);
        setMessages(prev => [...prev, (res.data as any).data]);
      }

      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
      setIsUploading(false);
    }
  };

  const handleTyping = () => {
    if (!activeChatId || !socketConnected) return;
    
    socketRef.current.emit('typing', { chatId: activeChatId, isTyping: true });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing', { chatId: activeChatId, isTyping: false });
    }, 2000);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!socketConnected) {
      toast.error('Cannot delete message in offline mode');
      return;
    }
    socketRef.current.emit('deleteMessage', { messageId, chatId: activeChatId, userId });
  };

  const handleAddReaction = (messageId: string, reaction: string) => {
    if (!socketConnected) {
      toast.error('Cannot add reaction in offline mode');
      return;
    }
    socketRef.current.emit('addReaction', { messageId, chatId: activeChatId, reaction, userId });
  };

  if (!userId || !accessToken) {
    return (
      <div className="flex h-screen bg-gray-50 justify-center items-center font-inter">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-500">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">Please log in to access your educational workspace and chat with mentors.</p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden font-inter">
      <ChatSidebar
        chats={chatList}
        unreadCounts={unreadCounts}
        activeChatId={activeChatId || undefined}
        onSelect={(cid, name) => {
           const chat = chatList.find(c => c.chatId === cid);
           if (chat) {
             switchToTeacher(cid, { id: chat.contact._id || (chat.contact as any).id, name });
           }
        }}
        loading={loading}
        error={error || undefined}
        directory={teachers}
        initiateChat={initiateChat}
        onSwitch={switchToTeacher}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        socketConnected={socketConnected}
        currentDeptId={departmentId || ''}
        userRole="Student"
      />
      
      <main className="flex-1 flex flex-col relative bg-gray-50/30">
        <ChatWindow
          messages={messages}
          isTyping={typingStatus}
          message={message}
          file={file}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onMessageChange={setMessage}
          onFileChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) setFile(selectedFile);
          }}
          onSend={handleSendMessage}
          onTyping={handleTyping}
          onDelete={handleDeleteMessage}
          onReact={handleAddReaction}
          activeContact={activeTeacher || undefined}
          currentUserId={userId}
          userRole="Student"
        />
      </main>

    </div>
  );
};

export default ChatStudent;