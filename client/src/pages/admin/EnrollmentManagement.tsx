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
  FileText
} from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enrollment Management</h2>
          <p className="text-muted-foreground">Process and manage student enrollments</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Enrollments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter((e: Enrollment) => e.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Enrollments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter((e: Enrollment) => e.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully enrolled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
            <p className="text-xs text-muted-foreground">All enrollment requests</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Enrollment Requests
          </CardTitle>
          <CardDescription>Review and process student enrollment applications</CardDescription>
        </CardHeader>
        <CardContent>
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
  );
}

// Helper component for labels
const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={className} {...props} />
);