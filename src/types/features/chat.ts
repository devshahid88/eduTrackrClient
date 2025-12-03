export interface ChatListItem {
  chatId: string;
  contact: {
    _id: string;
    username: string;
  };
  contactModel: 'Teacher' | 'Student';
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface ChatMessage {
  _id: string;
  id?: string;
  chatId: string;
  sender: string;
  senderModel: 'Student' | 'Teacher';
  message?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document';
  reactions?: { reaction: string; userId: string }[];
  timestamp: string;
  isError?: boolean;
  isDeleted?: boolean;
  replyTo?: Partial<ChatMessage>;
}

export interface ChatStudentState {
  userId: string;
  token: string;
  departmentId: string;
}
