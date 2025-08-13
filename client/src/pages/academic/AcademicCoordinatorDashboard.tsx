import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  ClipboardList,
  Target,
  Award,
  ChartBar,
  Clock
} from "lucide-react";

export function AcademicCoordinatorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch academic coordinator specific data
  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ["/api/announcements/academic_coordinator"],
    queryFn: () => apiRequest("/api/announcements?role=academic_coordinator"),
    refetchInterval: 30000
  });

  const { data: curriculumData = {}, isLoading: curriculumLoading } = useQuery({
    queryKey: ["/api/academic/curriculum"],
    queryFn: () => apiRequest("/api/academic/curriculum"),
    refetchInterval: 60000
  });

  const { data: teacherPerformance = [], isLoading: teacherLoading } = useQuery({
    queryKey: ["/api/academic/teacher-performance"],
    queryFn: () => apiRequest("/api/academic/teacher-performance"),
    refetchInterval: 300000
  });

  // Fetch all teachers data
  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ["/api/academic/teachers"],
    queryFn: () => apiRequest("/api/academic/teachers"),
    refetchInterval: 300000
  });

  // Fetch teacher statistics
  const { data: teacherStats = {}, isLoading: teacherStatsLoading } = useQuery({
    queryKey: ["/api/academic/teachers/stats"],
    queryFn: () => apiRequest("/api/academic/teachers/stats"),
    refetchInterval: 300000
  });

  const { data: academicReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports/academic"],
    queryFn: () => apiRequest("/api/reports?type=academic"),
    refetchInterval: 60000
  });

  const { data: academicStats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/academic/stats"],
    queryFn: () => apiRequest("/api/academic/stats"),
    refetchInterval: 300000
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events/academic"],
    queryFn: () => apiRequest("/api/events?category=academic"),
    refetchInterval: 30000
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (statsLoading) {
    return <div className="flex items-center justify-center h-64">Loading academic coordinator dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Academic Coordinator Dashboard</h1>
        <p className="text-muted-foreground">
          Curriculum management and academic excellence oversight
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{academicStats.totalSubjects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across {academicStats.totalGrades || 0} grade levels
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teacherStats.totalTeachers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {teacherStats.activeTeachers || 0} currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Curriculum Progress</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{academicStats.curriculumProgress || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  This academic year
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Academic Achievement</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{academicStats.averageGrade || "N/A"}</div>
                <p className="text-xs text-muted-foreground">
                  School-wide average
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Academic Announcements</CardTitle>
                <CardDescription>Latest curriculum and academic updates</CardDescription>
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
                    <p className="text-sm text-muted-foreground">No academic announcements</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Events</CardTitle>
                <CardDescription>Curriculum-related events and milestones</CardDescription>
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
                    <p className="text-sm text-muted-foreground">No academic events scheduled</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Curriculum Management
              </CardTitle>
              <CardDescription>Oversee and manage academic curriculum</CardDescription>
            </CardHeader>
            <CardContent>
              {curriculumLoading ? (
                <p className="text-center text-muted-foreground">Loading curriculum data...</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Curriculum Progress</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Grade 10 Curriculum</span>
                            <span>{curriculumData.grade10Progress || 0}%</span>
                          </div>
                          <Progress value={curriculumData.grade10Progress || 0} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Grade 11 Curriculum</span>
                            <span>{curriculumData.grade11Progress || 0}%</span>
                          </div>
                          <Progress value={curriculumData.grade11Progress || 0} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Grade 12 Curriculum</span>
                            <span>{curriculumData.grade12Progress || 0}%</span>
                          </div>
                          <Progress value={curriculumData.grade12Progress || 0} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Subject Distribution</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Core Subjects</span>
                          <span className="font-medium">{curriculumData.coreSubjects || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Elective Subjects</span>
                          <span className="font-medium">{curriculumData.electiveSubjects || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Specialized Tracks</span>
                          <span className="font-medium">{curriculumData.specializedTracks || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Faculty Performance & Management
              </CardTitle>
              <CardDescription>Monitor teacher performance and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Teachers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teacherStats.totalTeachers || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Active Teachers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teacherStats.activeTeachers || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Activity Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(teacherStats.activityRate || 0)}%</div>
                  </CardContent>
                </Card>
              </div>
              
              <ScrollArea className="h-96">
                {teachersLoading ? (
                  <p className="text-center text-muted-foreground">Loading teacher data...</p>
                ) : teachers.length > 0 ? (
                  <div className="space-y-4">
                    {teachers.map((teacher: any) => (
                      <div key={teacher.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{teacher.name}</h3>
                              <Badge variant={teacher.status === 'Active' ? 'default' : 'secondary'}>
                                {teacher.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{teacher.email}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Sections:</span>
                                <div className="font-medium">{teacher.sectionsCount}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Subjects:</span>
                                <div className="font-medium">{teacher.subjectsCount}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tasks:</span>
                                <div className="font-medium">{teacher.tasksCount}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Meetings:</span>
                                <div className="font-medium">{teacher.meetingsCount}</div>
                              </div>
                            </div>
                            {teacher.sections.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-muted-foreground">Teaching: </span>
                                {teacher.subjects.map((subject: string, index: number) => (
                                  <Badge key={index} variant="outline" className="mr-1 text-xs">
                                    {subject}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No teachers found</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar className="h-5 w-5" />
                Academic Performance Analytics
              </CardTitle>
              <CardDescription>Student performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Grade Level Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Grade 10</span>
                      <div className="flex items-center gap-2">
                        <Progress value={academicStats.grade10Performance || 0} className="w-20 h-2" />
                        <span className="text-sm font-medium">{academicStats.grade10Performance || 0}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Grade 11</span>
                      <div className="flex items-center gap-2">
                        <Progress value={academicStats.grade11Performance || 0} className="w-20 h-2" />
                        <span className="text-sm font-medium">{academicStats.grade11Performance || 0}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Grade 12</span>
                      <div className="flex items-center gap-2">
                        <Progress value={academicStats.grade12Performance || 0} className="w-20 h-2" />
                        <span className="text-sm font-medium">{academicStats.grade12Performance || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Subject Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Mathematics</span>
                      <span className="font-medium">{academicStats.mathPerformance || "N/A"}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">English</span>
                      <span className="font-medium">{academicStats.englishPerformance || "N/A"}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Science</span>
                      <span className="font-medium">{academicStats.sciencePerformance || "N/A"}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Social Studies</span>
                      <span className="font-medium">{academicStats.socialStudiesPerformance || "N/A"}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Academic Reports & Documentation
              </CardTitle>
              <CardDescription>Generate and review academic reports</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {reportsLoading ? (
                  <p className="text-center text-muted-foreground">Loading reports...</p>
                ) : academicReports.length > 0 ? (
                  <div className="space-y-4">
                    {academicReports.map((report: any) => (
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
                  <p className="text-center text-muted-foreground">No academic reports available</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Academic Planning & Strategy
              </CardTitle>
              <CardDescription>Long-term academic planning and strategic initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Create Curriculum Plan
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Schedule Faculty Meeting
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Performance Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Plan Academic Events
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Academic Targets</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Curriculum Completion</span>
                      <Badge variant="secondary">{academicStats.curriculumCompletion || 0}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Teacher Development</span>
                      <Badge variant="secondary">{academicStats.teacherDevelopment || 0}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Student Engagement</span>
                      <Badge variant="secondary">{academicStats.studentEngagement || 0}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Academic Excellence</span>
                      <Badge variant="secondary">{academicStats.academicExcellence || 0}%</Badge>
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