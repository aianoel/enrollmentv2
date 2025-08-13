import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { DashboardBackground } from '@/components/ui/dashboard-background';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Heart, Users, ClipboardList, UserCheck } from 'lucide-react';

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
    <DashboardBackground userRole="guidance" className="p-6">
      <div className="space-y-6">
        {/* Welcome Header */}
        <EnhancedCard 
          variant="gradient" 
          className="bg-gradient-to-r from-teal-600 to-teal-700 text-white border-0"
          data-testid="welcome-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
                Welcome back, {user.name}!
              </h2>
              <p className="opacity-90">Ready to guide and support our students today?</p>
            </div>
            <Heart className="h-16 w-16 opacity-20" />
          </div>
        </EnhancedCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <EnhancedCard className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allStudents.length}</div>
              <p className="text-xs text-muted-foreground">Under guidance</p>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCounseling}</div>
              <p className="text-xs text-muted-foreground">Pending counseling</p>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEnrollments.length}</div>
              <p className="text-xs text-muted-foreground">Successfully enrolled</p>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wellness Programs</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Active programs</p>
            </CardContent>
          </EnhancedCard>
        </div>
      </div>
    </DashboardBackground>
  );
};