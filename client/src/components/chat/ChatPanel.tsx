import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

export const ChatPanel: React.FC = () => {
  const { userProfile } = useAuth();
  const { messages, onlineUsers, isOpen, setIsOpen, sendMessage } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      await sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen || !userProfile) return null;

  return (
    <div className="fixed right-0 top-16 bottom-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-primary-600 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold" data-testid="chat-title">Chat</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-gray-200 p-1"
            onClick={() => setIsOpen(false)}
            data-testid="button-close-chat"
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>
      </div>

      {/* Online Users */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Online Now ({onlineUsers.length})</h4>
        <div className="space-y-2 max-h-24 overflow-y-auto">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-3" data-testid={`online-user-${user.id}`}>
              <div className="relative">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-sm">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white online-indicator"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          ))}
          {onlineUsers.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">No users online</p>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4" data-testid="chat-messages">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === userProfile.id;
          return (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              data-testid={`message-${message.id}`}
            >
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className={`font-medium text-xs ${isOwnMessage ? 'text-white bg-primary-600 rounded-full w-6 h-6 flex items-center justify-center' : 'text-primary-600'}`}>
                  {isOwnMessage ? 'You' : getInitials(message.senderId)}
                </span>
              </div>
              <div className="flex-1 max-w-xs">
                <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                  {!isOwnMessage && <span className="text-sm font-medium text-gray-900">User</span>}
                </div>
                <div className={`rounded-lg p-2 ${isOwnMessage ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
                  <p className="text-sm break-words">{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-sm"
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-primary-600 hover:bg-primary-700"
            disabled={!messageInput.trim()}
            data-testid="button-send-message"
          >
            <i className="fas fa-paper-plane"></i>
          </Button>
        </form>
      </div>
    </div>
  );
};
