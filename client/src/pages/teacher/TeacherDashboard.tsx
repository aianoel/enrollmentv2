import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DashboardStats } from '../../components/dashboard/DashboardStats';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardBackground } from '@/components/ui/dashboard-background';
import { EnhancedCard, StatCard, ActionCard } from '@/components/ui/enhanced-card';
import { EnhancedButton, QuickActionButton } from '@/components/ui/enhanced-button';
import { BookOpen, Calendar, Trophy, Clock, FileText, Video, MessageSquare, BarChart3, Upload, Users, GraduationCap } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'teacher') {
    return <EmptyState message="Access denied. Teacher role required." />;
  }

  return (
    <DashboardBackground userRole="teacher" className="p-6">
      <div className="space-y-6">
        {/* Welcome Header */}
        <EnhancedCard 
          variant="gradient" 
          className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0"
          data-testid="welcome-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
                Welcome back, {user.name}!
              </h2>
              <p className="opacity-90">Ready to inspire minds today?</p>
            </div>
            <GraduationCap className="h-16 w-16 opacity-20" />
          </div>
        </EnhancedCard>

        {/* Quick Stats */}
        <DashboardStats />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            title="Grade Assignments"
            description="Review and grade student work"
            icon={BarChart3}
            color="green"
            data-testid="quick-grade"
          />
          <QuickActionButton
            title="Upload Module"
            description="Add new learning materials"
            icon={Upload}
            color="blue"
            data-testid="quick-module"
          />
          <QuickActionButton
            title="Schedule Meeting"
            description="Plan virtual classes"
            icon={Video}
            color="purple"
            data-testid="quick-meeting"
          />
          <QuickActionButton
            title="Send Announcement"
            description="Communicate with students"
            icon={MessageSquare}
            color="orange"
            data-testid="quick-announce"
          />
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
    </DashboardBackground>
  );
};
