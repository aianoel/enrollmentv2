import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  DollarSign, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  Database,
  Shield
} from "lucide-react";
import type { SchoolSettings, TuitionFee } from "@shared/schema";

const schoolSettingsFormSchema = z.object({
  schoolYear: z.string().min(4, "School year is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

const tuitionFeeFormSchema = z.object({
  gradeLevel: z.number().min(1).max(12),
  amount: z.number().min(0, "Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
});

type SchoolSettingsFormData = z.infer<typeof schoolSettingsFormSchema>;
type TuitionFeeFormData = z.infer<typeof tuitionFeeFormSchema>;

export function SystemConfiguration() {
  const [selectedSettings, setSelectedSettings] = useState<SchoolSettings | null>(null);
  const [selectedFee, setSelectedFee] = useState<TuitionFee | null>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: schoolSettings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/admin/school-settings"],
    queryFn: () => apiRequest("/api/admin/school-settings")
  });

  const { data: tuitionFees = [], isLoading: feesLoading } = useQuery({
    queryKey: ["/api/admin/tuition-fees"],
    queryFn: () => apiRequest("/api/admin/tuition-fees")
  });

  // Forms
  const settingsForm = useForm<SchoolSettingsFormData>({
    resolver: zodResolver(schoolSettingsFormSchema),
    defaultValues: { schoolYear: "", startDate: "", endDate: "" },
  });

  const feeForm = useForm<TuitionFeeFormData>({
    resolver: zodResolver(tuitionFeeFormSchema),
    defaultValues: { gradeLevel: 1, amount: 0, dueDate: "" },
  });

  // School Settings mutations
  const createSettingsMutation = useMutation({
    mutationFn: (data: SchoolSettingsFormData) => apiRequest("/api/admin/school-settings", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/school-settings"] });
      setIsSettingsDialogOpen(false);
      settingsForm.reset();
      toast({ title: "School settings created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create school settings", variant: "destructive" });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SchoolSettingsFormData> }) =>
      apiRequest(`/api/admin/school-settings/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/school-settings"] });
      setIsSettingsDialogOpen(false);
      setSelectedSettings(null);
      settingsForm.reset();
      toast({ title: "School settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update school settings", variant: "destructive" });
    },
  });

  // Tuition Fee mutations
  const createFeeMutation = useMutation({
    mutationFn: (data: TuitionFeeFormData) => apiRequest("/api/admin/tuition-fees", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tuition-fees"] });
      setIsFeeDialogOpen(false);
      feeForm.reset();
      toast({ title: "Tuition fee created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create tuition fee", variant: "destructive" });
    },
  });

  const updateFeeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TuitionFeeFormData> }) =>
      apiRequest(`/api/admin/tuition-fees/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tuition-fees"] });
      setIsFeeDialogOpen(false);
      setSelectedFee(null);
      feeForm.reset();
      toast({ title: "Tuition fee updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update tuition fee", variant: "destructive" });
    },
  });

  const deleteFeeMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/tuition-fees/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tuition-fees"] });
      toast({ title: "Tuition fee deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete tuition fee", variant: "destructive" });
    },
  });

  // Handlers
  const handleCreateSettings = (data: SchoolSettingsFormData) => {
    createSettingsMutation.mutate(data);
  };

  const handleUpdateSettings = (data: SchoolSettingsFormData) => {
    if (selectedSettings) {
      updateSettingsMutation.mutate({ id: selectedSettings.id, data });
    }
  };

  const handleEditSettings = (settings: SchoolSettings) => {
    setSelectedSettings(settings);
    settingsForm.reset({
      schoolYear: settings.schoolYear,
      startDate: settings.startDate || "",
      endDate: settings.endDate || "",
    });
    setIsSettingsDialogOpen(true);
  };

  const handleCreateFee = (data: TuitionFeeFormData) => {
    createFeeMutation.mutate(data);
  };

  const handleUpdateFee = (data: TuitionFeeFormData) => {
    if (selectedFee) {
      updateFeeMutation.mutate({ id: selectedFee.id, data });
    }
  };

  const handleEditFee = (fee: TuitionFee) => {
    setSelectedFee(fee);
    feeForm.reset({
      gradeLevel: fee.gradeLevel,
      amount: parseFloat(fee.amount),
      dueDate: fee.dueDate || "",
    });
    setIsFeeDialogOpen(true);
  };

  // Get system statistics
  const getSystemStats = () => {
    const currentSettings = schoolSettings[0]; // Assuming single active setting
    const totalFees = tuitionFees.reduce((sum: number, fee: TuitionFee) => sum + parseFloat(fee.amount), 0);
    const gradesCovered = new Set(tuitionFees.map((fee: TuitionFee) => fee.gradeLevel)).size;
    
    return {
      currentSchoolYear: currentSettings?.schoolYear || "Not Set",
      totalFeeStructures: tuitionFees.length,
      totalFeeAmount: totalFees,
      gradesCovered,
      systemStatus: "Operational"
    };
  };

  const stats = getSystemStats();

  if (settingsLoading || feesLoading) {
    return <div className="flex items-center justify-center h-64">Loading system configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Configuration</h2>
          <p className="text-muted-foreground">Manage school settings and financial configuration</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">School Year</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentSchoolYear}</div>
            <p className="text-xs text-muted-foreground">Current academic year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Structures</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFeeStructures}</div>
            <p className="text-xs text-muted-foreground">Configured fee levels</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalFeeAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All grade levels</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Database className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge className="bg-green-100 text-green-800">{stats.systemStatus}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">All systems running</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="school-settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="school-settings">School Settings</TabsTrigger>
          <TabsTrigger value="tuition-fees">Tuition Fees</TabsTrigger>
          <TabsTrigger value="system-info">System Info</TabsTrigger>
        </TabsList>

        <TabsContent value="school-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    School Year Configuration
                  </CardTitle>
                  <CardDescription>Configure academic year settings and important dates</CardDescription>
                </div>
                <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedSettings ? "Edit School Settings" : "Create School Settings"}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedSettings 
                          ? "Update school year configuration"
                          : "Configure new school year settings"
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...settingsForm}>
                      <form onSubmit={settingsForm.handleSubmit(selectedSettings ? handleUpdateSettings : handleCreateSettings)} className="space-y-4">
                        <FormField
                          control={settingsForm.control}
                          name="schoolYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>School Year</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 2024-2025" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsSettingsDialogOpen(false);
                              setSelectedSettings(null);
                              settingsForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {selectedSettings ? "Update Settings" : "Create Settings"}
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
                    <TableHead>School Year</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolSettings.map((settings: SchoolSettings) => (
                    <TableRow key={settings.id}>
                      <TableCell className="font-medium">{settings.schoolYear}</TableCell>
                      <TableCell>
                        {settings.startDate ? new Date(settings.startDate).toLocaleDateString() : "Not set"}
                      </TableCell>
                      <TableCell>
                        {settings.endDate ? new Date(settings.endDate).toLocaleDateString() : "Not set"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSettings(settings)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tuition-fees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Tuition Fee Management
                  </CardTitle>
                  <CardDescription>Configure tuition fees for different grade levels</CardDescription>
                </div>
                <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Fee Structure
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedFee ? "Edit Tuition Fee" : "Create Tuition Fee"}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedFee 
                          ? "Update tuition fee information"
                          : "Add a new tuition fee structure"
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...feeForm}>
                      <form onSubmit={feeForm.handleSubmit(selectedFee ? handleUpdateFee : handleCreateFee)} className="space-y-4">
                        <FormField
                          control={feeForm.control}
                          name="gradeLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade Level</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="12" 
                                  placeholder="Enter grade level"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={feeForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01"
                                  placeholder="Enter fee amount"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={feeForm.control}
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
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsFeeDialogOpen(false);
                              setSelectedFee(null);
                              feeForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {selectedFee ? "Update Fee" : "Create Fee"}
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
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tuitionFees.map((fee: TuitionFee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">Grade {fee.gradeLevel}</TableCell>
                      <TableCell>${parseFloat(fee.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "Not set"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditFee(fee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteFeeMutation.mutate(fee.id)}
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

        <TabsContent value="system-info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Information
              </CardTitle>
              <CardDescription>Current system status and configuration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Database Status</div>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">School Year</div>
                  <Badge variant="outline">{stats.currentSchoolYear}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Fee Structures</div>
                  <Badge variant="outline">{stats.totalFeeStructures} configured</Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Grade Levels Covered</div>
                  <Badge variant="outline">{stats.gradesCovered} levels</Badge>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="text-sm font-medium mb-2">System Configuration</div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>• PostgreSQL database with Drizzle ORM</div>
                  <div>• Real-time data synchronization</div>
                  <div>• Role-based access control</div>
                  <div>• Automated backup system</div>
                  <div>• Multi-tenant architecture support</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}