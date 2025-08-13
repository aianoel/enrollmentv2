import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { DashboardBackground } from '@/components/ui/dashboard-background';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { FileText, Users, UserPlus, UserCheck } from 'lucide-react';

export const RegistrarDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/enrollments'],
    queryFn: () => apiRequest('/api/enrollments')
  });

  const { data: students = [] } = useQuery({
    queryKey: ['/api/users', 'students'],
    queryFn: () => apiRequest('/api/users')
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['/api/sections'],
    queryFn: () => apiRequest('/api/sections')
  });

  if (!user || user.role !== 'registrar') {
    return <div className="text-center py-8">Access denied. Registrar role required.</div>;
  }

  const allStudents = students.filter((s: any) => s.role === 'student');
  const pendingEnrollments = enrollments.filter((e: any) => e.status === 'pending');
  const approvedEnrollments = enrollments.filter((e: any) => e.status === 'approved');
  const rejectedEnrollments = enrollments.filter((e: any) => e.status === 'rejected');

  return (
    <DashboardBackground userRole="registrar" className="p-6">
      <div className="space-y-6">
        {/* Welcome Header */}
        <EnhancedCard 
          variant="gradient" 
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-0"
          data-testid="welcome-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
                Welcome back, {user.name}!
              </h2>
              <p className="opacity-90">Manage student records and enrollment processes efficiently.</p>
            </div>
            <FileText className="h-16 w-16 opacity-20" />
          </div>
        </EnhancedCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <EnhancedCard className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allStudents.length}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </EnhancedCard>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Enrollments</CardTitle>
            <i className="fas fa-clock text-orange-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEnrollments.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sections</CardTitle>
            <i className="fas fa-layer-group text-blue-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections.length}</div>
            <p className="text-xs text-muted-foreground">Available sections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <i className="fas fa-check-circle text-green-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Today's approvals</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button className="h-20 bg-indigo-600 hover:bg-indigo-700 flex-col space-y-2" data-testid="enrollment-requests">
          <i className="fas fa-user-plus text-xl"></i>
          <span>Enrollment Requests</span>
        </Button>
        <Button className="h-20 bg-blue-600 hover:bg-blue-700 text-white flex-col space-y-2" data-testid="student-records">
          <i className="fas fa-address-book text-xl"></i>
          <span>Student Records</span>
        </Button>
        <Button className="h-20 bg-green-600 hover:bg-green-700 text-white flex-col space-y-2" data-testid="section-management">
          <i className="fas fa-layer-group text-xl"></i>
          <span>Section Management</span>
        </Button>
        <Button className="h-20 bg-purple-600 hover:bg-purple-700 text-white flex-col space-y-2" data-testid="generate-reports">
          <i className="fas fa-file-alt text-xl"></i>
          <span>Academic Reports</span>
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Enrollment Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Enrollment Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingEnrollments.length > 0 ? (
              <div className="space-y-3">
                {pendingEnrollments.slice(0, 5).map((enrollment: any) => (
                  <div key={enrollment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Student ID: {enrollment.studentId}</p>
                      <p className="text-sm text-gray-600">Status: {enrollment.status}</p>
                    </div>
                    <div className="text-right space-x-2">
                      <Button size="sm" variant="outline" className="text-green-600">
                        <i className="fas fa-check mr-1"></i>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <i className="fas fa-times mr-1"></i>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-user-plus text-2xl mb-2 text-gray-400"></i>
                <p>No pending enrollment requests</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Section Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {sections.length > 0 ? (
              <div className="space-y-3">
                {sections.slice(0, 5).map((section: any) => (
                  <div key={section.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{section.name}</p>
                      <p className="text-sm text-gray-600">Grade Level: {section.gradeLevel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">
                        Capacity: 0/30
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-layer-group text-2xl mb-2 text-gray-400"></i>
                <p>No sections available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900">Pending Applications</h4>
              <p className="text-2xl font-bold text-orange-600">{pendingEnrollments.length}</p>
              <p className="text-sm text-orange-700 mt-1">Awaiting review</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Approved Applications</h4>
              <p className="text-2xl font-bold text-green-600">{approvedEnrollments.length}</p>
              <p className="text-sm text-green-700 mt-1">Successfully enrolled</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900">Rejected Applications</h4>
              <p className="text-2xl font-bold text-red-600">{rejectedEnrollments.length}</p>
              <p className="text-sm text-red-700 mt-1">Did not meet requirements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};