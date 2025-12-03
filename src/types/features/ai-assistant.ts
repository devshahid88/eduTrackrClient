// In your types file (e.g., src/types/index.ts)
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
  category: string;
}

export interface AiChatRequest {
  message: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  timestamp: string;
}

export interface AiChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  timestamp?: string;
}
