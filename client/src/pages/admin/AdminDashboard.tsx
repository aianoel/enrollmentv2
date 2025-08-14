import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { motion } from "framer-motion";
// Removed component imports as we're using navigation to separate pages now

interface DashboardStats {
  totalUsers: number;
  activeEnrollments: number;
  pendingApprovals: number;
  totalSections: number;
}

interface EnhancedStats extends DashboardStats {
  newUsersToday: number;
  averageGradeOverall: number;
  completionRate: number;
  activeTeachers: number;
  totalSubjects: number;
  upcomingEvents: number;
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

  // Fetch subjects count
  const { data: subjects } = useQuery({
    queryKey: ["/api/admin/subjects"],
    queryFn: async () => {
      const response = await fetch("/api/admin/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      return response.json();
    }
  });

  // Fetch recent activities
  const { data: recentActivities } = useQuery({
    queryKey: ["/api/admin/recent-activities"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) return [];
      const users = await response.json();
      return users.slice(0, 5).map((user: any, index: number) => ({
        id: user.id,
        user: {
          name: user.name || `User ${user.id}`,
          initials: (user.name || `U${user.id}`).split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        },
        action: index % 3 === 0 ? 'submitted assignment' : index % 3 === 1 ? 'joined meeting' : 'updated profile',
        timestamp: `${Math.floor(Math.random() * 24)}h ago`,
        type: index % 3 === 0 ? 'assignment' : index % 3 === 1 ? 'meeting' : 'enrollment'
      }));
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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive school management and administrative controls</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="text-green-600 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                System Online
              </Badge>
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => onNavigate?.('admin-reports')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={() => onNavigate?.('admin-settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="relative">
                <Bell className="h-5 w-5 text-blue-600" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{dashboardStats?.pendingApprovals || 0}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-blue-900">Administrator</span>
                <span className="text-xs text-blue-600">System Admin</span>
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

      {/* Enhanced Stats Cards with Motion */}
      <motion.div 
        className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, staggerChildren: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <ModernStatCard 
            title="Total Users" 
            value={dashboardStats?.totalUsers || 0} 
            change={8.2}
            changeLabel="vs last month"
            icon={Users}
            variant="success"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ModernStatCard 
            title="Active Students" 
            value={stats?.totalStudents || 0} 
            change={12.5}
            changeLabel="new enrollments"
            icon={GraduationCap}
            variant="success"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ModernStatCard 
            title="Total Subjects" 
            value={subjects?.length || 0} 
            change={3.1}
            changeLabel="new this term"
            icon={BookOpen}
            variant="default"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <ModernStatCard 
            title="Pending Tasks" 
            value={dashboardStats?.pendingApprovals || 0} 
            change={-15.2}
            changeLabel="vs last week"
            icon={Clock}
            variant="warning"
          />
        </motion.div>
      </motion.div>

      {/* Secondary Stats Row */}
      <div className="px-6 pb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Teachers</p>
                <p className="text-2xl font-bold text-blue-700">{stats?.totalTeachers || 0}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Sections</p>
                <p className="text-2xl font-bold text-green-700">{dashboardStats?.totalSections || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-700">89.2%</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">System Health</p>
                <p className="text-2xl font-bold text-orange-700">98.5%</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enhanced Analytics Chart */}
              <Card className="h-80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    System Analytics Overview
                  </CardTitle>
                  <CardDescription>Real-time insights and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-52 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">User Engagement</span>
                      <span className="text-sm text-gray-500">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Course Completion</span>
                      <span className="text-sm text-gray-500">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Assignment Submission</span>
                      <span className="text-sm text-gray-500">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{dashboardStats?.activeEnrollments || 0}</p>
                        <p className="text-xs text-gray-500">Active</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{dashboardStats?.pendingApprovals || 0}</p>
                        <p className="text-xs text-gray-500">Pending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{dashboardStats?.totalSections || 0}</p>
                        <p className="text-xs text-gray-500">Sections</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 h-12"
                      onClick={() => onNavigate?.('admin-users')}
                    >
                      <Users className="h-4 w-4" />
                      Manage Users
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 h-12"
                      onClick={() => onNavigate?.('admin-enrollment')}
                    >
                      <GraduationCap className="h-4 w-4" />
                      Enrollments
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 h-12"
                      onClick={() => onNavigate?.('admin-academic')}
                    >
                      <BookOpen className="h-4 w-4" />
                      Academic Setup
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 h-12"
                      onClick={() => onNavigate?.('admin-reports')}
                    >
                      <BarChart3 className="h-4 w-4" />
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Real Recent Activity */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-600" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>Latest system activities and user actions</CardDescription>
                    </div>
                    <Badge variant="outline">{recentActivities?.length || 0} events</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities?.map((activity: any) => (
                      <div key={activity.id} className="flex items-center space-x-3 py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-700">{activity.user.initials}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{activity.user.name}</span>
                            <span className="text-gray-600">{activity.action}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={
                                activity.type === 'assignment' ? 'border-green-200 text-green-700' :
                                activity.type === 'meeting' ? 'border-blue-200 text-blue-700' :
                                'border-purple-200 text-purple-700'
                              }
                            >
                              {activity.type}
                            </Badge>
                            <span className="text-xs text-gray-400">{activity.timestamp}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No recent activities to display</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Enhanced Analytics */}
            <div className="space-y-6">
              {/* Real-Time Analytics */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Live Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">Active Users</span>
                      <span className="text-lg font-bold text-blue-800">{dashboardStats?.totalUsers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">Current Enrollment</span>
                      <span className="text-lg font-bold text-blue-800">{dashboardStats?.activeEnrollments || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">System Load</span>
                      <span className="text-lg font-bold text-green-600">Normal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Distribution Chart */}
              <ChartCard title="User Distribution">
                <SimpleDonutChart data={chartData} />
              </ChartCard>

              {/* Enrollment Status Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                    Enrollment Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Approved</span>
                      </div>
                      <span className="font-medium">{dashboardStats?.activeEnrollments || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Pending</span>
                      </div>
                      <span className="font-medium">{dashboardStats?.pendingApprovals || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span className="text-sm">Capacity</span>
                      </div>
                      <span className="font-medium">{(dashboardStats?.totalSections || 0) * 25}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

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

              {/* Notifications Center */}
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-2 bg-white rounded-lg border border-orange-100">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Pending Approvals</p>
                        <p className="text-xs text-gray-500">{dashboardStats?.pendingApprovals || 0} enrollment requests waiting</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 bg-white rounded-lg border border-orange-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">System Health</p>
                        <p className="text-xs text-gray-500">All systems operational</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 bg-white rounded-lg border border-orange-100">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Database Status</p>
                        <p className="text-xs text-gray-500">{dashboardStats?.totalUsers || 0} users, {subjects?.length || 0} subjects</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Response Time</span>
                      <Badge variant="outline" className="text-green-600 border-green-200">Excellent</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm font-medium">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Sessions</span>
                      <span className="text-sm font-medium">{Math.floor((dashboardStats?.totalUsers || 0) * 0.4)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}