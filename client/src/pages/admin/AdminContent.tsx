import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  FileText,
  Video,
  Image,
  Upload,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Eye,
  Download,
  Star,
  Clock,
  Users,
  Activity
} from "lucide-react";

// Schema definitions
const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["document", "video", "image", "lesson", "assignment"]),
  subjectId: z.number().optional(),
  content: z.string().min(1, "Content is required"),
  tags: z.string().optional(),
});

type ContentFormData = z.infer<typeof contentSchema>;

interface Content {
  id: number;
  title: string;
  description: string;
  type: string;
  subjectId?: number;
  content: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
  views?: number;
  downloads?: number;
  rating?: number;
}

interface Subject {
  id: number;
  name: string;
  description: string;
}

export function AdminContent() {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const contentForm = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "document",
      content: "",
      tags: "",
    },
  });

  // Fetch content
  const { data: content = [], isLoading: contentLoading } = useQuery({
    queryKey: ["/api/admin/content"],
    queryFn: async () => {
      const response = await fetch("/api/admin/content");
      if (!response.ok) throw new Error("Failed to fetch content");
      return response.json();
    }
  });

  // Fetch subjects for dropdown
  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/admin/subjects"],
    queryFn: async () => {
      const response = await fetch("/api/admin/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      return response.json();
    }
  });

  // Content mutations
  const createContentMutation = useMutation({
    mutationFn: (data: ContentFormData) => apiRequest("/api/admin/content", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      setIsContentDialogOpen(false);
      contentForm.reset();
      toast({ title: "Content created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create content", variant: "destructive" });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ContentFormData> }) =>
      apiRequest(`/api/admin/content/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      setIsContentDialogOpen(false);
      setSelectedContent(null);
      contentForm.reset();
      toast({ title: "Content updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update content", variant: "destructive" });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/content/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({ title: "Content deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete content", variant: "destructive" });
    },
  });

  // Filter content
  const filteredContent = content.filter((item: Content) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCreateContent = (data: ContentFormData) => {
    createContentMutation.mutate(data);
  };

  const handleUpdateContent = (data: ContentFormData) => {
    if (selectedContent) {
      updateContentMutation.mutate({ id: selectedContent.id, data });
    }
  };

  const handleEditContent = (item: Content) => {
    setSelectedContent(item);
    contentForm.reset({
      title: item.title,
      description: item.description,
      type: item.type as any,
      subjectId: item.subjectId || undefined,
      content: item.content,
      tags: item.tags || "",
    });
    setIsContentDialogOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document": return FileText;
      case "video": return Video;
      case "image": return Image;
      case "lesson": return BookOpen;
      case "assignment": return Edit;
      default: return FileText;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      document: "bg-blue-100 text-blue-800",
      video: "bg-red-100 text-red-800",
      image: "bg-green-100 text-green-800",
      lesson: "bg-purple-100 text-purple-800",
      assignment: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (contentLoading) {
    return <div className="flex items-center justify-center h-64">Loading content...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                Content Management
              </h1>
              <p className="text-gray-600 mt-2">Manage educational content, resources, and learning materials</p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {content.length} Total Items
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {content.filter((c: Content) => c.type === 'lesson').length} Lessons
                </Badge>
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  {content.filter((c: Content) => c.type === 'assignment').length} Assignments
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="border-gray-300">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics Cards */}
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
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Content</p>
                    <p className="text-3xl font-bold text-blue-900">{content.length}</p>
                    <p className="text-xs text-blue-600 mt-1">All formats</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
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
                    <p className="text-sm font-medium text-green-700">Active Lessons</p>
                    <p className="text-3xl font-bold text-green-900">{content.filter((c: Content) => c.type === 'lesson').length}</p>
                    <p className="text-xs text-green-600 mt-1">Ready to teach</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600" />
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
            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Media Files</p>
                    <p className="text-3xl font-bold text-purple-900">{content.filter((c: Content) => ['video', 'image'].includes(c.type)).length}</p>
                    <p className="text-xs text-purple-600 mt-1">Videos & images</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Video className="h-6 w-6 text-purple-600" />
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
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Total Views</p>
                    <p className="text-3xl font-bold text-orange-900">{content.reduce((sum: number, c: Content) => sum + (c.views || 0), 0)}</p>
                    <p className="text-xs text-orange-600 mt-1">Engagement metric</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content Management Interface */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl text-purple-900">
                  <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  Content Library
                </CardTitle>
                <CardDescription className="text-purple-700 mt-2">
                  Organize and manage all educational content and resources
                </CardDescription>
              </div>
              <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Content
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedContent ? "Edit Content" : "Create New Content"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedContent 
                        ? "Update content information and settings"
                        : "Add new educational content to the library"
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...contentForm}>
                    <form onSubmit={contentForm.handleSubmit(selectedContent ? handleUpdateContent : handleCreateContent)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={contentForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter content title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={contentForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="document">📄 Document</SelectItem>
                                  <SelectItem value="video">📹 Video</SelectItem>
                                  <SelectItem value="image">🖼️ Image</SelectItem>
                                  <SelectItem value="lesson">📚 Lesson</SelectItem>
                                  <SelectItem value="assignment">📝 Assignment</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={contentForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter content description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contentForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter the actual content or URL" {...field} rows={4} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={contentForm.control}
                          name="subjectId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject (Optional)</FormLabel>
                              <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select subject" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">No Subject</SelectItem>
                                  {subjects.map((subject: Subject) => (
                                    <SelectItem key={subject.id} value={subject.id.toString()}>
                                      {subject.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={contentForm.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. math, algebra, grade-10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsContentDialogOpen(false);
                            setSelectedContent(null);
                            contentForm.reset();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {selectedContent ? "Update Content" : "Create Content"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search content by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px] bg-white border-gray-300">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📁 All Types</SelectItem>
                  <SelectItem value="document">📄 Documents</SelectItem>
                  <SelectItem value="video">📹 Videos</SelectItem>
                  <SelectItem value="image">🖼️ Images</SelectItem>
                  <SelectItem value="lesson">📚 Lessons</SelectItem>
                  <SelectItem value="assignment">📝 Assignments</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-9"
                >
                  📋 List
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

            {/* Content Display */}
            {viewMode === "list" ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Content</TableHead>
                      <TableHead className="font-semibold text-gray-700">Type</TableHead>
                      <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                      <TableHead className="font-semibold text-gray-700">Engagement</TableHead>
                      <TableHead className="font-semibold text-gray-700">Created</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContent.map((item: Content) => {
                      const IconComponent = getTypeIcon(item.type);
                      return (
                        <TableRow key={item.id} className="hover:bg-purple-50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center text-white">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{item.title}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getTypeBadgeColor(item.type)} border-0 font-medium`}>
                              {item.type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {subjects.find((s: Subject) => s.id === item.subjectId)?.name || "General"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Eye className="h-4 w-4" />
                              <span>{item.views || 0}</span>
                              <Download className="h-4 w-4 ml-2" />
                              <span>{item.downloads || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditContent(item)}
                                className="hover:bg-purple-50 hover:border-purple-300"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteContentMutation.mutate(item.id)}
                                className="hover:bg-red-50 hover:border-red-300 text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredContent.map((item: Content) => {
                  const IconComponent = getTypeIcon(item.type);
                  return (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center text-white">
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.title}</h3>
                              <p className="text-sm text-gray-500">ID: {item.id}</p>
                            </div>
                          </div>
                          <Badge className={`${getTypeBadgeColor(item.type)} text-xs border-0`}>
                            {item.type}
                          </Badge>
                        </div>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{item.views || 0} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              <span>{item.downloads || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditContent(item)}
                            className="flex-1 hover:bg-purple-50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteContentMutation.mutate(item.id)}
                            className="hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}