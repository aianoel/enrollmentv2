import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export const GuidanceDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: students = [] } = useQuery({
    queryKey: ['/api/users', 'students'],
    queryFn: () => apiRequest('/api/users')
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/enrollments'],
    queryFn: () => apiRequest('/api/enrollments')
  });

  if (!user || user.role !== 'guidance') {
    return <div className="text-center py-8">Access denied. Guidance role required.</div>;
  }

  const allStudents = students.filter((s: any) => s.role === 'student');
  const activeEnrollments = enrollments.filter((e: any) => e.status === 'approved');
  const pendingCounseling = Math.floor(allStudents.length * 0.1); // Simulated pending counseling sessions

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
          Welcome back, {user.name}!
        </h2>
        <p className="opacity-90">Ready to guide and support our students today?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <i className="fas fa-users text-teal-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allStudents.length}</div>
            <p className="text-xs text-muted-foreground">Under guidance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <i className="fas fa-clipboard-list text-blue-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCounseling}</div>
            <p className="text-xs text-muted-foreground">Pending counseling</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interventions</CardTitle>
            <i className="fas fa-heart text-red-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Stories</CardTitle>
            <i className="fas fa-star text-yellow-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button className="h-20 bg-teal-600 hover:bg-teal-700 flex-col space-y-2" data-testid="student-profiles">
          <i className="fas fa-user-friends text-xl"></i>
          <span>Student Profiles</span>
        </Button>
        <Button className="h-20 bg-blue-600 hover:bg-blue-700 text-white flex-col space-y-2" data-testid="counseling-sessions">
          <i className="fas fa-comments text-xl"></i>
          <span>Counseling Sessions</span>
        </Button>
        <Button className="h-20 bg-purple-600 hover:bg-purple-700 text-white flex-col space-y-2" data-testid="behavioral-reports">
          <i className="fas fa-file-medical-alt text-xl"></i>
          <span>Behavioral Reports</span>
        </Button>
        <Button className="h-20 bg-green-600 hover:bg-green-700 text-white flex-col space-y-2" data-testid="academic-performance">
          <i className="fas fa-chart-line text-xl"></i>
          <span>Academic Performance</span>
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Students */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Students</CardTitle>
          </CardHeader>
          <CardContent>
            {allStudents.length > 0 ? (
              <div className="space-y-3">
                {allStudents.slice(0, 5).map((student: any) => (
                  <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">No issues reported</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Normal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-user-friends text-2xl mb-2 text-gray-400"></i>
                <p>No students to monitor</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-clipboard text-2xl mb-2 text-gray-400"></i>
              <p>No recent activities</p>
              <p className="text-sm">Counseling sessions and interventions will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Guidance Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Academic Support</h4>
              <p className="text-sm text-blue-700 mt-1">Study skills, time management, academic planning</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Career Guidance</h4>
              <p className="text-sm text-green-700 mt-1">Career exploration, college preparation</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">Personal Development</h4>
              <p className="text-sm text-purple-700 mt-1">Social skills, emotional support, crisis intervention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};