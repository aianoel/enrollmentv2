import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { io, Socket } from 'socket.io-client';

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
  conversations: any[];
  loadConversation: (partnerId: number) => Promise<void>;
  selectedConversation: any;
  setSelectedConversation: (conversation: any) => void;
  unreadCount: number;
  newMessageNotification: any;
  clearNotification: () => void;
  markChatAsRead: () => void;
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
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessageNotification, setNewMessageNotification] = useState<any>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user) {
      const newSocket = io();
      setSocket(newSocket);

      // Join user room for receiving messages
      newSocket.emit('join_user', user.id);

      // Listen for new messages
      newSocket.on('new_message', (message) => {
        const newMsg = {
          id: message.id.toString(),
          senderId: message.senderId.toString(),
          senderName: message.senderName,
          message: message.message,
          timestamp: message.createdAt,
          recipientId: message.recipientId?.toString()
        };
        
        setMessages(prev => [...prev, newMsg]);
        
        // Show notification if chat is closed or different conversation
        if (!isOpen || selectedConversation?.id !== message.senderId) {
          setUnreadCount(prev => prev + 1);
          setNewMessageNotification({
            id: Date.now(),
            senderName: message.senderName,
            message: message.message,
            timestamp: new Date()
          });
          
          // Play notification sound
          playNotificationSound();
          
          // Show browser notification if supported
          showBrowserNotification(message.senderName, message.message);
        }
      });

      // Listen for user status updates
      newSocket.on('user_status_update', (data) => {
        setOnlineUsers(prev => prev.map(user => 
          user.id === data.userId.toString() 
            ? { ...user, isOnline: data.isOnline }
            : user
        ));
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, isOpen, selectedConversation]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuJ0PPWfiwFJnzJ8du');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if audio can't play
    } catch (error) {
      // Ignore audio errors
    }
  };

  const showBrowserNotification = (senderName: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const messageText = message || 'New message';
      const notification = new Notification(`New message from ${senderName}`, {
        body: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText,
        icon: '/favicon.ico',
        tag: 'chat-message'
      });
      
      notification.onclick = () => {
        window.focus();
        setIsOpen(true);
        notification.close();
      };
      
      setTimeout(() => notification.close(), 5000);
    }
  };

  const clearNotification = () => {
    setNewMessageNotification(null);
  };

  const markChatAsRead = () => {
    setUnreadCount(0);
    clearNotification();
  };

  // Load conversations
  useEffect(() => {
    if (user) {
      loadConversations();
      loadOnlineUsers();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const response = await apiRequest(`/api/chat/conversations?userId=${user.id}`);
      setConversations(response);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      const response = await apiRequest('/api/chat/online-users');
      setOnlineUsers(response.map((user: any) => ({
        id: user.id.toString(),
        name: user.name,
        role: user.role,
        isOnline: user.isOnline
      })));
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  };

  const loadConversation = async (partnerId: number) => {
    if (!user) return;
    try {
      const response = await apiRequest(`/api/chat/messages?userId=${user.id}&partnerId=${partnerId}`);
      setMessages(response.map((msg: any) => ({
        id: msg.id.toString(),
        senderId: msg.senderId.toString(),
        senderName: msg.senderName || 'Unknown',
        message: msg.message,
        timestamp: msg.createdAt,
        recipientId: msg.recipientId?.toString()
      })));
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const sendMessage = async (message: string, recipientId?: string): Promise<void> => {
    if (!user || !recipientId) return;
    
    try {
      await apiRequest('/api/chat/messages', 'POST', {
        senderId: user.id,
        recipientId: parseInt(recipientId),
        content: message
      });

      // Also emit via socket for real-time updates
      if (socket) {
        socket.emit('send_message', {
          senderId: user.id,
          recipientId: parseInt(recipientId),
          content: message
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsOnline = () => {
    if (!user) return;
    updateUserStatus(true);
  };

  const markAsOffline = () => {
    if (!user) return;
    updateUserStatus(false);
  };

  const updateUserStatus = async (isOnline: boolean) => {
    if (!user) return;
    try {
      await apiRequest('/api/chat/user-status', 'PUT', {
        userId: user.id,
        isOnline
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const value = {
    messages,
    onlineUsers,
    isOpen,
    setIsOpen,
    sendMessage,
    markAsOnline,
    markAsOffline,
    conversations,
    loadConversation,
    selectedConversation,
    setSelectedConversation,
    unreadCount,
    newMessageNotification,
    clearNotification,
    markChatAsRead
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};