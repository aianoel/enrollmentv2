import React from 'react';
import { Button } from '../ui/button';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { EnhancedChatSystem } from './EnhancedChatSystem';
import { X } from 'lucide-react';

export const ChatPanel: React.FC = () => {
  const { user } = useAuth();
  const { isOpen, setIsOpen } = useChat();

  if (!isOpen || !user) return null;

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold" data-testid="chat-title">Enhanced Chat System</h3>
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

      {/* Enhanced Chat System */}
      <div className="flex-1">
        <EnhancedChatSystem />
      </div>
    </div>
  );
};
