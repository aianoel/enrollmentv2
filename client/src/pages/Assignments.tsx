import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AssignmentCard } from '../components/assignments/AssignmentCard';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useAuth } from '../contexts/AuthContext';
import { Assignment } from '@shared/schema';

export const Assignments: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: assignments, loading } = useRealtimeData<Assignment>('assignments');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'graded', label: 'Graded' },
    { id: 'overdue', label: 'Overdue' },
  ];

  const handleSubmitAssignment = (assignmentId: string) => {
    console.log('Submit assignment:', assignmentId);
    // Implementation for assignment submission
  };

  const handleDownloadAssignment = (assignmentId: string) => {
    console.log('Download assignment:', assignmentId);
    // Implementation for assignment download
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (searchQuery) {
      return assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
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
        <h2 className="text-2xl font-bold text-gray-900">Assignments & Tasks</h2>
        <div className="flex space-x-2">
          <Input
            type="search"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
            data-testid="input-search-assignments"
          />
          <Button className="bg-primary-600 hover:bg-primary-700" data-testid="button-filter">
            <i className="fas fa-filter mr-2"></i>Filter
          </Button>
        </div>
      </div>

      {/* Assignment Filters */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? 'default' : 'outline'}
            className={`whitespace-nowrap ${
              activeFilter === filter.id 
                ? 'bg-primary-100 text-primary-700 border-primary-200' 
                : ''
            }`}
            onClick={() => setActiveFilter(filter.id)}
            data-testid={`filter-${filter.id}`}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-tasks text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search terms.' : 'Assignments will appear here when available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onSubmit={userProfile?.role === 'student' ? handleSubmitAssignment : undefined}
              onDownload={handleDownloadAssignment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
