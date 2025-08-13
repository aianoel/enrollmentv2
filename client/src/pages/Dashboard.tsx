import React from 'react';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
          Welcome back, {user.name}!
        </h2>
        <p className="opacity-90">
          {user.role === 'student' && "Ready to continue your learning journey?"}
          {user.role === 'teacher' && "Ready to inspire minds today?"}
          {user.role === 'admin' && "Ready to manage the school system?"}
          {user.role === 'parent' && "Keep track of your child's progress."}
        </p>
      </div>

      {/* Quick Stats */}
      <DashboardStats />

      {/* Recent Activity & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Empty state for now */}
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-clock text-2xl mb-2 text-gray-400"></i>
                <p>No recent activity to display.</p>
                <p className="text-sm">Activity will appear here as you use the system.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Items */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {user.role === 'student' ? 'Upcoming Deadlines' : 'Upcoming Events'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Empty state for now */}
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-calendar text-2xl mb-2 text-gray-400"></i>
                <p>No upcoming items to display.</p>
                <p className="text-sm">
                  {user.role === 'student' 
                    ? 'Assignment deadlines will appear here.' 
                    : 'Scheduled events will appear here.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
