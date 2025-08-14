import React from 'react';
import { Card, CardContent } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';

interface StatCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
}

export const DashboardStats: React.FC = () => {
  const { user } = useAuth();

  const getStatsForRole = (): StatCard[] => {
    switch (user?.role) {
      case 'student':
        return [
          {
            title: 'Enrolled Subjects',
            value: 6,
            subtitle: 'Current semester',
            icon: 'fas fa-book-open',
            color: 'blue'
          },
          {
            title: 'Current GPA',
            value: '3.85',
            subtitle: '▲ 0.2 from last quarter',
            icon: 'fas fa-chart-line',
            color: 'green'
          },
          {
            title: 'Pending Tasks',
            value: 4,
            subtitle: '2 due this week',
            icon: 'fas fa-tasks',
            color: 'orange'
          },
          {
            title: 'Attendance',
            value: '92%',
            subtitle: 'This semester',
            icon: 'fas fa-calendar',
            color: 'purple'
          }
        ];
      case 'teacher':
        return [
          {
            title: 'Classes Teaching',
            value: 5,
            subtitle: 'Active sections',
            icon: 'fas fa-chalkboard-teacher',
            color: 'blue'
          },
          {
            title: 'Students',
            value: 180,
            subtitle: 'Total enrolled',
            icon: 'fas fa-users',
            color: 'green'
          },
          {
            title: 'Pending Grading',
            value: 23,
            subtitle: 'Assignments to grade',
            icon: 'fas fa-clipboard-check',
            color: 'orange'
          },
          {
            title: 'Modules Uploaded',
            value: 12,
            subtitle: 'This semester',
            icon: 'fas fa-upload',
            color: 'purple'
          }
        ];
      case 'admin':
        return [
          {
            title: 'Total Students',
            value: 1250,
            subtitle: 'Active enrollments',
            icon: 'fas fa-user-graduate',
            color: 'blue'
          },
          {
            title: 'Faculty Members',
            value: 45,
            subtitle: 'Teaching staff',
            icon: 'fas fa-chalkboard-teacher',
            color: 'green'
          },
          {
            title: 'Sections',
            value: 32,
            subtitle: 'All grade levels',
            icon: 'fas fa-layer-group',
            color: 'orange'
          },
          {
            title: 'System Health',
            value: '99%',
            subtitle: 'Uptime this month',
            icon: 'fas fa-heartbeat',
            color: 'purple'
          }
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="saas-grid">
      {stats.map((stat, index) => (
        <div key={index} className="saas-card saas-scale-in group" data-testid={`stat-card-${index}`}>
          <div className="saas-card-content">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(stat.color)} group-hover:scale-110 transition-transform duration-200`}>
                <i className={`${stat.icon} text-base`}></i>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1" data-testid={`stat-title-${index}`}>
                {stat.title}
              </h3>
              <p className={`text-sm font-medium ${stat.color === 'green' ? 'text-green-600' : stat.color === 'orange' ? 'text-orange-600' : stat.color === 'purple' ? 'text-purple-600' : 'text-gray-500'}`} data-testid={`stat-subtitle-${index}`}>
                {stat.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
