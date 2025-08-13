import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Upload, FileText, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";

interface Fee {
  id: number;
  feeType: string;
  amount: string;
  dueDate: string;
  status: string;
}

interface Payment {
  id: number;
  feeId: number;
  fee?: Fee;
  amountPaid: string;
  paymentDate: string;
  paymentMethod: string;
  paymentStatus: string;
  referenceNumber?: string;
  receiptUrl?: string;
  notes?: string;
}

export function StudentPaymentPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Fetch student's unpaid fees
  const { data: myFees = [], isLoading: isLoadingFees } = useQuery({
    queryKey: ["/api/student/fees"],
  });

  // Fetch student's payment history
  const { data: myPayments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ["/api/student/payments"],
  });

  // Submit online payment mutation
  const submitPaymentMutation = useMutation({
    mutationFn: async (paymentData: FormData) => {
      return apiRequest("/api/student/payments", {
        method: "POST",
        body: paymentData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Submitted",
        description: "Your payment has been submitted for verification. You will be notified once it's processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/fees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/payments"] });
      setPaymentDialogOpen(false);
      setSelectedFee(null);
      setReceiptFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const OnlinePaymentForm = ({ fee }: { fee: Fee }) => {
    const [formData, setFormData] = useState({
      referenceNumber: "",
      notes: "",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file type (images only)
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File",
            description: "Please upload an image file (JPG, PNG, etc.)",
            variant: "destructive",
          });
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: "Please upload an image smaller than 5MB",
            variant: "destructive",
          });
          return;
        }

        setReceiptFile(file);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.referenceNumber.trim()) {
        toast({
          title: "Error",
          description: "Please enter a reference number",
          variant: "destructive",
        });
        return;
      }

      if (!receiptFile) {
        toast({
          title: "Error",
          description: "Please upload a payment receipt",
          variant: "destructive",
        });
        return;
      }

      const formDataToSubmit = new FormData();
      formDataToSubmit.append('feeId', fee.id.toString());
      formDataToSubmit.append('amountPaid', fee.amount);
      formDataToSubmit.append('paymentMethod', 'online');
      formDataToSubmit.append('referenceNumber', formData.referenceNumber);
      formDataToSubmit.append('notes', formData.notes);
      formDataToSubmit.append('receipt', receiptFile);

      submitPaymentMutation.mutate(formDataToSubmit);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-online-payment">
        <div>
          <Label>Payment Information</Label>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="font-medium" data-testid="text-fee-type">{fee.feeType}</p>
            <p className="text-lg font-bold text-green-600" data-testid="text-fee-amount">₱{fee.amount}</p>
            <p className="text-sm text-gray-600" data-testid="text-due-date">
              Due: {new Date(fee.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Payment Instructions:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Transfer ₱{fee.amount} to our bank account or GCash</li>
            <li>2. Take a screenshot or photo of your payment receipt</li>
            <li>3. Enter the reference number from your receipt below</li>
            <li>4. Upload the receipt image</li>
            <li>5. Click submit and wait for verification</li>
          </ol>
        </div>

        <div>
          <Label htmlFor="reference-number">Reference/Transaction Number *</Label>
          <Input
            id="reference-number"
            value={formData.referenceNumber}
            onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
            placeholder="Enter your transaction reference number"
            required
            data-testid="input-reference-number"
          />
        </div>

        <div>
          <Label htmlFor="receipt-upload">Upload Payment Receipt *</Label>
          <Input
            id="receipt-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            data-testid="input-receipt-upload"
          />
          {receiptFile && (
            <p className="text-sm text-green-600 mt-1" data-testid="text-file-selected">
              ✓ {receiptFile.name} selected
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="payment-notes">Additional Notes (Optional)</Label>
          <Textarea
            id="payment-notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information about your payment"
            data-testid="textarea-payment-notes"
          />
        </div>

        <Button 
          type="submit" 
          disabled={submitPaymentMutation.isPending} 
          className="w-full"
          data-testid="button-submit-payment"
        >
          {submitPaymentMutation.isPending ? "Submitting..." : "Submit Payment"}
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
        return <Badge variant="secondary" data-testid={`badge-status-${status}`}><Clock className="w-3 h-3 mr-1" />Pending Verification</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Outstanding Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Outstanding Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingFees ? (
            <div className="text-center py-4" data-testid="loading-fees">Loading your fees...</div>
          ) : myFees.length === 0 ? (
            <div className="text-center py-4 text-gray-500" data-testid="no-outstanding-fees">
              You have no outstanding fees at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {myFees.map((fee: Fee) => (
                <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`fee-card-${fee.id}`}>
                  <div className="flex-1">
                    <p className="font-medium" data-testid={`text-fee-type-${fee.id}`}>{fee.feeType}</p>
                    <p className="text-sm text-gray-600" data-testid={`text-fee-due-${fee.id}`}>
                      Due: {new Date(fee.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-lg text-red-600" data-testid={`text-fee-amount-${fee.id}`}>₱{fee.amount}</p>
                  </div>
                  <Dialog open={paymentDialogOpen && selectedFee?.id === fee.id} onOpenChange={(open) => {
                    setPaymentDialogOpen(open);
                    if (!open) setSelectedFee(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setSelectedFee(fee)}
                        data-testid={`button-pay-online-${fee.id}`}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Online
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Online Payment</DialogTitle>
                      </DialogHeader>
                      {selectedFee && <OnlinePaymentForm fee={selectedFee} />}
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPayments ? (
            <div className="text-center py-4" data-testid="loading-payment-history">Loading payment history...</div>
          ) : myPayments.length === 0 ? (
            <div className="text-center py-4 text-gray-500" data-testid="no-payment-history">
              No payment history found.
            </div>
          ) : (
            <div className="space-y-3">
              {myPayments.map((payment: Payment) => (
                <div key={payment.id} className="p-4 border rounded-lg" data-testid={`payment-history-${payment.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium" data-testid={`text-payment-fee-${payment.id}`}>{payment.fee?.feeType}</p>
                      <p className="text-sm text-gray-600" data-testid={`text-payment-date-${payment.id}`}>
                        Paid: {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" data-testid={`text-payment-amount-${payment.id}`}>₱{payment.amountPaid}</p>
                      {getStatusBadge(payment.paymentStatus)}
                    </div>
                  </div>
                  
                  {payment.referenceNumber && (
                    <p className="text-sm text-gray-600" data-testid={`text-payment-reference-${payment.id}`}>
                      Reference: {payment.referenceNumber}
                    </p>
                  )}
                  
                  {payment.paymentStatus === "rejected" && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700" data-testid={`text-rejection-notice-${payment.id}`}>
                      Payment was rejected. Please check with the accounting office or submit a new payment.
                    </div>
                  )}
                  
                  {payment.paymentStatus === "verified" && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700" data-testid={`text-verification-notice-${payment.id}`}>
                      Payment has been verified and processed successfully.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Info */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-blue-600 mb-2">Bank Transfer</h4>
              <p className="text-sm text-gray-600">Account Name: EduManage School</p>
              <p className="text-sm text-gray-600">Account Number: 1234-5678-9012</p>
              <p className="text-sm text-gray-600">Bank: ABC Bank</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">GCash</h4>
              <p className="text-sm text-gray-600">GCash Number: 09123456789</p>
              <p className="text-sm text-gray-600">Account Name: EduManage School</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-600 mb-2">Cash Payment</h4>
              <p className="text-sm text-gray-600">Visit the Accounting Office during business hours</p>
              <p className="text-sm text-gray-600">Mon-Fri: 8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}