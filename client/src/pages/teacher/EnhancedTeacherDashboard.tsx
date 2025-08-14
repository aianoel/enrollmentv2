import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Calendar,
  Clock,
  Users,
  FileText,
  Video,
  Timer,
  Award,
  Bell,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
} from "lucide-react";
import type { User, Section, TeacherTask, TeacherMeeting, TaskSubmission, Notification } from "@shared/schema";
import { SchoolHeader, SchoolCard } from "@/components/ui/school-ui";

// Form schemas
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  taskType: z.enum(["Assignment", "Quiz", "Test"]),
  sectionId: z.number().min(1, "Section is required"),
  timerMinutes: z.number().optional(),
  dueDate: z.string().optional(),
});

const meetingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  sectionId: z.number().min(1, "Section is required"),
  meetingUrl: z.string().url("Valid meeting URL is required"),
  scheduledAt: z.string().min(1, "Date and time is required"),
  durationMinutes: z.number().min(15, "Minimum 15 minutes required"),
});

type TaskFormData = z.infer<typeof taskFormSchema>;
type MeetingFormData = z.infer<typeof meetingFormSchema>;

export function EnhancedTeacherDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TeacherTask | null>(null);

  // Fetch data
  const { data: sections = [] } = useQuery({
    queryKey: ["/api/teacher/sections"],
    queryFn: () => apiRequest("/api/teacher/sections")
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/teacher/tasks"],
    queryFn: () => apiRequest("/api/teacher/tasks")
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ["/api/teacher/meetings"],
    queryFn: () => apiRequest("/api/teacher/meetings")
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/teacher/notifications"],
    queryFn: () => apiRequest("/api/teacher/notifications")
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["/api/teacher/submissions", selectedTask?.id],
    queryFn: () => apiRequest(`/api/teacher/submissions${selectedTask?.id ? `?taskId=${selectedTask.id}` : ""}`),
    enabled: !!selectedTask
  });

  // Forms
  const taskForm = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      taskType: "Assignment",
      sectionId: 0,
      timerMinutes: undefined,
      dueDate: "",
    },
  });

  const meetingForm = useForm<MeetingFormData>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: "",
      sectionId: 0,
      meetingUrl: "",
      scheduledAt: "",
      durationMinutes: 60,
    },
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => apiRequest("/api/teacher/tasks", "POST", {
      ...data,
      teacherId: user?.id,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/tasks"] });
      setIsTaskDialogOpen(false);
      taskForm.reset();
      toast({ title: "Task created successfully" });
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: (data: MeetingFormData) => apiRequest("/api/teacher/meetings", "POST", {
      ...data,
      teacherId: user?.id,
      scheduledAt: new Date(data.scheduledAt).toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/meetings"] });
      setIsMeetingDialogOpen(false);
      meetingForm.reset();
      toast({ title: "Meeting created successfully" });
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/teacher/notifications/${id}/read`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/notifications"] });
    },
  });

  // Helper functions
  const getSectionName = (sectionId: number) => {
    const section = sections.find((s: Section) => s.id === sectionId);
    return section ? `${section.name} (Grade ${section.gradeLevel})` : "Unknown Section";
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "Quiz": return <Timer className="h-4 w-4" />;
      case "Test": return <Award className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string | Date | null) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleString();
  };

  const unreadNotifications = notifications.filter((n: Notification) => !n.isRead);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-green-50 via-white to-emerald-50 min-h-full">
      {/* Enhanced Teacher Header */}
      <SchoolHeader 
        title="Teacher Dashboard"
        subtitle="Manage your classes, assignments, and student progress"
        icon={Users}
        variant="teacher"
        userName={user?.name}
      />
      
      {/* Action Buttons Header */}
      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-task">
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Create an assignment, quiz, or test for your students</DialogDescription>
              </DialogHeader>
              <Form {...taskForm}>
                <form onSubmit={taskForm.handleSubmit((data) => createTaskMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={taskForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title" {...field} data-testid="input-task-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={taskForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter task description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={taskForm.control}
                      name="taskType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-task-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Assignment">Assignment</SelectItem>
                              <SelectItem value="Quiz">Quiz</SelectItem>
                              <SelectItem value="Test">Test</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={taskForm.control}
                      name="sectionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Section</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value ? field.value.toString() : ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-task-section">
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sections.map((section: Section) => (
                                <SelectItem key={section.id} value={section.id.toString()}>
                                  {section.name} (Grade {section.gradeLevel})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={taskForm.control}
                      name="timerMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timer (minutes, optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="60" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={taskForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date (optional)</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createTaskMutation.isPending}>
                      Create Task
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-meeting">
                <Video className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule Meeting</DialogTitle>
                <DialogDescription>Create a virtual meeting for your students</DialogDescription>
              </DialogHeader>
              <Form {...meetingForm}>
                <form onSubmit={meetingForm.handleSubmit((data) => createMeetingMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={meetingForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter meeting title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={meetingForm.control}
                    name="sectionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sections.map((section: Section) => (
                              <SelectItem key={section.id} value={section.id.toString()}>
                                {section.name} (Grade {section.gradeLevel})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={meetingForm.control}
                    name="meetingUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://meet.google.com/xxx-xxxx-xxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={meetingForm.control}
                      name="scheduledAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduled Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={meetingForm.control}
                      name="durationMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsMeetingDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMeetingMutation.isPending}>
                      Schedule Meeting
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SchoolCard
          icon={FileText}
          title="Active Tasks"
          value={tasks.length}
          description={`${tasks.filter((t: TeacherTask) => t.dueDate && new Date(t.dueDate) > new Date()).length} upcoming`}
          variant="teacher"
        />
        <SchoolCard
          icon={Video}
          title="Scheduled Meetings"
          value={meetings.length}
          description={`${meetings.filter((m: TeacherMeeting) => new Date(m.scheduledAt) > new Date()).length} upcoming`}
          variant="teacher"
        />
        <SchoolCard
          icon={Users}
          title="Sections"
          value={sections.length}
          description="Classes assigned"
          variant="teacher"
        />
        <SchoolCard
          icon={Bell}
          title="Notifications"
          value={unreadNotifications.length}
          description="Unread messages"
          variant="teacher"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>Manage assignments, quizzes, and tests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Timer</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task: TeacherTask) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {getTaskTypeIcon(task.taskType)}
                          {task.taskType}
                        </Badge>
                      </TableCell>
                      <TableCell>{getSectionName(task.sectionId)}</TableCell>
                      <TableCell>
                        {task.dueDate ? formatDateTime(task.dueDate) : "No due date"}
                      </TableCell>
                      <TableCell>
                        {task.timerMinutes ? `${task.timerMinutes} min` : "No timer"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTask(task)}
                          data-testid={`button-view-submissions-${task.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Submissions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Meetings</CardTitle>
              <CardDescription>Virtual meetings with your students</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Scheduled At</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((meeting: TeacherMeeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell className="font-medium">{meeting.title}</TableCell>
                      <TableCell>{getSectionName(meeting.sectionId)}</TableCell>
                      <TableCell>{formatDateTime(meeting.scheduledAt)}</TableCell>
                      <TableCell>{meeting.durationMinutes} minutes</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Join Meeting
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          {selectedTask ? (
            <Card>
              <CardHeader>
                <CardTitle>Submissions for: {selectedTask.title}</CardTitle>
                <CardDescription>Review and grade student submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission: TaskSubmission) => (
                      <TableRow key={submission.id}>
                        <TableCell>Student {submission.studentId}</TableCell>
                        <TableCell>{formatDateTime(submission.submittedAt)}</TableCell>
                        <TableCell>
                          {submission.score ? `${submission.score}/100` : "Not graded"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={submission.score ? "default" : "secondary"}>
                            {submission.score ? "Graded" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Grade
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Select a task to view submissions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>System messages and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification: Notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg border ${notification.isRead ? 'bg-muted/50' : 'bg-primary/5 border-primary/20'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markNotificationReadMutation.mutate(notification.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}