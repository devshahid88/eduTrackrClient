import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
} from 'react';
import {
  Send,
  BookOpen,
  Users,
  FileText,
  PieChart,
  Bot,
  User,
  History,
  Trash2,
  Download,
  Copy,
  Check,
  ClipboardList,
  Award,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { MdAutoAwesome, MdHistory, MdFileDownload, MdDeleteSweep } from 'react-icons/md';

// --- Types ---
export interface AiMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export interface QuickAction {
  text: string;
  icon: React.ComponentType<any>;
}

export interface AiChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  timestamp?: string;
}

const AiTeacher: React.FC = () => {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 1,
      type: 'ai',
      content:
        "Greetings, Educator! I'm your advanced AI teaching assistant. I can help you architect lesson plans, synthesize assessments, analyze student trajectories, or provide deep pedagogical insights. How shall we transform learning today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const API_BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';

  const teacherActions: QuickAction[] = [
    { text: 'Design a STEM lesson plan for Grade 10', icon: BookOpen },
    { text: 'Compose a quiz for Quantum Physics', icon: ClipboardList },
    { text: 'Synthesize student performance analytics', icon: PieChart },
    { text: 'Draft an evaluation rubric for literary essays', icon: Award },
    { text: 'Recommend strategies for kinesthetic learners', icon: Users },
    { text: 'Architect curriculum for the upcoming semester', icon: FileText },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToAPI = async (
    message: string,
    context: { type: 'user' | 'ai'; content: string }[] | null = null
  ): Promise<string> => {
    const payload = { message, context };
    const response = await fetch(`${API_BASE_URL}/api/ai/teacher/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data: AiChatResponse = await response.json();
    if (!data.success || !data.response) throw new Error(data.error || 'No response from AI resonance');
    return data.response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: AiMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const currentText = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    setError(null);

    try {
      const context = messages.slice(-3).map((msg) => ({ type: msg.type, content: msg.content }));
      const aiText = await sendMessageToAPI(currentText, context);

      const aiMsg: AiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsConnected(true);
    } catch (err) {
      setError('Communication link failure. Synchronizing neural protocols.');
      setIsConnected(false);
      const errMsg: AiMessage = {
        id: Date.now() + 2,
        type: 'ai',
        content: "I apologize, our synaptic link is currently experiencing interference. Please verify your connection or attempt recalibration.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (actionText: string) => {
    setInputMessage(actionText);
    inputRef.current?.focus();
  };

  const copyMessage = (messageId: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const clearHistory = () => {
    setMessages([{
      id: 1,
      type: 'ai',
      content: "Memory wipe complete. How shall we begin our new educational architectural session?",
      timestamp: new Date(),
    }]);
    setError(null);
  };

  const exportChat = () => {
    const chatData = messages.map((msg) => ({
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
    }));
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neural-academic-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderMessage = (message: AiMessage) => (
    <div
      key={message.id}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-8 group animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div className={`flex items-start max-w-[85%] lg:max-w-[70%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-4' : 'mr-4'}`}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
            message.type === 'user' ? 'bg-blue-600' : message.isError ? 'bg-rose-500' : 'bg-gray-900 border border-gray-100'
          }`}>
            {message.type === 'user' ? <User size={18} className="text-white" /> : message.isError ? <AlertCircle size={18} className="text-white" /> : <Bot size={18} className="text-blue-400" />}
          </div>
        </div>
        <div className={`relative px-6 py-4 rounded-[2rem] shadow-sm ${
          message.type === 'user' ? 'bg-blue-600 text-white shadow-blue-100' : 
          message.isError ? 'bg-rose-50 text-rose-800 border-rose-100 border' : 
          'bg-white text-gray-800 border border-gray-50'
        }`}>
          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <div className="flex items-center justify-between mt-3 opacity-60">
            <span className="text-[10px] font-black uppercase tracking-widest">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {message.type === 'ai' && !message.isError && (
              <button
                onClick={() => copyMessage(message.id, message.content)}
                className="hover:text-blue-600 transition-colors p-1"
              >
                {copiedMessageId === message.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 h-[calc(100vh-120px)] flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-gray-900 rounded-[1.5rem] flex items-center justify-center shadow-xl">
              <MdAutoAwesome className="text-2xl text-blue-400 animate-pulse" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">AI Teaching Laboratory</h1>
              <p className="text-gray-500 font-medium text-sm">Empowering educators with predictive intelligence.</p>
           </div>
        </div>
        <div className="flex gap-2">
          <button onClick={clearHistory} className="p-3 bg-white text-gray-400 border border-gray-100 rounded-2xl hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-95 shadow-sm" title="Clear Logic"><MdDeleteSweep className="text-xl" /></button>
          <button onClick={exportChat} className="p-3 bg-white text-gray-400 border border-gray-100 rounded-2xl hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 shadow-sm" title="Sync Records"><MdFileDownload className="text-xl" /></button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0 overflow-hidden">
        {/* Sidebar: Neural Tools */}
        <div className="hidden lg:flex w-80 flex-col space-y-6">
           <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex-1 overflow-y-auto custom-scrollbar">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-2">Knowledge Domains</h3>
              <div className="space-y-3">
                {teacherActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.text)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:bg-blue-50/50 hover:border-blue-100 text-left transition-all duration-300 group"
                  >
                    <div className="bg-white p-2.5 rounded-xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                      <action.icon size={16} />
                    </div>
                    <span className="text-xs font-black text-gray-600 group-hover:text-blue-900 leading-tight">{action.text}</span>
                  </button>
                ))}
              </div>

              <div className="mt-10 p-5 bg-gray-900 rounded-[2rem] text-white">
                 <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{isConnected ? 'System Online' : 'Offline Mode'}</span>
                 </div>
                 <p className="text-[10px] font-medium text-gray-400 leading-relaxed">Neural processing cores are active. Ready for pedagogical synthesis.</p>
              </div>
           </div>
        </div>

        {/* Neural Interface (Chat Area) */}
        <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
           {/* Chat Indicator */}
           <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Atmosphere Real-time Resonance</span>
              </div>
              <MdHistory className="text-xl text-gray-300 hover:text-blue-600 transition-colors cursor-pointer" />
           </div>

           {/* Transcript */}
           <div className="flex-1 overflow-y-auto p-10 space-y-2 custom-scrollbar bg-gray-50/20">
              {messages.map(renderMessage)}
              {isTyping && (
                <div className="flex justify-start mb-8 animate-pulse">
                  <div className="bg-white border border-gray-50 rounded-[2rem] px-6 py-4 flex items-center gap-3 shadow-sm">
                    <Loader2 size={16} className="text-blue-500 animate-spin" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">AI is synthesizing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           {/* Input Chamber */}
           <div className="p-8 border-t border-gray-50 bg-white">
              <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-[2rem] border border-gray-100 shadow-inner group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                 <input
                   ref={inputRef}
                   type="text"
                   value={inputMessage}
                   onChange={(e) => setInputMessage(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                   placeholder="Ask about architecture, curriculum, or individual student trajectories..."
                   className="flex-1 px-6 py-4 bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-800 placeholder:text-gray-300"
                   disabled={isTyping}
                 />
                 <button
                   onClick={handleSendMessage}
                   disabled={!inputMessage.trim() || isTyping}
                   className={`p-4 rounded-[1.5rem] shadow-xl flex items-center justify-center transition-all ${
                     !inputMessage.trim() || isTyping ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-blue-400 hover:scale-105 active:scale-95 shadow-blue-900/10'
                   }`}
                 >
                   {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                 </button>
              </div>
           </div>

           {/* Error toast overlay inside chat if any */}
           {error && (
             <div className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 z-50">
                <AlertCircle size={14} />
                {error}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AiTeacher;
