import React, { useState, useEffect } from 'react';
import { Header } from '../navigation/Header';
import { Sidebar } from '../navigation/Sidebar';

import { Dashboard } from '../../pages/Dashboard';
import { Grades } from '../../pages/Grades';
import { Assignments } from '../../pages/Assignments';
import { Modules } from '../../pages/Modules';
import { Meetings } from '../../pages/Meetings';
import { Announcements } from '../../pages/Announcements';
import { TeacherDashboard } from '../../pages/teacher/TeacherDashboard';
import { EnhancedTeacherDashboard } from '../../pages/teacher/EnhancedTeacherDashboard';
import { AdminDashboard } from '../../pages/admin/AdminDashboard';
import { StudentDashboard } from '../../pages/student/StudentDashboard';
import { EnhancedStudentDashboard } from '../../pages/student/EnhancedStudentDashboard';
import { ParentDashboard } from '../../pages/parent/ParentDashboard';
import { GuidanceDashboard } from '../../pages/guidance/GuidanceDashboard';
import { EnhancedGuidanceDashboard } from '../../pages/guidance/EnhancedGuidanceDashboard';
import { RegistrarDashboard } from '../../pages/registrar/RegistrarDashboard';
import { EnhancedRegistrarDashboard } from '../../pages/registrar/EnhancedRegistrarDashboard';
import { AccountingDashboard } from '../../pages/accounting/AccountingDashboard';
import { EnhancedAccountingDashboard } from '../../pages/accounting/EnhancedAccountingDashboard';
import { PrincipalDashboard } from '../../pages/principal/PrincipalDashboard';
import { AcademicCoordinatorDashboard } from '../../pages/academic/AcademicCoordinatorDashboard';
import { StudentPaymentPage } from '../../pages/student/StudentPaymentPage';
import { FacebookStyleChat } from '../chat/FacebookStyleChat';
import { AdminControlPanel } from '../admin/AdminControlSimple';
import { UserManagement } from '../admin/UserManagement';
import { useAuth } from '../../contexts/AuthContext';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false); // Auto-close mobile sidebar on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!user) return null;

  const renderContent = () => {
    // Role-specific dashboard routing
    if (currentSection === 'dashboard') {
      switch (user.role) {
        case 'admin':
          return <AdminDashboard />;
        case 'principal':
          return <PrincipalDashboard />;
        case 'academic_coordinator':
          return <AcademicCoordinatorDashboard />;
        case 'teacher':
          return <EnhancedTeacherDashboard />;
        case 'student':
          return <EnhancedStudentDashboard />;
        case 'parent':
          return <ParentDashboard />;
        case 'guidance':
          return <EnhancedGuidanceDashboard />;
        case 'registrar':
          return <EnhancedRegistrarDashboard />;
        case 'accounting':
          return <EnhancedAccountingDashboard />;
        default:
          return <Dashboard />;
      }
    }

    // Common sections based on current selection
    switch (currentSection) {
      case 'grades':
        return <Grades />;
      case 'assignments':
        return <Assignments />;
      case 'modules':
        return <Modules />;
      case 'meetings':
        return <Meetings />;
      case 'announcements':
        return <Announcements />;
      case 'payments':
        // Student payments portal
        return user.role === 'student' ? <StudentPaymentPage /> : <Dashboard />;
      // Role-specific sections can be added here
      case 'classes':
        return <TeacherDashboard />; // For now, redirect to teacher dashboard
      case 'users':
        return <UserManagement />;
      case 'admin-control':
        return <AdminControlPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - No borders, full height */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed lg:relative lg:translate-x-0 z-50 lg:z-auto
        w-64 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar 
          currentSection={currentSection} 
          onSectionChange={(section) => {
            setCurrentSection(section);
            if (isMobile) setIsSidebarOpen(false);
          }}
        />
      </div>
      
      {/* Main content area - No borders, full space utilization */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header - No borders */}
        <Header 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobile={isMobile}
        />
        
        {/* Content area - No borders, full height */}
        <main className="flex-1 overflow-auto h-full">
          <div className="w-full h-full">
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* Facebook Style Chat */}
      <FacebookStyleChat />
    </div>
  );
};
