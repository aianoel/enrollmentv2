import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DashboardStats } from '../../components/dashboard/DashboardStats';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'teacher') {
    return <EmptyState message="Access denied. Teacher role required." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
          Welcome back, {user.name}!
        </h2>
        <p className="opacity-90">Ready to inspire minds today?</p>
      </div>

      {/* Quick Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button className="h-20 bg-primary-600 hover:bg-primary-700 flex-col space-y-2" data-testid="quick-grade">
          <i className="fas fa-clipboard-check text-xl"></i>
          <span>Grade Assignments</span>
        </Button>
        <Button className="h-20 bg-secondary-600 hover:bg-secondary-700 text-white flex-col space-y-2" data-testid="quick-module">
          <i className="fas fa-upload text-xl"></i>
          <span>Upload Module</span>
        </Button>
        <Button className="h-20 bg-accent-600 hover:bg-accent-700 text-white flex-col space-y-2" data-testid="quick-meeting">
          <i className="fas fa-video text-xl"></i>
          <span>Schedule Meeting</span>
        </Button>
        <Button className="h-20 bg-purple-600 hover:bg-purple-700 text-white flex-col space-y-2" data-testid="quick-announce">
          <i className="fas fa-bullhorn text-xl"></i>
          <span>Send Announcement</span>
        </Button>
      </div>

      {/* Teacher-specific content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">My Classes</h3>
            </div>
            <div className="p-6">
              <EmptyState 
                icon="fas fa-users"
                message="No classes assigned yet"
                description="Classes will appear here once sections are assigned to you"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
            </div>
            <div className="p-6">
              <EmptyState 
                icon="fas fa-file-alt"
                message="No recent submissions"
                description="Student submissions will appear here for grading"
              />
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Grade Distribution</h3>
            </div>
            <div className="p-6">
              <EmptyState 
                icon="fas fa-chart-pie"
                message="No grade data available"
                description="Grade distribution charts will appear here"
              />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h3>
            </div>
            <div className="p-6">
              <EmptyState 
                icon="fas fa-calendar"
                message="No scheduled meetings"
                description="Your scheduled meetings will appear here"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
