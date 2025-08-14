import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Users,
  FileText,
  Search,
  Filter,
  TrendingUp,
  Activity,
  GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Enrollment, Section } from "@shared/schema";

export function EnrollmentManagement() {
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch enrollments and sections
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/admin/enrollments"],
    queryFn: () => apiRequest("/api/admin/enrollments")
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["/api/admin/sections"],
    queryFn: () => apiRequest("/api/admin/sections")
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("/api/admin/users")
  });

  // Update enrollment mutation
  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Enrollment> }) =>
      apiRequest(`/api/admin/enrollments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments"] });
      toast({ title: "Enrollment updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update enrollment", variant: "destructive" });
    },
  });

  const handleStatusUpdate = (enrollment: Enrollment, newStatus: string) => {
    updateEnrollmentMutation.mutate({
      id: enrollment.id,
      data: { status: newStatus }
    });
  };

  const handleSectionAssignment = (enrollment: Enrollment, sectionId: number) => {
    updateEnrollmentMutation.mutate({
      id: enrollment.id,
      data: { sectionId }
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, color: "text-yellow-600", icon: Clock },
      approved: { variant: "default" as const, color: "text-green-600", icon: CheckCircle },
      rejected: { variant: "destructive" as const, color: "text-red-600", icon: XCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      paid: "bg-green-100 text-green-800",
      unpaid: "bg-red-100 text-red-800",
      partial: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.unpaid}>
        {status}
      </Badge>
    );
  };

  const getStudentName = (studentId: number) => {
    const student = users.find((user: any) => user.id === studentId);
    return student?.name || "Unknown Student";
  };

  const getSectionName = (sectionId: number) => {
    const section = sections.find((s: Section) => s.id === sectionId);
    return section?.name || "Unassigned";
  };

  if (enrollmentsLoading) {
    return <div className="flex items-center justify-center h-64">Loading enrollments...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                Enrollment Management
              </h1>
              <p className="text-gray-600 mt-2">Process and manage student enrollment applications and approvals</p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                  {enrollments.filter((e: Enrollment) => e.status === 'pending').length} Pending
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {enrollments.filter((e: Enrollment) => e.status === 'approved').length} Approved
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {enrollments.length} Total
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="border-gray-300">
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Enhanced Statistics Cards */}
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Pending Approval</p>
                    <p className="text-3xl font-bold text-yellow-900">{enrollments.filter((e: Enrollment) => e.status === 'pending').length}</p>
                    <p className="text-xs text-yellow-600 mt-1">Awaiting review</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Approved</p>
                    <p className="text-3xl font-bold text-green-900">{enrollments.filter((e: Enrollment) => e.status === 'approved').length}</p>
                    <p className="text-xs text-green-600 mt-1">Successfully enrolled</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Rejected</p>
                    <p className="text-3xl font-bold text-red-900">{enrollments.filter((e: Enrollment) => e.status === 'rejected').length}</p>
                    <p className="text-xs text-red-600 mt-1">Not approved</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Requests</p>
                    <p className="text-3xl font-bold text-blue-900">{enrollments.length}</p>
                    <p className="text-xs text-blue-600 mt-1">All applications</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Enrollment Management Interface */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl text-green-900">
                  <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  Enrollment Processing Center
                </CardTitle>
                <CardDescription className="text-green-700 mt-2">
                  Review, approve, and manage student enrollment applications
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment: Enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">
                    {getStudentName(enrollment.studentId)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(enrollment.status || 'pending')}
                  </TableCell>
                  <TableCell>
                    {enrollment.sectionId ? getSectionName(enrollment.sectionId) : (
                      <Select onValueChange={(value) => handleSectionAssignment(enrollment, parseInt(value))}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Assign section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((section: Section) => (
                            <SelectItem key={section.id} value={section.id.toString()}>
                              {section.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(enrollment.paymentStatus || 'unpaid')}
                  </TableCell>
                  <TableCell>
                    {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEnrollment(enrollment);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {enrollment.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleStatusUpdate(enrollment, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleStatusUpdate(enrollment, 'rejected')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Enrollment Details</DialogTitle>
            <DialogDescription>
              Review enrollment information and documents
            </DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <p className="text-sm">{getStudentName(selectedEnrollment.studentId)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedEnrollment.status || 'pending')}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Section</Label>
                  <p className="text-sm">
                    {selectedEnrollment.sectionId ? getSectionName(selectedEnrollment.sectionId) : "Not assigned"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Status</Label>
                  <div className="mt-1">
                    {getPaymentStatusBadge(selectedEnrollment.paymentStatus || 'unpaid')}
                  </div>
                </div>
              </div>
              
              {selectedEnrollment.documents && (
                <div>
                  <Label className="text-sm font-medium">Documents</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      {selectedEnrollment.documents}
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Submitted Date</Label>
                <p className="text-sm">
                  {selectedEnrollment.createdAt ? new Date(selectedEnrollment.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}