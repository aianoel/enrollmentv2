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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  GraduationCap,
  Award,
  BookOpen,
  Plus,
  Eye,
  Edit,
  Save,
  X,
} from "lucide-react";

// Form schema for grade encoding
const gradeFormSchema = z.object({
  studentId: z.number().min(1, "Student is required"),
  subjectId: z.number().min(1, "Subject is required"),
  grade: z.number().min(60).max(100, "Grade must be between 60-100"),
  quarter: z.enum(["1", "2", "3", "4"]),
  schoolYear: z.string().min(1, "School year is required"),
});

type GradeFormData = z.infer<typeof gradeFormSchema>;

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
}

interface Section {
  id: number;
  name: string;
  gradeLevel: number;
}

interface Subject {
  id: number;
  name: string;
}

interface Grade {
  id: number;
  studentId: number;
  subjectId: number;
  teacherId: number;
  grade: number;
  quarter: string;
  schoolYear: string;
  studentName: string;
  subjectName: string;
}

interface TeacherAssignment {
  id: number;
  sectionId: number;
  subjectId: number;
  sectionName: string;
  subjectName: string;
  gradeLevel: number;
}

export function GradeManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<string>("1");
  const [editingGrade, setEditingGrade] = useState<{studentId: number, subjectId: number} | null>(null);
  const [tempGrade, setTempGrade] = useState<string>("");
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);

  // Fetch teacher's assigned sections with subjects
  const { data: assignments = [] } = useQuery<TeacherAssignment[]>({
    queryKey: ["/api/teacher/assignments"],
    queryFn: () => apiRequest("/api/teacher/assignments")
  });

  // Fetch students in selected section
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/teacher/students", selectedSection],
    queryFn: () => apiRequest(`/api/teacher/students?sectionId=${selectedSection}`),
    enabled: !!selectedSection
  });

  // Fetch subjects for selected section
  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/teacher/section-subjects", selectedSection],
    queryFn: () => apiRequest(`/api/teacher/section-subjects?sectionId=${selectedSection}`),
    enabled: !!selectedSection
  });

  // Fetch grades for selected section and quarter
  const { data: grades = [] } = useQuery<Grade[]>({
    queryKey: ["/api/teacher/grades", selectedSection, selectedQuarter],
    queryFn: () => apiRequest(`/api/teacher/grades?sectionId=${selectedSection}&quarter=${selectedQuarter}`),
    enabled: !!selectedSection && !!selectedQuarter
  });

  // Grade form
  const gradeForm = useForm<GradeFormData>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      quarter: "1",
      schoolYear: "2024-2025",
      grade: 75
    }
  });

  // Save grade mutation
  const saveGradeMutation = useMutation({
    mutationFn: (data: GradeFormData) => apiRequest("/api/teacher/grades", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/grades"] });
      toast({
        title: "Success",
        description: "Grade saved successfully"
      });
      setIsGradeDialogOpen(false);
      gradeForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save grade",
        variant: "destructive"
      });
    }
  });

  // Update grade mutation
  const updateGradeMutation = useMutation({
    mutationFn: ({ studentId, subjectId, grade }: { studentId: number, subjectId: number, grade: number }) => 
      apiRequest(`/api/teacher/grades/${studentId}/${subjectId}`, {
        method: "PUT",
        body: JSON.stringify({ 
          grade, 
          quarter: selectedQuarter,
          schoolYear: "2024-2025"
        })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/grades"] });
      setEditingGrade(null);
      setTempGrade("");
      toast({
        title: "Success",
        description: "Grade updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update grade",
        variant: "destructive"
      });
    }
  });

  // Get unique sections from assignments
  const sections = assignments.reduce((acc: Section[], assignment) => {
    const existingSection = acc.find(s => s.id === assignment.sectionId);
    if (!existingSection) {
      acc.push({
        id: assignment.sectionId,
        name: assignment.sectionName,
        gradeLevel: assignment.gradeLevel
      });
    }
    return acc;
  }, []);

  // Get grade for specific student and subject
  const getGrade = (studentId: number, subjectId: number) => {
    return grades.find(g => g.studentId === studentId && g.subjectId === subjectId);
  };

  // Handle grade submission
  const onSubmitGrade = (data: GradeFormData) => {
    saveGradeMutation.mutate(data);
  };

  // Handle inline grade editing
  const handleSaveInlineGrade = (studentId: number, subjectId: number) => {
    const grade = parseFloat(tempGrade);
    if (grade >= 60 && grade <= 100) {
      updateGradeMutation.mutate({ studentId, subjectId, grade });
    } else {
      toast({
        title: "Invalid Grade",
        description: "Grade must be between 60-100",
        variant: "destructive"
      });
    }
  };

  const startEditing = (studentId: number, subjectId: number, currentGrade?: number) => {
    setEditingGrade({ studentId, subjectId });
    setTempGrade(currentGrade?.toString() || "");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Grade Management
          </CardTitle>
          <CardDescription>
            Manage student grades for your assigned sections and subjects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section and Quarter Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Section</label>
              <Select
                value={selectedSection?.toString() || ""}
                onValueChange={(value) => setSelectedSection(parseInt(value))}
              >
                <SelectTrigger data-testid="select-section">
                  <SelectValue placeholder="Choose a section..." />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name} (Grade {section.gradeLevel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Quarter</label>
              <Select
                value={selectedQuarter}
                onValueChange={setSelectedQuarter}
              >
                <SelectTrigger data-testid="select-quarter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Quarter</SelectItem>
                  <SelectItem value="2">2nd Quarter</SelectItem>
                  <SelectItem value="3">3rd Quarter</SelectItem>
                  <SelectItem value="4">4th Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSection && (
            <Tabs defaultValue="gradesheet" className="space-y-4">
              <TabsList>
                <TabsTrigger value="gradesheet" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Grade Sheet
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Students ({students.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gradesheet" className="space-y-4">
                {students.length > 0 && subjects.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        {sections.find(s => s.id === selectedSection)?.name} - {selectedQuarter}
                        {selectedQuarter === "1" ? "st" : selectedQuarter === "2" ? "nd" : selectedQuarter === "3" ? "rd" : "th"} Quarter
                      </h3>
                      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                        <DialogTrigger asChild>
                          <Button data-testid="add-grade-btn">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Grade
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Grade</DialogTitle>
                            <DialogDescription>
                              Enter grade for a student in the selected section
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...gradeForm}>
                            <form onSubmit={gradeForm.handleSubmit(onSubmitGrade)} className="space-y-4">
                              <FormField
                                control={gradeForm.control}
                                name="studentId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Student</FormLabel>
                                    <FormControl>
                                      <Select
                                        value={field.value?.toString() || ""}
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select student..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {students.map((student) => (
                                            <SelectItem key={student.id} value={student.id.toString()}>
                                              {student.firstName} {student.lastName}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={gradeForm.control}
                                name="subjectId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                      <Select
                                        value={field.value?.toString() || ""}
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select subject..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id.toString()}>
                                              {subject.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={gradeForm.control}
                                name="grade"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Grade (60-100)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="60"
                                        max="100"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={gradeForm.control}
                                name="quarter"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Quarter</FormLabel>
                                    <FormControl>
                                      <Select value={selectedQuarter} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">1st Quarter</SelectItem>
                                          <SelectItem value="2">2nd Quarter</SelectItem>
                                          <SelectItem value="3">3rd Quarter</SelectItem>
                                          <SelectItem value="4">4th Quarter</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsGradeDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={saveGradeMutation.isPending}>
                                  {saveGradeMutation.isPending ? "Saving..." : "Save Grade"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Student Name</TableHead>
                            {subjects.map((subject) => (
                              <TableHead key={subject.id} className="text-center">
                                {subject.name}
                              </TableHead>
                            ))}
                            <TableHead className="text-center">Average</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student) => {
                            const studentGrades = subjects.map(subject => getGrade(student.id, subject.id));
                            const validGrades = studentGrades.filter(g => g?.grade).map(g => g!.grade);
                            const average = validGrades.length > 0 
                              ? (validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length).toFixed(1)
                              : "---";

                            return (
                              <TableRow key={student.id}>
                                <TableCell className="font-medium">
                                  {student.firstName} {student.lastName}
                                </TableCell>
                                {subjects.map((subject) => {
                                  const grade = getGrade(student.id, subject.id);
                                  const isEditing = editingGrade?.studentId === student.id && 
                                                  editingGrade?.subjectId === subject.id;

                                  return (
                                    <TableCell key={subject.id} className="text-center">
                                      {isEditing ? (
                                        <div className="flex items-center gap-1">
                                          <Input
                                            type="number"
                                            min="60"
                                            max="100"
                                            value={tempGrade}
                                            onChange={(e) => setTempGrade(e.target.value)}
                                            className="w-16 h-8 text-center"
                                            autoFocus
                                          />
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleSaveInlineGrade(student.id, subject.id)}
                                          >
                                            <Save className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setEditingGrade(null)}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <div 
                                          className="cursor-pointer hover:bg-gray-100 p-1 rounded flex items-center justify-center gap-1"
                                          onClick={() => startEditing(student.id, subject.id, grade?.grade)}
                                        >
                                          {grade ? (
                                            <Badge variant={grade.grade >= 75 ? "default" : "destructive"}>
                                              {grade.grade}
                                            </Badge>
                                          ) : (
                                            <span className="text-gray-400">---</span>
                                          )}
                                          <Edit className="h-3 w-3 opacity-50" />
                                        </div>
                                      )}
                                    </TableCell>
                                  );
                                })}
                                <TableCell className="text-center">
                                  <Badge variant={parseFloat(average) >= 75 ? "default" : "destructive"}>
                                    {average}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No data available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {students.length === 0 ? "No students enrolled in this section" : "No subjects assigned for this section"}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <div className="grid gap-4">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <Card key={student.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{student.firstName} {student.lastName}</h4>
                              <p className="text-sm text-gray-500">{student.email}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">No students enrolled</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        There are no students enrolled in this section yet.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!selectedSection && (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Select a section to begin</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a section from the dropdown above to view students and manage grades.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}