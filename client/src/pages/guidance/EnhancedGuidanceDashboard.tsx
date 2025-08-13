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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Clock,
  Heart,
  Shield,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Bell,
} from "lucide-react";
import type { 
  User, 
  GuidanceBehaviorRecord, 
  GuidanceCounselingSession, 
  GuidanceWellnessProgram, 
  GuidanceProgramParticipant 
} from "@shared/schema";

// Form schemas
const behaviorRecordFormSchema = z.object({
  studentId: z.number().min(1, "Student is required"),
  incidentType: z.string().min(1, "Incident type is required"),
  description: z.string().min(1, "Description is required"),
  actionTaken: z.string().optional(),
  status: z.enum(["Pending", "Resolved", "Escalated"]),
});

const counselingSessionFormSchema = z.object({
  studentId: z.number().min(1, "Student is required"),
  sessionDate: z.string().min(1, "Session date is required"),
  sessionNotes: z.string().optional(),
  followUpDate: z.string().optional(),
  confidentialityLevel: z.enum(["Internal", "Share with Parent", "Share with Teacher"]),
});

const wellnessProgramFormSchema = z.object({
  programName: z.string().min(1, "Program name is required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type BehaviorRecordFormData = z.infer<typeof behaviorRecordFormSchema>;
type CounselingSessionFormData = z.infer<typeof counselingSessionFormSchema>;
type WellnessProgramFormData = z.infer<typeof wellnessProgramFormSchema>;

export function EnhancedGuidanceDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBehaviorDialogOpen, setIsBehaviorDialogOpen] = useState(false);
  const [isCounselingDialogOpen, setIsCounselingDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<GuidanceWellnessProgram | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  // Fetch data
  const { data: behaviorRecords = [] } = useQuery({
    queryKey: ["/api/guidance/behavior-records"],
    queryFn: () => apiRequest("/api/guidance/behavior-records")
  });

  const { data: counselingSessions = [] } = useQuery({
    queryKey: ["/api/guidance/counseling-sessions"],
    queryFn: () => apiRequest("/api/guidance/counseling-sessions")
  });

  const { data: wellnessPrograms = [] } = useQuery({
    queryKey: ["/api/guidance/wellness-programs"],
    queryFn: () => apiRequest("/api/guidance/wellness-programs")
  });

  const { data: programParticipants = [] } = useQuery({
    queryKey: ["/api/guidance/program-participants", selectedProgram?.id],
    queryFn: () => apiRequest(`/api/guidance/program-participants${selectedProgram?.id ? `?programId=${selectedProgram.id}` : ""}`),
    enabled: !!selectedProgram
  });

  const { data: students = [] } = useQuery({
    queryKey: ["/api/guidance/students"],
    queryFn: () => apiRequest("/api/guidance/students")
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["/api/guidance/teachers"],
    queryFn: () => apiRequest("/api/guidance/teachers")
  });

  // Forms
  const behaviorForm = useForm<BehaviorRecordFormData>({
    resolver: zodResolver(behaviorRecordFormSchema),
    defaultValues: {
      studentId: 0,
      incidentType: "",
      description: "",
      actionTaken: "",
      status: "Pending",
    },
  });

  const counselingForm = useForm<CounselingSessionFormData>({
    resolver: zodResolver(counselingSessionFormSchema),
    defaultValues: {
      studentId: 0,
      sessionDate: "",
      sessionNotes: "",
      followUpDate: "",
      confidentialityLevel: "Internal",
    },
  });

  const programForm = useForm<WellnessProgramFormData>({
    resolver: zodResolver(wellnessProgramFormSchema),
    defaultValues: {
      programName: "",
      description: "",
      startDate: "",
      endDate: "",
    },
  });

  // Mutations
  const createBehaviorRecordMutation = useMutation({
    mutationFn: (data: BehaviorRecordFormData) => apiRequest("/api/guidance/behavior-records", "POST", {
      ...data,
      reportedBy: user?.id,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guidance/behavior-records"] });
      setIsBehaviorDialogOpen(false);
      behaviorForm.reset();
      toast({ title: "Behavior record created successfully" });
    },
  });

  const createCounselingSessionMutation = useMutation({
    mutationFn: (data: CounselingSessionFormData) => apiRequest("/api/guidance/counseling-sessions", "POST", {
      ...data,
      counselorId: user?.id,
      sessionDate: new Date(data.sessionDate).toISOString(),
      followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guidance/counseling-sessions"] });
      setIsCounselingDialogOpen(false);
      counselingForm.reset();
      toast({ title: "Counseling session recorded successfully" });
    },
  });

  const createWellnessProgramMutation = useMutation({
    mutationFn: (data: WellnessProgramFormData) => apiRequest("/api/guidance/wellness-programs", "POST", {
      ...data,
      createdBy: user?.id,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guidance/wellness-programs"] });
      setIsProgramDialogOpen(false);
      programForm.reset();
      toast({ title: "Wellness program created successfully" });
    },
  });

  const updateBehaviorRecordMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest(`/api/guidance/behavior-records/${id}`, "PATCH", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guidance/behavior-records"] });
      toast({ title: "Behavior record updated successfully" });
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: (data: { programId: number; studentId: number }) => 
      apiRequest("/api/guidance/program-participants", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guidance/program-participants"] });
      setSelectedStudent(null);
      toast({ title: "Student added to program successfully" });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: (data: { recipientId: number; message: string; link?: string }) => 
      apiRequest("/api/guidance/notifications", "POST", data),
    onSuccess: () => {
      toast({ title: "Notification sent successfully" });
    },
  });

  // Helper functions
  const getStudentName = (studentId: number) => {
    const student = students.find((s: User) => s.id === studentId);
    return student ? student.name : `Student ${studentId}`;
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find((t: User) => t.id === teacherId);
    return teacher ? teacher.name : `Teacher ${teacherId}`;
  };

  const formatDateTime = (dateString: string | Date | null) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleString();
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "default";
      case "Escalated": return "destructive";
      default: return "secondary";
    }
  };

  const getIncidentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "bullying": return <Shield className="h-4 w-4 text-red-500" />;
      case "misconduct": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "truancy": return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Statistics
  const pendingRecords = behaviorRecords.filter((r: GuidanceBehaviorRecord) => r.status === "Pending");
  const recentSessions = counselingSessions.filter((s: GuidanceCounselingSession) => 
    new Date(s.sessionDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  );
  const activePrograms = wellnessPrograms.filter((p: GuidanceWellnessProgram) => 
    new Date(p.endDate) > new Date()
  );

  const incidentTypes = ["Bullying", "Misconduct", "Truancy", "Academic Issues", "Social Issues", "Family Issues"];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guidance Office Dashboard</h1>
          <p className="text-muted-foreground">Monitor student behavior, counseling sessions, and wellness programs</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBehaviorDialogOpen} onOpenChange={setIsBehaviorDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-behavior-record">
                <Plus className="mr-2 h-4 w-4" />
                Record Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record Behavior Incident</DialogTitle>
                <DialogDescription>Document a behavioral incident for follow-up and tracking</DialogDescription>
              </DialogHeader>
              <Form {...behaviorForm}>
                <form onSubmit={behaviorForm.handleSubmit((data) => createBehaviorRecordMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={behaviorForm.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-behavior-student">
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map((student: User) => (
                              <SelectItem key={student.id} value={student.id.toString()}>
                                {student.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={behaviorForm.control}
                    name="incidentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select incident type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {incidentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={behaviorForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the incident in detail..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={behaviorForm.control}
                    name="actionTaken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action Taken (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe any immediate actions taken..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={behaviorForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                            <SelectItem value="Escalated">Escalated</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsBehaviorDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createBehaviorRecordMutation.isPending}>
                      Record Incident
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCounselingDialogOpen} onOpenChange={setIsCounselingDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-counseling-session">
                <MessageSquare className="mr-2 h-4 w-4" />
                Log Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Log Counseling Session</DialogTitle>
                <DialogDescription>Record details of a counseling session with a student</DialogDescription>
              </DialogHeader>
              <Form {...counselingForm}>
                <form onSubmit={counselingForm.handleSubmit((data) => createCounselingSessionMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={counselingForm.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map((student: User) => (
                              <SelectItem key={student.id} value={student.id.toString()}>
                                {student.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={counselingForm.control}
                    name="sessionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={counselingForm.control}
                    name="sessionNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Record session details, observations, and recommendations..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={counselingForm.control}
                    name="followUpDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-up Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={counselingForm.control}
                    name="confidentialityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confidentiality Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select confidentiality level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Internal">Internal Only</SelectItem>
                            <SelectItem value="Share with Parent">Share with Parent</SelectItem>
                            <SelectItem value="Share with Teacher">Share with Teacher</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCounselingDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCounselingSessionMutation.isPending}>
                      Log Session
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-wellness-program">
                <Heart className="mr-2 h-4 w-4" />
                Create Program
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Wellness Program</DialogTitle>
                <DialogDescription>Set up a new wellness or intervention program for students</DialogDescription>
              </DialogHeader>
              <Form {...programForm}>
                <form onSubmit={programForm.handleSubmit((data) => createWellnessProgramMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={programForm.control}
                    name="programName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Anti-Bullying Workshop" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={programForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the program's goals and activities..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={programForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={programForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsProgramDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createWellnessProgramMutation.isPending}>
                      Create Program
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRecords.length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentSessions.length}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrograms.length}</div>
            <p className="text-xs text-muted-foreground">Ongoing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">In system</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Cases Alert */}
      {pendingRecords.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {pendingRecords.length} pending behavior case{pendingRecords.length > 1 ? 's' : ''} that require attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="behavior" className="space-y-4">
        <TabsList>
          <TabsTrigger value="behavior">Behavior Records</TabsTrigger>
          <TabsTrigger value="counseling">Counseling Sessions</TabsTrigger>
          <TabsTrigger value="programs">Wellness Programs</TabsTrigger>
          <TabsTrigger value="participants">Program Participants</TabsTrigger>
        </TabsList>
        
        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Records</CardTitle>
              <CardDescription>Track and manage student behavioral incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Incident Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date Reported</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {behaviorRecords.map((record: GuidanceBehaviorRecord) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{getStudentName(record.studentId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getIncidentTypeIcon(record.incidentType)}
                          {record.incidentType}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{record.description}</TableCell>
                      <TableCell>{formatDateTime(record.dateReported)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {record.status === "Pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBehaviorRecordMutation.mutate({ id: record.id, status: "Resolved" })}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendNotificationMutation.mutate({
                              recipientId: record.studentId,
                              message: `Follow-up required for ${record.incidentType} incident`,
                              link: `/guidance/behavior/${record.id}`
                            })}
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counseling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Counseling Sessions</CardTitle>
              <CardDescription>Record and track counseling sessions with students</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Session Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Follow-up Date</TableHead>
                    <TableHead>Confidentiality</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {counselingSessions.map((session: GuidanceCounselingSession) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{getStudentName(session.studentId)}</TableCell>
                      <TableCell>{formatDateTime(session.sessionDate)}</TableCell>
                      <TableCell className="max-w-xs truncate">{session.sessionNotes || "No notes"}</TableCell>
                      <TableCell>{session.followUpDate ? formatDateTime(session.followUpDate) : "None"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{session.confidentialityLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wellness Programs</CardTitle>
              <CardDescription>Manage wellness and intervention programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {wellnessPrograms.map((program: GuidanceWellnessProgram) => (
                  <Card key={program.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProgram(program)}>
                    <CardHeader>
                      <CardTitle className="text-lg">{program.programName}</CardTitle>
                      <CardDescription className="line-clamp-2">{program.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(program.startDate)} - {formatDate(program.endDate)}
                        </div>
                        <Badge variant={new Date(program.endDate) > new Date() ? "default" : "secondary"}>
                          {new Date(program.endDate) > new Date() ? "Active" : "Completed"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          {selectedProgram ? (
            <Card>
              <CardHeader>
                <CardTitle>Participants: {selectedProgram.programName}</CardTitle>
                <CardDescription>Manage students enrolled in this wellness program</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => setSelectedStudent(parseInt(value))}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Add student to program" />
                      </SelectTrigger>
                      <SelectContent>
                        {students
                          .filter((student: User) => !programParticipants.some((p: GuidanceProgramParticipant) => p.studentId === student.id))
                          .map((student: User) => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => selectedStudent && addParticipantMutation.mutate({ 
                        programId: selectedProgram.id, 
                        studentId: selectedStudent 
                      })}
                      disabled={!selectedStudent}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Date Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {programParticipants.map((participant: GuidanceProgramParticipant) => (
                        <TableRow key={participant.id}>
                          <TableCell className="font-medium">{getStudentName(participant.studentId)}</TableCell>
                          <TableCell>{formatDate(participant.joinedAt)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Select a wellness program to view and manage participants</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}