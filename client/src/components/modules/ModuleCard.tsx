import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { LearningModule } from '@shared/schema';
import { formatFileSize, getFileIcon } from '../../utils/firebaseHelpers';

interface ModuleCardProps {
  module: LearningModule;
  onDownload?: (moduleId: string) => void;
  onView?: (moduleId: string) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  onDownload,
  onView
}) => {
  const getFileTypeColor = () => {
    if (module.fileType.includes('pdf')) return 'text-red-600 bg-red-100';
    if (module.fileType.includes('word')) return 'text-blue-600 bg-blue-100';
    if (module.fileType.includes('video')) return 'text-purple-600 bg-purple-100';
    if (module.fileType.includes('image')) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getFileTypeLabel = () => {
    if (module.fileType.includes('pdf')) return 'PDF';
    if (module.fileType.includes('word')) return 'DOC';
    if (module.fileType.includes('video')) return 'Video';
    if (module.fileType.includes('image')) return 'Image';
    return 'File';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover-lift border border-gray-200" data-testid={`module-card-${module.id}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileTypeColor()}`}>
            <i className={`${getFileIcon(module.fileType)} text-xl`}></i>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFileTypeColor()}`}>
            {getFileTypeLabel()}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2" data-testid={`module-title-${module.id}`}>
          {module.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2" data-testid={`module-description-${module.id}`}>
          {module.description}
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
            <span className="text-gray-500">Size:</span>
            <span className="font-medium">{formatFileSize(module.fileSize)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Uploaded:</span>
            <span className="font-medium">{formatDate(module.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Downloads:</span>
            <span className="font-medium">{module.downloadCount}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {onDownload && (
            <Button 
              className="flex-1 bg-primary-600 hover:bg-primary-700"
              onClick={() => onDownload(module.id)}
              data-testid={`button-download-${module.id}`}
            >
              <i className="fas fa-download mr-2"></i>Download
            </Button>
          )}
          {onView && (
            <Button
              variant="outline"
              className="px-4"
              onClick={() => onView(module.id)}
              data-testid={`button-view-${module.id}`}
            >
              <i className="fas fa-eye"></i>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
