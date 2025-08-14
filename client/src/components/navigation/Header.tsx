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
      <div className="w-full px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-3 p-2 text-white/80 hover:text-white hover:bg-white/10"
                onClick={onMenuClick}
                data-testid="button-mobile-menu"
              >
                <i className="fas fa-bars text-lg"></i>
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <i className="fas fa-graduation-cap text-white text-lg" data-testid="header-logo"></i>
              </div>
              <h1 className="text-xl font-bold text-white" data-testid="header-title">EduManage</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Chat Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2.5 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="button-chat-toggle"
            >
              <i className="fas fa-comments text-lg"></i>
              {onlineUsers.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 shadow-sm" data-testid="chat-indicator"></span>
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2.5 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
              data-testid="button-notifications"
            >
              <i className="fas fa-bell text-lg"></i>
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center shadow-sm" data-testid="notification-count">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-3 ml-2">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm" data-testid="user-initials">
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
