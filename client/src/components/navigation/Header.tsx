import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { LogoutButton } from '../common/LogoutButton';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface HeaderProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, isMobile = false }) => {
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
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-3 p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                onClick={onMenuClick}
                data-testid="button-mobile-menu"
              >
                <i className="fas fa-bars text-lg"></i>
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 saas-gradient-bg rounded-xl flex items-center justify-center shadow-sm">
                <i className="fas fa-graduation-cap text-white text-base" data-testid="header-logo"></i>
              </div>
              <h1 className="text-lg sm:text-xl font-bold saas-text-gradient" data-testid="header-title">EduManage</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Chat Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="button-chat-toggle"
            >
              <i className="fas fa-comments text-lg"></i>
              {onlineUsers.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full shadow-sm" data-testid="chat-indicator"></span>
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
              data-testid="button-notifications"
            >
              <i className="fas fa-bell text-lg"></i>
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 saas-badge saas-badge-error min-w-[18px] h-[18px] flex items-center justify-center text-xs font-semibold" data-testid="notification-count">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-3 ml-2">
              <div className="w-9 h-9 saas-gradient-bg rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm" data-testid="user-initials">
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900" data-testid="user-name">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 capitalize font-medium" data-testid="user-role">
                  {user.role.replace('_', ' ')}
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
