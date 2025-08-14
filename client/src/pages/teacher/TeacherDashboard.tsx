import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardBackground } from '@/components/ui/dashboard-background';
import { EnhancedCard, StatCard, ActionCard } from '@/components/ui/enhanced-card';
import { EnhancedButton, QuickActionButton } from '@/components/ui/enhanced-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GradeManagement } from '@/components/teacher/GradeManagement';
import { TeacherStats } from '@/components/teacher/TeacherStats';
import { TeacherClasses } from '@/components/teacher/TeacherClasses';
import { RecentGrades } from '@/components/teacher/RecentGrades';
import { BookOpen, Calendar, Trophy, Clock, FileText, Video, MessageSquare, BarChart3, Upload, Users, GraduationCap, ClipboardList } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

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
        <TeacherStats />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            title="Manage Grades"
            description="Encode and view student grades"
            icon={ClipboardList}
            color="green"
            data-testid="quick-grade"
            onClick={() => setActiveTab("grades")}
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Grade Management
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Teacher-specific content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* My Classes */}
              <TeacherClasses />

              {/* Recent Grades */}
              <RecentGrades />

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

              {/* Quick Actions Card */}
              <Card>
                <CardContent className="p-0">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => setActiveTab("grades")}
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Manage Grades
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Create Assignment
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Video className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <GradeManagement />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">Assignment Management</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Assignment creation and management features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardBackground>
  );
};
