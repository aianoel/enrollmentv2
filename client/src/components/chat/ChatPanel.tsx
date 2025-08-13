import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { X, Send, Users, MessageSquare } from 'lucide-react';

export const ChatPanel: React.FC = () => {
  const { user } = useAuth();
  const { 
    isOpen, 
    setIsOpen, 
    messages, 
    sendMessage, 
    onlineUsers, 
    conversations, 
    loadConversation,
    selectedConversation,
    setSelectedConversation 
  } = useChat();
  
  const [messageText, setMessageText] = useState('');
  const [view, setView] = useState<'conversations' | 'users' | 'chat'>('conversations');

  // Get all users for starting new conversations
  const { data: allUsers = [] } = useQuery({
    queryKey: ['/api/users'],
    enabled: isOpen && view === 'users'
  });

  if (!isOpen || !user) return null;

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    await sendMessage(messageText, selectedConversation.partnerId?.toString());
    setMessageText('');
  };

  const startConversation = (targetUser: any) => {
    setSelectedConversation({
      partnerId: targetUser.id,
      partnerName: targetUser.name,
      partnerRole: targetUser.role
    });
    setView('chat');
    loadConversation(targetUser.id);
  };

  const openExistingConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    setView('chat');
    loadConversation(conversation.partnerId);
  };

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-40 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold" data-testid="chat-title">
            {view === 'chat' && selectedConversation 
              ? `Chat with ${selectedConversation.partnerName}`
              : 'Chat System'
            }
          </h3>
          <div className="flex items-center gap-2">
            {view === 'chat' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:text-primary-foreground/80 p-1"
                onClick={() => setView('conversations')}
                data-testid="button-back-conversations"
              >
                ←
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:text-primary-foreground/80 p-1"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      {view !== 'chat' && (
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <Button
            variant={view === 'conversations' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 rounded-none"
            onClick={() => setView('conversations')}
            data-testid="tab-conversations"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chats
          </Button>
          <Button
            variant={view === 'users' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 rounded-none"
            onClick={() => setView('users')}
            data-testid="tab-users"
          >
            <Users className="h-4 w-4 mr-2" />
            Users
          </Button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {view === 'conversations' && (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new chat from the Users tab</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => openExistingConversation(conversation)}
                    data-testid={`conversation-${conversation.partnerId}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {conversation.partnerName?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{conversation.partnerName}</p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}

        {view === 'users' && (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {allUsers
                .filter((u: any) => u.id !== user.id)
                .map((targetUser: any) => (
                  <div
                    key={targetUser.id}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => startConversation(targetUser)}
                    data-testid={`user-${targetUser.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {targetUser.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {onlineUsers.some(ou => ou.id === targetUser.id.toString() && ou.isOnline) && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{targetUser.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{targetUser.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        )}

        {view === 'chat' && selectedConversation && (
          <>
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user.id.toString() ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${message.id}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.senderId === user.id.toString()
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  data-testid="input-message"
                />
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
        )}
      </div>
    </div>
  );
};
