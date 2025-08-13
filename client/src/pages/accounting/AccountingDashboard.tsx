import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export const AccountingDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: tuitionFees = [] } = useQuery({
    queryKey: ['/api/tuition-fees'],
    queryFn: () => apiRequest('/api/tuition-fees')
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/enrollments'],
    queryFn: () => apiRequest('/api/enrollments')
  });

  const { data: students = [] } = useQuery({
    queryKey: ['/api/users', 'students'],
    queryFn: () => apiRequest('/api/users')
  });

  if (!user || user.role !== 'accounting') {
    return <div className="text-center py-8">Access denied. Accounting role required.</div>;
  }

  const allStudents = students.filter((s: any) => s.role === 'student');
  const paidEnrollments = enrollments.filter((e: any) => e.paymentStatus === 'paid');
  const unpaidEnrollments = enrollments.filter((e: any) => e.paymentStatus === 'unpaid');
  const totalRevenue = tuitionFees.reduce((sum: number, fee: any) => sum + parseFloat(fee.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
          Welcome back, {user.name}!
        </h2>
        <p className="opacity-90">Manage school finances and payment records efficiently.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <i className="fas fa-dollar-sign text-emerald-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current academic year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Students</CardTitle>
            <i className="fas fa-check-circle text-green-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidEnrollments.length}</div>
            <p className="text-xs text-muted-foreground">Current payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <i className="fas fa-exclamation-triangle text-orange-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidEnrollments.length}</div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <i className="fas fa-chart-pie text-blue-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.length > 0 ? Math.round((paidEnrollments.length / enrollments.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Collection rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button className="h-20 bg-emerald-600 hover:bg-emerald-700 flex-col space-y-2" data-testid="payment-records">
          <i className="fas fa-receipt text-xl"></i>
          <span>Payment Records</span>
        </Button>
        <Button className="h-20 bg-blue-600 hover:bg-blue-700 text-white flex-col space-y-2" data-testid="tuition-management">
          <i className="fas fa-dollar-sign text-xl"></i>
          <span>Tuition Management</span>
        </Button>
        <Button className="h-20 bg-purple-600 hover:bg-purple-700 text-white flex-col space-y-2" data-testid="generate-receipts">
          <i className="fas fa-file-invoice text-xl"></i>
          <span>Generate Receipts</span>
        </Button>
        <Button className="h-20 bg-indigo-600 hover:bg-indigo-700 text-white flex-col space-y-2" data-testid="financial-reports">
          <i className="fas fa-chart-bar text-xl"></i>
          <span>Financial Reports</span>
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {paidEnrollments.length > 0 ? (
              <div className="space-y-3">
                {paidEnrollments.slice(0, 5).map((enrollment: any) => (
                  <div key={enrollment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Student ID: {enrollment.studentId}</p>
                      <p className="text-sm text-gray-600">Status: {enrollment.paymentStatus}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Paid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-receipt text-2xl mb-2 text-gray-400"></i>
                <p>No recent payments</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outstanding Balances */}
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {unpaidEnrollments.length > 0 ? (
              <div className="space-y-3">
                {unpaidEnrollments.slice(0, 5).map((enrollment: any) => (
                  <div key={enrollment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Student ID: {enrollment.studentId}</p>
                      <p className="text-sm text-gray-600">Status: {enrollment.paymentStatus}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        Unpaid
                      </span>
                      <Button size="sm" className="ml-2 text-xs">
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-check-circle text-2xl mb-2 text-gray-400"></i>
                <p>All payments are up to date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary by Grade Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {tuitionFees.map((fee: any) => (
              <div key={fee.id} className="p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-medium text-emerald-900">Grade {fee.gradeLevel}</h4>
                <p className="text-2xl font-bold text-emerald-600">₱{parseFloat(fee.amount).toLocaleString()}</p>
                <p className="text-sm text-emerald-700 mt-1">Tuition fee</p>
                <p className="text-xs text-emerald-600 mt-1">
                  Due: {new Date(fee.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};