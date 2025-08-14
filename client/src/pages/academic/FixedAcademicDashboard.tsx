import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  Tabs, TabsContent, TabsList, TabsTrigger,
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button, Input, Textarea, Badge,
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui";

import {
  BookOpen, Plus, Users, UserPlus, GraduationCap, ClipboardList,
  Calendar, School, ChartBar, Clock, CalendarDays, FileText
} from "lucide-react";

// Form schemas
const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  description: z.string().optional(),
});

const sectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  capacity: z.number().min(1).max(60).default(40),
  schoolYear: z.string().min(1, "School year is required"),
});

const assignmentSchema = z.object({
  teacherId: z.number(),
  subjectId: z.number(),
  sectionId: z.number(),
  schoolYear: z.string().default("2024-2025"),
  semester: z.string().default("1st"),
});

const scheduleSchema = z.object({
  teacherId: z.number(),
  subjectId: z.number(),
  sectionId: z.number(),
  dayOfWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  room: z.string().optional(),
});

export default function FixedAcademicDashboard() {
  const queryClient = useQueryClient();

  // Queries
  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/academic/subjects'],
    refetchInterval: 30000
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['/api/academic/sections'],
    refetchInterval: 30000
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['/api/academic/teachers'],
    refetchInterval: 30000
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['/api/academic/teacher-assignments'],
    refetchInterval: 30000
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['/api/academic/teacher-schedules'],
    refetchInterval: 30000
  });

  // Forms
  const subjectForm = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { description: "" }
  });

  const sectionForm = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
    defaultValues: { capacity: 40, schoolYear: "2024-2025" }
  });

  const assignmentForm = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { schoolYear: "2024-2025", semester: "1st" }
  });

  const scheduleForm = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
  });

  // Mutations
  const createSubjectMutation = useMutation({
    mutationFn: (data: z.infer<typeof subjectSchema>) => 
      apiRequest('/api/academic/subjects', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic/subjects'] });
      subjectForm.reset();
      toast({ title: "Subject created successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating subject", description: error.message, variant: "destructive" });
    }
  });

  const createSectionMutation = useMutation({
    mutationFn: (data: z.infer<typeof sectionSchema>) => 
      apiRequest('/api/academic/sections', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic/sections'] });
      sectionForm.reset();
      toast({ title: "Section created successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating section", description: error.message, variant: "destructive" });
    }
  });

  const assignTeacherMutation = useMutation({
    mutationFn: (data: z.infer<typeof assignmentSchema>) => 
      apiRequest('/api/academic/teacher-assignments', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic/teacher-assignments'] });
      assignmentForm.reset();
      toast({ title: "Teacher assigned successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error assigning teacher", description: error.message, variant: "destructive" });
    }
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data: z.infer<typeof scheduleSchema>) => 
      apiRequest('/api/academic/schedules', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic/teacher-schedules'] });
      scheduleForm.reset();
      toast({ title: "Schedule created successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating schedule", description: error.message, variant: "destructive" });
    }
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Coordinator Dashboard</h1>
        <p className="text-gray-600">Manage subjects, sections, teacher assignments, and schedules</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <School className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sections</p>
                <p className="text-2xl font-bold text-gray-900">{sections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled Classes</p>
                <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subjects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="assignments">Teacher Assignments</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Subject Management</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Subject
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
                  <Plus className="w-4 h-4 mr-2" />
                  Create Section
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
                            <Input placeholder="Grade 10-A" {...field} data-testid="input-section-name" />
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
                          <FormControl>
                            <Input placeholder="Grade 10" {...field} data-testid="input-grade-level" />
                          </FormControl>
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
                            <Input type="number" min="1" max="60" {...field} onChange={(e) => field.onChange(Number(e.target.value))} data-testid="input-capacity" />
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
            <CardHeader>
              <CardTitle>Current Teacher Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>School Year</TableHead>
                    <TableHead>Semester</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment: any) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.teacher_name}</TableCell>
                      <TableCell>{assignment.subject_name}</TableCell>
                      <TableCell>{assignment.section_name}</TableCell>
                      <TableCell>{assignment.school_year}</TableCell>
                      <TableCell>{assignment.semester}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Class Schedules</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Class Schedule</DialogTitle>
                  <DialogDescription>Schedule a class for a specific teacher, subject, and section</DialogDescription>
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
                    <FormField
                      control={scheduleForm.control}
                      name="dayOfWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day of Week</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger data-testid="select-day">
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
                          <FormLabel>Room (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Room 101" {...field} data-testid="input-room" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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

          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Room</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule: any) => (
                    <TableRow key={schedule.id}>
                      <TableCell>{schedule.day_of_week}</TableCell>
                      <TableCell>{schedule.start_time} - {schedule.end_time}</TableCell>
                      <TableCell>{schedule.teacher_name}</TableCell>
                      <TableCell>{schedule.subject_name}</TableCell>
                      <TableCell>{schedule.section_name}</TableCell>
                      <TableCell>{schedule.room || '-'}</TableCell>
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