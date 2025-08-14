import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { io, Socket } from 'socket.io-client';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
  ScrollArea,
} from '@/components/ui/scroll-area';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Send,
  Users,
  MessageSquare,
  Circle,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  X,
  ArrowLeft,
  Minimize2,
  MessageCircle,
} from 'lucide-react';
import type { User, Message, UserStatus } from '@shared/schema';

// Form schema for sending messages
const messageFormSchema = z.object({
  messageText: z.string().min(1, 'Message cannot be empty'),
});

type MessageFormData = z.infer<typeof messageFormSchema>;

interface ConversationWithDetails {
  id: string;
  conversationType: 'private' | 'group';
  partnerId?: number;
  partnerName?: string;
  partnerRole?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  createdAt: string;
}

interface OnlineUser {
  userId: number;
  user?: User;
  isOnline: boolean;
  lastSeen?: string;
}

export function FacebookStyleChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form for sending messages
  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      messageText: '',
    },
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/chat/conversations'],
    queryFn: () => apiRequest(`/api/chat/conversations?userId=${user?.id}`),
    enabled: !!user,
    refetchInterval: 5000,
  });

  // Fetch all users for online status
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    enabled: !!user,
  });

  // Fetch online users
  const { data: onlineUsers = [] } = useQuery<User[]>({
    queryKey: ['/api/chat/online-users'],
    refetchInterval: 10000,
    enabled: !!user,
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/chat/messages', selectedConversation?.partnerId],
    queryFn: () => 
      selectedConversation?.partnerId
        ? apiRequest(`/api/chat/messages?userId=${user?.id}&partnerId=${selectedConversation.partnerId}`)
        : Promise.resolve([]),
    enabled: !!user && !!selectedConversation?.partnerId,
    refetchInterval: 2000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { senderId: number; recipientId: number; messageText: string }) => {
      return apiRequest('/api/chat/messages', 'POST', messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      setMessageText('');
      messageForm.reset();
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user) {
      const newSocket = io();
      setSocket(newSocket);

      newSocket.emit('join_user', user.id);

      newSocket.on('new_message', (message) => {
        queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
        queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      });

      newSocket.on('user_online', (data) => {
        queryClient.invalidateQueries({ queryKey: ['/api/chat/online-users'] });
      });

      newSocket.on('user_offline', (data) => {
        queryClient.invalidateQueries({ queryKey: ['/api/chat/online-users'] });
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, queryClient]);

  // Auto-scroll to bottom when new messages arrive or conversation changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedConversation]);

  // Scroll to bottom when component mounts or conversation is selected
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    };
    
    // Scroll immediately and after a short delay to ensure content is rendered
    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation || !user) return;

    const recipientId = selectedConversation.partnerId;
    
    if (!recipientId) {
      toast({
        title: 'Error',
        description: 'Cannot identify message recipient',
        variant: 'destructive',
      });
      return;
    }

    const messageData = {
      senderId: user.id,
      recipientId: recipientId,
      messageText: messageText.trim(),
    };

    sendMessageMutation.mutate(messageData);
    setMessageText('');
    
    // Scroll to bottom after sending message
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startConversation = (targetUser: User) => {
    // Check if conversation already exists
    const existingConversation = conversations.find((conv: ConversationWithDetails) => 
      conv.partnerId === targetUser.id
    );

    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      // Create new conversation object
      const newConversation: ConversationWithDetails = {
        id: `conv_${Math.min(user?.id || 0, targetUser.id)}_${Math.max(user?.id || 0, targetUser.id)}`,
        conversationType: 'private',
        partnerId: targetUser.id,
        partnerName: targetUser.name,
        partnerRole: targetUser.role,
        lastMessage: '',
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      };
      setSelectedConversation(newConversation);
    }
  };

  const isUserOnline = (userId: number) => {
    // Check if the API returns user objects directly (current format)
    if (onlineUsers.length > 0 && 'id' in onlineUsers[0]) {
      return onlineUsers.some((user: User) => user.id === userId);
    }
    // Fallback to status objects format
    return (onlineUsers as unknown as OnlineUser[]).some((status: OnlineUser) => status.userId === userId && status.isOnline);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'teacher': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'parent': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'guidance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'registrar': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'accounting': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  // Filter online users based on search
  const filteredOnlineUsers = (() => {
    // If onlineUsers API returns user objects directly
    if (onlineUsers.length > 0 && 'id' in onlineUsers[0]) {
      return onlineUsers.filter((u: User) => 
        u.id !== user?.id && 
        u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Otherwise, filter from all users and check online status
    return (users as User[]).filter((u: User) => 
      u.id !== user?.id && 
      isUserOnline(u.id) &&
      u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  })();

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv: ConversationWithDetails) =>
    conv.partnerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
          <Button
            onClick={() => setIsMinimized(false)}
            className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-xl"
            data-testid="button-expand-chat"
          >
            <MessageCircle className="h-7 w-7 text-white" />
          </Button>
          {filteredOnlineUsers.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {filteredOnlineUsers.length}
            </div>
          )}
          {filteredOnlineUsers.length === 0 && onlineUsers.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {onlineUsers.length}
            </div>
          )}
          <div className="absolute bottom-0 right-1 bg-green-500 rounded-full h-4 w-4 border-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-4 w-96 h-[500px] bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-t-lg z-50 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          {selectedConversation ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-primary-foreground hover:text-primary-foreground/80"
                onClick={() => setSelectedConversation(null)}
                data-testid="button-back-chat-list"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium text-sm">{selectedConversation.partnerName}</span>
              {selectedConversation.partnerId && isUserOnline(selectedConversation.partnerId) && (
                <Circle className="h-2 w-2 fill-green-400 text-green-400" />
              )}
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium text-sm">Chat</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedConversation && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-primary-foreground hover:text-primary-foreground/80"
                data-testid="button-voice-call"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-primary-foreground hover:text-primary-foreground/80"
                data-testid="button-video-call"
              >
                <Video className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-primary-foreground hover:text-primary-foreground/80"
            onClick={() => setIsMinimized(true)}
            data-testid="button-minimize-chat"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedConversation ? (
        // Chat View
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-3 max-h-80 overflow-y-auto">
            <div className="space-y-2 min-h-full">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((message: Message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-2xl word-wrap break-words ${
                        message.senderId === user.id
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.messageText}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === user.id 
                          ? 'text-primary-foreground/70' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.createdAt || new Date())}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky bottom-0">
            <div className="flex items-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 mb-1"
                data-testid="button-attach-file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="pr-16 min-h-[40px] resize-none rounded-full"
                  data-testid="input-message"
                  autoComplete="off"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6"
                    data-testid="button-emoji"
                  >
                    <Smile className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    size="sm"
                    className="p-1 h-6 w-6 rounded-full"
                    data-testid="button-send-message"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Main Chat List View
        <div className="flex-1 flex">
          {/* Conversations List */}
          <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 text-sm"
                  data-testid="input-search"
                />
              </div>
            </div>

            {/* Conversations */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredConversations.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No conversations</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation: ConversationWithDetails) => (
                    <div
                      key={conversation.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedConversation(conversation)}
                      data-testid={`conversation-${conversation.partnerId}`}
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {conversation.partnerName?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.partnerId && isUserOnline(conversation.partnerId) && (
                          <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500 border-2 border-white dark:border-gray-900" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-xs truncate">{conversation.partnerName}</p>
                          {conversation.unreadCount && conversation.unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conversation.lastMessage || 'Start a conversation'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Online Users Sidebar */}
          <div className="w-24 flex flex-col bg-gray-50 dark:bg-gray-800">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center">
                <Circle className="h-2 w-2 fill-green-500 text-green-500 mr-1" />
                <span className="text-xs font-medium">{filteredOnlineUsers.length}</span>
              </div>
            </div>
            
            <ScrollArea className="flex-1 h-[400px] max-h-[60vh]">
              <div className="p-1">
                {filteredOnlineUsers.map((onlineUser: User) => (
                  <div
                    key={onlineUser.id}
                    className="flex flex-col items-center p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer mb-2"
                    onClick={() => startConversation(onlineUser)}
                    data-testid={`online-user-${onlineUser.id}`}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-xs">
                          {onlineUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500 border-2 border-white dark:border-gray-800" />
                    </div>
                    <span className="text-xs text-center truncate w-full mt-1" title={onlineUser.name}>
                      {onlineUser.name.split(' ')[0]}
                    </span>
                    <Badge variant="outline" className={`text-xs px-1 py-0 mt-1 ${getRoleColor(onlineUser.role)}`}>
                      {onlineUser.role}
                    </Badge>
                  </div>
                ))}
                
                {filteredOnlineUsers.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    <Users className="h-6 w-6 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">No users online</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}