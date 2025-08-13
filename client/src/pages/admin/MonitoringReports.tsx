import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart3, 
  Users, 
  GraduationCap, 
  FileText,
  TrendingUp,
  Calendar
} from "lucide-react";
import type { User, Grade, Enrollment, Assignment } from "@shared/schema";

export function MonitoringReports() {
  // Fetch data for reports
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("/api/admin/users")
  });

  const { data: grades = [], isLoading: gradesLoading } = useQuery({
    queryKey: ["/api/admin/grades"],
    queryFn: () => apiRequest("/api/admin/grades")
  });

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/admin/enrollments"],
    queryFn: () => apiRequest("/api/admin/enrollments")
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/admin/assignments"],
    queryFn: () => apiRequest("/api/admin/assignments")
  });

  // Calculate statistics
  const getStatistics = () => {
    const students = users.filter((user: User) => user.role === 'student');
    const teachers = users.filter((user: User) => user.role === 'teacher');
    const approvedEnrollments = enrollments.filter((e: Enrollment) => e.status === 'approved');
    const pendingEnrollments = enrollments.filter((e: Enrollment) => e.status === 'pending');
    
    // Grade statistics
    const gradesByStudent = grades.reduce((acc: any, grade: Grade) => {
      if (!acc[grade.studentId]) {
        acc[grade.studentId] = [];
      }
      acc[grade.studentId].push(parseFloat(grade.grade || '0'));
      return acc;
    }, {});

    const studentAverages = Object.entries(gradesByStudent).map(([studentId, studentGrades]: [string, any]) => {
      const average = studentGrades.reduce((sum: number, grade: number) => sum + grade, 0) / studentGrades.length;
      const student = students.find((s: User) => s.id === parseInt(studentId));
      return {
        studentId: parseInt(studentId),
        studentName: student?.name || 'Unknown',
        average: isNaN(average) ? 0 : average,
        gradeCount: studentGrades.length
      };
    });

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      approvedEnrollments: approvedEnrollments.length,
      pendingEnrollments: pendingEnrollments.length,
      totalGrades: grades.length,
      totalAssignments: assignments.length,
      studentAverages,
      overallAverage: studentAverages.length > 0 
        ? studentAverages.reduce((sum, student) => sum + student.average, 0) / studentAverages.length 
        : 0
    };
  };

  const statistics = getStatistics();

  const StatCard = ({ icon: Icon, title, value, description, color = "blue" }: {
    icon: any;
    title: string;
    value: string | number;
    description: string;
    color?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const getGradeBadge = (average: number) => {
    if (average >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (average >= 80) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (average >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>;
    if (average >= 60) return <Badge className="bg-orange-100 text-orange-800">Needs Improvement</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  if (usersLoading || gradesLoading || enrollmentsLoading || assignmentsLoading) {
    return <div className="flex items-center justify-center h-64">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoring & Reports</h2>
          <p className="text-muted-foreground">System analytics and performance reports</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title="Total Students"
          value={statistics.totalStudents}
          description="Enrolled students"
          color="blue"
        />
        <StatCard
          icon={GraduationCap}
          title="Total Teachers"
          value={statistics.totalTeachers}
          description="Teaching staff"
          color="green"
        />
        <StatCard
          icon={FileText}
          title="Total Grades"
          value={statistics.totalGrades}
          description="Recorded grades"
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          title="Overall Average"
          value={statistics.overallAverage.toFixed(1)}
          description="School-wide GPA"
          color="orange"
        />
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="system">System Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Student Performance Report
              </CardTitle>
              <CardDescription>Academic performance analytics and grade distributions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Average Grade</TableHead>
                    <TableHead>Total Grades</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.studentAverages
                    .sort((a, b) => b.average - a.average)
                    .map((student) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="font-medium">{student.studentName}</TableCell>
                      <TableCell>{student.average.toFixed(2)}</TableCell>
                      <TableCell>{student.gradeCount}</TableCell>
                      <TableCell>{getGradeBadge(student.average)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enrollment Report
              </CardTitle>
              <CardDescription>Student enrollment status and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Approved Enrollments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{statistics.approvedEnrollments}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pending Enrollments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{statistics.pendingEnrollments}</div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Submission Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment: Enrollment) => {
                    const student = users.find((user: User) => user.id === enrollment.studentId);
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {student?.name || 'Unknown Student'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={enrollment.status === 'approved' ? 'default' : 'secondary'}
                            className={
                              enrollment.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : enrollment.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              enrollment.paymentStatus === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {enrollment.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                System Statistics
              </CardTitle>
              <CardDescription>Overall system usage and activity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">User Distribution</div>
                  <div className="space-y-1">
                    {['admin', 'teacher', 'student', 'parent', 'guidance', 'registrar', 'accounting'].map((role) => {
                      const count = users.filter((user: User) => user.role === role).length;
                      return (
                        <div key={role} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{role}s</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Academic Data</div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Grades</span>
                      <Badge variant="outline">{statistics.totalGrades}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Assignments</span>
                      <Badge variant="outline">{statistics.totalAssignments}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average GPA</span>
                      <Badge variant="outline">{statistics.overallAverage.toFixed(2)}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Enrollment Status</div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Approved</span>
                      <Badge className="bg-green-100 text-green-800">{statistics.approvedEnrollments}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{statistics.pendingEnrollments}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Requests</span>
                      <Badge variant="outline">{enrollments.length}</Badge>
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