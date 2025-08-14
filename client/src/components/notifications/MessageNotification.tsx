import React, { useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export const MessageNotification: React.FC = () => {
  const { newMessageNotification, clearNotification, setIsOpen } = useChat();

  useEffect(() => {
    if (newMessageNotification) {
      // Auto-clear notification after 5 seconds
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [newMessageNotification, clearNotification]);

  if (!newMessageNotification) return null;

  const handleClick = () => {
    setIsOpen(true);
    clearNotification();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearNotification();
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5">
      <Card 
        className="p-4 max-w-sm cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-l-4 border-l-blue-500"
        onClick={handleClick}
        data-testid="message-notification"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <i className="fas fa-comment text-blue-500"></i>
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                New message from {newMessageNotification.senderName}
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {newMessageNotification.message}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(newMessageNotification.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
            onClick={handleClose}
            data-testid="button-close-notification"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </div>
  );
};