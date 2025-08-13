import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useRealtimeQuery } from '../../hooks/useRealtimeData';
import { useAuth } from '../../contexts/AuthContext';
import { Grade } from '@shared/schema';

export const GradesTable: React.FC = () => {
  const { userProfile } = useAuth();
  const [selectedQuarter, setSelectedQuarter] = useState('current');
  
  const { data: grades, loading } = useRealtimeQuery<Grade>(
    'grades',
    'studentId',
    userProfile?.id
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-100 text-green-800';
    if (grade >= 85) return 'bg-blue-100 text-blue-800';
    if (grade >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const calculateGPA = () => {
    if (grades.length === 0) return '0.00';
    const average = grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length;
    return (average / 25).toFixed(2); // Convert to 4.0 scale
  };

  const getCompletedSubjects = () => {
    return grades.filter(g => g.grade > 0).length;
  };

  const getAverageGrade = () => {
    if (grades.length === 0) return '0.0';
    const average = grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length;
    return average.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Grades</h2>
        <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
          <SelectTrigger className="w-48" data-testid="select-quarter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Quarter</SelectItem>
            <SelectItem value="Q1">Q1 2024</SelectItem>
            <SelectItem value="Q2">Q2 2024</SelectItem>
            <SelectItem value="Q3">Q3 2024</SelectItem>
            <SelectItem value="Q4">Q4 2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grades Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2" data-testid="current-gpa">
              {calculateGPA()}
            </div>
            <p className="text-gray-600 font-medium">Current GPA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2" data-testid="completed-subjects">
              {getCompletedSubjects()}/{grades.length}
            </div>
            <p className="text-gray-600 font-medium">Subjects Graded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2" data-testid="average-grade">
              {getAverageGrade()}
            </div>
            <p className="text-gray-600 font-medium">Average Grade</p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Grades Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Subject Grades</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Q1
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Q2
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Q3
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Q4
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {grades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No grades available yet.
                    </td>
                  </tr>
                ) : (
                  grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50" data-testid={`grade-row-${grade.id}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">Subject Name</div>
                        <div className="text-sm text-gray-500">Course Description</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        Teacher Name
                      </td>
                      <td className="px-6 py-4">
                        {grade.quarter === 'Q1' ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {grade.quarter === 'Q2' ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {grade.quarter === 'Q3' ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {grade.quarter === 'Q4' ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400">-</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
