import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { EmptyState } from '../components/common/EmptyState';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useAuth } from '../contexts/AuthContext';
import { Announcement } from '@shared/schema';

export const Announcements: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: announcements, loading } = useRealtimeData<Announcement>('announcements');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'high', label: 'High Priority' },
    { id: 'medium', label: 'Medium Priority' },
    { id: 'low', label: 'Low Priority' },
  ];

  const canCreateAnnouncement = ['admin', 'teacher', 'guidance'].includes(user?.role || '');

  const filteredAnnouncements = (announcements || []).filter(announcement => {
    if (searchQuery) {
      return announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
    // Since priority doesn't exist in the schema, we'll remove this filter for now
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'fas fa-exclamation-triangle text-red-600';
      case 'medium':
        return 'fas fa-info-circle text-orange-600';
      case 'low':
        return 'fas fa-info text-blue-600';
      default:
        return 'fas fa-info text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
        <div className="flex space-x-2">
          <Input
            type="search"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
            data-testid="input-search-announcements"
          />
          {canCreateAnnouncement && (
            <Button className="bg-primary-600 hover:bg-primary-700" data-testid="button-create-announcement">
              <i className="fas fa-plus mr-2"></i>Create Announcement
            </Button>
          )}
        </div>
      </div>

      {/* Priority Filters */}
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

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState 
          icon="fas fa-bullhorn"
          message="No announcements found"
          description={searchQuery ? 'Try adjusting your search terms.' : 'Announcements will appear here when available.'}
        />
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover-lift" data-testid={`announcement-card-${announcement.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-bullhorn text-primary-600"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg" data-testid={`announcement-title-${announcement.id}`}>
                          {announcement.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          General
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <i className="fas fa-user mr-1"></i>
                        <span>Author Name</span>
                        <span className="mx-2">•</span>
                        <i className="fas fa-clock mr-1"></i>
                        <span>{announcement.datePosted ? formatDate(announcement.datePosted) : 'No date'}</span>
                      </div>
                    </div>
                  </div>
                  {canCreateAnnouncement && (
                    <Button variant="ghost" size="sm" data-testid={`button-edit-announcement-${announcement.id}`}>
                      <i className="fas fa-ellipsis-v"></i>
                    </Button>
                  )}
                </div>

                <div className="ml-13">
                  <p className="text-gray-700 leading-relaxed mb-4" data-testid={`announcement-content-${announcement.id}`}>
                    {announcement.content}
                  </p>



                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>
                        <i className="fas fa-users mr-1"></i>
                        Target: All Users
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" data-testid={`button-share-${announcement.id}`}>
                        <i className="fas fa-share"></i>
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-bookmark-${announcement.id}`}>
                        <i className="fas fa-bookmark"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
