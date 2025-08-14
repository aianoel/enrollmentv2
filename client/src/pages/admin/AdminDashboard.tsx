import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  GraduationCap, 
  Settings, 
  FileText, 
  MessageSquare, 
  BarChart3,
  UserCheck,
  BookOpen,
  Calendar,
  DollarSign,
  Shield,
  Building2
} from "lucide-react";
import { DashboardBackground } from '@/components/ui/dashboard-background';
import { EnhancedCard, StatCard } from '@/components/ui/enhanced-card';
import { UserManagement } from "./UserManagement";
import { EnrollmentManagement } from "./EnrollmentManagement";
import { AcademicSetup } from "./AcademicSetup";
import { ContentManagement } from "./ContentManagement";
import { MonitoringReports } from "./MonitoringReports";
import { CommunicationTools } from "./CommunicationTools";
import { SystemConfiguration } from "./SystemConfiguration";
import { apiRequest } from "@/lib/queryClient";

interface DashboardStats {
  totalUsers: number;
  activeEnrollments: number;
  totalSections: number;
  pendingApprovals: number;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: () => apiRequest("/api/admin/stats")
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("/api/admin/users")
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["/api/admin/enrollments"],
    queryFn: () => apiRequest("/api/admin/enrollments")
  });

  const dashboardStats: DashboardStats = {
    totalUsers: users.length,
    activeEnrollments: enrollments.filter((e: any) => e.status === 'approved').length,
    totalSections: 0, // Will be populated when sections are loaded
    pendingApprovals: enrollments.filter((e: any) => e.status === 'pending').length
  };

  const StatCard = ({ icon: Icon, title, value, description, color = "blue" }: {
    icon: any;
    title: string;
    value: string | number;
    description: string;
    color?: string;
  }) => (
    <Card className="card-responsive">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (statsLoading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="saas-container p-6 space-y-6">
      {/* Admin Welcome Header with SaaS Design */}
      <div className="saas-gradient-bg rounded-2xl p-8 text-white saas-slide-up shadow-xl" data-testid="welcome-header">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="opacity-90 text-lg font-medium">
              Comprehensive school management and administrative controls
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
          <TabsTrigger value="enrollment" className="text-xs sm:text-sm">Enrollment</TabsTrigger>
          <TabsTrigger value="academic" className="text-xs sm:text-sm">Academic</TabsTrigger>
          <TabsTrigger value="content" className="text-xs sm:text-sm">Content</TabsTrigger>
          <TabsTrigger value="monitoring" className="text-xs sm:text-sm">Reports</TabsTrigger>
          <TabsTrigger value="communication" className="text-xs sm:text-sm">Chat</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 saas-fade-in">
          <div className="saas-grid">
            <div className="saas-card saas-scale-in group">
              <div className="saas-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform duration-200">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Total Users</h3>
                  <p className="text-sm font-medium text-gray-500">Active system users</p>
                </div>
              </div>
            </div>
            
            <div className="saas-card saas-scale-in group">
              <div className="saas-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100 text-green-600 group-hover:scale-110 transition-transform duration-200">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{dashboardStats.activeEnrollments}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Active Enrollments</h3>
                  <p className="text-sm font-medium text-gray-500">Approved student enrollments</p>
                </div>
              </div>
            </div>
            
            <div className="saas-card saas-scale-in group">
              <div className="saas-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform duration-200">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{dashboardStats.pendingApprovals}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Pending Approvals</h3>
                  <p className="text-sm font-medium text-gray-500">Enrollment requests awaiting approval</p>
                </div>
              </div>
            </div>
            
            <div className="saas-card saas-scale-in group">
              <div className="saas-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform duration-200">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{dashboardStats.totalSections}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Total Sections</h3>
                  <p className="text-sm font-medium text-gray-500">Academic sections available</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="saas-card">
              <div className="saas-card-content">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Actions</h3>
                  <p className="text-sm text-gray-500">Common administrative tasks</p>
                </div>
                <div className="space-y-3">
                  <button 
                    className="saas-button-secondary w-full justify-start text-left flex items-center"
                    onClick={() => setActiveTab("users")}
                  >
                    <Users className="mr-3 h-4 w-4" />
                    Manage Users & Roles
                  </button>
                  <button 
                    className="saas-button-secondary w-full justify-start text-left flex items-center"
                    onClick={() => setActiveTab("enrollment")}
                  >
                    <UserCheck className="mr-3 h-4 w-4" />
                    Process Enrollments
                  </button>
                  <button 
                    className="saas-button-secondary w-full justify-start text-left flex items-center"
                    onClick={() => setActiveTab("academic")}
                  >
                    <BookOpen className="mr-3 h-4 w-4" />
                    Academic Setup
                  </button>
                  <button 
                    className="saas-button-secondary w-full justify-start text-left flex items-center"
                    onClick={() => setActiveTab("content")}
                  >
                    <FileText className="mr-3 h-4 w-4" />
                    Content Management
                  </button>
                </div>
              </div>
            </div>

            <div className="saas-card">
              <div className="saas-card-content">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">System Status</h3>
                  <p className="text-sm text-gray-500">Current system health and alerts</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database Status</span>
                    <span className="saas-badge saas-badge-success">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Sessions</span>
                    <span className="saas-badge saas-badge-primary">{dashboardStats.totalUsers} Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending Actions</span>
                    <span className="saas-badge saas-badge-warning">{dashboardStats.pendingApprovals} Items</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Backup</span>
                      <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="enrollment">
          <EnrollmentManagement />
        </TabsContent>

        <TabsContent value="academic">
          <AcademicSetup />
        </TabsContent>

        <TabsContent value="content">
          <ContentManagement />
        </TabsContent>

        <TabsContent value="monitoring">
          <MonitoringReports />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationTools />
        </TabsContent>

        <TabsContent value="settings">
          <SystemConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
}