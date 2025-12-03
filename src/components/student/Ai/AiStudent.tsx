import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  User as UserIcon, 
  Send, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw,
  Calculator,
  BookOpen,
  HelpCircle,
  Lightbulb,
  FileText,
  Brain
} from 'lucide-react';
import { AiMessage, QuickAction, AiChatRequest, AiChatResponse } from '../../../types/features/ai-assistant';
import { cn } from '../../../utils/cn';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const initialBotGreeting: AiMessage = {
  id: 1,
  type: 'ai',
  content:
    "Hello! I'm your AI study assistant. I'm here to help you with your studies, answer questions, explain concepts, and provide learning support. How can I assist you today?",
  timestamp: new Date(),
};

const quickActions: QuickAction[] = [
  { 
    text: 'Explain this math concept step by step', 
    icon: Calculator,
    category: 'math'
  },
  { 
    text: 'Help me understand this topic', 
    icon: Lightbulb,
    category: 'general'
  },
  { 
    text: 'Create a study plan for my exam', 
    icon: BookOpen,
    category: 'study'
  },
  { 
    text: 'Summarize key points from this text', 
    icon: FileText,
    category: 'summary'
  },
  { 
    text: 'Ask me practice questions', 
    icon: HelpCircle,
    category: 'practice'
  },
  { 
    text: 'Explain like I\'m 5 years old', 
    icon: Brain,
    category: 'explain'
  },
];

const AiStudent: React.FC = () => {
  // State management with proper typing
  const [messages, setMessages] = useState<AiMessage[]>([initialBotGreeting]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Refs for DOM manipulation
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Generate unique message ID
  const generateMessageId = (): number => {
    return Date.now() + Math.random();
  };

  // Send message to AI API
  const sendMessage = async (messageContent: string): Promise<void> => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: AiMessage = {
      id: generateMessageId(),
      type: 'user',
      content: messageContent.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      const requestData: AiChatRequest = {
        message: messageContent.trim(),
        conversationHistory: messages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AiChatResponse = await response.json();

      if (data.success && data.response) {
        const aiMessage: AiMessage = {
          id: generateMessageId(),
          type: 'ai',
          content: data.response,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Add error message to chat
      const errorAiMessage: AiMessage = {
        id: generateMessageId(),
        type: 'ai',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    sendMessage(input);
  };

  // Handle quick action click
  const handleQuickAction = (action: QuickAction): void => {
    setInput(action.text);
    inputRef.current?.focus();
  };

  // Copy message content to clipboard
  const copyToClipboard = async (messageId: number, content: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      toast.success('Message copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Failed to copy message');
    }
  };

  // Clear conversation
  const clearConversation = (): void => {
    setMessages([initialBotGreeting]);
    setError(null);
    toast.success('Conversation cleared');
  };

  // Retry last message
  const retryLastMessage = (): void => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(msg => msg.type === 'user');
    
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Study Assistant</h1>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  connected ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-sm text-gray-500">
                  {connected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={retryLastMessage}
              disabled={isLoading || messages.length <= 1}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Retry last message"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={clearConversation}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear conversation"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                  className="flex items-center space-x-2 p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconComponent className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{action.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex space-x-3",
              message.type === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.type === 'ai' && (
              <div className="flex-shrink-0">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full",
                  message.isError ? "bg-red-100" : "bg-blue-100"
                )}>
                  <Bot className={cn(
                    "w-5 h-5",
                    message.isError ? "text-red-600" : "text-blue-600"
                  )} />
                </div>
              </div>
            )}
            
            <div className={cn(
              "flex flex-col space-y-1 max-w-xs lg:max-w-md xl:max-w-lg",
              message.type === 'user' ? 'items-end' : 'items-start'
            )}>
              <div className={cn(
                "px-4 py-2 rounded-lg shadow-sm",
                message.type === 'user'
                  ? "bg-blue-600 text-white"
                  : message.isError
                  ? "bg-red-50 text-red-900 border border-red-200"
                  : "bg-white text-gray-900 border border-gray-200"
              )}>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatTimestamp(message.timestamp)}</span>
                {message.type === 'ai' && !message.isError && (
                  <button
                    onClick={() => copyToClipboard(message.id, message.content)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copy message"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6 py-2">
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your studies..."
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          AI responses may contain errors. Always verify important information.
        </div>
      </div>
    </div>
  );
};

export default AiStudent;
