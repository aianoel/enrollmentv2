import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  FileText,
  BookOpen,
  BarChart3,
  MessageSquare,
  Settings,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Activity,
  Bell,
  DollarSign,
  Shield,
  Building2,
  CheckCircle,
  Clock
} from "lucide-react";
import { DashboardBackground } from '@/components/ui/dashboard-background';
import { EnhancedCard, StatCard } from '@/components/ui/enhanced-card';
import { StatCard as ModernStatCard, ActivityFeed, ChartCard, ProgressCard, SimpleDonutChart, DashboardLayout } from '@/components/ui/modern-dashboard';
import { UserManagement } from "./UserManagement";
import { EnrollmentManagement } from "./EnrollmentManagement";
import { AcademicSetup } from "./AcademicSetup";
import { ContentManagement } from "./ContentManagement";
import { MonitoringReports } from "./MonitoringReports";
import { CommunicationTools } from "./CommunicationTools";
import { SystemConfiguration } from "./SystemConfiguration";

interface DashboardStats {
  totalUsers: number;
  activeEnrollments: number;
  pendingApprovals: number;
  totalSections: number;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard-stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    }
  });

  // Fetch general stats
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    }
  });

  if (statsLoading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  // Sample activity data
  const sampleActivities = [
    {
      id: "1",
      user: { name: "John Smith", initials: "JS" },
      action: "Submitted Math Assignment #5",
      timestamp: "2 minutes ago",
      type: "assignment" as const
    },
    {
      id: "2", 
      user: { name: "Sarah Wilson", initials: "SW" },
      action: "Received grade for Science Quiz",
      timestamp: "5 minutes ago",
      type: "grade" as const
    },
    {
      id: "3",
      user: { name: "Mike Johnson", initials: "MJ" },
      action: "Enrolled in Advanced Physics",
      timestamp: "10 minutes ago", 
      type: "enrollment" as const
    },
    {
      id: "4",
      user: { name: "Lisa Brown", initials: "LB" },
      action: "Scheduled parent-teacher meeting",
      timestamp: "15 minutes ago",
      type: "meeting" as const
    }
  ];

  const chartData = [
    { label: "Students", value: (dashboardStats?.totalUsers || 0) * 0.8, color: "#3b82f6" },
    { label: "Teachers", value: (dashboardStats?.totalUsers || 0) * 0.15, color: "#10b981" },
    { label: "Staff", value: (dashboardStats?.totalUsers || 0) * 0.05, color: "#f59e0b" }
  ];

  const progressData = [
    { label: "Course Completion", value: 145, max: 200 },
    { label: "Assignment Submissions", value: 89, max: 100 },
    { label: "Attendance Rate", value: 95, max: 100 }
  ];

  return (
    <DashboardLayout>
      {/* Header with navigation tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Comprehensive school management and administrative controls</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Source code
            </Button>
            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
              <Bell className="h-5 w-5 text-gray-600" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Admin User</span>
                <span className="text-xs text-gray-500">Administrator</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 bg-gray-50 border border-gray-200">
              <TabsTrigger value="overview" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-blue-200">
                Home
              </TabsTrigger>
              <TabsTrigger value="users" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                Users
              </TabsTrigger>
              <TabsTrigger value="enrollment" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                Enrollment
              </TabsTrigger>
              <TabsTrigger value="academic" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                Academic
              </TabsTrigger>
              <TabsTrigger value="content" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                Content
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                Reports
              </TabsTrigger>
              <TabsTrigger value="communication" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                Chat
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <ModernStatCard 
          title="New Students" 
          value={43} 
          change={6}
          changeLabel=""
          icon={Users}
          variant="success"
        />
        <ModernStatCard 
          title="Completed Today" 
          value={17} 
          change={-3}
          changeLabel=""
          icon={CheckCircle}
          variant="error"
        />
        <ModernStatCard 
          title="New Assignments" 
          value={7} 
          change={9}
          changeLabel=""
          icon={FileText}
          variant="success"
        />
        <ModernStatCard 
          title="Total Enrolled" 
          value="27.3k" 
          change={3}
          changeLabel=""
          icon={GraduationCap}
          variant="success"
        />
        <ModernStatCard 
          title="Daily Earnings" 
          value="$95" 
          change={-2}
          changeLabel=""
          icon={DollarSign}
          variant="error"
        />
        <ModernStatCard 
          title="Active Courses" 
          value={621} 
          change={-1}
          changeLabel=""
          icon={BookOpen}
          variant="error"
        />
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsContent value="overview" className="space-y-6">
          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Development Activity Chart */}
              <ChartCard title="Student Progress Activity" className="h-80">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Interactive charts would be implemented here</p>
                    <p className="text-sm">showing student progress over time</p>
                  </div>
                </div>
              </ChartCard>

              {/* Documentation Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Read our documentation</span>
                  <span className="text-blue-600">with code samples.</span>
                </div>
              </div>

              {/* Activity Table */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Development Activity</CardTitle>
                      <CardDescription>Recent updates and changes</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sampleActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 py-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">{activity.user.initials}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{activity.user.name}</span>
                            <span className="text-gray-500">{activity.action}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">{activity.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Charts and Progress */}
            <div className="space-y-6">
              {/* Donut Charts */}
              <ChartCard title="User Distribution">
                <SimpleDonutChart data={chartData} />
              </ChartCard>

              <ChartCard title="Course Progress">
                <SimpleDonutChart data={[
                  { label: "Completed", value: 60, color: "#10b981" },
                  { label: "In Progress", value: 30, color: "#3b82f6" },
                  { label: "Not Started", value: 10, color: "#e5e7eb" }
                ]} />
              </ChartCard>

              {/* Progress Cards */}
              <ProgressCard title="School Metrics" items={progressData} />

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">New feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Student satisfaction</span>
                      <span className="text-sm font-medium">4.8/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Course completion</span>
                      <span className="text-sm font-medium">89%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Today profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,423</div>
                  <div className="text-sm text-green-600">+12% from yesterday</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="enrollment" className="space-y-6">
          <EnrollmentManagement />
        </TabsContent>
        
        <TabsContent value="academic" className="space-y-6">
          <AcademicSetup />
        </TabsContent>
        
        <TabsContent value="content" className="space-y-6">
          <ContentManagement />
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-6">
          <MonitoringReports />
        </TabsContent>
        
        <TabsContent value="communication" className="space-y-6">
          <CommunicationTools />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <SystemConfiguration />
        </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}