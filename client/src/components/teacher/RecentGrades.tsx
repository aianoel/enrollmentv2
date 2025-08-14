import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, TrendingUp, TrendingDown } from 'lucide-react';

export const RecentGrades: React.FC = () => {
  const { data: assignments } = useQuery({
    queryKey: ['/api/teacher/assignments'],
  });

  const { data: grades, isLoading } = useQuery({
    queryKey: ['/api/teacher/grades'],
    enabled: !!assignments && Array.isArray(assignments) && assignments.length > 0,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Recent Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!grades || grades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Recent Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No grades recorded</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start encoding grades in the Grade Management tab.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the 5 most recent grades
  const recentGrades = grades.slice(-5).reverse();

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-100 text-green-800';
    if (grade >= 80) return 'bg-blue-100 text-blue-800';
    if (grade >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getGradeIcon = (grade: number) => {
    return grade >= 75 ? TrendingUp : TrendingDown;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Recent Grades Encoded
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentGrades.map((grade: any, index: number) => {
            const GradeIcon = getGradeIcon(grade.grade);
            return (
              <div
                key={`${grade.student_id}-${grade.subject_id}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {grade.student_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {grade.subject_name} • Quarter {grade.quarter}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getGradeColor(grade.grade)} flex items-center gap-1`}
                  >
                    <GradeIcon className="h-3 w-3" />
                    {grade.grade}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};