import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DashboardStats } from '../../components/dashboard/DashboardStats';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();

  if (!userProfile || userProfile.role !== 'admin') {
    return <EmptyState message="Access denied. Admin role required." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
          Welcome back, {userProfile.firstName}!
        </h2>
        <p className="opacity-90">Ready to manage the school system?</p>
      </div>

      {/* Quick Stats */}
      <DashboardStats />

      {/* Admin Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button className="h-20 bg-primary-600 hover:bg-primary-700 flex-col space-y-2" data-testid="quick-users">
          <i className="fas fa-users-cog text-xl"></i>
          <span>Manage Users</span>
        </Button>
        <Button className="h-20 bg-secondary-600 hover:bg-secondary-700 text-white flex-col space-y-2" data-testid="quick-sections">
          <i className="fas fa-layer-group text-xl"></i>
          <span>Manage Sections</span>
        </Button>
        <Button className="h-20 bg-accent-600 hover:bg-accent-700 text-white flex-col space-y-2" data-testid="quick-subjects">
          <i className="fas fa-book-open text-xl"></i>
          <span>Manage Subjects</span>
        </Button>
        <Button className="h-20 bg-purple-600 hover:bg-purple-700 text-white flex-col space-y-2" data-testid="quick-reports">
          <i className="fas fa-chart-bar text-xl"></i>
          <span>View Reports</span>
        </Button>
      </div>

      {/* Admin Management Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <Button size="sm" className="bg-primary-600 hover:bg-primary-700" data-testid="add-user">
                  <i className="fas fa-plus mr-2"></i>Add User
                </Button>
              </div>
            </div>
            <div className="p-6">
              <EmptyState 
                icon="fas fa-users"
                message="User management interface"
                description="Create, edit, and manage user accounts for all roles"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section Management */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Section Management</h3>
                <Button size="sm" className="bg-secondary-600 hover:bg-secondary-700 text-white" data-testid="add-section">
                  <i className="fas fa-plus mr-2"></i>Add Section
                </Button>
              </div>
            </div>
            <div className="p-6">
              <EmptyState 
                icon="fas fa-layer-group"
                message="Section management interface"
                description="Create and assign sections, manage class rosters"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database Status</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Storage Usage</span>
                <span className="text-gray-900 font-medium">2.3 GB / 10 GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Sessions</span>
                <span className="text-gray-900 font-medium">127</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Admin Activity Log</h3>
            </div>
            <div className="p-6">
              <EmptyState 
                icon="fas fa-history"
                message="No recent admin activity"
                description="System administration actions will be logged here"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
