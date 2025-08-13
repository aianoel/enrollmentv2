import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useAuth } from './AuthContext';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  recipientId?: string;
}

interface OnlineUser {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
}

interface ChatContextType {
  messages: ChatMessage[];
  onlineUsers: OnlineUser[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sendMessage: (message: string, recipientId?: string) => Promise<void>;
  markAsOnline: () => void;
  markAsOffline: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Placeholder functions for PostgreSQL chat implementation
  const sendMessage = async (message: string, recipientId?: string): Promise<void> => {
    if (!user) return;
    
    // TODO: Implement PostgreSQL chat message sending
    console.log('Chat message (PostgreSQL not yet implemented):', message);
    
    // For now, add message locally for testing
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id.toString(),
      senderName: user.name,
      message,
      timestamp: new Date().toISOString(),
      recipientId
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const markAsOnline = () => {
    if (!user) return;
    // TODO: Implement PostgreSQL presence tracking
    console.log('User marked as online (PostgreSQL not yet implemented)');
  };

  const markAsOffline = () => {
    if (!user) return;
    // TODO: Implement PostgreSQL presence tracking  
    console.log('User marked as offline (PostgreSQL not yet implemented)');
  };

  const value = {
    messages,
    onlineUsers,
    isOpen,
    setIsOpen,
    sendMessage,
    markAsOnline,
    markAsOffline,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};