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
import { RegistrarDashboard } from '../../pages/registrar/RegistrarDashboard';
import { AccountingDashboard } from '../../pages/accounting/AccountingDashboard';
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
        case 'teacher':
          return <EnhancedTeacherDashboard />;
        case 'student':
          return <EnhancedStudentDashboard />;
        case 'parent':
          return <ParentDashboard />;
        case 'guidance':
          return <GuidanceDashboard />;
        case 'registrar':
          return <RegistrarDashboard />;
        case 'accounting':
          return <AccountingDashboard />;
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
      // Role-specific sections can be added here
      case 'classes':
        return <TeacherDashboard />; // For now, redirect to teacher dashboard
      case 'users':
        return <AdminDashboard />; // For now, redirect to admin dashboard
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />
        <main className={`flex-1 p-6 transition-all duration-300 ${isOpen ? 'mr-80' : ''}`}>
          {renderContent()}
        </main>
        <ChatPanel />
      </div>
    </div>
  );
};
