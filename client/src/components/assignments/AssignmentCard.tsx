import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Assignment } from '@shared/schema';

interface AssignmentCardProps {
  assignment: Assignment;
  onSubmit?: (assignmentId: string) => void;
  onDownload?: (assignmentId: string) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onSubmit,
  onDownload
}) => {
  const getDueStatus = () => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-700' };
    if (diffDays === 0) return { label: 'Due Today', color: 'bg-red-100 text-red-700' };
    if (diffDays === 1) return { label: 'Due Tomorrow', color: 'bg-red-100 text-red-700' };
    if (diffDays <= 3) return { label: `Due in ${diffDays} days`, color: 'bg-orange-100 text-orange-700' };
    return { label: `Due in ${diffDays} days`, color: 'bg-blue-100 text-blue-700' };
  };

  const getTypeIcon = () => {
    const iconMap = {
      assignment: 'fas fa-file-alt',
      quiz: 'fas fa-question-circle',
      exam: 'fas fa-clipboard-list',
      project: 'fas fa-project-diagram'
    };
    return iconMap[assignment.type] || 'fas fa-file-alt';
  };

  const getTypeColor = () => {
    const colorMap = {
      assignment: 'text-blue-600 bg-blue-100',
      quiz: 'text-green-600 bg-green-100',
      exam: 'text-red-600 bg-red-100',
      project: 'text-purple-600 bg-purple-100'
    };
    return colorMap[assignment.type] || 'text-gray-600 bg-gray-100';
  };

  const dueStatus = getDueStatus();

  return (
    <Card className="hover-lift border border-gray-200" data-testid={`assignment-card-${assignment.id}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${dueStatus.color}`}>
            {dueStatus.label}
          </span>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor()}`}>
            <i className={`${getTypeIcon()} text-sm`}></i>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2" data-testid={`assignment-title-${assignment.id}`}>
          {assignment.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2" data-testid={`assignment-description-${assignment.id}`}>
          {assignment.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Subject:</span>
            <span className="font-medium">Subject Name</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Teacher:</span>
            <span className="font-medium">Teacher Name</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Points:</span>
            <span className="font-medium">{assignment.points}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium capitalize">{assignment.type}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {onSubmit && (
            <Button 
              className="flex-1 bg-primary-600 hover:bg-primary-700"
              onClick={() => onSubmit(assignment.id)}
              data-testid={`button-submit-${assignment.id}`}
            >
              Submit Work
            </Button>
          )}
          {onDownload && assignment.attachments.length > 0 && (
            <Button
              variant="outline"
              className="px-4"
              onClick={() => onDownload(assignment.id)}
              data-testid={`button-download-${assignment.id}`}
            >
              <i className="fas fa-download"></i>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
