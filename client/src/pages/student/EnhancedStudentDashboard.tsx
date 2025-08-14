import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Video,
  Timer,
  Award,
  Bell,
  CheckCircle,
  Clock,
  Upload,
  ExternalLink,
  Play,
  Pause,
  Calendar,
  BookOpen,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import type { TeacherTask, TeacherMeeting, TaskSubmission, Notification, Grade } from "@shared/schema";
import { SchoolHeader, SchoolCard } from "@/components/ui/school-ui";

// Form schema for submissions
const submissionFormSchema = z.object({
  fileUrl: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

type SubmissionFormData = z.infer<typeof submissionFormSchema>;

interface TaskWithTimer extends TeacherTask {
  timeRemaining?: number;
  isStarted?: boolean;
}

export function EnhancedStudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<TaskWithTimer | null>(null);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [taskTimers, setTaskTimers] = useState<Map<number, { timeRemaining: number; isActive: boolean }>>(new Map());

  // Fetch data
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/student/tasks"],
    queryFn: () => apiRequest("/api/student/tasks")
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ["/api/student/meetings"],
    queryFn: () => apiRequest("/api/student/meetings")
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/student/notifications"],
    queryFn: () => apiRequest("/api/student/notifications")
  });

  const { data: grades = [] } = useQuery({
    queryKey: ["/api/student/grades"],
    queryFn: () => apiRequest("/api/student/grades")
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["/api/student/submissions"],
    queryFn: () => apiRequest("/api/student/submissions")
  });

  // Form
  const submissionForm = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      fileUrl: "",
      content: "",
    },
  });

  // Timer management
  useEffect(() => {
    const interval = setInterval(() => {
      setTaskTimers((prev) => {
        const newTimers = new Map(prev);
        newTimers.forEach((timer, taskId) => {
          if (timer.isActive && timer.timeRemaining > 0) {
            newTimers.set(taskId, {
              ...timer,
              timeRemaining: timer.timeRemaining - 1,
            });
          } else if (timer.timeRemaining <= 0) {
            newTimers.set(taskId, {
              ...timer,
              isActive: false,
            });
            toast({
              title: "Time's up!",
              description: "The timer for your task has expired.",
              variant: "destructive",
            });
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [toast]);

  // Mutations
  const submitTaskMutation = useMutation({
    mutationFn: (data: { taskId: number; submission: SubmissionFormData }) =>
      apiRequest("/api/student/submissions", "POST", {
        taskId: data.taskId,
        studentId: user?.id,
        fileUrl: data.submission.fileUrl,
        content: data.submission.content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/submissions"] });
      setIsSubmissionDialogOpen(false);
      setSelectedTask(null);
      submissionForm.reset();
      toast({ title: "Submission successful" });
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/student/notifications/${id}/read`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/notifications"] });
    },
  });

  // Helper functions
  const startTimer = (task: TeacherTask) => {
    if (task.timerMinutes) {
      const timeInSeconds = task.timerMinutes * 60;
      setTaskTimers((prev) => new Map(prev.set(task.id, {
        timeRemaining: timeInSeconds,
        isActive: true,
      })));
      toast({
        title: "Timer started",
        description: `You have ${task.timerMinutes} minutes to complete this task.`,
      });
    }
  };

  const pauseTimer = (taskId: number) => {
    setTaskTimers((prev) => {
      const newTimers = new Map(prev);
      const timer = newTimers.get(taskId);
      if (timer) {
        newTimers.set(taskId, { ...timer, isActive: false });
      }
      return newTimers;
    });
  };

  const resumeTimer = (taskId: number) => {
    setTaskTimers((prev) => {
      const newTimers = new Map(prev);
      const timer = newTimers.get(taskId);
      if (timer && timer.timeRemaining > 0) {
        newTimers.set(taskId, { ...timer, isActive: true });
      }
      return newTimers;
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

  const isTaskSubmitted = (taskId: number) => {
    return submissions.some((s: TaskSubmission) => s.taskId === taskId);
  };

  const getTaskSubmission = (taskId: number) => {
    return submissions.find((s: TaskSubmission) => s.taskId === taskId);
  };

  const isTaskOverdue = (task: TeacherTask) => {
    return task.dueDate && new Date(task.dueDate) < new Date();
  };

  const upcomingTasks = tasks.filter((task: TeacherTask) => 
    !isTaskSubmitted(task.id) && (!task.dueDate || new Date(task.dueDate) > new Date())
  );
  const overdueTasks = tasks.filter((task: TeacherTask) => 
    !isTaskSubmitted(task.id) && isTaskOverdue(task)
  );
  const completedTasks = tasks.filter((task: TeacherTask) => isTaskSubmitted(task.id));
  const unreadNotifications = notifications.filter((n: Notification) => !n.isRead);
  const upcomingMeetings = meetings.filter((m: TeacherMeeting) => new Date(m.scheduledAt) > new Date());

  // Calculate average grade
  const averageGrade = grades.length > 0 
    ? grades.reduce((sum: number, grade: Grade) => sum + parseFloat(grade.grade || "0"), 0) / grades.length
    : 0;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-full">
      {/* Enhanced Student Header */}
      <SchoolHeader 
        title="Student Dashboard"
        subtitle="Track your progress, complete assignments, and excel in your studies"
        icon={BookOpen}
        variant="student"
        userName={user?.name}
      />

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SchoolCard
          icon={FileText}
          title="Pending Tasks"
          value={upcomingTasks.length}
          description={`${overdueTasks.length} overdue`}
          variant="student"
        />
        <SchoolCard
          icon={Video}
          title="Upcoming Meetings"
          value={upcomingMeetings.length}
          description="This week"
          variant="student"
        />
        <SchoolCard
          icon={TrendingUp}
          title="Average Grade"
          value={`${averageGrade.toFixed(1)}%`}
          description={`${grades.length} graded assignments`}
          variant="student"
        />
        <SchoolCard
          icon={Bell}
          title="Notifications"
          value={unreadNotifications.length}
          description="Unread messages"
          variant="student"
        />
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}. Please submit them as soon as possible.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4">
            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Tasks ({upcomingTasks.length + overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Timer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...overdueTasks, ...upcomingTasks].map((task: TeacherTask) => {
                      const timer = taskTimers.get(task.id);
                      const isOverdue = isTaskOverdue(task);
                      
                      return (
                        <TableRow key={task.id} className={isOverdue ? "bg-destructive/5" : ""}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              {getTaskTypeIcon(task.taskType)}
                              {task.taskType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className={isOverdue ? "text-destructive font-medium" : ""}>
                              {task.dueDate ? formatDateTime(task.dueDate) : "No due date"}
                              {isOverdue && <div className="text-xs">OVERDUE</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {task.timerMinutes ? (
                              <div className="space-y-1">
                                <div className="text-sm">{task.timerMinutes} min limit</div>
                                {timer && (
                                  <div className="flex items-center gap-2">
                                    <div className={`text-xs font-mono ${timer.timeRemaining <= 300 ? 'text-destructive' : ''}`}>
                                      {formatTime(timer.timeRemaining)}
                                    </div>
                                    {timer.isActive ? (
                                      <Button size="sm" variant="ghost" onClick={() => pauseTimer(task.id)}>
                                        <Pause className="h-3 w-3" />
                                      </Button>
                                    ) : timer.timeRemaining > 0 ? (
                                      <Button size="sm" variant="ghost" onClick={() => resumeTimer(task.id)}>
                                        <Play className="h-3 w-3" />
                                      </Button>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            ) : (
                              "No timer"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isOverdue ? "destructive" : "outline"}>
                              {isOverdue ? "Overdue" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {task.timerMinutes && !timer && (
                                <Button size="sm" variant="outline" onClick={() => startTimer(task)}>
                                  <Timer className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsSubmissionDialogOpen(true);
                                }}
                                data-testid={`button-submit-task-${task.id}`}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Submit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Completed Tasks ({completedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedTasks.map((task: TeacherTask) => {
                      const submission = getTaskSubmission(task.id);
                      return (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              {getTaskTypeIcon(task.taskType)}
                              {task.taskType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {submission ? formatDateTime(submission.submittedAt) : "N/A"}
                          </TableCell>
                          <TableCell>
                            {submission?.score ? (
                              <Badge variant="default">{submission.score}/100</Badge>
                            ) : (
                              <Badge variant="secondary">Not graded</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission?.feedback || "No feedback"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Virtual classes and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Scheduled At</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingMeetings.map((meeting: TeacherMeeting) => {
                    const isStartingSoon = new Date(meeting.scheduledAt).getTime() - Date.now() < 15 * 60 * 1000; // 15 minutes
                    
                    return (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium">{meeting.title}</TableCell>
                        <TableCell>{formatDateTime(meeting.scheduledAt)}</TableCell>
                        <TableCell>{meeting.durationMinutes} minutes</TableCell>
                        <TableCell>
                          <Badge variant={isStartingSoon ? "default" : "secondary"}>
                            {isStartingSoon ? "Starting Soon" : "Scheduled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Join Meeting
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Grades</CardTitle>
              <CardDescription>Academic performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold">Overall Average: {averageGrade.toFixed(1)}%</div>
                  <Progress value={averageGrade} className="flex-1" />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Quarter</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade: Grade) => {
                      const gradeValue = parseFloat(grade.grade || "0");
                      const performance = gradeValue >= 90 ? "Excellent" : 
                                        gradeValue >= 80 ? "Good" : 
                                        gradeValue >= 70 ? "Satisfactory" : "Needs Improvement";
                      const variant = gradeValue >= 90 ? "default" : 
                                    gradeValue >= 80 ? "secondary" : 
                                    gradeValue >= 70 ? "outline" : "destructive";
                      
                      return (
                        <TableRow key={grade.id}>
                          <TableCell className="font-medium">{grade.subject}</TableCell>
                          <TableCell>Quarter {grade.quarter}</TableCell>
                          <TableCell>
                            <div className="text-lg font-semibold">{gradeValue}%</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={variant}>{performance}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Important updates and announcements</CardDescription>
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
                        {notification.link && (
                          <a 
                            href={notification.link} 
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            View Details <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
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

      {/* Submission Dialog */}
      <Dialog open={isSubmissionDialogOpen} onOpenChange={setIsSubmissionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              Submit your work for: {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <Form {...submissionForm}>
              <form 
                onSubmit={submissionForm.handleSubmit((data) => 
                  submitTaskMutation.mutate({ taskId: selectedTask.id, submission: data })
                )} 
                className="space-y-4"
              >
                <FormField
                  control={submissionForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Answer/Work</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your answer or describe your work..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={submissionForm.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File URL (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Paste file URL if you have attachments..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsSubmissionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitTaskMutation.isPending}>
                    Submit Work
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}