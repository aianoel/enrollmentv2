import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ref, push, onValue, serverTimestamp, set, onDisconnect } from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { ChatMessage } from '@shared/schema';

interface OnlineUser {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
  lastSeen: string;
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
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Listen to chat messages
  useEffect(() => {
    if (!user) return;

    const messagesRef = ref(database, 'chat/messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const messageList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setMessages(messageList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      }
    });

    return unsubscribe;
  }, [user]);

  // Listen to online users
  useEffect(() => {
    if (!user) return;

    const presenceRef = ref(database, 'presence');
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setOnlineUsers(userList.filter(u => u.isOnline));
      }
    });

    return unsubscribe;
  }, [user]);

  // Mark user as online when they connect
  useEffect(() => {
    if (!user || !userProfile) return;

    const presenceRef = ref(database, `presence/${user.uid}`);
    const connectedRef = ref(database, '.info/connected');
    
    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // Set user as online
        set(presenceRef, {
          id: user.uid,
          name: `${userProfile.firstName} ${userProfile.lastName}`,
          role: userProfile.role,
          isOnline: true,
          lastSeen: serverTimestamp(),
        });

        // Remove user when they disconnect
        onDisconnect(presenceRef).set({
          id: user.uid,
          name: `${userProfile.firstName} ${userProfile.lastName}`,
          role: userProfile.role,
          isOnline: false,
          lastSeen: serverTimestamp(),
        });
      }
    });
  }, [user, userProfile]);

  const sendMessage = async (message: string, recipientId?: string) => {
    if (!user || !userProfile) return;

    const messagesRef = ref(database, 'chat/messages');
    const newMessage: Omit<ChatMessage, 'id'> = {
      senderId: user.uid,
      recipientId,
      message: message.trim(),
      type: 'text',
      isEdited: false,
      timestamp: new Date().toISOString(),
    };

    try {
      await push(messagesRef, newMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const markAsOnline = () => {
    if (!user || !userProfile) return;
    
    const presenceRef = ref(database, `presence/${user.uid}`);
    set(presenceRef, {
      id: user.uid,
      name: `${userProfile.firstName} ${userProfile.lastName}`,
      role: userProfile.role,
      isOnline: true,
      lastSeen: serverTimestamp(),
    });
  };

  const markAsOffline = () => {
    if (!user || !userProfile) return;
    
    const presenceRef = ref(database, `presence/${user.uid}`);
    set(presenceRef, {
      id: user.uid,
      name: `${userProfile.firstName} ${userProfile.lastName}`,
      role: userProfile.role,
      isOnline: false,
      lastSeen: serverTimestamp(),
    });
  };

  return (
    <ChatContext.Provider value={{
      messages,
      onlineUsers,
      isOpen,
      setIsOpen,
      sendMessage,
      markAsOnline,
      markAsOffline,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
