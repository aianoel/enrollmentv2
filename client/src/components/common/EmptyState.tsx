import React from 'react';

interface EmptyStateProps {
  icon?: string;
  message: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'fas fa-inbox',
  message,
  description,
  action
}) => {
  return (
    <div className="text-center py-12">
      <i className={`${icon} text-4xl text-gray-400 mb-4`}></i>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      {description && (
        <p className="text-gray-500 mb-4">{description}</p>
      )}
      {action && action}
    </div>
  );
};
