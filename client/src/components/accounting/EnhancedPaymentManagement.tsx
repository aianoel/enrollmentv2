import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, DollarSign, FileText, CheckCircle, XCircle, Clock, Upload, Eye } from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  gradeLevel?: string;
}

interface Fee {
  id: number;
  studentId: number;
  student?: Student;
  feeType: string;
  amount: string;
  dueDate: string;
  status: string;
}

interface Payment {
  id: number;
  feeId: number;
  studentId: number;
  student?: Student;
  fee?: Fee;
  amountPaid: string;
  paymentDate: string;
  paymentMethod: string;
  paymentStatus: string;
  referenceNumber?: string;
  receiptUrl?: string;
  notes?: string;
  recordedBy?: number;
  verifiedBy?: number;
  verifiedAt?: string;
}

export function EnhancedPaymentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Fetch unpaid fees (students who need to pay)
  const { data: unpaidFees = [], isLoading: isLoadingFees } = useQuery({
    queryKey: ["/api/accounting/unpaid-fees"],
  });

  // Fetch pending payments for verification
  const { data: pendingPayments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ["/api/accounting/pending-payments"],
  });

  // Fetch all payments for tracking
  const { data: allPayments = [], isLoading: isLoadingAllPayments } = useQuery({
    queryKey: ["/api/accounting/payments"],
  });

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      feeId: number;
      studentId: number;
      amountPaid: number;
      paymentMethod: string;
      referenceNumber?: string;
      notes?: string;
    }) => {
      return apiRequest("/api/accounting/payments", {
        method: "POST",
        body: JSON.stringify(paymentData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Recorded",
        description: "Payment has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/unpaid-fees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/pending-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/payments"] });
      setPaymentDialogOpen(false);
      setSelectedFee(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ paymentId, status, notes }: { paymentId: number; status: string; notes?: string }) => {
      return apiRequest(`/api/accounting/payments/${paymentId}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Updated",
        description: "Payment status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/pending-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/payments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    },
  });

  const PaymentForm = ({ fee }: { fee: Fee }) => {
    const [formData, setFormData] = useState({
      amountPaid: fee.amount,
      paymentMethod: "",
      referenceNumber: "",
      notes: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.paymentMethod) {
        toast({
          title: "Error",
          description: "Please select a payment method",
          variant: "destructive",
        });
        return;
      }

      recordPaymentMutation.mutate({
        feeId: fee.id,
        studentId: fee.studentId,
        amountPaid: parseFloat(formData.amountPaid),
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-payment">
        <div>
          <Label htmlFor="student-info">Student Information</Label>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="font-medium" data-testid="text-student-name">{fee.student?.name}</p>
            <p className="text-sm text-gray-600" data-testid="text-student-email">{fee.student?.email}</p>
            <p className="text-sm text-gray-600" data-testid="text-fee-type">Fee: {fee.feeType}</p>
            <p className="text-sm text-gray-600" data-testid="text-fee-amount">Amount: ₱{fee.amount}</p>
          </div>
        </div>

        <div>
          <Label htmlFor="amount-paid">Amount Paid</Label>
          <Input
            id="amount-paid"
            type="number"
            step="0.01"
            value={formData.amountPaid}
            onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
            data-testid="input-amount-paid"
          />
        </div>

        <div>
          <Label htmlFor="payment-method">Payment Method</Label>
          <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
            <SelectTrigger data-testid="select-payment-method">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="online">Online Payment</SelectItem>
              <SelectItem value="promissory_note">Promissory Note</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.paymentMethod === "online" && (
          <div>
            <Label htmlFor="reference-number">Reference Number</Label>
            <Input
              id="reference-number"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              placeholder="Enter transaction reference number"
              data-testid="input-reference-number"
            />
          </div>
        )}

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about the payment"
            data-testid="textarea-notes"
          />
        </div>

        <Button type="submit" disabled={recordPaymentMutation.isPending} className="w-full" data-testid="button-record-payment">
          {recordPaymentMutation.isPending ? "Recording..." : "Record Payment"}
        </Button>
      </form>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500" data-testid={`badge-status-${status}`}><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive" data-testid={`badge-status-${status}`}><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary" data-testid={`badge-status-${status}`}><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <DollarSign className="w-4 h-4" />;
      case "online":
        return <CreditCard className="w-4 h-4" />;
      case "promissory_note":
        return <FileText className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Students Who Need to Pay */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Students Who Need to Pay
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingFees ? (
            <div className="text-center py-4" data-testid="loading-fees">Loading fees...</div>
          ) : unpaidFees.length === 0 ? (
            <div className="text-center py-4 text-gray-500" data-testid="no-unpaid-fees">
              No unpaid fees found
            </div>
          ) : (
            <div className="space-y-3">
              {unpaidFees.map((fee: Fee) => (
                <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`fee-card-${fee.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium" data-testid={`text-student-name-${fee.id}`}>{fee.student?.name}</p>
                        <p className="text-sm text-gray-600" data-testid={`text-fee-type-${fee.id}`}>{fee.feeType}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-lg" data-testid={`text-amount-${fee.id}`}>₱{fee.amount}</p>
                    <p className="text-sm text-gray-600" data-testid={`text-due-date-${fee.id}`}>
                      Due: {new Date(fee.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Dialog open={paymentDialogOpen && selectedFee?.id === fee.id} onOpenChange={(open) => {
                    setPaymentDialogOpen(open);
                    if (!open) setSelectedFee(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setSelectedFee(fee)}
                        data-testid={`button-pay-${fee.id}`}
                      >
                        Record Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                      </DialogHeader>
                      {selectedFee && <PaymentForm fee={selectedFee} />}
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Payment Verifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Payment Verifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPayments ? (
            <div className="text-center py-4" data-testid="loading-payments">Loading payments...</div>
          ) : pendingPayments.length === 0 ? (
            <div className="text-center py-4 text-gray-500" data-testid="no-pending-payments">
              No pending payments for verification
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((payment: Payment) => (
                <div key={payment.id} className="p-4 border rounded-lg" data-testid={`payment-card-${payment.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <div>
                        <p className="font-medium" data-testid={`text-payment-student-${payment.id}`}>{payment.student?.name}</p>
                        <p className="text-sm text-gray-600" data-testid={`text-payment-method-${payment.id}`}>
                          {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" data-testid={`text-payment-amount-${payment.id}`}>₱{payment.amountPaid}</p>
                      {getStatusBadge(payment.paymentStatus)}
                    </div>
                  </div>

                  {payment.referenceNumber && (
                    <p className="text-sm text-gray-600 mb-2" data-testid={`text-reference-${payment.id}`}>
                      Reference: {payment.referenceNumber}
                    </p>
                  )}

                  {payment.receiptUrl && (
                    <div className="mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setReceiptDialogOpen(true);
                        }}
                        data-testid={`button-view-receipt-${payment.id}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Receipt
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verifyPaymentMutation.mutate({ paymentId: payment.id, status: "verified" })}
                      disabled={verifyPaymentMutation.isPending}
                      data-testid={`button-verify-${payment.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verifyPaymentMutation.mutate({ paymentId: payment.id, status: "rejected" })}
                      disabled={verifyPaymentMutation.isPending}
                      data-testid={`button-reject-${payment.id}`}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Payments History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAllPayments ? (
            <div className="text-center py-4" data-testid="loading-all-payments">Loading payment history...</div>
          ) : allPayments.length === 0 ? (
            <div className="text-center py-4 text-gray-500" data-testid="no-payment-history">
              No payment history found
            </div>
          ) : (
            <div className="space-y-3">
              {allPayments.map((payment: Payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`history-payment-${payment.id}`}>
                  <div className="flex items-center gap-3">
                    {getPaymentMethodIcon(payment.paymentMethod)}
                    <div>
                      <p className="font-medium" data-testid={`text-history-student-${payment.id}`}>{payment.student?.name}</p>
                      <p className="text-sm text-gray-600" data-testid={`text-history-date-${payment.id}`}>
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" data-testid={`text-history-amount-${payment.id}`}>₱{payment.amountPaid}</p>
                    {getStatusBadge(payment.paymentStatus)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Viewer Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div>
                <p><strong>Student:</strong> {selectedPayment.student?.name}</p>
                <p><strong>Amount:</strong> ₱{selectedPayment.amountPaid}</p>
                <p><strong>Reference:</strong> {selectedPayment.referenceNumber}</p>
                <p><strong>Date:</strong> {new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
              </div>
              {selectedPayment.receiptUrl && (
                <div className="border rounded-lg p-4">
                  <img 
                    src={selectedPayment.receiptUrl} 
                    alt="Payment Receipt" 
                    className="w-full max-h-96 object-contain"
                    data-testid="img-receipt"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}