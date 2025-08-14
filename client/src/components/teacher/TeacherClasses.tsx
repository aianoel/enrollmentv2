import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen } from 'lucide-react';

export const TeacherClasses: React.FC = () => {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['/api/teacher/assignments'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Classes
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

  if (!assignments || assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No classes assigned</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any sections assigned yet. Contact the academic coordinator to get assignments.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group assignments by section
  const sectionGroups = assignments.reduce((acc: any, assignment: any) => {
    const sectionKey = `${assignment.section_id}`;
    if (!acc[sectionKey]) {
      acc[sectionKey] = {
        sectionId: assignment.section_id,
        sectionName: assignment.section_name,
        gradeLevel: assignment.grade_level,
        subjects: []
      };
    }
    if (assignment.subject_name) {
      acc[sectionKey].subjects.push({
        id: assignment.subject_id,
        name: assignment.subject_name
      });
    }
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          My Classes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.values(sectionGroups).map((section: any) => (
            <div
              key={section.sectionId}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">
                  {section.sectionName}
                </h4>
                <Badge variant="secondary">
                  Grade {section.gradeLevel}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {section.subjects.map((subject: any) => (
                  <Badge key={subject.id} variant="outline" className="text-xs">
                    {subject.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};