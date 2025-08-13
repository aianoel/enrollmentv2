import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { ref, push, set, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../../lib/firebase';
import { useLandingPageData } from '../../hooks/useLandingPageData';
import { Plus, Trash2, Upload, Eye } from 'lucide-react';
import { initializeSampleData } from '../../utils/sampleData';

export const LandingPageManager: React.FC = () => {
  const { toast } = useToast();
  const { heroImages, announcements, news, events, loading } = useLandingPageData();
  const [activeTab, setActiveTab] = useState<'hero' | 'announcements' | 'news' | 'events'>('hero');
  const [uploading, setUploading] = useState(false);

  // Form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    postedBy: 'Admin'
  });

  const [newsForm, setNewsForm] = useState({
    title: '',
    summary: '',
    content: '',
    image: ''
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const imageRef = storageRef(storage, `hero-images/${Date.now()}-${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      
      // Add to hero images array
      const currentImages = heroImages.map(img => img.url);
      const newImages = [...currentImages, downloadURL];
      await set(ref(database, 'landingPage/heroImages'), newImages);
      
      toast({
        title: "Success",
        description: "Hero image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeHeroImage = async (imageUrl: string) => {
    try {
      const currentImages = heroImages.map(img => img.url);
      const newImages = currentImages.filter(url => url !== imageUrl);
      await set(ref(database, 'landingPage/heroImages'), newImages);
      
      toast({
        title: "Success",
        description: "Hero image removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const addAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const announcementData = {
        ...announcementForm,
        date: new Date().toISOString().split('T')[0],
        isActive: true
      };
      
      await push(ref(database, 'announcements'), announcementData);
      setAnnouncementForm({ title: '', content: '', postedBy: 'Admin' });
      
      toast({
        title: "Success",
        description: "Announcement added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add announcement",
        variant: "destructive",
      });
    }
  };

  const addNews = async () => {
    if (!newsForm.title || !newsForm.summary) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const newsData = {
        ...newsForm,
        date: new Date().toISOString().split('T')[0]
      };
      
      await push(ref(database, 'news'), newsData);
      setNewsForm({ title: '', summary: '', content: '', image: '' });
      
      toast({
        title: "Success",
        description: "News article added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add news article",
        variant: "destructive",
      });
    }
  };

  const addEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await push(ref(database, 'events'), eventForm);
      setEventForm({ title: '', date: '', time: '', location: '', description: '' });
      
      toast({
        title: "Success",
        description: "Event added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (type: string, id: string) => {
    try {
      await remove(ref(database, `${type}/${id}`));
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleInitializeSampleData = async () => {
    try {
      await initializeSampleData();
      toast({
        title: "Success",
        description: "Sample data initialized successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize sample data",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Landing Page Manager</h1>
        <Button onClick={handleInitializeSampleData} variant="outline">
          Initialize Sample Data
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'hero', label: 'Hero Images' },
            { key: 'announcements', label: 'Announcements' },
            { key: 'news', label: 'News' },
            { key: 'events', label: 'Events' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Hero Images Tab */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Hero Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="hero-upload">Select Image</Label>
                <Input
                  id="hero-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Hero Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Hero ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeHeroImage(image.url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ann-title">Title</Label>
                <Input
                  id="ann-title"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <Label htmlFor="ann-content">Content</Label>
                <Textarea
                  id="ann-content"
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Announcement content"
                />
              </div>
              <div>
                <Label htmlFor="ann-author">Posted By</Label>
                <Input
                  id="ann-author"
                  value={announcementForm.postedBy}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, postedBy: e.target.value }))}
                  placeholder="Author name"
                />
              </div>
              <Button onClick={addAnnouncement}>
                <Plus className="h-4 w-4 mr-2" />
                Add Announcement
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <p className="text-gray-600 text-sm">{announcement.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        By {announcement.postedBy} on {announcement.date}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteItem('announcements', announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* News Tab */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add News Article</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="news-title">Title</Label>
                <Input
                  id="news-title"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="News title"
                />
              </div>
              <div>
                <Label htmlFor="news-summary">Summary</Label>
                <Textarea
                  id="news-summary"
                  value={newsForm.summary}
                  onChange={(e) => setNewsForm(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary"
                />
              </div>
              <div>
                <Label htmlFor="news-image">Image URL</Label>
                <Input
                  id="news-image"
                  value={newsForm.image}
                  onChange={(e) => setNewsForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="news-content">Full Content</Label>
                <Textarea
                  id="news-content"
                  value={newsForm.content}
                  onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Full article content"
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={addNews}>
                <Plus className="h-4 w-4 mr-2" />
                Add News Article
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current News</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {news.map((newsItem) => (
                  <div key={newsItem.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div className="flex space-x-4">
                      {newsItem.image && (
                        <img src={newsItem.image} alt={newsItem.title} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div>
                        <h3 className="font-semibold">{newsItem.title}</h3>
                        <p className="text-gray-600 text-sm">{newsItem.summary}</p>
                        <p className="text-xs text-gray-500 mt-1">{newsItem.date}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteItem('news', newsItem.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="event-title">Title</Label>
                <Input
                  id="event-title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="event-time">Time</Label>
                  <Input
                    id="event-time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="event-location">Location</Label>
                <Input
                  id="event-location"
                  value={eventForm.location}
                  onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Event location"
                />
              </div>
              <div>
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Event description"
                />
              </div>
              <Button onClick={addEvent}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-gray-600 text-sm">{event.description}</p>
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                        <p>📅 {event.date} {event.time && `• ${event.time}`}</p>
                        <p>📍 {event.location}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteItem('events', event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};