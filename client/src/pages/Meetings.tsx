import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { EmptyState } from '../components/common/EmptyState';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useAuth } from '../contexts/AuthContext';
import { Meeting } from '@shared/schema';

export const Meetings: React.FC = () => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: meetings, loading } = useRealtimeData<Meeting>('meetings');

  const filters = [
    { id: 'all', label: 'All Meetings' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' },
  ];

  const handleJoinMeeting = (meetingId: string, meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (searchQuery) {
      return meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             meeting.description?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getMeetingStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${timeString}`;
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
        <h2 className="text-2xl font-bold text-gray-900">
          {userProfile?.role === 'teacher' ? 'Schedule & Host Meetings' : 'Meetings'}
        </h2>
        <div className="flex space-x-2">
          <Input
            type="search"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
            data-testid="input-search-meetings"
          />
          {userProfile?.role === 'teacher' && (
            <Button className="bg-primary-600 hover:bg-primary-700" data-testid="button-schedule-meeting">
              <i className="fas fa-plus mr-2"></i>Schedule Meeting
            </Button>
          )}
        </div>
      </div>

      {/* Meeting Filters */}
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

      {/* Meetings List */}
      {filteredMeetings.length === 0 ? (
        <EmptyState 
          icon="fas fa-video"
          message="No meetings found"
          description={searchQuery ? 'Try adjusting your search terms.' : 'Meetings will appear here when available.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map((meeting) => (
            <Card key={meeting.id} className="hover-lift" data-testid={`meeting-card-${meeting.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMeetingStatusColor(meeting.status)}`}>
                    {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                  </span>
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-video text-primary-600 text-sm"></i>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2" data-testid={`meeting-title-${meeting.id}`}>
                  {meeting.title}
                </h3>
                
                {meeting.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {meeting.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <i className="fas fa-calendar text-gray-400 mr-2 w-4"></i>
                    <span className="text-gray-900">
                      {formatDateTime(meeting.scheduledDate, meeting.startTime)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <i className="fas fa-clock text-gray-400 mr-2 w-4"></i>
                    <span className="text-gray-900">
                      {meeting.startTime} - {meeting.endTime}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <i className="fas fa-users text-gray-400 mr-2 w-4"></i>
                    <span className="text-gray-900">
                      {meeting.attendees.length} attendees
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {meeting.status === 'scheduled' && (
                    <Button 
                      className="flex-1 bg-primary-600 hover:bg-primary-700"
                      onClick={() => handleJoinMeeting(meeting.id, meeting.meetingLink)}
                      data-testid={`button-join-${meeting.id}`}
                    >
                      <i className="fas fa-play mr-2"></i>Join Meeting
                    </Button>
                  )}
                  {meeting.status === 'ongoing' && (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleJoinMeeting(meeting.id, meeting.meetingLink)}
                      data-testid={`button-join-ongoing-${meeting.id}`}
                    >
                      <i className="fas fa-play mr-2"></i>Join Now
                    </Button>
                  )}
                  {userProfile?.role === 'teacher' && (
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-edit-${meeting.id}`}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
