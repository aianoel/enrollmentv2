import React from 'react';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Header with SaaS design */}
      <div className="saas-gradient-bg rounded-2xl p-6 sm:p-8 text-white saas-slide-up shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2" data-testid="welcome-message">
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h2>
            <p className="opacity-90 text-base sm:text-lg font-medium">
              {user.role === 'student' && "Ready to continue your learning journey?"}
              {user.role === 'teacher' && "Ready to inspire minds today?"}
              {user.role === 'admin' && "Ready to manage the school system?"}
              {user.role === 'parent' && "Keep track of your child's progress."}
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-user-graduate text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="saas-fade-in">
        <DashboardStats />
      </div>

      {/* Recent Activity & Upcoming */}
      <div className="saas-grid grid-cols-1 lg:grid-cols-2 saas-slide-up">
        {/* Recent Activity */}
        <div className="saas-card">
          <div className="saas-card-content p-0">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-blue-600"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clock text-xl text-gray-400"></i>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">No recent activity</h4>
                <p className="text-sm text-gray-500">Activity will appear here as you use the system.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Items */}
        <div className="saas-card">
          <div className="saas-card-content p-0">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-calendar text-green-600"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.role === 'student' ? 'Upcoming Deadlines' : 'Upcoming Events'}
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-calendar text-xl text-gray-400"></i>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">No upcoming items</h4>
                <p className="text-sm text-gray-500">
                  {user.role === 'student' 
                    ? 'Assignment deadlines will appear here.' 
                    : 'Scheduled events will appear here.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
