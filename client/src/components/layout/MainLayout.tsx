import React, { useState, useEffect } from 'react';
import { Header } from '../navigation/Header';
import { Sidebar } from '../navigation/Sidebar';
import { ChatPanel } from '../chat/ChatPanel';
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
import { EnhancedChatSystem } from '../chat/EnhancedChatSystem';
import { AdminControlPanel } from '../admin/AdminControlSimple';
import { UserManagement } from '../admin/UserManagement';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const { isOpen } = useChat();
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
    <div className="saas-layout flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="saas-sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`saas-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar 
          currentSection={currentSection} 
          onSectionChange={(section) => {
            setCurrentSection(section);
            if (isMobile) setIsSidebarOpen(false);
          }}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="saas-header">
          <Header 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            isMobile={isMobile}
          />
        </div>
        <main className="flex-1 overflow-auto bg-gray-50 h-full">
          <div className="w-full h-full saas-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* Enhanced Chat panel with SaaS design */}
      <div className={`saas-chat-panel ${isOpen ? 'open' : ''}`}>
        <EnhancedChatSystem />
      </div>
      
      {/* Chat panel overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900 bg-opacity-50"
          onClick={() => {}} // Let chat handle its own closing
        />
      )}
      
      <ChatPanel />
    </div>
  );
};
