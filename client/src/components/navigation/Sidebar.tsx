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
          { id: 'users', label: 'Manage Users', icon: 'fas fa-users-cog' },
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
    <aside className="w-48 bg-white/90 backdrop-blur-sm shadow-lg border-r border-gray-200/50 h-full">
      <div className="p-3 border-b border-gray-200/50">
        <h2 className="text-lg font-bold text-gray-800">EduManage</h2>
        <p className="text-xs text-gray-600 capitalize">{user.role}</p>
      </div>
      
      <nav className="p-2 space-y-1">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={currentSection === item.id ? 'default' : 'ghost'}
            className={`flex items-center space-x-2 w-full justify-start h-8 text-sm ${
              currentSection === item.id
                ? 'bg-primary-50 text-primary-600 hover:bg-primary-100 border-r-2 border-primary-500'
                : 'text-gray-700 hover:bg-gray-100/70'
            }`}
            onClick={() => onSectionChange(item.id)}
            data-testid={`nav-${item.id}`}
          >
            <i className={`${item.icon} w-4 text-xs`}></i>
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        ))}

        <div className="pt-3 border-t border-gray-200/50">
          <Button
            variant="ghost"
            className="flex items-center space-x-2 w-full justify-start text-gray-700 hover:bg-gray-100/70 h-8 text-sm"
            onClick={logout}
            data-testid="nav-logout"
          >
            <i className="fas fa-sign-out-alt w-4 text-xs"></i>
            <span className="text-xs">Logout</span>
          </Button>
        </div>
      </nav>
    </aside>
  );
};
