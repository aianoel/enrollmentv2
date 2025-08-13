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
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Receipt,
  Award,
  Building,
  Eye,
  Edit,
  Trash2,
  Download,
  AlertTriangle,
} from "lucide-react";
import type { 
  User, 
  FeeStructure, 
  Invoice, 
  Payment, 
  Scholarship, 
  SchoolExpense 
} from "@shared/schema";
import { EnhancedPaymentManagement } from "@/components/accounting/EnhancedPaymentManagement";

// Form schemas
const feeStructureFormSchema = z.object({
  gradeLevel: z.string().min(1, "Grade level is required"),
  tuitionFee: z.number().min(0, "Tuition fee must be positive"),
  miscFee: z.number().min(0, "Misc fee must be positive"),
  otherFee: z.number().min(0, "Other fee must be positive"),
  effectiveSchoolYear: z.string().min(1, "School year is required"),
});

const invoiceFormSchema = z.object({
  studentId: z.number().min(1, "Student is required"),
  schoolYear: z.string().min(1, "School year is required"),
  dueDate: z.string().min(1, "Due date is required"),
  totalAmount: z.number().min(0, "Total amount must be positive"),
  status: z.enum(["Unpaid", "Partial", "Paid"]),
});

const paymentFormSchema = z.object({
  invoiceId: z.number().min(1, "Invoice is required"),
  amountPaid: z.number().min(0, "Amount must be positive"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  receiptNumber: z.string().optional(),
});

const scholarshipFormSchema = z.object({
  studentId: z.number().min(1, "Student is required"),
  scholarshipName: z.string().min(1, "Scholarship name is required"),
  discountPercentage: z.number().min(0).max(100, "Percentage must be between 0-100"),
  effectiveSchoolYear: z.string().min(1, "School year is required"),
});

const expenseFormSchema = z.object({
  expenseDate: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  amount: z.number().min(0, "Amount must be positive"),
});

type FeeStructureFormData = z.infer<typeof feeStructureFormSchema>;
type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
type PaymentFormData = z.infer<typeof paymentFormSchema>;
type ScholarshipFormData = z.infer<typeof scholarshipFormSchema>;
type ExpenseFormData = z.infer<typeof expenseFormSchema>;

export function EnhancedAccountingDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFeeStructureDialogOpen, setIsFeeStructureDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isScholarshipDialogOpen, setIsScholarshipDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  // Fetch data
  const { data: feeStructures = [] } = useQuery({
    queryKey: ["/api/accounting/fee-structures"],
    queryFn: () => apiRequest("/api/accounting/fee-structures")
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/accounting/invoices"],
    queryFn: () => apiRequest("/api/accounting/invoices")
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/accounting/payments"],
    queryFn: () => apiRequest("/api/accounting/payments")
  });

  const { data: scholarships = [] } = useQuery({
    queryKey: ["/api/accounting/scholarships"],
    queryFn: () => apiRequest("/api/accounting/scholarships")
  });

  const { data: schoolExpenses = [] } = useQuery({
    queryKey: ["/api/accounting/school-expenses"],
    queryFn: () => apiRequest("/api/accounting/school-expenses")
  });

  const { data: students = [] } = useQuery({
    queryKey: ["/api/accounting/students"],
    queryFn: () => apiRequest("/api/accounting/students")
  });

  // Forms
  const feeStructureForm = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureFormSchema),
    defaultValues: {
      gradeLevel: "",
      tuitionFee: 0,
      miscFee: 0,
      otherFee: 0,
      effectiveSchoolYear: "2025-2026",
    },
  });

  const invoiceForm = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      studentId: 0,
      schoolYear: "2025-2026",
      dueDate: "",
      totalAmount: 0,
      status: "Unpaid",
    },
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      invoiceId: 0,
      amountPaid: 0,
      paymentMethod: "",
      receiptNumber: "",
    },
  });

  const scholarshipForm = useForm<ScholarshipFormData>({
    resolver: zodResolver(scholarshipFormSchema),
    defaultValues: {
      studentId: 0,
      scholarshipName: "",
      discountPercentage: 0,
      effectiveSchoolYear: "2025-2026",
    },
  });

  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      expenseDate: "",
      category: "",
      description: "",
      amount: 0,
    },
  });

  // Mutations
  const createFeeStructureMutation = useMutation({
    mutationFn: (data: FeeStructureFormData) => apiRequest("/api/accounting/fee-structures", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/fee-structures"] });
      setIsFeeStructureDialogOpen(false);
      feeStructureForm.reset();
      toast({ title: "Fee structure created successfully" });
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: InvoiceFormData) => apiRequest("/api/accounting/invoices", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/invoices"] });
      setIsInvoiceDialogOpen(false);
      invoiceForm.reset();
      toast({ title: "Invoice created successfully" });
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: PaymentFormData) => apiRequest("/api/accounting/payments", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/invoices"] });
      setIsPaymentDialogOpen(false);
      paymentForm.reset();
      toast({ title: "Payment recorded successfully" });
    },
  });

  const createScholarshipMutation = useMutation({
    mutationFn: (data: ScholarshipFormData) => apiRequest("/api/accounting/scholarships", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/scholarships"] });
      setIsScholarshipDialogOpen(false);
      scholarshipForm.reset();
      toast({ title: "Scholarship created successfully" });
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => apiRequest("/api/accounting/school-expenses", "POST", {
      ...data,
      recordedBy: user?.id,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/school-expenses"] });
      setIsExpenseDialogOpen(false);
      expenseForm.reset();
      toast({ title: "Expense recorded successfully" });
    },
  });

  // Helper functions
  const getStudentName = (studentId: number) => {
    const student = students.find((s: User) => s.id === studentId);
    return student ? student.name : `Student ${studentId}`;
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(parseFloat(amount.toString()));
  };

  const formatDateTime = (dateString: string | Date | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "default";
      case "Unpaid": return "destructive";
      case "Partial": return "secondary";
      default: return "outline";
    }
  };

  // Statistics
  const totalRevenue = payments.reduce((sum: number, payment: Payment) => 
    sum + parseFloat(payment.amountPaid), 0);
  const unpaidInvoices = invoices.filter((inv: Invoice) => inv.status === "Unpaid");
  const totalUnpaid = unpaidInvoices.reduce((sum: number, inv: Invoice) => 
    sum + parseFloat(inv.totalAmount), 0);
  const totalExpenses = schoolExpenses.reduce((sum: number, exp: SchoolExpense) => 
    sum + parseFloat(exp.amount), 0);
  const netIncome = totalRevenue - totalExpenses;

  const gradeLevels = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", 
                      "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const paymentMethods = ["Cash", "Bank Transfer", "GCash", "Credit Card", "Check"];
  const expenseCategories = ["Utilities", "Supplies", "Salaries", "Maintenance", "Transportation", "Equipment", "Other"];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
          <p className="text-muted-foreground">Manage billing, payments, expenses, and financial reporting</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isFeeStructureDialogOpen} onOpenChange={setIsFeeStructureDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-fee-structure">
                <Plus className="mr-2 h-4 w-4" />
                Fee Structure
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Fee Structure</DialogTitle>
                <DialogDescription>Set up tuition and fees for a specific grade level</DialogDescription>
              </DialogHeader>
              <Form {...feeStructureForm}>
                <form onSubmit={feeStructureForm.handleSubmit((data) => createFeeStructureMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={feeStructureForm.control}
                      name="gradeLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-fee-grade">
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
                      control={feeStructureForm.control}
                      name="effectiveSchoolYear"
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
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={feeStructureForm.control}
                      name="tuitionFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tuition Fee</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="50000" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={feeStructureForm.control}
                      name="miscFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Misc Fee</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5000" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={feeStructureForm.control}
                      name="otherFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Fee</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2000" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsFeeStructureDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createFeeStructureMutation.isPending}>
                      Create Fee Structure
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-invoice">
                <Receipt className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate Invoice</DialogTitle>
                <DialogDescription>Create a billing statement for a student</DialogDescription>
              </DialogHeader>
              <Form {...invoiceForm}>
                <form onSubmit={invoiceForm.handleSubmit((data) => createInvoiceMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={invoiceForm.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-invoice-student">
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
                      control={invoiceForm.control}
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
                      control={invoiceForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={invoiceForm.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount (PHP)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="57000" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createInvoiceMutation.isPending}>
                      Generate Invoice
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-record-payment">
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>Record a student payment for an invoice</DialogDescription>
              </DialogHeader>
              <Form {...paymentForm}>
                <form onSubmit={paymentForm.handleSubmit((data) => createPaymentMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={paymentForm.control}
                    name="invoiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select invoice" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {invoices.filter((inv: Invoice) => inv.status !== 'Paid').map((invoice: Invoice) => (
                              <SelectItem key={invoice.id} value={invoice.id.toString()}>
                                {getStudentName(invoice.studentId)} - {formatCurrency(invoice.totalAmount)} ({invoice.schoolYear})
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
                      control={paymentForm.control}
                      name="amountPaid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount Paid (PHP)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="25000" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={paymentForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentMethods.map((method) => (
                                <SelectItem key={method} value={method}>
                                  {method}
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
                    control={paymentForm.control}
                    name="receiptNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receipt Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="OR-2025-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createPaymentMutation.isPending}>
                      Record Payment
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From all payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUnpaid)}</div>
            <p className="text-xs text-muted-foreground">{unpaidInvoices.length} unpaid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">School operations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">Revenue - Expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Invoices Alert */}
      {unpaidInvoices.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length > 1 ? 's' : ''} totaling {formatCurrency(totalUnpaid)} that require follow-up.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices & Billing</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="payment-management">Payment Management</TabsTrigger>
          <TabsTrigger value="fee-structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          <TabsTrigger value="expenses">School Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Invoices</CardTitle>
              <CardDescription>Manage student billing and track payment status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>School Year</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{getStudentName(invoice.studentId)}</TableCell>
                      <TableCell>{invoice.schoolYear}</TableCell>
                      <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(invoice.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
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

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>Track all payments received from students</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Receipt Number</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {/* Get student from invoice */}
                        {(() => {
                          const invoice = invoices.find((inv: Invoice) => inv.id === payment.invoiceId);
                          return invoice ? getStudentName(invoice.studentId) : "Unknown";
                        })()}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(payment.amountPaid)}</TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell>{payment.receiptNumber || "N/A"}</TableCell>
                      <TableCell>{formatDateTime(payment.paymentDate)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-management" className="space-y-4">
          <EnhancedPaymentManagement />
        </TabsContent>

        <TabsContent value="fee-structures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structures</CardTitle>
              <CardDescription>Manage tuition and fee schedules by grade level</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>School Year</TableHead>
                    <TableHead>Tuition Fee</TableHead>
                    <TableHead>Misc Fee</TableHead>
                    <TableHead>Other Fee</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructures.map((fee: FeeStructure) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{fee.gradeLevel}</TableCell>
                      <TableCell>{fee.effectiveSchoolYear}</TableCell>
                      <TableCell>{formatCurrency(fee.tuitionFee)}</TableCell>
                      <TableCell>{formatCurrency(fee.miscFee)}</TableCell>
                      <TableCell>{formatCurrency(fee.otherFee)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(parseFloat(fee.tuitionFee) + parseFloat(fee.miscFee) + parseFloat(fee.otherFee))}
                      </TableCell>
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

        <TabsContent value="scholarships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scholarships & Discounts</CardTitle>
              <CardDescription>Manage student scholarships and fee discounts</CardDescription>
              <div className="pt-4">
                <Dialog open={isScholarshipDialogOpen} onOpenChange={setIsScholarshipDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Award className="mr-2 h-4 w-4" />
                      Add Scholarship
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Grant Scholarship</DialogTitle>
                      <DialogDescription>Award a scholarship or discount to a student</DialogDescription>
                    </DialogHeader>
                    <Form {...scholarshipForm}>
                      <form onSubmit={scholarshipForm.handleSubmit((data) => createScholarshipMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={scholarshipForm.control}
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
                          control={scholarshipForm.control}
                          name="scholarshipName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Scholarship Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Academic Excellence Scholarship" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={scholarshipForm.control}
                            name="discountPercentage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Discount Percentage</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" max="100" placeholder="50" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={scholarshipForm.control}
                            name="effectiveSchoolYear"
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
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsScholarshipDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createScholarshipMutation.isPending}>
                            Grant Scholarship
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
                    <TableHead>Scholarship Name</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>School Year</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scholarships.map((scholarship: Scholarship) => (
                    <TableRow key={scholarship.id}>
                      <TableCell className="font-medium">{getStudentName(scholarship.studentId)}</TableCell>
                      <TableCell>{scholarship.scholarshipName}</TableCell>
                      <TableCell className="font-medium">{scholarship.discountPercentage}%</TableCell>
                      <TableCell>{scholarship.effectiveSchoolYear}</TableCell>
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

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Expenses</CardTitle>
              <CardDescription>Track operational expenses and school expenditures</CardDescription>
              <div className="pt-4">
                <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Building className="mr-2 h-4 w-4" />
                      Record Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record School Expense</DialogTitle>
                      <DialogDescription>Log an operational expense for the school</DialogDescription>
                    </DialogHeader>
                    <Form {...expenseForm}>
                      <form onSubmit={expenseForm.handleSubmit((data) => createExpenseMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={expenseForm.control}
                            name="expenseDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expense Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={expenseForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {expenseCategories.map((category) => (
                                      <SelectItem key={category} value={category}>
                                        {category}
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
                          control={expenseForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount (PHP)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="15000" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={expenseForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Expense details..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createExpenseMutation.isPending}>
                            Record Expense
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
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolExpenses.map((expense: SchoolExpense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{expense.description || "No description"}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>{getStudentName(expense.recordedBy)}</TableCell>
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
      </Tabs>
    </div>
  );
}