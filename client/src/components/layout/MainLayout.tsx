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
import { AdminDashboard } from '../../pages/admin/AdminDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

export const MainLayout: React.FC = () => {
  const { userProfile } = useAuth();
  const { isOpen } = useChat();
  const [currentSection, setCurrentSection] = useState('dashboard');

  if (!userProfile) return null;

  const renderContent = () => {
    // Role-specific dashboard routing
    if (currentSection === 'dashboard') {
      switch (userProfile.role) {
        case 'teacher':
          return <TeacherDashboard />;
        case 'admin':
          return <AdminDashboard />;
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
