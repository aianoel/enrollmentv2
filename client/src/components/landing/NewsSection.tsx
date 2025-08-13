import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, ChevronRight } from 'lucide-react';
import { NewsItem } from '../../hooks/useLandingPageData';

interface NewsSectionProps {
  news: NewsItem[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  if (news.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest News</h2>
          <p className="text-lg text-gray-600">Stay updated with what's happening at our school</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.slice(0, 6).map((newsItem) => (
            <Card key={newsItem.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {newsItem.image && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={newsItem.image} 
                    alt={newsItem.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(newsItem.date)}
                </div>
                <CardTitle className="text-xl line-clamp-2">{newsItem.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 line-clamp-3 mb-4">{newsItem.summary}</p>
                <Button variant="ghost" className="p-0 h-auto text-primary-600 hover:text-primary-700">
                  Read more <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {news.length > 6 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              View All News
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};