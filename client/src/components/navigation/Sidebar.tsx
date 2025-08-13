import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentSection, onSectionChange }) => {
  const { userProfile, logout } = useAuth();

  if (!userProfile) return null;

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' }
    ];

    switch (userProfile.role) {
      case 'student':
        return [
          ...baseItems,
          { id: 'grades', label: 'My Grades', icon: 'fas fa-chart-line' },
          { id: 'assignments', label: 'Assignments', icon: 'fas fa-tasks' },
          { id: 'modules', label: 'Learning Modules', icon: 'fas fa-book' },
          { id: 'meetings', label: 'Meetings', icon: 'fas fa-video' },
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
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={currentSection === item.id ? 'default' : 'ghost'}
            className={`flex items-center space-x-3 w-full justify-start ${
              currentSection === item.id
                ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => onSectionChange(item.id)}
            data-testid={`nav-${item.id}`}
          >
            <i className={`${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </Button>
        ))}

        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="flex items-center space-x-3 w-full justify-start text-gray-700 hover:bg-gray-100"
            onClick={logout}
            data-testid="nav-logout"
          >
            <i className="fas fa-sign-out-alt w-5"></i>
            <span>Logout</span>
          </Button>
        </div>
      </nav>
    </aside>
  );
};
