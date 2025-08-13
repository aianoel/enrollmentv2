import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ModuleCard } from '../components/modules/ModuleCard';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { LearningModule } from '@shared/schema';

export const Modules: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: modules, loading } = useRealtimeData<LearningModule>('learning_modules');

  const subjects = [
    { id: 'all', label: 'All Subjects' },
    { id: 'math', label: 'Mathematics' },
    { id: 'english', label: 'English' },
    { id: 'science', label: 'Science' },
    { id: 'history', label: 'History' },
    { id: 'pe', label: 'Physical Education' },
  ];

  const handleDownloadModule = (moduleId: string) => {
    console.log('Download module:', moduleId);
    // Implementation for module download
  };

  const handleViewModule = (moduleId: string) => {
    console.log('View module:', moduleId);
    // Implementation for module preview
  };

  const filteredModules = modules.filter(module => {
    if (searchQuery) {
      return module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             module.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Learning Modules</h2>
        <div className="flex space-x-2">
          <Input
            type="search"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
            data-testid="input-search-modules"
          />
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {subjects.map((subject) => (
          <Button
            key={subject.id}
            variant={activeSubject === subject.id ? 'default' : 'outline'}
            className={`whitespace-nowrap ${
              activeSubject === subject.id 
                ? 'bg-primary-100 text-primary-700 border-primary-200' 
                : ''
            }`}
            onClick={() => setActiveSubject(subject.id)}
            data-testid={`subject-${subject.id}`}
          >
            {subject.label}
          </Button>
        ))}
      </div>

      {/* Modules Grid */}
      {filteredModules.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-book text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No learning modules found</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search terms.' : 'Learning modules will appear here when available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onDownload={handleDownloadModule}
              onView={handleViewModule}
            />
          ))}
        </div>
      )}
    </div>
  );
};
