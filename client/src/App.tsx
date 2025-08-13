import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { LoginForm } from "./components/auth/LoginForm";
import { EnrollmentPortal } from "./components/enrollment/EnrollmentPortal";
import { MainLayout } from "./components/layout/MainLayout";
import { useAuth } from "./contexts/AuthContext";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { user, userProfile, loading } = useAuth();
  const [showEnrollment, setShowEnrollment] = useState(false);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show enrollment portal if requested
  if (showEnrollment && !user) {
    return (
      <EnrollmentPortal 
        onBackToLogin={() => setShowEnrollment(false)} 
      />
    );
  }

  // Show login form if not authenticated
  if (!user || !userProfile) {
    return (
      <LoginForm 
        onEnrollmentClick={() => setShowEnrollment(true)} 
      />
    );
  }

  // Show main application with chat provider for authenticated users
  return (
    <ChatProvider>
      <MainLayout />
    </ChatProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/not-found" component={NotFound} />
      <Route component={AppContent} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
