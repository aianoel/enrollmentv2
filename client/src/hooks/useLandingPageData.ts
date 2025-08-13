import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../lib/firebase';

export interface HeroImage {
  url: string;
  alt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  postedBy: string;
  isActive?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image?: string;
  date: string;
  content?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  time?: string;
}

export const useLandingPageData = () => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set default data immediately to prevent infinite loading
    const defaultData = {
      heroImages: [
        { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080', alt: 'School building' },
        { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080', alt: 'Students learning' },
        { url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080', alt: 'Students studying' }
      ],
      announcements: [
        {
          id: 'default1',
          title: 'Welcome to EduManage',
          content: 'Experience our comprehensive school management system with real-time features.',
          date: '2025-08-13',
          postedBy: 'Admin',
          isActive: true
        },
        {
          id: 'default2',
          title: 'Enrollment Now Open',
          content: 'Start your enrollment process today! Complete online registration available.',
          date: '2025-08-12',
          postedBy: 'Registrar',
          isActive: true
        }
      ],
      news: [
        {
          id: 'default1',
          title: 'EduManage Platform Launch',
          summary: 'Our new comprehensive school management system is now live with advanced features.',
          image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
          date: '2025-08-10',
          content: 'The EduManage platform brings together students, teachers, parents, and administrators...'
        },
        {
          id: 'default2',
          title: 'New Features Available',
          summary: 'Real-time chat, assignment tracking, and grade management now available.',
          image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
          date: '2025-08-08',
          content: 'Enhanced features include real-time messaging, comprehensive grade tracking...'
        }
      ],
      events: [
        {
          id: 'default1',
          title: 'Platform Demo Session',
          date: '2025-09-05',
          time: '2:00 PM - 4:00 PM',
          location: 'Virtual Meeting',
          description: 'Join us for a comprehensive demonstration of all EduManage features.'
        },
        {
          id: 'default2',
          title: 'Teacher Training Workshop',
          date: '2025-08-25',
          time: '10:00 AM - 12:00 PM',
          location: 'Online',
          description: 'Learn how to maximize the platform\'s capabilities for classroom management.'
        }
      ]
    };

    // Set default data immediately
    setHeroImages(defaultData.heroImages);
    setAnnouncements(defaultData.announcements);
    setNews(defaultData.news);
    setEvents(defaultData.events);
    setLoading(false);

    // Try to load from Firebase, but don't block the UI
    try {
      const heroImagesRef = ref(database, 'landingPage/heroImages');
      const announcementsRef = ref(database, 'announcements');
      const newsRef = ref(database, 'news');
      const eventsRef = ref(database, 'events');

      let loadedCount = 0;
      const totalRefs = 4;

      const checkAllLoaded = () => {
        loadedCount++;
        // Don't change loading state here since we already have default data
      };

    // Listen to hero images
    const unsubscribeHeroImages = onValue(heroImagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        setHeroImages(data.map((url: string) => ({ url, alt: 'Hero image' })));
      } else {
        // Default images if none exist
        setHeroImages([
          { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080', alt: 'School building' },
          { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080', alt: 'Students learning' }
        ]);
      }
      checkAllLoaded();
    }, (error) => {
      console.error('Firebase error loading hero images:', error);
      // Use default images on error
      setHeroImages([
        { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080', alt: 'School building' },
        { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080', alt: 'Students learning' }
      ]);
      checkAllLoaded();
    });

    // Listen to announcements
    const unsubscribeAnnouncements = onValue(announcementsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const announcementsList = Object.entries(data).map(([id, announcement]: [string, any]) => ({
          id,
          ...announcement
        })).filter((ann: Announcement) => ann.isActive !== false)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAnnouncements(announcementsList);
      } else {
        setAnnouncements([]);
      }
      checkAllLoaded();
    }, (error) => {
      console.error('Firebase error loading announcements:', error);
      setAnnouncements([]);
      checkAllLoaded();
    });

    // Listen to news
    const unsubscribeNews = onValue(newsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newsList = Object.entries(data).map(([id, newsItem]: [string, any]) => ({
          id,
          ...newsItem
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNews(newsList);
      } else {
        setNews([]);
      }
      checkAllLoaded();
    }, (error) => {
      console.error('Firebase error loading news:', error);
      setNews([]);
      checkAllLoaded();
    });

    // Listen to events
    const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const eventsList = Object.entries(data).map(([id, event]: [string, any]) => ({
          id,
          ...event
        })).filter((event: Event) => new Date(event.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(eventsList);
      } else {
        setEvents([]);
      }
      checkAllLoaded();
    }, (error) => {
      console.error('Firebase error loading events:', error);
      setEvents([]);
      checkAllLoaded();
    });

    } catch (error) {
      console.error('Firebase connection error:', error);
      // Keep using default data if Firebase fails
    }
  }, []);

  return {
    heroImages,
    announcements,
    news,
    events,
    loading
  };
};