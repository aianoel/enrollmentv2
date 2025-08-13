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
    <Card>
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
    <DashboardBackground userRole="admin" className="p-6">
      <div className="space-y-6">
        <EnhancedCard 
          variant="gradient" 
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0"
          data-testid="welcome-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="opacity-90">
                Comprehensive school management and administrative controls
              </p>
            </div>
            <Shield className="h-16 w-16 opacity-20" />
          </div>
        </EnhancedCard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="monitoring">Reports</TabsTrigger>
          <TabsTrigger value="communication">Chat</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Users}
              title="Total Users"
              value={dashboardStats.totalUsers}
              description="Active system users"
              color="blue"
            />
            <StatCard
              icon={UserCheck}
              title="Active Enrollments"
              value={dashboardStats.activeEnrollments}
              description="Approved student enrollments"
              color="green"
            />
            <StatCard
              icon={FileText}
              title="Pending Approvals"
              value={dashboardStats.pendingApprovals}
              description="Enrollment requests awaiting approval"
              color="orange"
            />
            <StatCard
              icon={GraduationCap}
              title="Total Sections"
              value={dashboardStats.totalSections}
              description="Academic sections available"
              color="purple"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("users")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users & Roles
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("enrollment")}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Process Enrollments
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("academic")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Academic Setup
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("content")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Content Management
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Sessions</span>
                  <Badge variant="secondary">{dashboardStats.totalUsers} Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Actions</span>
                  <Badge variant="destructive">{dashboardStats.pendingApprovals} Items</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Backup</span>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
              </CardContent>
            </Card>
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
    </DashboardBackground>
  );
}