import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();

  // For demo purposes, we'll assume parent can view child's data
  const { data: children = [] } = useQuery({
    queryKey: ['/api/users', 'children'],
    queryFn: () => apiRequest('/api/users')
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['/api/announcements'],
    queryFn: () => apiRequest('/api/announcements')
  });

  const { data: events = [] } = useQuery({
    queryKey: ['/api/events'],
    queryFn: () => apiRequest('/api/events')
  });

  if (!user || user.role !== 'parent') {
    return <div className="text-center py-8">Access denied. Parent role required.</div>;
  }

  const studentChildren = children.filter((c: any) => c.role === 'student');
  const upcomingEvents = events.filter((e: any) => new Date(e.date) > new Date()).slice(0, 5);
  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
          Welcome back, {user.name}!
        </h2>
        <p className="opacity-90">Keep track of your child's progress.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Children</CardTitle>
            <i className="fas fa-users text-green-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentChildren.length}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <i className="fas fa-bullhorn text-blue-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">New updates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <i className="fas fa-calendar text-orange-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <i className="fas fa-dollar-sign text-purple-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Paid</div>
            <p className="text-xs text-muted-foreground">Current term</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button className="h-20 bg-green-600 hover:bg-green-700 flex-col space-y-2" data-testid="view-child-grades">
          <i className="fas fa-chart-line text-xl"></i>
          <span>View Grades</span>
        </Button>
        <Button className="h-20 bg-blue-600 hover:bg-blue-700 text-white flex-col space-y-2" data-testid="view-attendance">
          <i className="fas fa-calendar-check text-xl"></i>
          <span>Attendance</span>
        </Button>
        <Button className="h-20 bg-purple-600 hover:bg-purple-700 text-white flex-col space-y-2" data-testid="view-billing">
          <i className="fas fa-receipt text-xl"></i>
          <span>Billing</span>
        </Button>
        <Button className="h-20 bg-orange-600 hover:bg-orange-700 text-white flex-col space-y-2" data-testid="message-teachers">
          <i className="fas fa-comments text-xl"></i>
          <span>Message Teachers</span>
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Children's Academic Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Children's Academic Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {studentChildren.length > 0 ? (
              <div className="space-y-3">
                {studentChildren.slice(0, 3).map((child: any) => (
                  <div key={child.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-gray-600">Grade: Not assigned</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">Good Standing</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-users text-2xl mb-2 text-gray-400"></i>
                <p>No children enrolled</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAnnouncements.length > 0 ? (
              <div className="space-y-3">
                {recentAnnouncements.map((announcement: any) => (
                  <div key={announcement.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{announcement.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(announcement.datePosted).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-bullhorn text-2xl mb-2 text-gray-400"></i>
                <p>No recent announcements</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};