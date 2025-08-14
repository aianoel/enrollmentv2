import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { io, Socket } from "socket.io-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ScrollArea,
} from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
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
} from "lucide-react";
import type { User, Conversation, Message, UserStatus } from "@shared/schema";

// Form schemas
const conversationFormSchema = z.object({
  conversationType: z.enum(["private", "group"]),
  memberIds: z.array(z.number()).min(1, "At least one member is required"),
});

const messageFormSchema = z.object({
  messageText: z.string().min(1, "Message cannot be empty"),
});

type ConversationFormData = z.infer<typeof conversationFormSchema>;
type MessageFormData = z.infer<typeof messageFormSchema>;

interface ConversationWithDetails extends Conversation {
  members?: User[];
  lastMessage?: Message;
  unreadCount?: number;
}

export function EnhancedChatSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [typingUsers, setTypingUsers] = useState<{[key: number]: string}>({});
  const [onlineUsers, setOnlineUsers] = useState<UserStatus[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch data
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/chat/conversations", user?.id],
    queryFn: () => apiRequest(`/api/chat/conversations?userId=${user?.id}`),
    enabled: !!user?.id
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chat/messages", user?.id, (selectedConversation as any)?.partnerId],
    queryFn: () => {
      const partnerId = (selectedConversation as any)?.partnerId;
      return apiRequest(`/api/chat/messages?userId1=${user?.id}&userId2=${partnerId}`);
    },
    enabled: !!(selectedConversation as any)?.partnerId && !!user?.id,
    refetchInterval: 5000 // Fallback polling
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("/api/users")
  });

  // Forms
  const conversationForm = useForm<ConversationFormData>({
    resolver: zodResolver(conversationFormSchema),
    defaultValues: {
      conversationType: "private",
      memberIds: [],
    },
  });

  // Mutations
  const createConversationMutation = useMutation({
    mutationFn: (data: ConversationFormData) => apiRequest("/api/chat/conversations", "POST", {
      ...data,
      currentUserId: user?.id // Add current user ID for conversation creation
    }),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      setIsNewConversationDialogOpen(false);
      conversationForm.reset();
      setSelectedConversation(newConversation);
      toast({ title: "Conversation created successfully" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: any) => apiRequest("/api/chat/messages", "POST", messageData),
    onSuccess: () => {
      const partnerId = (selectedConversation as any)?.partnerId;
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", user?.id, partnerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations", user?.id] });
      setMessageText("");
    },
  });

  // Socket.IO setup
  useEffect(() => {
    if (!user?.id) return;

    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    // Join user and get online status
    newSocket.emit('join_user', user.id);

    // Listen for new messages
    newSocket.on('new_message', (message: Message) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      
      // Show notification if message is not from current user
      if (message.senderId !== user.id) {
        const sender = users.find((u: User) => u.id === message.senderId);
        toast({
          title: `New message from ${sender?.name || 'Unknown'}`,
          description: message.messageText?.substring(0, 50) + (message.messageText && message.messageText.length > 50 ? '...' : ''),
        });
      }
    });

    // Listen for typing indicators
    newSocket.on('user_typing', (data: { conversationId: number, userId: number, userName: string }) => {
      if (data.conversationId === selectedConversation?.id && data.userId !== user.id) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: data.userName }));
      }
    });

    newSocket.on('user_stop_typing', (data: { conversationId: number, userId: number }) => {
      setTypingUsers(prev => {
        const updated = { ...prev };
        delete updated[data.userId];
        return updated;
      });
    });

    // Listen for online status changes
    newSocket.on('user_online', (data: { userId: number, isOnline: boolean }) => {
      setOnlineUsers(prev => {
        const updated = prev.filter(u => u.userId !== data.userId);
        if (data.isOnline) {
          updated.push({ userId: data.userId, isOnline: true, lastSeen: new Date() });
        }
        return updated;
      });
    });

    newSocket.on('user_offline', (data: { userId: number, isOnline: boolean }) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    return () => {
      newSocket.emit('user_offline', user.id);
      newSocket.disconnect();
    };
  }, [user?.id, queryClient, toast, users, selectedConversation?.id]);

  // Join conversation room when selected
  useEffect(() => {
    if (socket && selectedConversation?.id) {
      socket.emit('join_conversation', selectedConversation.id);
      
      // Mark conversation as read
      if (user?.id) {
        apiRequest(`/api/chat/conversations/${selectedConversation.id}/read`, "PATCH", {
          userId: user.id
        });
      }
    }
  }, [socket, selectedConversation?.id, user?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper functions
  const getUserName = (userId: number) => {
    const foundUser = users.find((u: User) => u.id === userId);
    return foundUser ? foundUser.name : `User ${userId}`;
  };

  const getUserRole = (userId: number) => {
    const foundUser = users.find((u: User) => u.id === userId);
    return foundUser ? foundUser.role : "unknown";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isUserOnline = (userId: number) => {
    return onlineUsers.some(status => status.userId === userId && status.isOnline);
  };

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation || !user) return;

    // Extract recipient ID from conversation
    const recipientId = (selectedConversation as any).partnerId;
    
    if (!recipientId) {
      toast({
        title: "Error",
        description: "Cannot identify message recipient",
        variant: "destructive",
      });
      return;
    }

    const messageData = {
      senderId: user.id,
      recipientId: recipientId,
      messageText: messageText.trim(),
    };

    // Send via HTTP API
    sendMessageMutation.mutate(messageData);
    
    setMessageText("");
    
    // Stop typing indicator
    if (socket) {
      socket.emit('typing_stop', {
        conversationId: selectedConversation.id,
        userId: user.id
      });
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedConversation || !user) return;

    // Send typing indicator
    socket.emit('typing_start', {
      conversationId: selectedConversation.id,
      userId: user.id,
      userName: user.name
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        conversationId: selectedConversation.id,
        userId: user.id
      });
    }, 3000);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      case 'parent': return 'bg-purple-100 text-purple-800';
      case 'guidance': return 'bg-yellow-100 text-yellow-800';
      case 'registrar': return 'bg-pink-100 text-pink-800';
      case 'accounting': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Messages</h2>
            <Dialog open={isNewConversationDialogOpen} onOpenChange={setIsNewConversationDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-new-conversation">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                  <DialogDescription>Start a new conversation with one or more users</DialogDescription>
                </DialogHeader>
                <Form {...conversationForm}>
                  <form onSubmit={conversationForm.handleSubmit((data) => createConversationMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={conversationForm.control}
                      name="conversationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="group">Group</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={conversationForm.control}
                      name="memberIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Members</FormLabel>
                          <Select onValueChange={(value) => {
                            const userId = parseInt(value);
                            if (!field.value.includes(userId)) {
                              field.onChange([...field.value, userId]);
                            }
                          }}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select users..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.filter((u: User) => u.id !== user.id).map((chatUser: User) => (
                                <SelectItem key={chatUser.id} value={chatUser.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <span>{chatUser.name}</span>
                                    <Badge variant="outline" className={getRoleColor(chatUser.role)}>
                                      {chatUser.role}
                                    </Badge>
                                    {isUserOnline(chatUser.id) && (
                                      <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {field.value.map((userId) => {
                              const selectedUser = users.find((u: User) => u.id === userId);
                              return selectedUser ? (
                                <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                                  {selectedUser.name}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                      field.onChange(field.value.filter(id => id !== userId));
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ) : null;
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsNewConversationDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createConversationMutation.isPending}>
                        Create Conversation
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-9" />
          </div>
          
          {/* Online Users Section */}
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Online Users ({onlineUsers.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {onlineUsers.slice(0, 6).map((status) => {
                const onlineUser = users.find((u: User) => u.id === status.userId);
                return onlineUser ? (
                  <div key={onlineUser.id} className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs">
                    <Circle className="h-1.5 w-1.5 fill-green-500 text-green-500" />
                    <span className="truncate max-w-20">{onlineUser.name}</span>
                  </div>
                ) : null;
              })}
              {onlineUsers.length > 6 && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs">
                  +{onlineUsers.length - 6} more
                </div>
              )}
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.map((conversation: Conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id 
                    ? 'bg-primary/10 border-primary/20 border' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedConversation(conversation)}
                data-testid={`conversation-${conversation.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {conversation.conversationType === 'group' ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          'PM'
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {conversation.conversationType === 'group' ? 'Group Chat' : 'Private Chat'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      Click to view messages...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedConversation.conversationType === 'group' ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        'PM'
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation.conversationType === 'group' ? 'Group Chat' : 'Private Chat'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {Object.keys(typingUsers).length > 0 
                        ? `${Object.values(typingUsers).join(', ')} typing...`
                        : 'Click to start chatting'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message: Message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[70%] ${message.senderId === user.id ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(getUserName(message.senderId))}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg px-3 py-2 ${
                        message.senderId === user.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        {message.senderId !== user.id && (
                          <p className="text-xs font-medium mb-1">
                            {getUserName(message.senderId)}
                            <Badge variant="outline" className={`ml-1 text-xs ${getRoleColor(getUserRole(message.senderId))}`}>
                              {getUserRole(message.senderId)}
                            </Badge>
                          </p>
                        )}
                        <p className="text-sm">{message.messageText}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    data-testid="input-message"
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!messageText.trim()}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}