import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '../ui/card';
import { StatCard } from '../ui/enhanced-card';
import { Users, BookOpen, ClipboardCheck, FileText } from 'lucide-react';

interface TeacherStatsData {
  totalSections: number;
  totalStudents: number;
  totalSubjects: number;
  totalGrades: number;
}

export const TeacherStats: React.FC = () => {
  const { data: assignments } = useQuery({
    queryKey: ['/api/teacher/assignments'],
  });

  const { data: allStudents } = useQuery({
    queryKey: ['/api/teacher/all-students'],
  });

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    if (!assignments || !Array.isArray(assignments)) {
      return {
        totalSections: 0,
        totalStudents: 0,
        totalSubjects: 0,
        totalGrades: 0,
      };
    }

    const uniqueSections = new Set(assignments.map((a: any) => a.section_id));
    const uniqueSubjects = new Set(assignments.map((a: any) => a.subject_id));
    
    return {
      totalSections: uniqueSections.size,
      totalStudents: Array.isArray(allStudents) ? allStudents.length : 0,
      totalSubjects: uniqueSubjects.size,
      totalGrades: 0, // This would need another API call to count grades
    };
  }, [assignments, allStudents]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Teaching Sections"
        value={stats.totalSections}
        subtitle="Active sections"
        icon={BookOpen}
        color="blue"
        trend={{ value: 0, label: "sections", isPositive: true }}
        data-testid="stat-sections"
      />
      <StatCard
        title="Total Students"
        value={stats.totalStudents}
        subtitle="Across all sections"
        icon={Users}
        color="green"
        trend={{ value: 0, label: "students", isPositive: true }}
        data-testid="stat-students"
      />
      <StatCard
        title="Teaching Subjects"
        value={stats.totalSubjects}
        subtitle="Different subjects"
        icon={FileText}
        color="purple"
        trend={{ value: 0, label: "subjects", isPositive: true }}
        data-testid="stat-subjects"
      />
      <StatCard
        title="Grades Encoded"
        value={stats.totalGrades}
        subtitle="This quarter"
        icon={ClipboardCheck}
        color="orange"
        trend={{ value: 0, label: "grades", isPositive: true }}
        data-testid="stat-grades"
      />
    </div>
  );
};