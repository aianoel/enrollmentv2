import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  GraduationCap,
  UserCheck
} from "lucide-react";
import type { Section, Subject, TeacherAssignment, User } from "@shared/schema";

const sectionFormSchema = z.object({
  name: z.string().min(2, "Section name must be at least 2 characters"),
  gradeLevel: z.number().min(1).max(12),
  adviserId: z.number().optional(),
});

const subjectFormSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  gradeLevel: z.number().min(1).max(12),
});

const teacherAssignmentFormSchema = z.object({
  teacherId: z.number().min(1, "Teacher is required"),
  sectionId: z.number().min(1, "Section is required"),
  subjectId: z.number().min(1, "Subject is required"),
});

type SectionFormData = z.infer<typeof sectionFormSchema>;
type SubjectFormData = z.infer<typeof subjectFormSchema>;
type TeacherAssignmentFormData = z.infer<typeof teacherAssignmentFormSchema>;

export function AcademicSetup() {
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ["/api/admin/sections"],
    queryFn: () => apiRequest("/api/admin/sections")
  });

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/admin/subjects"],
    queryFn: () => apiRequest("/api/admin/subjects")
  });

  const { data: teacherAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/admin/teacher-assignments"],
    queryFn: () => apiRequest("/api/admin/teacher-assignments")
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("/api/admin/users")
  });

  // Forms
  const sectionForm = useForm<SectionFormData>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: { name: "", gradeLevel: 1 },
  });

  const subjectForm = useForm<SubjectFormData>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: { name: "", gradeLevel: 1 },
  });

  const assignmentForm = useForm<TeacherAssignmentFormData>({
    resolver: zodResolver(teacherAssignmentFormSchema),
    defaultValues: { teacherId: 0, sectionId: 0, subjectId: 0 },
  });

  // Section mutations
  const createSectionMutation = useMutation({
    mutationFn: (data: SectionFormData) => apiRequest("/api/admin/sections", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      setIsSectionDialogOpen(false);
      sectionForm.reset();
      toast({ title: "Section created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create section", variant: "destructive" });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SectionFormData> }) =>
      apiRequest(`/api/admin/sections/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      setIsSectionDialogOpen(false);
      setSelectedSection(null);
      sectionForm.reset();
      toast({ title: "Section updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update section", variant: "destructive" });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/sections/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      toast({ title: "Section deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete section", variant: "destructive" });
    },
  });

  // Subject mutations
  const createSubjectMutation = useMutation({
    mutationFn: (data: SubjectFormData) => apiRequest("/api/admin/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subjects"] });
      setIsSubjectDialogOpen(false);
      subjectForm.reset();
      toast({ title: "Subject created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create subject", variant: "destructive" });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/subjects/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subjects"] });
      toast({ title: "Subject deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete subject", variant: "destructive" });
    },
  });

  // Teacher assignment mutations
  const createAssignmentMutation = useMutation({
    mutationFn: (data: TeacherAssignmentFormData) => apiRequest("/api/admin/teacher-assignments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teacher-assignments"] });
      setIsAssignmentDialogOpen(false);
      assignmentForm.reset();
      toast({ title: "Teacher assignment created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create teacher assignment", variant: "destructive" });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/teacher-assignments/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teacher-assignments"] });
      toast({ title: "Teacher assignment deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete teacher assignment", variant: "destructive" });
    },
  });

  // Handlers
  const handleCreateSection = (data: SectionFormData) => {
    createSectionMutation.mutate(data);
  };

  const handleUpdateSection = (data: SectionFormData) => {
    if (selectedSection) {
      updateSectionMutation.mutate({ id: selectedSection.id, data });
    }
  };

  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    sectionForm.reset({
      name: section.name,
      gradeLevel: section.gradeLevel,
      adviserId: section.adviserId || undefined,
    });
    setIsSectionDialogOpen(true);
  };

  const handleCreateSubject = (data: SubjectFormData) => {
    createSubjectMutation.mutate(data);
  };

  const handleCreateAssignment = (data: TeacherAssignmentFormData) => {
    createAssignmentMutation.mutate(data);
  };

  // Helper functions
  const getTeacherName = (teacherId: number) => {
    const teacher = users.find((user: User) => user.id === teacherId);
    return teacher?.name || "Unknown Teacher";
  };

  const getSectionName = (sectionId: number) => {
    const section = sections.find((s: Section) => s.id === sectionId);
    return section?.name || "Unknown Section";
  };

  const getSubjectName = (subjectId: number) => {
    const subject = subjects.find((s: Subject) => s.id === subjectId);
    return subject?.name || "Unknown Subject";
  };

  const teachers = users.filter((user: User) => user.role === 'teacher');

  if (sectionsLoading || subjectsLoading || assignmentsLoading) {
    return <div className="flex items-center justify-center h-64">Loading academic setup...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Academic Setup</h2>
          <p className="text-muted-foreground">Manage sections, subjects, and teacher assignments</p>
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="assignments">Teacher Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Section Management
                  </CardTitle>
                  <CardDescription>Create and manage academic sections</CardDescription>
                </div>
                <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Section
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedSection ? "Edit Section" : "Create New Section"}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedSection 
                          ? "Update section information"
                          : "Add a new academic section"
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...sectionForm}>
                      <form onSubmit={sectionForm.handleSubmit(selectedSection ? handleUpdateSection : handleCreateSection)} className="space-y-4">
                        <FormField
                          control={sectionForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Section Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter section name" {...field} />
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
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select grade level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                                    <SelectItem key={grade} value={grade.toString()}>
                                      Grade {grade}
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
                          name="adviserId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adviser (Optional)</FormLabel>
                              <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select adviser" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">No adviser</SelectItem>
                                  {teachers.map((teacher: User) => (
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
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsSectionDialogOpen(false);
                              setSelectedSection(null);
                              sectionForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {selectedSection ? "Update Section" : "Create Section"}
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
                    <TableHead>Section Name</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Adviser</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section: Section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">{section.name}</TableCell>
                      <TableCell>Grade {section.gradeLevel}</TableCell>
                      <TableCell>
                        {section.adviserId ? getTeacherName(section.adviserId) : "No adviser assigned"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSection(section)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteSectionMutation.mutate(section.id)}
                          >
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

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subject Management
                  </CardTitle>
                  <CardDescription>Create and manage academic subjects</CardDescription>
                </div>
                <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Subject
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Subject</DialogTitle>
                      <DialogDescription>Add a new academic subject</DialogDescription>
                    </DialogHeader>
                    <Form {...subjectForm}>
                      <form onSubmit={subjectForm.handleSubmit(handleCreateSubject)} className="space-y-4">
                        <FormField
                          control={subjectForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter subject name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={subjectForm.control}
                          name="gradeLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade Level</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select grade level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                                    <SelectItem key={grade} value={grade.toString()}>
                                      Grade {grade}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsSubjectDialogOpen(false);
                              subjectForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Create Subject</Button>
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
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject: Subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>Grade {subject.gradeLevel}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSubjectMutation.mutate(subject.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Teacher Assignments
                  </CardTitle>
                  <CardDescription>Assign teachers to sections and subjects</CardDescription>
                </div>
                <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Assignment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Teacher Assignment</DialogTitle>
                      <DialogDescription>Assign a teacher to a section and subject</DialogDescription>
                    </DialogHeader>
                    <Form {...assignmentForm}>
                      <form onSubmit={assignmentForm.handleSubmit(handleCreateAssignment)} className="space-y-4">
                        <FormField
                          control={assignmentForm.control}
                          name="teacherId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teacher</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select teacher" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {teachers.map((teacher: User) => (
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
                          name="sectionId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Section</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
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
                          control={assignmentForm.control}
                          name="subjectId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select subject" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {subjects.map((subject: Subject) => (
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
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAssignmentDialogOpen(false);
                              assignmentForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Create Assignment</Button>
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
                    <TableHead>Teacher</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherAssignments.map((assignment: TeacherAssignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {getTeacherName(assignment.teacherId!)}
                      </TableCell>
                      <TableCell>{getSectionName(assignment.sectionId!)}</TableCell>
                      <TableCell>{getSubjectName(assignment.subjectId!)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAssignmentMutation.mutate(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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