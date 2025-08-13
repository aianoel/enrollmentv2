import React from 'react';
import { StudentPaymentPortal } from '@/components/student/StudentPaymentPortal';
import { useAuth } from '@/contexts/AuthContext';

export const StudentPaymentPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center py-8">Access denied. Please log in.</div>;
  }

  if (user.role !== 'student') {
    return <div className="text-center py-8">Access denied. Student role required.</div>;
  }

  return <StudentPaymentPortal />;
};