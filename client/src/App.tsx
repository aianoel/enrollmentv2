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
import { LandingPage } from "./pages/LandingPage";
import { useAuth } from "./contexts/AuthContext";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'enrollment'>('landing');

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show main application with chat provider for authenticated users
  if (user) {
    return (
      <ChatProvider>
        <MainLayout />
      </ChatProvider>
    );
  }

  // Show enrollment portal if requested
  if (currentView === 'enrollment') {
    return (
      <EnrollmentPortal 
        onBackToLogin={() => setCurrentView('landing')} 
      />
    );
  }

  // Show login form if requested
  if (currentView === 'login') {
    return (
      <LoginForm 
        onLogin={(loggedInUser) => {
          // The context will update the user state, triggering a re-render
          // The user state will be set by the AuthContext, so we don't need to do anything here
          // The component will re-render and show the MainLayout since user will be truthy
        }}
      />
    );
  }

  // Show landing page by default
  return (
    <LandingPage 
      onLoginClick={() => setCurrentView('login')}
      onEnrollmentClick={() => setCurrentView('enrollment')}
    />
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
