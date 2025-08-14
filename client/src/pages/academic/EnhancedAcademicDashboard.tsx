import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  BookOpen,
  Users,
  Calendar,
  Clock,
  Plus,
  UserPlus,
  BookPlus,
  GraduationCap,
  School,
  MapPin,
  Settings,
  PlusCircle,
  Edit3,
  Trash2,
  ChevronRight,
  UserCheck,
  CalendarDays,
  FileText
} from "lucide-react";

// Form schemas
const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  description: z.string().optional(),
});

const sectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  adviserId: z.number().optional(),
  capacity: z.number().min(1).max(50).default(40),
  schoolYear: z.string().min(1, "School year is required"),
});

const assignmentSchema = z.object({
  teacherId: z.number().min(1, "Teacher is required"),
  subjectId: z.number().min(1, "Subject is required"),
  sectionId: z.number().min(1, "Section is required"),
  schoolYear: z.string().min(1, "School year is required"),
  semester: z.string().min(1, "Semester is required"),
});

const scheduleSchema = z.object({
  teacherId: z.number().min(1, "Teacher is required"),
  subjectId: z.number().min(1, "Subject is required"),
  sectionId: z.number().min(1, "Section is required"),
  dayOfWeek: z.string().min(1, "Day of week is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  room: z.string().optional(),
  schoolYear: z.string().min(1, "School year is required"),
  semester: z.string().min(1, "Semester is required"),
});

export function EnhancedAcademicDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/academic/subjects"],
    queryFn: () => apiRequest("/api/academic/subjects"),
    refetchInterval: 30000
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ["/api/academic/sections"],
    queryFn: () => apiRequest("/api/academic/sections"),
    refetchInterval: 30000
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ["/api/academic/teachers"],
    queryFn: () => apiRequest("/api/academic/teachers"),
    refetchInterval: 30000
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/academic/teacher-assignments"],
    queryFn: () => apiRequest("/api/academic/teacher-assignments"),
    refetchInterval: 30000
  });

  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ["/api/academic/teacher-schedules"],
    queryFn: () => apiRequest("/api/academic/teacher-schedules"),
    refetchInterval: 30000
  });

  // Forms
  const subjectForm = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { 
      name: "",
      description: "" 
    }
  });

  const sectionForm = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
    defaultValues: { 
      name: "",
      gradeLevel: "",
      capacity: 40, 
      schoolYear: "2024-2025" 
    }
  });

  const assignmentForm = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { 
      teacherId: 0,
      subjectId: 0,
      sectionId: 0,
      schoolYear: "2024-2025", 
      semester: "1st" 
    }
  });

  const scheduleForm = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { 
      teacherId: 0,
      subjectId: 0,
      sectionId: 0,
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      room: "",
      schoolYear: "2024-2025", 
      semester: "1st" 
    }
  });

  // Mutations
  const createSubjectMutation = useMutation({
    mutationFn: (data: z.infer<typeof subjectSchema>) => 
      apiRequest("/api/academic/subjects", "POST", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Subject created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/academic/subjects"] });
      subjectForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create subject", variant: "destructive" });
    }
  });

  const createSectionMutation = useMutation({
    mutationFn: (data: z.infer<typeof sectionSchema>) => 
      apiRequest("/api/academic/sections", "POST", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Section created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/academic/sections"] });
      sectionForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create section", variant: "destructive" });
    }
  });

  const assignTeacherMutation = useMutation({
    mutationFn: (data: z.infer<typeof assignmentSchema>) => 
      apiRequest("/api/academic/assign-teacher", "POST", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Teacher assigned successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/academic/teacher-assignments"] });
      assignmentForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to assign teacher", variant: "destructive" });
    }
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data: z.infer<typeof scheduleSchema>) => 
      apiRequest("/api/academic/schedules", "POST", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Schedule created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/academic/teacher-schedules"] });
      scheduleForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create schedule", variant: "destructive" });
    }
  });

  // Stats calculations
  const stats = {
    totalSubjects: subjects.length,
    totalSections: sections.length,
    totalTeachers: teachers.length,
    totalAssignments: assignments.length,
    activeSchedules: schedules.length
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Coordinator</h1>
          <p className="text-gray-600">Manage subjects, sections, teacher assignments, and schedules</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <GraduationCap className="w-4 h-4 mr-1" />
            Academic Year 2024-2025
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Subjects</p>
                <h3 className="text-2xl font-bold">{stats.totalSubjects}</h3>
              </div>
              <BookOpen className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Sections</p>
                <h3 className="text-2xl font-bold">{stats.totalSections}</h3>
              </div>
              <School className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Active Teachers</p>
                <h3 className="text-2xl font-bold">{stats.totalTeachers}</h3>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Assignments</p>
                <h3 className="text-2xl font-bold">{stats.totalAssignments}</h3>
              </div>
              <UserCheck className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">Schedules</p>
                <h3 className="text-2xl font-bold">{stats.activeSchedules}</h3>
              </div>
              <CalendarDays className="h-8 w-8 text-teal-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white rounded-lg shadow-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <School className="w-4 h-4" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Teacher Assignments
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Recent Teacher Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {assignments.slice(0, 5).map((assignment: any) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 mb-2">
                      <div>
                        <p className="font-medium">{assignment.teacher_name}</p>
                        <p className="text-sm text-gray-600">{assignment.subject_name} - {assignment.section_name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {assignment.semester} Semester
                      </Badge>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Weekly Schedule Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Weekly Schedule Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                    const daySchedules = schedules.filter((schedule: any) => schedule.day_of_week === day);
                    return (
                      <div key={day} className="mb-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">{day}</h4>
                        <div className="space-y-1">
                          {daySchedules.slice(0, 3).map((schedule: any) => (
                            <div key={schedule.id} className="flex items-center text-xs bg-gray-50 p-2 rounded">
                              <Clock className="w-3 h-3 mr-1 text-gray-500" />
                              {schedule.start_time} - {schedule.subject_name}
                            </div>
                          ))}
                          {daySchedules.length > 3 && (
                            <p className="text-xs text-gray-500">+{daySchedules.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Subject Management</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <BookPlus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Subject</DialogTitle>
                  <DialogDescription>Add a new subject to the curriculum</DialogDescription>
                </DialogHeader>
                <Form {...subjectForm}>
                  <form onSubmit={subjectForm.handleSubmit((data) => createSubjectMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={subjectForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Mathematics" {...field} data-testid="input-subject-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={subjectForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Subject description..." {...field} data-testid="textarea-subject-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createSubjectMutation.isPending} data-testid="button-create-subject">
                        Create Subject
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject: any) => (
              <Card key={subject.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{subject.name}</h3>
                      <p className="text-sm text-gray-600">ID: {subject.id}</p>
                    </div>
                    <Badge variant="secondary">Subject</Badge>
                  </div>
                  {subject.description && (
                    <p className="text-sm text-gray-600 mt-2">{subject.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sections" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Section Management</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Section</DialogTitle>
                  <DialogDescription>Add a new section for students</DialogDescription>
                </DialogHeader>
                <Form {...sectionForm}>
                  <form onSubmit={sectionForm.handleSubmit((data) => createSectionMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={sectionForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Section Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Grade 7-A" {...field} data-testid="input-section-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sectionForm.control}
                      name="gradeLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-grade-level">
                                <SelectValue placeholder="Select grade level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Grade 7">Grade 7</SelectItem>
                              <SelectItem value="Grade 8">Grade 8</SelectItem>
                              <SelectItem value="Grade 9">Grade 9</SelectItem>
                              <SelectItem value="Grade 10">Grade 10</SelectItem>
                              <SelectItem value="Grade 11">Grade 11</SelectItem>
                              <SelectItem value="Grade 12">Grade 12</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sectionForm.control}
                      name="adviserId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adviser (Optional)</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))}>
                            <FormControl>
                              <SelectTrigger data-testid="select-adviser">
                                <SelectValue placeholder="Select adviser" />
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
                      control={sectionForm.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="50" {...field} onChange={(e) => field.onChange(Number(e.target.value))} data-testid="input-section-capacity" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sectionForm.control}
                      name="schoolYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Year</FormLabel>
                          <FormControl>
                            <Input placeholder="2024-2025" {...field} data-testid="input-school-year" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createSectionMutation.isPending} data-testid="button-create-section">
                        Create Section
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section: any) => (
              <Card key={section.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{section.name}</h3>
                      <p className="text-sm text-gray-600">{section.grade_level}</p>
                    </div>
                    <Badge variant="outline">{section.capacity} max</Badge>
                  </div>
                  {section.adviser_name && (
                    <p className="text-sm text-gray-600 mt-2">
                      <Users className="w-3 h-3 inline mr-1" />
                      Adviser: {section.adviser_name}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Teacher Assignments</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Teacher
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Teacher to Subject</DialogTitle>
                  <DialogDescription>Assign a teacher to a specific subject and section</DialogDescription>
                </DialogHeader>
                <Form {...assignmentForm}>
                  <form onSubmit={assignmentForm.handleSubmit((data) => assignTeacherMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={assignmentForm.control}
                      name="teacherId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teacher</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))}>
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
                      control={assignmentForm.control}
                      name="subjectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))}>
                            <FormControl>
                              <SelectTrigger data-testid="select-subject">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.map((subject: any) => (
                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                  {subject.name} ({subject.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={assignmentForm.control}
                      name="sectionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Section</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))}>
                            <FormControl>
                              <SelectTrigger data-testid="select-section">
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sections.map((section: any) => (
                                <SelectItem key={section.id} value={section.id.toString()}>
                                  {section.name} - {section.grade_level}
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
                        control={assignmentForm.control}
                        name="schoolYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Year</FormLabel>
                            <FormControl>
                              <Input placeholder="2024-2025" {...field} data-testid="input-assignment-school-year" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={assignmentForm.control}
                        name="semester"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Semester</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-semester">
                                  <SelectValue placeholder="Select semester" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1st">1st Semester</SelectItem>
                                <SelectItem value="2nd">2nd Semester</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={assignTeacherMutation.isPending} data-testid="button-assign-teacher">
                        Assign Teacher
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
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Teacher</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Semester</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">School Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assignments.map((assignment: any) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{assignment.teacher_name}</td>
                        <td className="px-4 py-3 text-sm">
                          {assignment.subject_name}
                          <span className="text-gray-500 ml-1">({assignment.subject_code})</span>
                        </td>
                        <td className="px-4 py-3 text-sm">{assignment.section_name}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline">{assignment.semester} Semester</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{assignment.school_year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Teacher Schedules</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Teacher Schedule</DialogTitle>
                  <DialogDescription>Set up a class schedule for a teacher</DialogDescription>
                </DialogHeader>
                <Form {...scheduleForm}>
                  <form onSubmit={scheduleForm.handleSubmit((data) => createScheduleMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={scheduleForm.control}
                      name="teacherId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teacher</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))}>
                            <FormControl>
                              <SelectTrigger data-testid="select-schedule-teacher">
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
                      name="subjectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))}>
                            <FormControl>
                              <SelectTrigger data-testid="select-schedule-subject">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.map((subject: any) => (
                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                  {subject.name} ({subject.code})
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
                          <Select onValueChange={(value) => field.onChange(Number(value))}>
                            <FormControl>
                              <SelectTrigger data-testid="select-schedule-section">
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sections.map((section: any) => (
                                <SelectItem key={section.id} value={section.id.toString()}>
                                  {section.name} - {section.grade_level}
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
                        name="dayOfWeek"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day of Week</FormLabel>
                            <Select onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger data-testid="select-day-of-week">
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Monday">Monday</SelectItem>
                                <SelectItem value="Tuesday">Tuesday</SelectItem>
                                <SelectItem value="Wednesday">Wednesday</SelectItem>
                                <SelectItem value="Thursday">Thursday</SelectItem>
                                <SelectItem value="Friday">Friday</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={scheduleForm.control}
                        name="room"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Room 101" {...field} data-testid="input-room" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={scheduleForm.control}
                        name="schoolYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Year</FormLabel>
                            <FormControl>
                              <Input placeholder="2024-2025" {...field} data-testid="input-schedule-school-year" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={scheduleForm.control}
                        name="semester"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Semester</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-schedule-semester">
                                  <SelectValue placeholder="Select semester" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1st">1st Semester</SelectItem>
                                <SelectItem value="2nd">2nd Semester</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createScheduleMutation.isPending} data-testid="button-create-schedule">
                        Create Schedule
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Weekly Schedule Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2 text-sm">
                <div className="font-medium p-2 bg-gray-100 rounded">Time</div>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <div key={day} className="font-medium p-2 bg-gray-100 rounded text-center">{day}</div>
                ))}
                
                {["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"].map((time) => (
                  <>
                    <div key={time} className="p-2 bg-gray-50 rounded font-medium">{time}</div>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                      const daySchedule = schedules.find((schedule: any) => 
                        schedule.day_of_week === day && schedule.start_time === time
                      );
                      return (
                        <div key={`${day}-${time}`} className="p-2 border rounded min-h-[60px]">
                          {daySchedule && (
                            <div className="bg-blue-100 text-blue-800 p-1 rounded text-xs">
                              <div className="font-medium">{daySchedule.subject_name}</div>
                              <div className="text-xs">{daySchedule.teacher_name}</div>
                              <div className="text-xs">{daySchedule.section_name}</div>
                              {daySchedule.room && <div className="text-xs">{daySchedule.room}</div>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}