import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Removed tabs import as we're using direct navigation now
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
// Removed component imports as we're using navigation to separate pages now

interface DashboardStats {
  totalUsers: number;
  activeEnrollments: number;
  pendingApprovals: number;
  totalSections: number;
}

interface AdminDashboardProps {
  onNavigate?: (section: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps = {}) {
  // Using navigation callback for proper routing

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
    { label: "Students", value: stats?.totalStudents || 0, color: "#3b82f6" },
    { label: "Teachers", value: stats?.totalTeachers || 0, color: "#10b981" },
    { label: "Staff", value: Math.max(0, (dashboardStats?.totalUsers || 0) - (stats?.totalStudents || 0) - (stats?.totalTeachers || 0)), color: "#f59e0b" }
  ];

  const progressData = [
    { label: "Active Enrollments", value: dashboardStats?.activeEnrollments || 0, max: dashboardStats?.totalUsers || 1 },
    { label: "Pending Approvals", value: dashboardStats?.pendingApprovals || 0, max: (dashboardStats?.activeEnrollments || 0) + (dashboardStats?.pendingApprovals || 1) },
    { label: "Total Sections", value: dashboardStats?.totalSections || 0, max: Math.max(dashboardStats?.totalSections || 1, 10) }
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
          <nav className="w-full">
            <div className="grid w-full grid-cols-8 bg-gray-50 border border-gray-200 rounded-lg">
              <button 
                onClick={() => onNavigate?.('dashboard')}
                className="px-4 py-2 text-sm font-medium bg-white text-blue-600 border-blue-200 rounded-l-lg border-r"
                data-testid="nav-home"
              >
                Home
              </button>
              <button 
                onClick={() => onNavigate?.('admin-users')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border-r"
                data-testid="nav-users"
              >
                Users
              </button>
              <button 
                onClick={() => onNavigate?.('admin-enrollment')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border-r"
                data-testid="nav-enrollment"
              >
                Enrollment
              </button>
              <button 
                onClick={() => onNavigate?.('admin-academic')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border-r"
                data-testid="nav-academic"
              >
                Academic
              </button>
              <button 
                onClick={() => onNavigate?.('admin-content')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border-r"
                data-testid="nav-content"
              >
                Content
              </button>
              <button 
                onClick={() => onNavigate?.('admin-reports')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border-r"
                data-testid="nav-reports"
              >
                Reports
              </button>
              <button 
                onClick={() => onNavigate?.('admin-communication')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border-r"
                data-testid="nav-chat"
              >
                Chat
              </button>
              <button 
                onClick={() => onNavigate?.('admin-settings')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-r-lg"
                data-testid="nav-settings"
              >
                Settings
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <ModernStatCard 
          title="Total Users" 
          value={dashboardStats?.totalUsers || 0} 
          change={0}
          changeLabel=""
          icon={Users}
          variant="success"
        />
        <ModernStatCard 
          title="Active Enrollments" 
          value={dashboardStats?.activeEnrollments || 0} 
          change={0}
          changeLabel=""
          icon={CheckCircle}
          variant="success"
        />
        <ModernStatCard 
          title="Total Teachers" 
          value={stats?.totalTeachers || 0} 
          change={0}
          changeLabel=""
          icon={FileText}
          variant="success"
        />
        <ModernStatCard 
          title="Total Enrolled" 
          value={dashboardStats?.activeEnrollments || 0} 
          change={0}
          changeLabel=""
          icon={GraduationCap}
          variant="success"
        />
        <ModernStatCard 
          title="Pending Approvals" 
          value={dashboardStats?.pendingApprovals || 0} 
          change={0}
          changeLabel=""
          icon={Clock}
          variant="warning"
        />
        <ModernStatCard 
          title="Total Sections" 
          value={dashboardStats?.totalSections || 0} 
          change={0}
          changeLabel=""
          icon={Building2}
          variant="success"
        />
      </div>

      <div className="p-6">
        <div className="space-y-6">
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

              <ChartCard title="Enrollment Status">
                <SimpleDonutChart data={[
                  { label: "Approved", value: dashboardStats?.activeEnrollments || 0, color: "#10b981" },
                  { label: "Pending", value: dashboardStats?.pendingApprovals || 0, color: "#f59e0b" },
                  { label: "Available", value: Math.max(0, (dashboardStats?.totalSections || 0) * 25 - (dashboardStats?.activeEnrollments || 0) - (dashboardStats?.pendingApprovals || 0)), color: "#e5e7eb" }
                ]} />
              </ChartCard>

              {/* Progress Cards */}
              <ProgressCard title="School Metrics" items={progressData} />

              {/* School Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">School Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Users</span>
                      <span className="text-sm font-medium">{dashboardStats?.totalUsers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Teachers</span>
                      <span className="text-sm font-medium">{stats?.totalTeachers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Grade</span>
                      <span className="text-sm font-medium">{stats?.averageGrade || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">School Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                  <div className="text-sm text-blue-600">Total Students</div>
                  <div className="text-sm text-gray-500 mt-1">{stats?.newEnrollments || 0} new enrollments</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}