import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Clock,
  Plus,
  UserPlus,
  Upload,
  BookPlus
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

  // Fetch sections and subjects for assignment dropdowns
  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ["/api/academic/sections"],
    queryFn: () => apiRequest("/api/academic/sections"),
    refetchInterval: 300000
  });

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/academic/subjects"],
    queryFn: () => apiRequest("/api/academic/subjects"),
    refetchInterval: 300000
  });

  // Fetch schedules and modules
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ["/api/academic/schedules"],
    queryFn: () => apiRequest("/api/academic/schedules"),
    refetchInterval: 300000
  });

  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ["/api/academic/modules"],
    queryFn: () => apiRequest("/api/academic/modules"),
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

  // Assignment schemas
  const assignmentSchema = z.object({
    teacherId: z.string(),
    sectionId: z.string(),
    isAdvisory: z.boolean().default(false)
  });

  const subjectAssignmentSchema = z.object({
    teacherId: z.string(),
    sectionId: z.string(),
    subjectId: z.string()
  });

  const scheduleSchema = z.object({
    teacherId: z.string(),
    sectionId: z.string(),
    subjectId: z.string(),
    dayOfWeek: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    room: z.string()
  });

  const moduleSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    teacherId: z.string(),
    subjectId: z.string(),
    sectionId: z.string().optional(),
    fileUrl: z.string().min(1, "File URL is required"),
    isPublic: z.boolean().default(false)
  });

  // Mutations for teacher assignments
  const assignSectionMutation = useMutation({
    mutationFn: async (data: { teacherId: number; sectionId: number; isAdvisory: boolean }) =>
      apiRequest(`/api/academic/teachers/${data.teacherId}/assign-section`, {
        method: "POST",
        body: JSON.stringify({ sectionId: data.sectionId, isAdvisory: data.isAdvisory }),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/academic/sections"] });
      toast({ title: "Success", description: "Teacher assignment updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to assign teacher", variant: "destructive" });
    }
  });

  const assignSubjectMutation = useMutation({
    mutationFn: async (data: { teacherId: number; sectionId: number; subjectId: number }) =>
      apiRequest(`/api/academic/teachers/${data.teacherId}/assign-subject`, {
        method: "POST",
        body: JSON.stringify({ sectionId: data.sectionId, subjectId: data.subjectId }),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic/teachers"] });
      toast({ title: "Success", description: "Subject assigned successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to assign subject", variant: "destructive" });
    }
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data: any) =>
      apiRequest("/api/academic/schedules", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic/schedules"] });
      toast({ title: "Success", description: "Schedule created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create schedule", variant: "destructive" });
    }
  });

  const uploadModuleMutation = useMutation({
    mutationFn: async (data: any) =>
      apiRequest("/api/academic/modules", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic/modules"] });
      toast({ title: "Success", description: "Module uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload module", variant: "destructive" });
    }
  });

  // Handler functions
  const handleTeacherAssignment = (teacherId: number, type: string, data: any) => {
    if (type === "section") {
      assignSectionMutation.mutate({ teacherId, sectionId: data.sectionId, isAdvisory: data.isAdvisory });
    } else if (type === "subject") {
      assignSubjectMutation.mutate({ teacherId, sectionId: data.sectionId, subjectId: data.subjectId });
    }
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
                Faculty Management & Assignments
              </CardTitle>
              <CardDescription>Assign teachers, subjects, schedules, and manage modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Learning Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{modules.length || 0}</div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="teachers" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="teachers">Teachers</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  <TabsTrigger value="schedules">Schedules</TabsTrigger>
                  <TabsTrigger value="modules">Modules</TabsTrigger>
                </TabsList>

                <TabsContent value="teachers" className="space-y-4">
                  <ScrollArea className="h-96">
                    {teachersLoading ? (
                      <p className="text-center text-muted-foreground">Loading teacher data...</p>
                    ) : teachers.length > 0 ? (
                      <div className="space-y-4">
                        {teachers.map((teacher: any) => (
                          <TeacherCard key={teacher.id} teacher={teacher} onAssign={handleTeacherAssignment} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">No teachers found</p>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                  <AssignmentManagement />
                </TabsContent>

                <TabsContent value="schedules" className="space-y-4">
                  <ScheduleManagement />
                </TabsContent>

                <TabsContent value="modules" className="space-y-4">
                  <ModuleManagement />
                </TabsContent>
              </Tabs>
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

// Teacher Card Component
function TeacherCard({ teacher, onAssign }: { teacher: any; onAssign: (teacherId: number, type: string, data: any) => void }) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'section' | 'subject'>('section');
  
  const { data: sections = [] } = useQuery({
    queryKey: ["/api/academic/sections"],
    queryFn: () => apiRequest("/api/academic/sections")
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/academic/subjects"],
    queryFn: () => apiRequest("/api/academic/subjects")
  });

  const assignmentForm = useForm({
    resolver: zodResolver(assignmentType === 'section' 
      ? z.object({ sectionId: z.string(), isAdvisory: z.boolean().default(false) })
      : z.object({ sectionId: z.string(), subjectId: z.string() })
    )
  });

  const handleAssignment = (data: any) => {
    onAssign(teacher.id, assignmentType, data);
    setShowAssignDialog(false);
    assignmentForm.reset();
  };

  return (
    <div className="border rounded-lg p-4">
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
          {teacher.subjects.length > 0 && (
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
        <div className="ml-4">
          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-assign-teacher">
                <UserPlus className="h-4 w-4 mr-1" />
                Assign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Teacher</DialogTitle>
                <DialogDescription>
                  Assign {teacher.name} to sections or subjects
                </DialogDescription>
              </DialogHeader>
              <Form {...assignmentForm}>
                <form onSubmit={assignmentForm.handleSubmit(handleAssignment)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={assignmentType === 'section' ? 'default' : 'outline'}
                      onClick={() => setAssignmentType('section')}
                      data-testid="button-assign-section"
                    >
                      Assign Section
                    </Button>
                    <Button
                      type="button"
                      variant={assignmentType === 'subject' ? 'default' : 'outline'}
                      onClick={() => setAssignmentType('subject')}
                      data-testid="button-assign-subject"
                    >
                      Assign Subject
                    </Button>
                  </div>

                  <FormField
                    control={assignmentForm.control}
                    name="sectionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-section">
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sections.map((section: any) => (
                              <SelectItem key={section.id} value={section.id.toString()}>
                                {section.name} (Grade {section.grade_level})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {assignmentType === 'subject' && (
                    <FormField
                      control={assignmentForm.control}
                      name="subjectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-subject">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.map((subject: any) => (
                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                  {subject.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {assignmentType === 'section' && (
                    <FormField
                      control={assignmentForm.control}
                      name="isAdvisory"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              data-testid="checkbox-advisory"
                            />
                          </FormControl>
                          <FormLabel>Assign as Section Adviser</FormLabel>
                        </FormItem>
                      )}
                    />
                  )}

                  <DialogFooter>
                    <Button type="submit" data-testid="button-confirm-assignment">
                      Assign
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

// Assignment Management Component
function AssignmentManagement() {
  const { data: teachers = [] } = useQuery({
    queryKey: ["/api/academic/teachers"],
    queryFn: () => apiRequest("/api/academic/teachers")
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["/api/academic/sections"],
    queryFn: () => apiRequest("/api/academic/sections")
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Teacher Assignments</h3>
      </div>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Section Advisers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sections.map((section: any) => (
                <div key={section.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{section.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">Grade {section.grade_level}</span>
                  </div>
                  <div>
                    {section.adviser_name ? (
                      <Badge variant="default">{section.adviser_name}</Badge>
                    ) : (
                      <Badge variant="secondary">No Adviser</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Teacher Assignments Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teachers.map((teacher: any) => (
                <div key={teacher.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{teacher.name}</h4>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    </div>
                    <div className="text-right text-sm">
                      <div>{teacher.sectionsCount} sections</div>
                      <div>{teacher.subjectsCount} subjects</div>
                    </div>
                  </div>
                  {teacher.subjects.length > 0 && (
                    <div className="mt-2">
                      {teacher.subjects.map((subject: string, index: number) => (
                        <Badge key={index} variant="outline" className="mr-1 text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Schedule Management Component
function ScheduleManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schedules = [] } = useQuery({
    queryKey: ["/api/academic/schedules"],
    queryFn: () => apiRequest("/api/academic/schedules")
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["/api/academic/teachers"],
    queryFn: () => apiRequest("/api/academic/teachers")
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["/api/academic/sections"],
    queryFn: () => apiRequest("/api/academic/sections")
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/academic/subjects"],
    queryFn: () => apiRequest("/api/academic/subjects")
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data: any) =>
      apiRequest("/api/academic/schedules", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic/schedules"] });
      toast({ title: "Success", description: "Schedule created successfully" });
      setShowCreateDialog(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create schedule", variant: "destructive" });
    }
  });

  const scheduleForm = useForm({
    resolver: zodResolver(z.object({
      teacherId: z.string(),
      sectionId: z.string(),
      subjectId: z.string(),
      dayOfWeek: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      room: z.string()
    }))
  });

  const handleCreateSchedule = (data: any) => {
    createScheduleMutation.mutate(data);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Class Schedules</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-schedule">
              <Plus className="h-4 w-4 mr-1" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Schedule</DialogTitle>
              <DialogDescription>Add a new class schedule</DialogDescription>
            </DialogHeader>
            <Form {...scheduleForm}>
              <form onSubmit={scheduleForm.handleSubmit(handleCreateSchedule)} className="space-y-4">
                <FormField
                  control={scheduleForm.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-teacher">
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachers.map((teacher: any) => (
                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={scheduleForm.control}
                  name="sectionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-schedule-section">
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sections.map((section: any) => (
                            <SelectItem key={section.id} value={section.id.toString()}>
                              {section.name} (Grade {section.grade_level})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={scheduleForm.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-schedule-subject">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject: any) => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={scheduleForm.control}
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Week</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-day">
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={scheduleForm.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-start-time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={scheduleForm.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-end-time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={scheduleForm.control}
                  name="room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room</FormLabel>
                      <FormControl>
                        <Input placeholder="Room number/name" {...field} data-testid="input-room" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" data-testid="button-create-schedule-submit">
                    Create Schedule
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Day</th>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Teacher</th>
                  <th className="text-left p-3">Section</th>
                  <th className="text-left p-3">Subject</th>
                  <th className="text-left p-3">Room</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule: any) => (
                  <tr key={schedule.id} className="border-b">
                    <td className="p-3">{schedule.day_of_week}</td>
                    <td className="p-3">{schedule.start_time} - {schedule.end_time}</td>
                    <td className="p-3">{schedule.teacher_name}</td>
                    <td className="p-3">{schedule.section_name}</td>
                    <td className="p-3">{schedule.subject_name}</td>
                    <td className="p-3">{schedule.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Module Management Component
function ModuleManagement() {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: modules = [] } = useQuery({
    queryKey: ["/api/academic/modules"],
    queryFn: () => apiRequest("/api/academic/modules")
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["/api/academic/teachers"],
    queryFn: () => apiRequest("/api/academic/teachers")
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/academic/subjects"],
    queryFn: () => apiRequest("/api/academic/subjects")
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["/api/academic/sections"],
    queryFn: () => apiRequest("/api/academic/sections")
  });

  const uploadModuleMutation = useMutation({
    mutationFn: async (data: any) =>
      apiRequest("/api/academic/modules", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic/modules"] });
      toast({ title: "Success", description: "Module uploaded successfully" });
      setShowUploadDialog(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload module", variant: "destructive" });
    }
  });

  const moduleForm = useForm({
    resolver: zodResolver(z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      teacherId: z.string(),
      subjectId: z.string(),
      sectionId: z.string().optional(),
      fileUrl: z.string().min(1, "File URL is required"),
      isPublic: z.boolean().default(false)
    }))
  });

  const handleUploadModule = (data: any) => {
    uploadModuleMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Learning Modules</h3>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-module">
              <Upload className="h-4 w-4 mr-1" />
              Upload Module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Learning Module</DialogTitle>
              <DialogDescription>Upload a new learning module for students</DialogDescription>
            </DialogHeader>
            <Form {...moduleForm}>
              <form onSubmit={moduleForm.handleSubmit(handleUploadModule)} className="space-y-4">
                <FormField
                  control={moduleForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Module Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter module title" {...field} data-testid="input-module-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={moduleForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter module description" {...field} data-testid="input-module-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={moduleForm.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-module-teacher">
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachers.map((teacher: any) => (
                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={moduleForm.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-module-subject">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject: any) => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={moduleForm.control}
                  name="sectionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-module-section">
                            <SelectValue placeholder="Select section or leave blank for all" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sections.map((section: any) => (
                            <SelectItem key={section.id} value={section.id.toString()}>
                              {section.name} (Grade {section.grade_level})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={moduleForm.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter file URL" {...field} data-testid="input-file-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={moduleForm.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          data-testid="checkbox-public"
                        />
                      </FormControl>
                      <FormLabel>Make this module public to all students</FormLabel>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" data-testid="button-upload-module-submit">
                    Upload Module
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {modules.map((module: any) => (
          <Card key={module.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
                <Badge variant={module.is_public ? "default" : "secondary"}>
                  {module.is_public ? "Public" : "Private"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Teacher:</span>
                  <div className="font-medium">{module.teacher_name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Subject:</span>
                  <div className="font-medium">{module.subject_name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Section:</span>
                  <div className="font-medium">{module.section_name || "All Sections"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Uploaded:</span>
                  <div className="font-medium">{new Date(module.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              {module.file_url && (
                <div className="mt-2">
                  <a 
                    href={module.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Module File
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}