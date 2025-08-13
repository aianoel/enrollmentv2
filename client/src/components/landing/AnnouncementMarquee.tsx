import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Calendar, User } from 'lucide-react';
import { Announcement } from '../../hooks/useLandingPageData';

interface AnnouncementMarqueeProps {
  announcements: Announcement[];
}

export const AnnouncementMarquee: React.FC<AnnouncementMarqueeProps> = ({ announcements }) => {
  if (announcements.length === 0) {
    return null;
  }

  return (
    <section className="bg-primary-600 text-white py-4 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-sm uppercase tracking-wide whitespace-nowrap">
            Announcements:
          </span>
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee flex space-x-8 whitespace-nowrap">
              {announcements.concat(announcements).map((announcement, index) => (
                <div key={`${announcement.id}-${index}`} className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">{announcement.title}</span>
                  <span className="text-primary-200">•</span>
                  <span>{announcement.content}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      

    </section>
  );
};