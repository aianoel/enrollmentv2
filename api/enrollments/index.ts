import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/db';
import { enrollments, users, sections } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all enrollments with student and section info
        const enrollmentsList = await db
          .select({
            id: enrollments.id,
            studentId: enrollments.studentId,
            studentName: users.name,
            studentEmail: users.email,
            sectionId: enrollments.sectionId,
            sectionName: sections.name,
            gradeLevel: sections.gradeLevel,
            status: enrollments.status,
            paymentStatus: enrollments.paymentStatus,
            createdAt: enrollments.createdAt,
          })
          .from(enrollments)
          .leftJoin(users, eq(enrollments.studentId, users.id))
          .leftJoin(sections, eq(enrollments.sectionId, sections.id))
          .limit(100);

        res.status(200).json({ enrollments: enrollmentsList });
        break;

      case 'POST':
        // Create new enrollment
        const { studentId, sectionId, status = 'pending', paymentStatus = 'unpaid' } = req.body;
        
        if (!studentId) {
          res.status(400).json({ error: 'Student ID is required' });
          return;
        }

        const newEnrollment = await db
          .insert(enrollments)
          .values({
            studentId: parseInt(studentId),
            sectionId: sectionId ? parseInt(sectionId) : null,
            status,
            paymentStatus,
          })
          .returning();

        res.status(201).json({ 
          message: 'Enrollment created successfully',
          enrollment: newEnrollment[0]
        });
        break;

      case 'PUT':
        // Update enrollment
        const { id } = req.query;
        const updateData = req.body;
        
        if (!id) {
          res.status(400).json({ error: 'Enrollment ID is required' });
          return;
        }

        const updatedEnrollment = await db
          .update(enrollments)
          .set(updateData)
          .where(eq(enrollments.id, parseInt(id as string)))
          .returning();

        if (updatedEnrollment.length === 0) {
          res.status(404).json({ error: 'Enrollment not found' });
          return;
        }

        res.status(200).json({ 
          message: 'Enrollment updated successfully',
          enrollment: updatedEnrollment[0]
        });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Enrollments API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
