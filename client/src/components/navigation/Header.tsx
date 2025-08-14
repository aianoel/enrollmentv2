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
  const { isOpen, setIsOpen, onlineUsers, unreadCount = 0, markChatAsRead } = useChat();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Temporarily disable notification count due to schema issues
  const notificationCount = 0;

  if (!user) return null;

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 shadow-lg">
      <div className="w-full px-3 sm:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            {/* Mobile menu button - always show on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="mr-2 sm:mr-3 p-2 text-white/80 hover:text-white hover:bg-white/10 lg:hidden"
              onClick={onMenuClick}
              data-testid="button-mobile-menu"
            >
              <i className="fas fa-bars text-base sm:text-lg"></i>
            </Button>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg rounded-md">
                <i className="fas fa-graduation-cap text-white text-base sm:text-lg" data-testid="header-logo"></i>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white hidden xs:block" data-testid="header-title">EduManage</h1>
              <h1 className="text-base font-bold text-white xs:hidden" data-testid="header-title-mobile">EM</h1>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Chat Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 sm:p-2.5 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                setIsOpen(!isOpen);
                if (!isOpen) markChatAsRead?.();
              }}
              data-testid="button-chat-toggle"
            >
              <i className="fas fa-comments text-base sm:text-lg"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 text-white text-xs flex items-center justify-center shadow-sm animate-pulse rounded-full" data-testid="chat-unread-count">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {onlineUsers.length > 0 && unreadCount === 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 shadow-sm" data-testid="chat-indicator"></span>
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 sm:p-2.5 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
              data-testid="button-notifications"
            >
              <i className="fas fa-bell text-base sm:text-lg"></i>
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 text-white text-xs flex items-center justify-center shadow-sm rounded-full" data-testid="notification-count">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-1 sm:space-x-3 ml-1 sm:ml-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg rounded-md">
                <span className="text-white font-semibold text-xs sm:text-sm" data-testid="user-initials">
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-white" data-testid="user-name">
                  {user.name}
                </p>
                <p className="text-xs text-white/70 capitalize font-medium" data-testid="user-role">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
              <div className="hidden sm:block">
                <LogoutButton />
              </div>
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
