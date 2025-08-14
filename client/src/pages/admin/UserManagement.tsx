import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Users, 
  UserPlus, 
  UserCheck,
  Shield, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  EyeOff
} from "lucide-react";
import type { User, Role } from "@shared/schema";

const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  roleId: z.number().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

const roleFormSchema = z.object({
  roleName: z.string().min(2, "Role name must be at least 2 characters"),
});

type UserFormData = z.infer<typeof userFormSchema>;
type RoleFormData = z.infer<typeof roleFormSchema>;

// Helper function to convert role ID to role name
const getRoleNameById = (roleId: number | string, roles: Role[]): string => {
  const role = roles.find(r => r.id === Number(roleId));
  return role?.roleName || 'unknown';
};

export function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users and roles
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("/api/admin/users")
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/admin/roles"],
    queryFn: () => apiRequest("/api/admin/roles")
  });

  // User form
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      password: "",
    },
  });

  // Role form
  const roleForm = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      roleName: "",
    },
  });

  // User mutations
  const createUserMutation = useMutation({
    mutationFn: (data: UserFormData) => apiRequest("/api/admin/users", "POST", {
      ...data,
      passwordHash: data.password // This will be hashed on the backend
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsUserDialogOpen(false);
      userForm.reset();
      toast({ title: "User created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create user", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormData> }) =>
      apiRequest(`/api/admin/users/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsUserDialogOpen(false);
      setSelectedUser(null);
      userForm.reset();
      toast({ title: "User updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/users/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deactivated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to deactivate user", variant: "destructive" });
    },
  });

  // Role mutations
  const createRoleMutation = useMutation({
    mutationFn: (data: RoleFormData) => apiRequest("/api/admin/roles", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setIsRoleDialogOpen(false);
      roleForm.reset();
      toast({ title: "Role created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create role", variant: "destructive" });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/roles/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({ title: "Role deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete role", variant: "destructive" });
    },
  });

  // Filter users
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = (data: UserFormData) => {
    createUserMutation.mutate(data);
  };

  const handleUpdateUser = (data: UserFormData) => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, data });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    userForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      roleId: user.roleId || undefined,
    });
    setIsUserDialogOpen(true);
  };

  const handleCreateRole = (data: RoleFormData) => {
    createRoleMutation.mutate(data);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      principal: "bg-indigo-100 text-indigo-800",
      academic_coordinator: "bg-cyan-100 text-cyan-800",
      teacher: "bg-blue-100 text-blue-800",
      student: "bg-green-100 text-green-800",
      parent: "bg-purple-100 text-purple-800",
      guidance: "bg-yellow-100 text-yellow-800",
      registrar: "bg-orange-100 text-orange-800",
      accounting: "bg-pink-100 text-pink-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (usersLoading || rolesLoading) {
    return <div className="flex items-center justify-center h-64">Loading users...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header - Mobile Responsive */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-lg sm:text-3xl">User & Role Management</span>
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Comprehensive user administration and role-based access control</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
                <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs sm:text-sm">
                  {users.length} Total Users
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-200 text-xs sm:text-sm">
                  {users.filter((u: User) => u.isActive).length} Active
                </Badge>
                <Badge variant="outline" className="text-purple-600 border-purple-200 text-xs sm:text-sm">
                  {roles.length} Roles Defined
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="outline" size="sm" className="border-gray-300 text-xs sm:text-sm">
                <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export Users</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">

        {/* Enhanced Statistics Cards - Mobile Responsive */}
        <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Active Users</p>
                  <p className="text-3xl font-bold text-blue-900">{users.filter((u: User) => u.isActive).length}</p>
                  <p className="text-xs text-blue-600 mt-1">+2 this week</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Teachers</p>
                  <p className="text-3xl font-bold text-green-900">{users.filter((u: User) => u.role === 'teacher').length}</p>
                  <p className="text-xs text-green-600 mt-1">Professional staff</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Students</p>
                  <p className="text-3xl font-bold text-purple-900">{users.filter((u: User) => u.role === 'student').length}</p>
                  <p className="text-xs text-purple-600 mt-1">Enrolled learners</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Admin Roles</p>
                  <p className="text-3xl font-bold text-orange-900">{users.filter((u: User) => ['admin', 'principal'].includes(u.role)).length}</p>
                  <p className="text-xs text-orange-600 mt-1">System administrators</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              <Shield className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl text-blue-900">
                      <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      User Management Console
                    </CardTitle>
                    <CardDescription className="text-blue-700 mt-2">
                      Create, edit, and manage system users with role-based permissions
                    </CardDescription>
                  </div>
                  <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                        <UserPlus className="mr-2 h-5 w-5" />
                        Add New User
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedUser ? "Edit User" : "Create New User"}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedUser 
                          ? "Update user information and permissions"
                          : "Add a new user to the system"
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...userForm}>
                      <form onSubmit={userForm.handleSubmit(selectedUser ? handleUpdateUser : handleCreateUser)} className="space-y-4">
                        <FormField
                          control={userForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter email address" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="admin">Administrator</SelectItem>
                                  <SelectItem value="principal">Principal</SelectItem>
                                  <SelectItem value="academic_coordinator">Academic Coordinator</SelectItem>
                                  <SelectItem value="teacher">Teacher</SelectItem>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="parent">Parent</SelectItem>
                                  <SelectItem value="guidance">Guidance Counselor</SelectItem>
                                  <SelectItem value="registrar">Registrar</SelectItem>
                                  <SelectItem value="accounting">Accounting</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {!selectedUser && (
                          <FormField
                            control={userForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter password" type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsUserDialogOpen(false);
                              setSelectedUser(null);
                              userForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {selectedUser ? "Update User" : "Create User"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
              <CardContent className="p-6">
                {/* Enhanced Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-[200px] bg-white border-gray-300">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🔍 All Roles</SelectItem>
                      <SelectItem value="admin">🛡️ Administrator</SelectItem>
                      <SelectItem value="teacher">👨‍🏫 Teacher</SelectItem>
                      <SelectItem value="student">🎓 Student</SelectItem>
                      <SelectItem value="parent">👨‍👩‍👧‍👦 Parent</SelectItem>
                      <SelectItem value="guidance">🧭 Guidance</SelectItem>
                      <SelectItem value="registrar">📋 Registrar</SelectItem>
                      <SelectItem value="accounting">💰 Accounting</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="h-9"
                    >
                      📋 Table
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-9"
                    >
                      ⊞ Grid
                    </Button>
                  </div>
                </div>

                {/* Enhanced Table/Grid View */}
                {viewMode === "table" ? (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold text-gray-700">User</TableHead>
                          <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                          <TableHead className="font-semibold text-gray-700">Role</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700">Created</TableHead>
                          <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user: User) => (
                          <TableRow key={user.id} className="hover:bg-blue-50 transition-colors">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {(user.name || '').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">ID: {user.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="text-gray-900">{user.email}</div>
                                <div className="text-gray-500">Primary contact</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getRoleBadgeColor(getRoleNameById(user.role, roles))} border-0 font-medium`}>
                                {getRoleNameById(user.role, roles).replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.isActive ? "default" : "secondary"}
                                className={user.isActive 
                                  ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                  : "bg-gray-100 text-gray-600"}
                              >
                                <div className={`w-2 h-2 rounded-full mr-2 ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  className="hover:bg-blue-50 hover:border-blue-300"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteUserMutation.mutate(user.id)}
                                  className="hover:bg-red-50 hover:border-red-300 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredUsers.map((user: User) => (
                      <Card key={user.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {(user.name || '').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-500">ID: {user.id}</p>
                              </div>
                            </div>
                            <Badge 
                              variant={user.isActive ? "default" : "secondary"}
                              className={user.isActive 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-600"}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>📧</span>
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${getRoleBadgeColor(getRoleNameById(user.role, roles))} text-xs border-0`}>
                                {getRoleNameById(user.role, roles).replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="flex-1 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              className="hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Role Management
                  </CardTitle>
                  <CardDescription>Define and manage user roles</CardDescription>
                </div>
                <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Shield className="mr-2 h-4 w-4" />
                      Add Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                      <DialogDescription>
                        Add a new role definition to the system
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...roleForm}>
                      <form onSubmit={roleForm.handleSubmit(handleCreateRole)} className="space-y-4">
                        <FormField
                          control={roleForm.control}
                          name="roleName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter role name" {...field} />
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
                              setIsRoleDialogOpen(false);
                              roleForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Create Role</Button>
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
                    <TableHead>Role Name</TableHead>
                    <TableHead>Users Count</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role: Role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.roleName}</TableCell>
                      <TableCell>
                        {users.filter((user: User) => user.roleId === role.id).length}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRoleMutation.mutate(role.id)}
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
    </div>
  );
}