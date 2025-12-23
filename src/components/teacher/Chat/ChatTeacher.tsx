import React, { useState, useEffect, FC } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Phone, Video, Info } from 'lucide-react';
import { MdChat, MdDashboard } from 'react-icons/md';
import axios from '../../../api/axiosInstance';
import io, { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { ChatSidebar } from '../../common/chat/ChatSidebar';
import { ChatWindow } from '../../common/chat/ChatWindow';
import { ChatListItem, ChatMessage } from '../../../types/features/chat';

// Backend configuration
const API_URL = 'http://localhost:3003/api';
const SOCKET_URL = 'http://localhost:3003';

let socket: Socket | null = null;

const ChatTeacher: FC = () => {
  const navigate = useNavigate();
  const authState = useSelector((state:any) => state.auth);
  const userId = authState?.user?.id || authState?.user?.id;
  const user = authState?.user as any;
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

  let typingTimeout: ReturnType<typeof setTimeout> | null = null;

  useEffect(() => {
    if (!userId || !accessToken || !teacherDepartmentId) {
      setError('Please log in and ensure department information is available');
      toast.error('Authentication or department information missing');
      setLoading(false);
      navigate('/login');
    }
  }, [userId, accessToken, teacherDepartmentId, navigate]);

  const scrollToBottom = () => {
    const messagesEnd = document.getElementById('messages-end');
    if (messagesEnd) {
      messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingStatus]);

  useEffect(() => {
    if (!userId || !accessToken) return;

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

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
      setSocketConnected(true);
      setError('');
      socket?.emit('join', { userId, userModel });
    });

    socket.on('disconnect', (reason: string) => {
      setSocketConnected(false);
      if (reason !== 'io client disconnect') {
        toast.error('Messaging server offline');
      }
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
          ? { ...chat, lastMessage: newMessage.message || 'Media Received', timestamp: newMessage.timestamp }
          : chat
      ));
    });

    socket.on('messageDeleted', (deletedMessage: ChatMessage) => {
      if (deletedMessage.chatId === activeChatId) {
        const messageId = deletedMessage._id || deletedMessage.id;
        setMessages((prev) => prev.filter((msg) => (msg._id || msg.id) !== messageId));
      }
      fetchChatList();
    });

    socket.on('newChat', ({ chatId, contact, contactModel }: any) => {
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

    socket.on('typing', ({ userId: typingUserId, isTyping: isUserTyping, chatId }: any) => {
        if (String(typingUserId) !== userId && chatId === activeChatId) {
          setTypingStatus(isUserTyping);
        }
      }
    );

    return () => {
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
      }
    };
  }, [userId, accessToken, activeChatId, students]);

  const fetchStudentsInDepartment = async () => {
    if (!userId || !accessToken || !teacherDepartmentId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = response.data.data || response.data || [];
      const deptStudents = (Array.isArray(data) ? data : (data.students || [])).filter(
        (student: any) => student.departmentId === teacherDepartmentId
      );
      setStudents(deptStudents);
    } catch (err: any) {
      setError('Failed to fetch department roster');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatList = async () => {
    if (!userId || !accessToken) return;
    try {
      const response = await axios.get(`${API_URL}/messages/chatlist`, {
        params: { userId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const chats = Array.isArray(response.data.data) ? response.data.data : (response.data.data?.chats || []);
      setChatList(chats);
      const initialUnreadCounts: Record<string, number> = {};
      chats.forEach((chat: any) => {
        initialUnreadCounts[chat.chatId] = chat.unreadCount || 0;
      });
      setUnreadCounts(initialUnreadCounts);
    } catch (err: any) {
      setError('Failed to fetch messages list');
    }
  };

  const markMessagesAsRead = (chatId: string) => {
    if (!chatId) return;
    setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));
  };

  const fetchMessages = async (chatId: string) => {
    if (!chatId || !accessToken) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/messages/${chatId}`, {
        params: { userId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const normalizedMessages: ChatMessage[] = (response.data.data || []).map((msg: any) => {
        const senderId = typeof msg.sender === 'object' ? msg.sender?._id : (msg.senderId || msg.sender);
        return { ...msg, _id: msg._id || msg.id, sender: String(senderId) };
      });
      setMessages(normalizedMessages);
      setTimeout(scrollToBottom, 100);
      markMessagesAsRead(chatId);
    } catch (err: any) {
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && accessToken && teacherDepartmentId) {
      fetchStudentsInDepartment();
      fetchChatList();
    }
  }, [userId, accessToken, teacherDepartmentId]);

  useEffect(() => {
    if (activeChatId) fetchMessages(activeChatId);
    else setMessages([]);
  }, [activeChatId]);

  const onInitiate = async (studentId: string) => {
    if (!userId || !accessToken) return;
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

  const handleTyping = () => {
    if (!isTyping && activeChatId && socketConnected) {
      setIsTyping(true);
      socket?.emit('typing', { chatId: activeChatId, sender: userId, isTyping: true });
    }
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      if (socketConnected) socket?.emit('typing', { chatId: activeChatId, sender: userId, isTyping: false });
    }, 2000);
  };

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
              chatId: activeChatId, sender: userId, senderModel: 'Teacher',
              receiver: activeStudent.id, receiverModel: 'Student',
              message: messageText, mediaUrl: uploadRes.data.data.url,
              mediaType: file.type.startsWith('image/') ? 'image' : 'document'
            });
          }
        } else {
          socket.emit('sendMessage', {
            chatId: activeChatId, sender: userId, senderModel: 'Teacher',
            receiver: activeStudent.id, receiverModel: 'Student', message: messageText
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
      toast.error('Failed to dispatch message');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      if (socketConnected && socket) socket.emit('deleteMessage', { messageId });
      else {
        await axios.post(`${API_URL}/messages/delete`, { messageId, userId }, { headers: { Authorization: `Bearer ${accessToken}` } });
        setMessages(prev => prev.filter(m => (m._id || m.id) !== messageId));
      }
    } catch (err: any) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] container mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full flex bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-0">
        <ChatSidebar
          chats={chatList}
          unreadCounts={unreadCounts}
          activeChatId={activeChatId || undefined}
          onSelect={(cid, name) => {
            const chat = chatList.find(c => c.chatId === cid);
            if (chat) onSwitch(cid, { id: chat.contact._id || (chat.contact as any).id, name });
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

        <main className="flex-1 flex flex-col bg-gray-50/10 min-w-0">
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
    </div>
  );
};

export default ChatTeacher;
