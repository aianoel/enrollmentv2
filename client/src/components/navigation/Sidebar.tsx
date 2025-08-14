import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentSection, onSectionChange }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' }
    ];

    switch (user.role) {
      case 'student':
        return [
          ...baseItems,
          { id: 'grades', label: 'My Grades', icon: 'fas fa-chart-line' },
          { id: 'assignments', label: 'Assignments', icon: 'fas fa-tasks' },
          { id: 'modules', label: 'Learning Modules', icon: 'fas fa-book' },
          { id: 'meetings', label: 'Meetings', icon: 'fas fa-video' },
          { id: 'payments', label: 'My Payments', icon: 'fas fa-credit-card' },
          { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn' },
        ];
      case 'teacher':
        return [
          ...baseItems,
          { id: 'classes', label: 'My Classes', icon: 'fas fa-users' },
          { id: 'gradebook', label: 'Gradebook', icon: 'fas fa-clipboard-list' },
          { id: 'assignments', label: 'Manage Assignments', icon: 'fas fa-tasks' },
          { id: 'modules', label: 'Learning Modules', icon: 'fas fa-book' },
          { id: 'meetings', label: 'Schedule Meetings', icon: 'fas fa-video' },
          { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn' },
        ];
      case 'admin':
        return [
          ...baseItems,
          { id: 'admin-control', label: 'System Control', icon: 'fas fa-cog' },
          { id: 'users', label: 'User Management', icon: 'fas fa-users-cog' },
          { id: 'sections', label: 'Manage Sections', icon: 'fas fa-layer-group' },
          { id: 'subjects', label: 'Manage Subjects', icon: 'fas fa-book-open' },
          { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn' },
          { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' },
        ];
      case 'registrar':
        return [
          ...baseItems,
          { id: 'enrollment', label: 'Enrollment Requests', icon: 'fas fa-user-plus' },
          { id: 'students', label: 'Student Records', icon: 'fas fa-address-book' },
          { id: 'sections', label: 'Section Management', icon: 'fas fa-layer-group' },
          { id: 'reports', label: 'Academic Reports', icon: 'fas fa-file-alt' },
        ];
      case 'accounting':
        return [
          ...baseItems,
          { id: 'payments', label: 'Payment Records', icon: 'fas fa-receipt' },
          { id: 'tuition', label: 'Tuition Management', icon: 'fas fa-dollar-sign' },
          { id: 'receipts', label: 'Generate Receipts', icon: 'fas fa-file-invoice' },
          { id: 'reports', label: 'Financial Reports', icon: 'fas fa-chart-pie' },
        ];
      case 'guidance':
        return [
          ...baseItems,
          { id: 'students', label: 'Student Records', icon: 'fas fa-user-graduate' },
          { id: 'counseling', label: 'Counseling Notes', icon: 'fas fa-clipboard' },
          { id: 'announcements', label: 'Send Announcements', icon: 'fas fa-bullhorn' },
        ];
      case 'parent':
        return [
          ...baseItems,
          { id: 'children', label: 'My Children', icon: 'fas fa-child' },
          { id: 'grades', label: 'View Grades', icon: 'fas fa-chart-line' },
          { id: 'attendance', label: 'Attendance', icon: 'fas fa-calendar-check' },
          { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn' },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <aside className="w-72 bg-white h-full flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 saas-gradient-bg rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-graduation-cap text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold saas-text-gradient">EduManage</h2>
            <p className="text-sm text-gray-500 capitalize font-medium">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`flex items-center space-x-3 w-full justify-start h-11 text-sm rounded-lg font-medium transition-all duration-200 ${
              currentSection === item.id
                ? 'bg-primary-50 text-primary-700 hover:bg-primary-100 shadow-sm border-l-3 border-primary-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            onClick={() => onSectionChange(item.id)}
            data-testid={`nav-${item.id}`}
          >
            <div className={`w-5 h-5 flex items-center justify-center ${
              currentSection === item.id ? 'text-primary-600' : 'text-gray-400'
            }`}>
              <i className={`${item.icon} text-sm`}></i>
            </div>
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="mb-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 saas-gradient-bg rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-semibold">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="flex items-center space-x-3 w-full justify-start text-gray-600 hover:bg-red-50 hover:text-red-600 h-11 rounded-lg font-medium transition-all duration-200"
          onClick={logout}
          data-testid="nav-logout"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="fas fa-sign-out-alt text-sm"></i>
          </div>
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};
