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
  GraduationCap,
  CheckCircle,
  AlertTriangle,
  Clock,
  BookOpen,
  Award,
  Eye,
  Edit,
  Trash2,
  Download,
  UserCheck,
} from "lucide-react";
import type { 
  User, 
  Section,
  RegistrarEnrollmentRequest, 
  RegistrarSubject, 
  AcademicRecord, 
  GraduationCandidate, 
  TranscriptRequest 
} from "@shared/schema";

// Form schemas
const enrollmentRequestFormSchema = z.object({
  studentId: z.number().min(1, "Student is required"),
  schoolYear: z.string().min(1, "School year is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  sectionId: z.number().optional(),
  status: z.enum(["Pending", "Approved", "Rejected"]),
});

const subjectFormSchema = z.object({
  subjectCode: z.string().min(1, "Subject code is required"),
  subjectName: z.string().min(1, "Subject name is required"),
  description: z.string().optional(),
  gradeLevel: z.string().min(1, "Grade level is required"),
  semester: z.string().min(1, "Semester is required"),
  prerequisiteId: z.number().optional(),
});

const academicRecordFormSchema = z.object({
  studentId: z.number().min(1, "Student is required"),
  subjectId: z.number().min(1, "Subject is required"),
  schoolYear: z.string().min(1, "School year is required"),
  quarter1: z.number().min(65).max(100).optional(),
  quarter2: z.number().min(65).max(100).optional(),
  quarter3: z.number().min(65).max(100).optional(),
  quarter4: z.number().min(65).max(100).optional(),
  finalGrade: z.number().min(65).max(100).optional(),
  remarks: z.enum(["Passed", "Failed", "Incomplete"]),
});

const graduationCandidateFormSchema = z.object({
  studentId: z.number().min(1, "Student is required"),
  schoolYear: z.string().min(1, "School year is required"),
  status: z.enum(["Pending", "Cleared", "With Deficiencies"]),
});

type EnrollmentRequestFormData = z.infer<typeof enrollmentRequestFormSchema>;
type SubjectFormData = z.infer<typeof subjectFormSchema>;
type AcademicRecordFormData = z.infer<typeof academicRecordFormSchema>;
type GraduationCandidateFormData = z.infer<typeof graduationCandidateFormSchema>;

export function EnhancedRegistrarDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [isGraduationDialogOpen, setIsGraduationDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  // Fetch data
  const { data: enrollmentRequests = [] } = useQuery({
    queryKey: ["/api/registrar/enrollment-requests"],
    queryFn: () => apiRequest("/api/registrar/enrollment-requests")
  });

  const { data: registrarSubjects = [] } = useQuery({
    queryKey: ["/api/registrar/subjects"],
    queryFn: () => apiRequest("/api/registrar/subjects")
  });

  const { data: academicRecords = [] } = useQuery({
    queryKey: ["/api/registrar/academic-records"],
    queryFn: () => apiRequest("/api/registrar/academic-records")
  });

  const { data: graduationCandidates = [] } = useQuery({
    queryKey: ["/api/registrar/graduation-candidates"],
    queryFn: () => apiRequest("/api/registrar/graduation-candidates")
  });

  const { data: transcriptRequests = [] } = useQuery({
    queryKey: ["/api/registrar/transcript-requests"],
    queryFn: () => apiRequest("/api/registrar/transcript-requests")
  });

  const { data: students = [] } = useQuery({
    queryKey: ["/api/registrar/students"],
    queryFn: () => apiRequest("/api/registrar/students")
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["/api/sections"],
    queryFn: () => apiRequest("/api/sections")
  });

  // Forms
  const enrollmentForm = useForm<EnrollmentRequestFormData>({
    resolver: zodResolver(enrollmentRequestFormSchema),
    defaultValues: {
      studentId: 0,
      schoolYear: "2025-2026",
      gradeLevel: "",
      sectionId: undefined,
      status: "Pending",
    },
  });

  const subjectForm = useForm<SubjectFormData>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      subjectCode: "",
      subjectName: "",
      description: "",
      gradeLevel: "",
      semester: "",
      prerequisiteId: undefined,
    },
  });

  const recordForm = useForm<AcademicRecordFormData>({
    resolver: zodResolver(academicRecordFormSchema),
    defaultValues: {
      studentId: 0,
      subjectId: 0,
      schoolYear: "2025-2026",
      quarter1: undefined,
      quarter2: undefined,
      quarter3: undefined,
      quarter4: undefined,
      finalGrade: undefined,
      remarks: "Passed",
    },
  });

  const graduationForm = useForm<GraduationCandidateFormData>({
    resolver: zodResolver(graduationCandidateFormSchema),
    defaultValues: {
      studentId: 0,
      schoolYear: "2025-2026",
      status: "Pending",
    },
  });

  // Mutations
  const createEnrollmentRequestMutation = useMutation({
    mutationFn: (data: EnrollmentRequestFormData) => apiRequest("/api/registrar/enrollment-requests", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrar/enrollment-requests"] });
      setIsEnrollmentDialogOpen(false);
      enrollmentForm.reset();
      toast({ title: "Enrollment request created successfully" });
    },
  });

  const updateEnrollmentRequestMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest(`/api/registrar/enrollment-requests/${id}`, "PATCH", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrar/enrollment-requests"] });
      toast({ title: "Enrollment request updated successfully" });
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: (data: SubjectFormData) => apiRequest("/api/registrar/subjects", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrar/subjects"] });
      setIsSubjectDialogOpen(false);
      subjectForm.reset();
      toast({ title: "Subject created successfully" });
    },
  });

  const createAcademicRecordMutation = useMutation({
    mutationFn: (data: AcademicRecordFormData) => apiRequest("/api/registrar/academic-records", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrar/academic-records"] });
      setIsRecordDialogOpen(false);
      recordForm.reset();
      toast({ title: "Academic record created successfully" });
    },
  });

  const createGraduationCandidateMutation = useMutation({
    mutationFn: (data: GraduationCandidateFormData) => apiRequest("/api/registrar/graduation-candidates", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrar/graduation-candidates"] });
      setIsGraduationDialogOpen(false);
      graduationForm.reset();
      toast({ title: "Graduation candidate added successfully" });
    },
  });

  const createTranscriptRequestMutation = useMutation({
    mutationFn: (studentId: number) => apiRequest("/api/registrar/transcript-requests", "POST", { studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrar/transcript-requests"] });
      toast({ title: "Transcript request created successfully" });
    },
  });

  const updateTranscriptRequestMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest(`/api/registrar/transcript-requests/${id}`, "PATCH", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrar/transcript-requests"] });
      toast({ title: "Transcript request updated successfully" });
    },
  });

  // Helper functions
  const getStudentName = (studentId: number) => {
    const student = students.find((s: User) => s.id === studentId);
    return student ? student.name : `Student ${studentId}`;
  };

  const getSectionName = (sectionId: number | null) => {
    if (!sectionId) return "Not assigned";
    const section = sections.find((s: Section) => s.id === sectionId);
    return section ? section.name : `Section ${sectionId}`;
  };

  const getSubjectName = (subjectId: number) => {
    const subject = registrarSubjects.find((s: RegistrarSubject) => s.id === subjectId);
    return subject ? `${subject.subjectCode} - ${subject.subjectName}` : `Subject ${subjectId}`;
  };

  const formatDateTime = (dateString: string | Date | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": 
      case "Cleared": 
      case "Released": return "default";
      case "Rejected": 
      case "With Deficiencies": return "destructive";
      case "Processing": return "secondary";
      default: return "outline";
    }
  };

  const calculateFinalGrade = (q1?: number, q2?: number, q3?: number, q4?: number) => {
    const grades = [q1, q2, q3, q4].filter(g => g !== undefined) as number[];
    if (grades.length === 0) return 0;
    return Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length);
  };

  // Statistics
  const pendingEnrollments = enrollmentRequests.filter((r: RegistrarEnrollmentRequest) => r.status === "Pending");
  const pendingGraduations = graduationCandidates.filter((c: GraduationCandidate) => c.status === "Pending");
  const pendingTranscripts = transcriptRequests.filter((r: TranscriptRequest) => r.status === "Pending");
  const totalStudents = students.filter((s: User) => s.role === 'student').length;

  const gradeLevels = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", 
                      "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const semesters = ["1st Semester", "2nd Semester", "Summer"];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Registrar Dashboard</h1>
          <p className="text-muted-foreground">Manage enrollment, academic records, curriculum, and graduation</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEnrollmentDialogOpen} onOpenChange={setIsEnrollmentDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-enrollment">
                <Plus className="mr-2 h-4 w-4" />
                New Enrollment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Enrollment Request</DialogTitle>
                <DialogDescription>Process a new student enrollment for the current school year</DialogDescription>
              </DialogHeader>
              <Form {...enrollmentForm}>
                <form onSubmit={enrollmentForm.handleSubmit((data) => createEnrollmentRequestMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={enrollmentForm.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-enrollment-student">
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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={enrollmentForm.control}
                      name="schoolYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Year</FormLabel>
                          <FormControl>
                            <Input placeholder="2025-2026" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={enrollmentForm.control}
                      name="gradeLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {gradeLevels.map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  {grade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={enrollmentForm.control}
                    name="sectionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section (Optional)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No section assigned</SelectItem>
                            {sections.map((section: Section) => (
                              <SelectItem key={section.id} value={section.id.toString()}>
                                {section.name} - {section.gradeLevel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEnrollmentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createEnrollmentRequestMutation.isPending}>
                      Create Enrollment
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-subject">
                <BookOpen className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Subject to Curriculum</DialogTitle>
                <DialogDescription>Create a new subject for the curriculum</DialogDescription>
              </DialogHeader>
              <Form {...subjectForm}>
                <form onSubmit={subjectForm.handleSubmit((data) => createSubjectMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={subjectForm.control}
                      name="subjectCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject Code</FormLabel>
                          <FormControl>
                            <Input placeholder="ENG101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={subjectForm.control}
                      name="subjectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject Name</FormLabel>
                          <FormControl>
                            <Input placeholder="English I" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={subjectForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Subject description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={subjectForm.control}
                      name="gradeLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {gradeLevels.map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  {grade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={subjectForm.control}
                      name="semester"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Semester</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select semester" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {semesters.map((semester) => (
                                <SelectItem key={semester} value={semester}>
                                  {semester}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createSubjectMutation.isPending}>
                      Add Subject
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
            <CardTitle className="text-sm font-medium">Pending Enrollments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEnrollments.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graduation Candidates</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingGraduations.length}</div>
            <p className="text-xs text-muted-foreground">Pending clearance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transcript Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTranscripts.length}</div>
            <p className="text-xs text-muted-foreground">Pending processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Enrollments Alert */}
      {pendingEnrollments.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {pendingEnrollments.length} pending enrollment request{pendingEnrollments.length > 1 ? 's' : ''} that require approval.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">Enrollment Requests</TabsTrigger>
          <TabsTrigger value="subjects">Curriculum Management</TabsTrigger>
          <TabsTrigger value="records">Academic Records</TabsTrigger>
          <TabsTrigger value="graduation">Graduation</TabsTrigger>
          <TabsTrigger value="transcripts">Transcript Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Requests</CardTitle>
              <CardDescription>Approve or reject student enrollment applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>School Year</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Date Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollmentRequests.map((request: RegistrarEnrollmentRequest) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{getStudentName(request.studentId)}</TableCell>
                      <TableCell>{request.schoolYear}</TableCell>
                      <TableCell>{request.gradeLevel}</TableCell>
                      <TableCell>{getSectionName(request.sectionId)}</TableCell>
                      <TableCell>{formatDateTime(request.dateRequested)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {request.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateEnrollmentRequestMutation.mutate({ id: request.id, status: "Approved" })}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateEnrollmentRequestMutation.mutate({ id: request.id, status: "Rejected" })}
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
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

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Management</CardTitle>
              <CardDescription>Manage subjects and curriculum structure</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrarSubjects.map((subject: RegistrarSubject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.subjectCode}</TableCell>
                      <TableCell>{subject.subjectName}</TableCell>
                      <TableCell>{subject.gradeLevel}</TableCell>
                      <TableCell>{subject.semester}</TableCell>
                      <TableCell className="max-w-xs truncate">{subject.description || "No description"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Records</CardTitle>
              <CardDescription>Manage student grades and academic performance</CardDescription>
              <div className="pt-4">
                <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Academic Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add Academic Record</DialogTitle>
                      <DialogDescription>Record student grades for a specific subject</DialogDescription>
                    </DialogHeader>
                    <Form {...recordForm}>
                      <form onSubmit={recordForm.handleSubmit((data) => createAcademicRecordMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={recordForm.control}
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
                            control={recordForm.control}
                            name="subjectId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value ? field.value.toString() : ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {registrarSubjects.map((subject: RegistrarSubject) => (
                                      <SelectItem key={subject.id} value={subject.id.toString()}>
                                        {subject.subjectCode} - {subject.subjectName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={recordForm.control}
                          name="schoolYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>School Year</FormLabel>
                              <FormControl>
                                <Input placeholder="2025-2026" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-4 gap-4">
                          <FormField
                            control={recordForm.control}
                            name="quarter1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quarter 1</FormLabel>
                                <FormControl>
                                  <Input type="number" min="65" max="100" placeholder="85" {...field} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={recordForm.control}
                            name="quarter2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quarter 2</FormLabel>
                                <FormControl>
                                  <Input type="number" min="65" max="100" placeholder="88" {...field} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={recordForm.control}
                            name="quarter3"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quarter 3</FormLabel>
                                <FormControl>
                                  <Input type="number" min="65" max="100" placeholder="90" {...field} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={recordForm.control}
                            name="quarter4"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quarter 4</FormLabel>
                                <FormControl>
                                  <Input type="number" min="65" max="100" placeholder="87" {...field} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={recordForm.control}
                            name="finalGrade"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Final Grade</FormLabel>
                                <FormControl>
                                  <Input type="number" min="65" max="100" placeholder="87.5" {...field} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={recordForm.control}
                            name="remarks"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Remarks</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select remarks" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Passed">Passed</SelectItem>
                                    <SelectItem value="Failed">Failed</SelectItem>
                                    <SelectItem value="Incomplete">Incomplete</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsRecordDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createAcademicRecordMutation.isPending}>
                            Add Record
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>School Year</TableHead>
                    <TableHead>Q1</TableHead>
                    <TableHead>Q2</TableHead>
                    <TableHead>Q3</TableHead>
                    <TableHead>Q4</TableHead>
                    <TableHead>Final</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicRecords.map((record: AcademicRecord) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{getStudentName(record.studentId)}</TableCell>
                      <TableCell>{getSubjectName(record.subjectId)}</TableCell>
                      <TableCell>{record.schoolYear}</TableCell>
                      <TableCell>{record.quarter1 || "-"}</TableCell>
                      <TableCell>{record.quarter2 || "-"}</TableCell>
                      <TableCell>{record.quarter3 || "-"}</TableCell>
                      <TableCell>{record.quarter4 || "-"}</TableCell>
                      <TableCell className="font-medium">{record.finalGrade || calculateFinalGrade(record.quarter1, record.quarter2, record.quarter3, record.quarter4)}</TableCell>
                      <TableCell>
                        <Badge variant={record.remarks === "Passed" ? "default" : record.remarks === "Failed" ? "destructive" : "secondary"}>
                          {record.remarks}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graduation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Graduation Candidates</CardTitle>
              <CardDescription>Manage graduation eligibility and clearance</CardDescription>
              <div className="pt-4">
                <Dialog open={isGraduationDialogOpen} onOpenChange={setIsGraduationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Add Candidate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Graduation Candidate</DialogTitle>
                      <DialogDescription>Add a student to the graduation candidates list</DialogDescription>
                    </DialogHeader>
                    <Form {...graduationForm}>
                      <form onSubmit={graduationForm.handleSubmit((data) => createGraduationCandidateMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={graduationForm.control}
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
                          control={graduationForm.control}
                          name="schoolYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>School Year</FormLabel>
                              <FormControl>
                                <Input placeholder="2025-2026" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsGraduationDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createGraduationCandidateMutation.isPending}>
                            Add Candidate
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>School Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Cleared</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {graduationCandidates.map((candidate: GraduationCandidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">{getStudentName(candidate.studentId)}</TableCell>
                      <TableCell>{candidate.schoolYear}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(candidate.status)}>
                          {candidate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(candidate.dateCleared)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {candidate.status === "Pending" && (
                            <Button size="sm" variant="outline">
                              <Award className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => createTranscriptRequestMutation.mutate(candidate.studentId)}
                          >
                            <FileText className="h-4 w-4" />
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

        <TabsContent value="transcripts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transcript Requests</CardTitle>
              <CardDescription>Process and manage transcript of records requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transcriptRequests.map((request: TranscriptRequest) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{getStudentName(request.studentId)}</TableCell>
                      <TableCell>{formatDateTime(request.requestDate)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(request.releaseDate)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {request.status === "Pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTranscriptRequestMutation.mutate({ id: request.id, status: "Processing" })}
                            >
                              Process
                            </Button>
                          )}
                          {request.status === "Processing" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTranscriptRequestMutation.mutate({ id: request.id, status: "Released" })}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
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
      </Tabs>
    </div>
  );
}