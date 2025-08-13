import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Event } from '../../hooks/useLandingPageData';

interface EventsSectionProps {
  events: Event[];
}

export const EventsSection: React.FC<EventsSectionProps> = ({ events }) => {
  if (events.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: isNaN(day) ? '1' : day.toString()
    };
  };

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
          <p className="text-lg text-gray-600">Don't miss out on these exciting school events</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 6).map((event) => {
            const shortDate = formatShortDate(event.date);
            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Date badge */}
                    <div className="flex-shrink-0 bg-primary-600 text-white rounded-lg p-3 text-center min-w-[60px]">
                      <div className="text-xs font-medium">{shortDate.month}</div>
                      <div className="text-xl font-bold">{shortDate.day}</div>
                    </div>
                    
                    {/* Event details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        
                        {event.time && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{event.time}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {events.length > 6 && (
          <div className="text-center mt-8">
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              View All Events →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};