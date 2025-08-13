import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { DashboardBackground } from '@/components/ui/dashboard-background';
import { EnhancedCard, StatCard, ActionCard } from '@/components/ui/enhanced-card';
import { EnhancedButton, QuickActionButton } from '@/components/ui/enhanced-button';
import { BookOpen, Calendar, Trophy, Clock, FileText, Video, MessageSquare, BarChart3, Upload, GraduationCap } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: grades = [] } = useQuery({
    queryKey: ['/api/grades', user?.id],
    queryFn: () => apiRequest(`/api/grades/student/${user?.id}`),
    enabled: !!user?.id
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['/api/assignments', 'student'],
    queryFn: () => apiRequest('/api/assignments')
  });

  if (!user || user.role !== 'student') {
    return <div className="text-center py-8">Access denied. Student role required.</div>;
  }

  const recentGrades = grades.slice(0, 5);
  const upcomingAssignments = assignments.filter((a: any) => new Date(a.dueDate) > new Date()).slice(0, 5);
  const gpa = grades.length > 0 ? (grades.reduce((sum: number, g: any) => sum + parseFloat(g.grade || 0), 0) / grades.length).toFixed(2) : '0.00';

  return (
    <DashboardBackground userRole="student" className="p-6">
      <div className="space-y-6">
        {/* Welcome Header */}
        <EnhancedCard 
          variant="gradient" 
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0"
          data-testid="welcome-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
                Welcome back, {user.name}!
              </h2>
              <p className="opacity-90">Ready to continue your learning journey?</p>
            </div>
            <GraduationCap className="h-16 w-16 opacity-20" />
          </div>
        </EnhancedCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Current GPA"
            value={gpa}
            description="Overall average"
            icon={BarChart3}
            iconColor="text-blue-600"
            trend={{ value: 5.2, label: "from last semester", isPositive: true }}
            data-testid="gpa-stat"
          />

          <StatCard
            title="Total Subjects"
            value={new Set(grades.map((g: any) => g.subject)).size}
            description="Enrolled subjects"
            icon={BookOpen}
            iconColor="text-green-600"
            data-testid="subjects-stat"
          />

          <StatCard
            title="Assignments Due"
            value={upcomingAssignments.length}
            description="Due this week"
            icon={Clock}
            iconColor="text-orange-600"
            data-testid="assignments-stat"
          />

          <StatCard
            title="Total Grades"
            value={grades.length}
            description="Recorded grades"
            icon={Trophy}
            iconColor="text-purple-600"
            trend={{ value: 12, label: "improvement", isPositive: true }}
            data-testid="grades-stat"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            title="View Grades"
            description="Check your academic performance"
            icon={BarChart3}
            color="blue"
            data-testid="view-grades"
          />
          <QuickActionButton
            title="Assignments"
            description="View and submit assignments"
            icon={FileText}
            color="green"
            data-testid="view-assignments"
          />
          <QuickActionButton
            title="Learning Modules"
            description="Access course materials"
            icon={BookOpen}
            color="purple"
            data-testid="view-modules"
          />
          <QuickActionButton
            title="Join Meeting"
            description="Attend virtual classes"
            icon={Video}
            color="orange"
            data-testid="view-meetings"
          />
        </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Grades</CardTitle>
          </CardHeader>
          <CardContent>
            {recentGrades.length > 0 ? (
              <div className="space-y-3">
                {recentGrades.map((grade: any) => (
                  <div key={grade.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{grade.subject}</p>
                      <p className="text-sm text-gray-600">Quarter {grade.quarter}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{grade.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-chart-line text-2xl mb-2 text-gray-400"></i>
                <p>No grades recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAssignments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAssignments.map((assignment: any) => (
                  <div key={assignment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{assignment.title}</p>
                      <p className="text-sm text-gray-600">{assignment.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-orange-600">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-tasks text-2xl mb-2 text-gray-400"></i>
                <p>No upcoming assignments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardBackground>
  );
};