import React, { useState } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const { isOpen } = useChat();
  const [currentSection, setCurrentSection] = useState('dashboard');

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
        return <AdminDashboard />; // For now, redirect to admin dashboard
      case 'admin-control':
        return <AdminControlPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <Sidebar 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      
      {/* Enhanced Chat panel with real-time users */}
      {isOpen && (
        <div className="w-80 border-l border-gray-200/50 bg-white/95 backdrop-blur-sm shadow-xl">
          <EnhancedChatSystem />
        </div>
      )}
      <ChatPanel />
    </div>
  );
};
