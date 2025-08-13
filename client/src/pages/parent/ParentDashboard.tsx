import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { DashboardBackground } from '@/components/ui/dashboard-background';
import { EnhancedCard, StatCard, ActionCard } from '@/components/ui/enhanced-card';
import { EnhancedButton, QuickActionButton } from '@/components/ui/enhanced-button';
import { Users, Calendar, MessageSquare, BarChart3, FileText, Trophy, Heart, BookOpen } from 'lucide-react';

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
    <DashboardBackground userRole="parent" className="p-6">
      <div className="space-y-6">
        {/* Welcome Header */}
        <EnhancedCard 
          variant="gradient" 
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0"
          data-testid="welcome-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
                Welcome back, {user.name}!
              </h2>
              <p className="opacity-90">Keep track of your child's progress.</p>
            </div>
            <Heart className="h-16 w-16 opacity-20" />
          </div>
        </EnhancedCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="My Children"
            value={studentChildren.length}
            description="Enrolled students"
            icon={Users}
            iconColor="text-purple-600"
            data-testid="children-stat"
          />

          <StatCard
            title="Announcements"
            value={announcements.length}
            description="New updates"
            icon={MessageSquare}
            iconColor="text-blue-600"
            data-testid="announcements-stat"
          />

          <StatCard
            title="Upcoming Events"
            value={upcomingEvents.length}
            description="This month"
            icon={Calendar}
            iconColor="text-orange-600"
            data-testid="events-stat"
          />

          <StatCard
            title="Payment Status"
            value="Paid"
            description="Current term"
            icon={Trophy}
            iconColor="text-green-600"
            data-testid="payment-stat"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            title="View Grades"
            description="Check academic progress"
            icon={BarChart3}
            color="green"
            data-testid="view-child-grades"
          />
          <QuickActionButton
            title="Attendance"
            description="Monitor attendance"
            icon={Calendar}
            color="blue"
            data-testid="view-attendance"
          />
          <QuickActionButton
            title="Billing"
            description="Payment history"
            icon={FileText}
            color="purple"
            data-testid="view-billing"
          />
          <QuickActionButton
            title="Message Teachers"
            description="Contact educators"
            icon={MessageSquare}
            color="orange"
            data-testid="message-teachers"
          />
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
    </DashboardBackground>
  );
};