import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { LogoutButton } from '../common/LogoutButton';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export const Header: React.FC = () => {
  const { user } = useAuth();
  const { isOpen, setIsOpen, onlineUsers } = useChat();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Fetch unread notification count
  const { data: notificationCount = 0 } = useQuery({
    queryKey: ["/api/notifications/count", user?.id],
    queryFn: () => apiRequest(`/api/notifications/count?recipientId=${user?.id}`),
    enabled: !!user?.id,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (!user) return null;

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-graduation-cap text-white text-sm" data-testid="header-logo"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900" data-testid="header-title">EduManage</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Chat Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="button-chat-toggle"
            >
              <i className="fas fa-comments text-xl"></i>
              {onlineUsers.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" data-testid="chat-indicator"></span>
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
              onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
              data-testid="button-notifications"
            >
              <i className="fas fa-bell text-xl"></i>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center" data-testid="notification-count">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm" data-testid="user-initials">
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900" data-testid="user-name">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 capitalize" data-testid="user-role">
                  {user.role}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={isNotificationPanelOpen} 
        onClose={() => setIsNotificationPanelOpen(false)} 
      />
    </header>
  );
};
