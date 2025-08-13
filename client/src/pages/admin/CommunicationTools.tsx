import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Users,
  AlertTriangle,
  Search
} from "lucide-react";
import type { ChatMessage, User } from "@shared/schema";

const messageFormSchema = z.object({
  receiverId: z.number().min(1, "Recipient is required"),
  message: z.string().min(1, "Message cannot be empty"),
});

type MessageFormData = z.infer<typeof messageFormSchema>;

export function CommunicationTools() {
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUser, setFilterUser] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: chatMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/admin/chat-messages"],
    queryFn: () => apiRequest("/api/admin/chat-messages")
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("/api/admin/users")
  });

  // Form
  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { receiverId: 0, message: "" },
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: (data: MessageFormData) => apiRequest("/api/admin/chat-messages", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        senderId: 1, // Admin user ID - this should come from auth context
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chat-messages"] });
      setIsMessageDialogOpen(false);
      messageForm.reset();
      toast({ title: "Message sent successfully" });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/chat-messages/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chat-messages"] });
      toast({ title: "Message deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete message", variant: "destructive" });
    },
  });

  // Handlers
  const handleSendMessage = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  // Helper functions
  const getUserName = (userId: number) => {
    const user = users.find((u: User) => u.id === userId);
    return user?.name || "Unknown User";
  };

  const getUserRole = (userId: number) => {
    const user = users.find((u: User) => u.id === userId);
    return user?.role || "unknown";
  };

  // Filter messages
  const filteredMessages = chatMessages.filter((message: ChatMessage) => {
    const senderName = getUserName(message.senderId);
    const receiverName = getUserName(message.receiverId || 0);
    const matchesSearch = 
      senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = filterUser === "all" || 
      message.senderId.toString() === filterUser || 
      message.receiverId?.toString() === filterUser;
    
    return matchesSearch && matchesUser;
  });

  // Get message statistics
  const getMessageStats = () => {
    const totalMessages = chatMessages.length;
    const todayMessages = chatMessages.filter((msg: ChatMessage) => {
      if (!msg.createdAt) return false;
      const today = new Date();
      const msgDate = new Date(msg.createdAt);
      return msgDate.toDateString() === today.toDateString();
    }).length;

    const uniqueUsers = new Set([
      ...chatMessages.map((msg: ChatMessage) => msg.senderId),
      ...chatMessages.filter((msg: ChatMessage) => msg.receiverId).map((msg: ChatMessage) => msg.receiverId!)
    ]).size;

    return { totalMessages, todayMessages, uniqueUsers };
  };

  const stats = getMessageStats();

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      teacher: "bg-blue-100 text-blue-800",
      student: "bg-green-100 text-green-800",
      parent: "bg-purple-100 text-purple-800",
      guidance: "bg-yellow-100 text-yellow-800",
      registrar: "bg-orange-100 text-orange-800",
      accounting: "bg-pink-100 text-pink-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (messagesLoading || usersLoading) {
    return <div className="flex items-center justify-center h-64">Loading communication tools...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Communication Tools</h2>
          <p className="text-muted-foreground">Manage and monitor system communications</p>
        </div>
        <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Send System Message</DialogTitle>
              <DialogDescription>Send a message to any user in the system</DialogDescription>
            </DialogHeader>
            <Form {...messageForm}>
              <form onSubmit={messageForm.handleSubmit(handleSendMessage)} className="space-y-4">
                <FormField
                  control={messageForm.control}
                  name="receiverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.filter((user: User) => user.id !== 1).map((user: User) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={messageForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your message" 
                          className="min-h-[100px]"
                          {...field} 
                        />
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
                      setIsMessageDialogOpen(false);
                      messageForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">All time messages</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Messages</CardTitle>
            <Send className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayMessages}</div>
            <p className="text-xs text-muted-foreground">Messages sent today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Users in conversations</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message Management
          </CardTitle>
          <CardDescription>Monitor and manage system communications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search messages, users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user: User) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message: ChatMessage) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{getUserName(message.senderId)}</span>
                      <Badge className={getRoleBadgeColor(getUserRole(message.senderId))}>
                        {getUserRole(message.senderId)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {message.receiverId ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{getUserName(message.receiverId)}</span>
                        <Badge className={getRoleBadgeColor(getUserRole(message.receiverId))}>
                          {getUserRole(message.receiverId)}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Broadcast</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate">{message.message}</div>
                  </TableCell>
                  <TableCell>
                    {message.createdAt ? new Date(message.createdAt).toLocaleString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMessageMutation.mutate(message.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMessages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Communication Guidelines
          </CardTitle>
          <CardDescription>Administrative communication policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <strong>Message Monitoring:</strong> All system messages are logged and monitored for security and policy compliance.
          </div>
          <div className="text-sm">
            <strong>Deletion Policy:</strong> Inappropriate messages can be deleted by administrators. Users will be notified of deletions.
          </div>
          <div className="text-sm">
            <strong>Broadcast Messages:</strong> Admin messages without specific recipients are sent as system-wide announcements.
          </div>
          <div className="text-sm">
            <strong>Privacy:</strong> User privacy is respected. Messages are only monitored for policy violations and security purposes.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}