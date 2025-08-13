import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FileText, 
  Newspaper, 
  Calendar, 
  Building2,
  Plus, 
  Edit, 
  Trash2,
  Image,
  Users
} from "lucide-react";
import type { Announcement, News, Event, OrgChart } from "@shared/schema";

const announcementFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

const newsFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

const eventFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(2, "Location must be at least 2 characters"),
});

const orgChartFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  photoUrl: z.string().url().optional().or(z.literal("")),
  reportsTo: z.number().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementFormSchema>;
type NewsFormData = z.infer<typeof newsFormSchema>;
type EventFormData = z.infer<typeof eventFormSchema>;
type OrgChartFormData = z.infer<typeof orgChartFormSchema>;

export function ContentManagement() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedOrgChart, setSelectedOrgChart] = useState<OrgChart | null>(null);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isOrgChartDialogOpen, setIsOrgChartDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: () => apiRequest("/api/announcements")
  });

  const { data: news = [], isLoading: newsLoading } = useQuery({
    queryKey: ["/api/news"],
    queryFn: () => apiRequest("/api/news")
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: () => apiRequest("/api/events")
  });

  const { data: orgChart = [], isLoading: orgChartLoading } = useQuery({
    queryKey: ["/api/admin/org-chart"],
    queryFn: () => apiRequest("/api/admin/org-chart")
  });

  // Forms
  const announcementForm = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: { title: "", content: "" },
  });

  const newsForm = useForm<NewsFormData>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: { title: "", summary: "", imageUrl: "" },
  });

  const eventForm = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: { title: "", description: "", date: "", location: "" },
  });

  const orgChartForm = useForm<OrgChartFormData>({
    resolver: zodResolver(orgChartFormSchema),
    defaultValues: { name: "", position: "", photoUrl: "" },
  });

  // Announcement mutations
  const createAnnouncementMutation = useMutation({
    mutationFn: (data: AnnouncementFormData) => apiRequest("/api/admin/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setIsAnnouncementDialogOpen(false);
      announcementForm.reset();
      toast({ title: "Announcement created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create announcement", variant: "destructive" });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AnnouncementFormData> }) =>
      apiRequest(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setIsAnnouncementDialogOpen(false);
      setSelectedAnnouncement(null);
      announcementForm.reset();
      toast({ title: "Announcement updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update announcement", variant: "destructive" });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/announcements/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Announcement deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete announcement", variant: "destructive" });
    },
  });

  // News mutations
  const createNewsMutation = useMutation({
    mutationFn: (data: NewsFormData) => apiRequest("/api/admin/news", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setIsNewsDialogOpen(false);
      newsForm.reset();
      toast({ title: "News created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create news", variant: "destructive" });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/news/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "News deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete news", variant: "destructive" });
    },
  });

  // Event mutations
  const createEventMutation = useMutation({
    mutationFn: (data: EventFormData) => apiRequest("/api/admin/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsEventDialogOpen(false);
      eventForm.reset();
      toast({ title: "Event created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/events/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete event", variant: "destructive" });
    },
  });

  // Org chart mutations
  const createOrgChartMutation = useMutation({
    mutationFn: (data: OrgChartFormData) => apiRequest("/api/admin/org-chart", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/org-chart"] });
      setIsOrgChartDialogOpen(false);
      orgChartForm.reset();
      toast({ title: "Organization chart entry created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create organization chart entry", variant: "destructive" });
    },
  });

  const deleteOrgChartMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/org-chart/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/org-chart"] });
      toast({ title: "Organization chart entry deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete organization chart entry", variant: "destructive" });
    },
  });

  // Handlers
  const handleCreateAnnouncement = (data: AnnouncementFormData) => {
    createAnnouncementMutation.mutate(data);
  };

  const handleUpdateAnnouncement = (data: AnnouncementFormData) => {
    if (selectedAnnouncement) {
      updateAnnouncementMutation.mutate({ id: selectedAnnouncement.id, data });
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    announcementForm.reset({
      title: announcement.title,
      content: announcement.content,
    });
    setIsAnnouncementDialogOpen(true);
  };

  const handleCreateNews = (data: NewsFormData) => {
    createNewsMutation.mutate(data);
  };

  const handleCreateEvent = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const handleCreateOrgChart = (data: OrgChartFormData) => {
    createOrgChartMutation.mutate(data);
  };

  if (announcementsLoading || newsLoading || eventsLoading || orgChartLoading) {
    return <div className="flex items-center justify-center h-64">Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">Manage landing page content and organization information</p>
        </div>
      </div>

      <Tabs defaultValue="announcements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="org-chart">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Announcements
                  </CardTitle>
                  <CardDescription>Manage school announcements and notifications</CardDescription>
                </div>
                <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Announcement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedAnnouncement ? "Edit Announcement" : "Create New Announcement"}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedAnnouncement 
                          ? "Update announcement information"
                          : "Add a new announcement to the landing page"
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...announcementForm}>
                      <form onSubmit={announcementForm.handleSubmit(selectedAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement)} className="space-y-4">
                        <FormField
                          control={announcementForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter announcement title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={announcementForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter announcement content" 
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
                              setIsAnnouncementDialogOpen(false);
                              setSelectedAnnouncement(null);
                              announcementForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {selectedAnnouncement ? "Update Announcement" : "Create Announcement"}
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
                    <TableHead>Title</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Date Posted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement: Announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell className="max-w-md truncate">{announcement.content}</TableCell>
                      <TableCell>
                        {announcement.datePosted ? new Date(announcement.datePosted).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAnnouncement(announcement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
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

        <TabsContent value="news" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5" />
                    News
                  </CardTitle>
                  <CardDescription>Manage news articles and updates</CardDescription>
                </div>
                <Dialog open={isNewsDialogOpen} onOpenChange={setIsNewsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add News
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Create New News Article</DialogTitle>
                      <DialogDescription>Add a new news article to the landing page</DialogDescription>
                    </DialogHeader>
                    <Form {...newsForm}>
                      <form onSubmit={newsForm.handleSubmit(handleCreateNews)} className="space-y-4">
                        <FormField
                          control={newsForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter news title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={newsForm.control}
                          name="summary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Summary</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter news summary" 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={newsForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter image URL" {...field} />
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
                              setIsNewsDialogOpen(false);
                              newsForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Create News</Button>
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
                    <TableHead>Title</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Date Posted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news.map((newsItem: News) => (
                    <TableRow key={newsItem.id}>
                      <TableCell className="font-medium">{newsItem.title}</TableCell>
                      <TableCell className="max-w-md truncate">{newsItem.summary}</TableCell>
                      <TableCell>
                        {newsItem.datePosted ? new Date(newsItem.datePosted).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteNewsMutation.mutate(newsItem.id)}
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

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Events
                  </CardTitle>
                  <CardDescription>Manage school events and activities</CardDescription>
                </div>
                <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                      <DialogDescription>Add a new event to the school calendar</DialogDescription>
                    </DialogHeader>
                    <Form {...eventForm}>
                      <form onSubmit={eventForm.handleSubmit(handleCreateEvent)} className="space-y-4">
                        <FormField
                          control={eventForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter event title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter event description" 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter event location" {...field} />
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
                              setIsEventDialogOpen(false);
                              eventForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Create Event</Button>
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
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event: Event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        {event.date ? new Date(event.date).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteEventMutation.mutate(event.id)}
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

        <TabsContent value="org-chart" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Organization Chart
                  </CardTitle>
                  <CardDescription>Manage school leadership and staff hierarchy</CardDescription>
                </div>
                <Dialog open={isOrgChartDialogOpen} onOpenChange={setIsOrgChartDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Position
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Add Organization Position</DialogTitle>
                      <DialogDescription>Add a new position to the organization chart</DialogDescription>
                    </DialogHeader>
                    <Form {...orgChartForm}>
                      <form onSubmit={orgChartForm.handleSubmit(handleCreateOrgChart)} className="space-y-4">
                        <FormField
                          control={orgChartForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter person's name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orgChartForm.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter position title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orgChartForm.control}
                          name="photoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Photo URL (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter photo URL" {...field} />
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
                              setIsOrgChartDialogOpen(false);
                              orgChartForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Add Position</Button>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Photo</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgChart.map((person: OrgChart) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell>{person.position}</TableCell>
                      <TableCell>
                        {person.photoUrl ? (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Image className="h-3 w-3" />
                            Has Photo
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Photo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteOrgChartMutation.mutate(person.id)}
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
  );
}