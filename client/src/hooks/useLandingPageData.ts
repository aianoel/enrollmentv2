import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface HeroImage {
  url: string;
  alt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  postedBy: string;
  isActive: boolean;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  date: string;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
}

export const useLandingPageData = () => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([
    { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080', alt: 'School building' },
    { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080', alt: 'Students learning' }
  ]);

  // Fetch announcements from PostgreSQL API
  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ['/api/announcements'],
    queryFn: async () => {
      const response = await fetch('/api/announcements');
      if (!response.ok) {
        console.warn('Failed to fetch announcements, using empty array');
        return [];
      }
      return response.json();
    }
  });

  // Fetch news from PostgreSQL API
  const { data: news = [], isLoading: newsLoading } = useQuery({
    queryKey: ['/api/news'],
    queryFn: async () => {
      const response = await fetch('/api/news');
      if (!response.ok) {
        console.warn('Failed to fetch news, using empty array');
        return [];
      }
      return response.json();
    }
  });

  // Fetch events from PostgreSQL API
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) {
        console.warn('Failed to fetch events, using empty array');
        return [];
      }
      return response.json();
    }
  });

  const loading = announcementsLoading || newsLoading || eventsLoading;

  return {
    heroImages,
    announcements: announcements as Announcement[],
    news: news as NewsItem[],
    events: events as EventItem[],
    loading
  };
};