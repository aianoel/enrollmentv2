import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Users, UserCheck, UserX, Filter, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isOnline?: boolean;
  lastActive?: string;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [onlineFilter, setOnlineFilter] = useState('all');
  const { toast } = useToast();

  // Fetch all users
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Fetch online users status
  const { data: onlineUsers = [], refetch: refetchOnlineUsers } = useQuery<User[]>({
    queryKey: ['/api/chat/online-users'],
  });

  // Auto-refresh online status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchOnlineUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchOnlineUsers]);

  // Merge users with online status
  const usersWithStatus = users.map((user: User) => ({
    ...user,
    isOnline: onlineUsers.some((onlineUser: User) => onlineUser.id === user.id),
    lastActive: onlineUsers.find((onlineUser: User) => onlineUser.id === user.id)?.lastActive || 'Unknown'
  }));

  // Filter users based on search, role, and online status
  const filteredUsers = usersWithStatus.filter((user: User) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesOnlineFilter = onlineFilter === 'all' || 
                               (onlineFilter === 'online' && user.isOnline) ||
                               (onlineFilter === 'offline' && !user.isOnline);
    
    return matchesSearch && matchesRole && matchesOnlineFilter;
  });

  // Get unique roles for filter
  const roles = Array.from(new Set(users.map((user: User) => user.role)));

  // Statistics
  const totalUsers = users.length;
  const onlineCount = usersWithStatus.filter((user: User) => user.isOnline).length;
  const offlineCount = totalUsers - onlineCount;

  const handleRefresh = () => {
    refetchUsers();
    refetchOnlineUsers();
    toast({
      title: "Refreshed",
      description: "User data and online status updated."
    });
  };

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      'admin': 'bg-red-100 text-red-800',
      'principal': 'bg-purple-100 text-purple-800',
      'academic_coordinator': 'bg-blue-100 text-blue-800',
      'teacher': 'bg-green-100 text-green-800',
      'student': 'bg-yellow-100 text-yellow-800',
      'parent': 'bg-pink-100 text-pink-800',
      'guidance': 'bg-indigo-100 text-indigo-800',
      'registrar': 'bg-orange-100 text-orange-800',
      'accounting': 'bg-teal-100 text-teal-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (usersLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online Now</p>
                <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-gray-600">{offlineCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Filtered</p>
                <p className="text-2xl font-bold text-purple-600">{filteredUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>

              <select
                value={onlineFilter}
                onChange={(e) => setOnlineFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="all">All Status</option>
                <option value="online">Online Only</option>
                <option value="offline">Offline Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your criteria.
              </div>
            ) : (
              filteredUsers.map((user: User) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{user.name}</h3>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                        <Badge variant={user.isOnline ? 'default' : 'secondary'}>
                          {user.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                        {user.isOnline ? 
                          ' • Active now' : 
                          user.lastActive !== 'Unknown' ? 
                            ` • Last active: ${user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Unknown'}` :
                            ' • Last activity unknown'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.isOnline && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Active
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}