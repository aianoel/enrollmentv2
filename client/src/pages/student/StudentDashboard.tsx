import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
          Welcome back, {user.name}!
        </h2>
        <p className="opacity-90">Ready to continue your learning journey?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <i className="fas fa-chart-line text-blue-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gpa}</div>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <i className="fas fa-book text-green-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(grades.map((g: any) => g.subject)).size}</div>
            <p className="text-xs text-muted-foreground">Enrolled subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments Due</CardTitle>
            <i className="fas fa-tasks text-orange-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
            <i className="fas fa-clipboard-list text-purple-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.length}</div>
            <p className="text-xs text-muted-foreground">Recorded grades</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button className="h-20 bg-blue-600 hover:bg-blue-700 flex-col space-y-2" data-testid="view-grades">
          <i className="fas fa-chart-line text-xl"></i>
          <span>View Grades</span>
        </Button>
        <Button className="h-20 bg-green-600 hover:bg-green-700 text-white flex-col space-y-2" data-testid="view-assignments">
          <i className="fas fa-tasks text-xl"></i>
          <span>Assignments</span>
        </Button>
        <Button className="h-20 bg-purple-600 hover:bg-purple-700 text-white flex-col space-y-2" data-testid="view-modules">
          <i className="fas fa-book text-xl"></i>
          <span>Learning Modules</span>
        </Button>
        <Button className="h-20 bg-orange-600 hover:bg-orange-700 text-white flex-col space-y-2" data-testid="view-meetings">
          <i className="fas fa-video text-xl"></i>
          <span>Meetings</span>
        </Button>
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
  );
};