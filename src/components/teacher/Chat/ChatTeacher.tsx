import React, { useState, useEffect, FC } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Phone, Video, Info } from 'lucide-react';
import axios from '../../../api/axiosInstance';
import io, { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { ChatSidebar } from '../../common/chat/ChatSidebar';
import { ChatWindow } from '../../common/chat/ChatWindow';
import { ChatListItem, ChatMessage } from '../../../types/features/chat';

// Backend configuration
const API_URL = 'http://localhost:3003/api';
const SOCKET_URL = 'http://localhost:3003';

// const API_URL = 'https://api.edutrackr.shop/api';
// const SOCKET_URL = 'https://api.edutrackr.shop';

// Module-level socket instance
let socket: Socket | null = null;

const ChatTeacher: FC = () => {
  const navigate = useNavigate();
  const authState = useSelector((state:any) => state.auth);
  const userId = authState?.user?.id || authState?.user?.id;
  const user= authState?.user as any;
  const teacherDepartmentId = user.departmentId as unknown as string;
  const accessToken = authState?.accessToken;
  const userModel = 'Teacher';

  const [message, setMessage] = useState<string>('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeStudent, setActiveStudent] = useState<{ id: string; name: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [typingStatus, setTypingStatus] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const reactionEmojis: string[] = ['❤️', '😂', '😢', '💯', '👍', '👎'];
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;

  // Validate auth data
  useEffect(() => {
    if (!userId || !accessToken || !teacherDepartmentId) {
      setError('Please log in and ensure department information is available');
      toast.error('Authentication or department information missing');
      setLoading(false);
      navigate('/login');
    }
  }, [userId, accessToken, teacherDepartmentId, navigate]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    const messagesEnd = document.getElementById('messages-end');
    if (messagesEnd) {
      messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingStatus]);

  // Initialize Socket.IO
  useEffect(() => {
    if (!userId || !accessToken) return;

    // Cleanup existing socket
    if (socket) {
      console.log('Cleaning up existing socket');
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    console.log('Initializing new socket connection');
    socket = io(SOCKET_URL, {
      auth: { token: accessToken, userId, userModel },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      setSocketConnected(true);
      setError('');
      socket?.emit('join', { userId, userModel });
    });

    socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket disconnected:', reason);
      setSocketConnected(false);
      if (reason !== 'io client disconnect') {
        toast.error('Real-time messaging disconnected', {
          style: { background: '#fefcbf', color: '#b45309' },
        });
      }
    });

    socket.on('connect_error', (err: Error) => {
      console.error('❌ Socket connection error:', err.message);
      setSocketConnected(false);
      setError('Failed to connect to real-time messaging');
      toast.error(`Connection failed: ${err.message}`);
    });

    socket.on('receiveMessage', (newMessage: ChatMessage) => {
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
      
      setChatList(prev => prev.map(chat => 
        chat.chatId === newMessage.chatId 
          ? { ...chat, lastMessage: newMessage.message || 'Media', timestamp: newMessage.timestamp }
          : chat
      ));
    });

    socket.on('messageReaction', (updatedMessage: ChatMessage) => {
      if (updatedMessage.chatId === activeChatId) {
        setMessages((prev) =>
          prev.map((msg) =>
            (msg._id || msg.id) === (updatedMessage._id || updatedMessage.id)
              ? { ...msg, reactions: updatedMessage.reactions }
              : msg
          )
        );
      }
    });

    socket.on('messageDeleted', (deletedMessage: ChatMessage) => {
      if (deletedMessage.chatId === activeChatId) {
        const messageId = deletedMessage._id || deletedMessage.id;
        setMessages((prev) =>
          prev.filter((msg) => (msg._id || msg.id) !== messageId)
        );
      }
      fetchChatList();
    });

    socket.on(
      'newChat',
      ({ chatId, contact, contactModel }: { chatId: string; contact: string; contactModel: string }) => {
        console.log('💬 New chat:', { chatId, contact, contactModel });
        fetchChatList();
        if (contactModel === 'Student') {
          setActiveChatId(chatId);
          setActiveStudent({
            id: contact,
            name: students.find((s) => s._id === contact)?.name || 'Student',
          });
        }
      }
    );

    socket.on(
      'typing',
      ({ userId: typingUserId, isTyping: isUserTyping, chatId }: { userId: string; isTyping: boolean; chatId: string }) => {
        if (String(typingUserId) !== userId && chatId === activeChatId) {
          setTypingStatus(isUserTyping);
        }
      }
    );

    socket.on('error', (err: { message: string }) => {
      console.error('❌ Socket error:', err);
      setError('Real-time messaging error');
      toast.error(err.message || 'Socket error');
    });

    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
      }
    };
  }, [userId, accessToken, activeChatId, students]);


  // Fetch students in department
  const fetchStudentsInDepartment = async () => {
    if (!userId || !accessToken || !teacherDepartmentId) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const studentData = response.data.data || response.data || [];
      const deptStudents = (Array.isArray(studentData) ? studentData : (studentData.students || [])).filter(
        (student: any) => student.departmentId === teacherDepartmentId
      );
      setStudents(deptStudents);
      setError('');
    } catch (err: any) {
      console.error('Fetch students error:', err);
      setError('Failed to fetch students');
      toast.error(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch chat list
  const fetchChatList = async () => {
    if (!userId || !accessToken) return;

    try {
      const response = await axios.get(`${API_URL}/messages/chatlist`, {
        params: { userId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const chatData = response.data.data;
      const chats = Array.isArray(chatData) ? chatData : (chatData?.chats || []);
      setChatList(chats);

      // Initialize unread counts from server data
      const initialUnreadCounts: Record<string, number> = {};
      chats.forEach((chat: any) => {
        initialUnreadCounts[chat.chatId] = chat.unreadCount || 0;
      });
      setUnreadCounts(initialUnreadCounts);

      setError('');
    } catch (err: any) {
      console.error('Fetch chat list error:', err);
      setError('Failed to fetch chat list');
      toast.error(err.response?.data?.message || 'Failed to fetch chat list');
    }
  };

  // Mark messages as read
  const markMessagesAsRead = (chatId: string) => {
    if (!chatId) return;

    setUnreadCounts((prev) => ({
      ...prev,
      [chatId]: 0,
    }));

    console.log(`Marked messages as read for chat: ${chatId}`);
  };

  // Fetch messages
  const fetchMessages = async (chatId: string) => {
    if (!chatId || !accessToken) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/messages/${chatId}`, {
        params: { userId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const normalizedMessages: ChatMessage[] = (response.data.data || []).map((msg: any) => {
        const senderId = typeof msg.sender === 'object' && msg.sender?._id
          ? msg.sender._id
          : msg.senderId || msg.sender;
        return {
          ...msg,
          _id: msg._id || msg.id,
          sender: String(senderId),
        };
      });
      setMessages(normalizedMessages);
      setError('');
      setTimeout(scrollToBottom, 100);

      // Mark messages as read
      markMessagesAsRead(chatId);
    } catch (err: any) {
      console.error('Fetch messages error:', err);
      setError('Failed to fetch messages');
      toast.error(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (userId && accessToken && teacherDepartmentId) {
      console.log(`Initial fetch with userId: ${userId}`);
      fetchStudentsInDepartment();
      fetchChatList();
    }
  }, [userId, accessToken, teacherDepartmentId]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // Validate MongoDB ObjectId
  const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

  // Initiate chat
  const onInitiate = async (studentId: string) => {
    if (!userId || !accessToken) {
      setError('Authentication required');
      toast.error('Please log in to start a chat');
      return;
    }

    if (!isValidObjectId(studentId) || !isValidObjectId(userId)) {
      setError('Invalid ID');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/messages/initiate`,
        { teacherId: userId, studentId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const { chatId } = response.data.data;
      await fetchChatList();
      setActiveChatId(chatId);
      setActiveStudent({
        id: studentId,
        name: students.find(s => (s._id || s.id) === studentId)?.name || 'Student'
      });
      markMessagesAsRead(chatId);
    } catch (err: any) {
      console.error('Initiate error:', err);
    }
  };

  const onSwitch = (chatId: string, student: { id: string; name: string }) => {
    setActiveChatId(chatId);
    setActiveStudent(student);
    markMessagesAsRead(chatId);
  };

  // Handle typing
  const handleTyping = () => {
    if (!isTyping && activeChatId && socketConnected) {
      setIsTyping(true);
      socket?.emit('typing', { chatId: activeChatId, sender: userId, isTyping: true });
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      if (socketConnected) {
        socket?.emit('typing', { chatId: activeChatId, sender: userId, isTyping: false });
      }
    }, 2000);
  };

  // Handle add reaction
  const handleAddReaction = async (messageId: string, reaction: string) => {
    try {
      if (socketConnected && socket) {
        socket.emit('addReaction', { messageId, reaction, userId, senderModel: 'Teacher' });
      } else {
        await axios.post(`${API_URL}/messages/reaction`, 
          { messageId, sender: userId, reaction, senderModel: 'Teacher' },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
    } catch (err: any) {
      console.error('Reaction error:', err);
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!activeChatId || !activeStudent || !accessToken || (!message.trim() && !file)) return;

    const messageText = message.trim();
    setMessage('');
    setFile(null);

    try {
      if (socketConnected && socket) {
        if (file) {
          const formData = new FormData();
          formData.append('media', file);
          setIsUploading(true);
          const uploadRes = await axios.post(`${API_URL}/messages/upload`, formData, {
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / (e.total || 1)))
          });

          if (uploadRes.data?.data?.url) {
            socket.emit('sendMedia', {
              chatId: activeChatId,
              sender: userId,
              senderModel: 'Teacher',
              receiver: activeStudent.id,
              receiverModel: 'Student',
              message: messageText,
              mediaUrl: uploadRes.data.data.url,
              mediaType: file.type.startsWith('image/') ? 'image' : 'document'
            });
          }
        } else {
          socket.emit('sendMessage', {
            chatId: activeChatId,
            sender: userId,
            senderModel: 'Teacher',
            receiver: activeStudent.id,
            receiverModel: 'Student',
            message: messageText
          });
        }
      } else {
        const formData = new FormData();
        formData.append('chatId', activeChatId);
        formData.append('sender', userId || '');
        formData.append('senderModel', 'Teacher');
        formData.append('receiver', activeStudent.id);
        formData.append('receiverModel', 'Student');
        if (messageText) formData.append('message', messageText);
        if (file) formData.append('media', file);

        await axios.post(`${API_URL}/messages/send`, formData, {
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'multipart/form-data' }
        });
        fetchMessages(activeChatId);
      }
    } catch (err: any) {
      console.error('Send error:', err);
      toast.error('Failed to send message');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      if (socketConnected && socket) {
        socket.emit('deleteMessage', { messageId });
      } else {
        await axios.post(`${API_URL}/messages/delete`, { messageId, userId }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setMessages(prev => prev.filter(m => (m._id || m.id) !== messageId));
      }
    } catch (err: any) {
      console.error('Delete error:', err);
    }
  };

  if (!userId || !accessToken || !teacherDepartmentId) {
    return (
      <div className="flex h-screen bg-gray-50 justify-center items-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Please log in and ensure department information is available</p>
          <p className="text-sm text-gray-500">Missing: {!userId && 'User ID'} {!accessToken && 'Access Token'} {!teacherDepartmentId && 'Dept ID'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 md:ml-64 relative overflow-hidden">
      <ChatSidebar
        chats={chatList}
        unreadCounts={unreadCounts}
        activeChatId={activeChatId || undefined}
        onSelect={(cid, name) => {
          const chat = chatList.find(c => c.chatId === cid);
          if (chat) {
            onSwitch(cid, { id: chat.contact._id || (chat.contact as any).id, name });
          }
        }}
        loading={loading}
        error={error || undefined}
        directory={students}
        initiateChat={onInitiate}
        onSwitch={onSwitch}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        socketConnected={socketConnected}
        currentDeptId={teacherDepartmentId || ''}
        userRole="Teacher"
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
          activeContact={activeStudent || undefined}
          currentUserId={userId}
          userRole="Teacher"
        />
      </main>
    </div>
  );
};

export default ChatTeacher;
