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
  GraduationCap,
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

// Response shape from your backend
export interface AiChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  timestamp?: string;
}

// --- Component ---
const AiTeacher: React.FC = () => {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 1,
      type: 'ai',
      content:
        "Hello! I'm your AI teaching assistant. I can help you create lesson plans, generate assessments, analyze student performance, and provide educational guidance. How can I assist you today?",
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

  // Update with your actual API base URL
  const API_BASE_URL = 'http://localhost:3003';

  const teacherActions: QuickAction[] = [
    { text: 'Create a lesson plan for elementary math', icon: BookOpen },
    { text: 'Generate quiz questions for science chapter', icon: ClipboardList },
    { text: 'Analyze student performance data', icon: PieChart },
    { text: 'Create assessment rubric for writing assignment', icon: Award },
    { text: 'Suggest teaching strategies for visual learners', icon: Users },
    { text: 'Help with curriculum planning for next semester', icon: FileText },
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
    const payload = {
      message,
      context,
    };

    const response = await fetch(`${API_BASE_URL}/api/ai/teacher/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AiChatResponse = await response.json();
    if (!data.success || !data.response) {
      throw new Error(data.error || 'No response from AI');
    }

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
      const context = messages
        .slice(-3)
        .map((msg) => ({ type: msg.type, content: msg.content }));
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
      setError('Failed to get response from AI. Please try again.');
      setIsConnected(false);
      const errMsg: AiMessage = {
        id: Date.now() + 2,
        type: 'ai',
        content:
          "I apologize, but I'm having trouble connecting to the server right now. Please check your connection and try again.",
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
    setMessages([
      {
        id: 1,
        type: 'ai',
        content:
          "Hello! I'm your AI teaching assistant. How can I help you with your educational tasks today?",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  const exportChat = () => {
    const chatData = messages.map((msg) => ({
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
    }));
    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-teacher-chat-${new Date()
      .toISOString()
      .split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const onInputKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isTyping) {
      handleSendMessage();
    }
  };

  const renderMessage = (message: AiMessage) => (
    <div
      key={message.id}
      className={`flex ${
        message.type === 'user' ? 'justify-end' : 'justify-start'
      } mb-4 group`}
    >
      <div
        className={`flex items-start max-w-xs lg:max-w-md xl:max-w-lg ${
          message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div
          className={`flex-shrink-0 ${
            message.type === 'user' ? 'ml-2' : 'mr-2'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user'
                ? 'bg-green-500'
                : message.isError
                ? 'bg-red-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
          >
            {message.type === 'user' ? (
              <User size={16} className="text-white" />
            ) : message.isError ? (
              <AlertCircle size={16} className="text-white" />
            ) : (
              <Bot size={16} className="text-white" />
            )}
          </div>
        </div>
        <div
          className={`rounded-2xl px-4 py-3 shadow-md relative ${
            message.type === 'user'
              ? 'bg-green-500 text-white'
              : message.isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-white text-gray-800 border border-gray-200'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-xs ${
                message.type === 'user'
                  ? 'text-green-100'
                  : message.isError
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {message.type === 'ai' && !message.isError && (
              <button
                onClick={() => copyMessage(message.id, message.content)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded"
              >
                {copiedMessageId === message.id ? (
                  <Check size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} className="text-gray-500" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto h-full flex flex-col md:ml-64">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  AI Teaching Assistant
                </h1>
                <p className="text-gray-600">Your intelligent education companion</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={clearHistory}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Clear</span>
              </button>
              <button
                onClick={exportChat}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
          {/* Connection Status & Error */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Teaching Tools</h3>
              <div className="space-y-2">
                {teacherActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.text)}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group text-left"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                      <action.icon size={14} className="text-blue-600 group-hover:text-blue-700" />
                    </div>
                    <span className="text-sm font-medium">{action.text}</span>
                  </button>
                ))}
              </div>
              {/* API Status */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></div>
                  <span className="text-xs text-gray-600">
                    {isConnected ? 'Connected to AI Service' : 'Connection Issue'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col min-h-0">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}
                ></div>
                <span className="font-medium text-gray-800">
                  AI Teaching Assistant {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                  <History size={18} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(renderMessage)}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-2xl px-4 py-3">
                    <Loader2 size={16} className="text-blue-500 animate-spin" />
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={onInputChange}
                    onKeyPress={onInputKeyPress}
                    placeholder="Ask me about lesson planning, assessments, teaching strategies..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={isTyping}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiTeacher;
