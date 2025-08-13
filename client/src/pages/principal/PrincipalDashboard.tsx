import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Bell,
  Settings,
  BarChart3,
  DollarSign
} from "lucide-react";

export function PrincipalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch principal-specific data
  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ["/api/announcements/principal"],
    queryFn: () => apiRequest("/api/announcements?role=principal"),
    refetchInterval: 30000 // Refresh every 30 seconds for real-time updates
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: () => apiRequest("/api/events"),
    refetchInterval: 30000
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports/academic"],
    queryFn: () => apiRequest("/api/reports?type=academic"),
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: schoolStats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/principal/stats"],
    queryFn: () => apiRequest("/api/principal/stats"),
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const { data: financialOverview = {}, isLoading: financialLoading } = useQuery({
    queryKey: ["/api/principal/financial"],
    queryFn: () => apiRequest("/api/principal/financial"),
    refetchInterval: 300000
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (statsLoading) {
    return <div className="flex items-center justify-center h-64">Loading principal dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Principal Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive school oversight and strategic management
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schoolStats.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{schoolStats.newEnrollments || 0} new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schoolStats.totalTeachers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {schoolStats.activeTeachers || 0} active this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Academic Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schoolStats.averageGrade || "N/A"}</div>
                <p className="text-xs text-muted-foreground">
                  School-wide average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{financialOverview.monthlyRevenue?.toLocaleString() || "0"}</div>
                <p className="text-xs text-muted-foreground">
                  +{financialOverview.revenueGrowth || 0}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>Latest school-wide communications</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  {announcementsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading announcements...</p>
                  ) : announcements.length > 0 ? (
                    <div className="space-y-3">
                      {announcements.slice(0, 5).map((announcement: any) => (
                        <div key={announcement.id} className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{announcement.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {formatDate(announcement.createdAt)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {announcement.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No announcements available</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>School calendar and important dates</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  {eventsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading events...</p>
                  ) : events.length > 0 ? (
                    <div className="space-y-3">
                      {events.slice(0, 5).map((event: any) => (
                        <div key={event.id} className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{event.eventName || event.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {formatDate(event.eventDate)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No upcoming events</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                School Announcements
              </CardTitle>
              <CardDescription>Manage and review all school communications</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {announcementsLoading ? (
                  <p className="text-center text-muted-foreground">Loading announcements...</p>
                ) : announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map((announcement: any) => (
                      <div key={announcement.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold">{announcement.title}</h3>
                            <p className="text-sm text-muted-foreground">{announcement.content}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Created: {formatDate(announcement.createdAt)}</span>
                              {announcement.createdBy && (
                                <span>• By: User {announcement.createdBy}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No announcements available</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                School Events & Calendar
              </CardTitle>
              <CardDescription>Manage school events and important dates</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {eventsLoading ? (
                  <p className="text-center text-muted-foreground">Loading events...</p>
                ) : events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event: any) => (
                      <div key={event.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold">{event.eventName || event.title}</h3>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline">
                                {formatDate(event.eventDate)}
                              </Badge>
                              {event.createdBy && (
                                <span>Created by: User {event.createdBy}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No events scheduled</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Academic Reports & Analytics
              </CardTitle>
              <CardDescription>School performance reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {reportsLoading ? (
                  <p className="text-center text-muted-foreground">Loading reports...</p>
                ) : reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report: any) => (
                      <div key={report.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold">{report.reportType} Report</h3>
                            <p className="text-sm text-muted-foreground">{report.content}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary">{report.reportType}</Badge>
                              <span>Generated: {formatDate(report.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No reports available</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Overview
              </CardTitle>
              <CardDescription>School financial performance and budget tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {financialLoading ? (
                <p className="text-center text-muted-foreground">Loading financial data...</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Revenue Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                          <span className="font-medium">₱{financialOverview.monthlyRevenue?.toLocaleString() || "0"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Yearly Revenue</span>
                          <span className="font-medium">₱{financialOverview.yearlyRevenue?.toLocaleString() || "0"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Outstanding Payments</span>
                          <span className="font-medium text-orange-600">₱{financialOverview.outstandingPayments?.toLocaleString() || "0"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Budget Allocation</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Faculty Expenses</span>
                          <span className="font-medium">₱{financialOverview.facultyExpenses?.toLocaleString() || "0"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Facility Maintenance</span>
                          <span className="font-medium">₱{financialOverview.facilityExpenses?.toLocaleString() || "0"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Academic Resources</span>
                          <span className="font-medium">₱{financialOverview.academicExpenses?.toLocaleString() || "0"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                School Governance & Policies
              </CardTitle>
              <CardDescription>Strategic planning and policy management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Review Academic Policies
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Faculty Performance Review
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Generate Annual Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      System Configuration
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Strategic Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Student Satisfaction</span>
                      <Badge variant="secondary">{schoolStats.studentSatisfaction || "N/A"}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Faculty Retention</span>
                      <Badge variant="secondary">{schoolStats.facultyRetention || "N/A"}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Academic Achievement</span>
                      <Badge variant="secondary">{schoolStats.academicAchievement || "N/A"}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Budget Efficiency</span>
                      <Badge variant="secondary">{schoolStats.budgetEfficiency || "N/A"}%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}