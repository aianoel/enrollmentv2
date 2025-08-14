import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/db';
import { users, enrollments, sections } from '../../shared/schema';
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
        // Get all students or specific student
        const { id } = req.query;
        
        if (id) {
          // Get specific student with enrollment info
          const student = await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
              isActive: users.isActive,
              createdAt: users.createdAt,
            })
            .from(users)
            .where(and(eq(users.id, parseInt(id as string)), eq(users.role, 'student')))
            .limit(1);

          if (student.length === 0) {
            res.status(404).json({ error: 'Student not found' });
            return;
          }

          // Get enrollment info
          const enrollment = await db
            .select({
              id: enrollments.id,
              sectionId: enrollments.sectionId,
              status: enrollments.status,
              paymentStatus: enrollments.paymentStatus,
              createdAt: enrollments.createdAt,
            })
            .from(enrollments)
            .where(eq(enrollments.studentId, parseInt(id as string)))
            .limit(1);

          res.status(200).json({
            student: student[0],
            enrollment: enrollment[0] || null
          });
        } else {
          // Get all students
          const students = await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
              isActive: users.isActive,
              createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.role, 'student'))
            .limit(50);

          res.status(200).json({ students });
        }
        break;

      case 'POST':
        // Create new student
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
          res.status(400).json({ error: 'Name, email, and password are required' });
          return;
        }

        // Hash password (in production, use proper password hashing)
        const passwordHash = password; // TODO: Implement proper password hashing

        const newStudent = await db
          .insert(users)
          .values({
            name,
            email,
            passwordHash,
            role: 'student',
            isActive: true,
          })
          .returning();

        res.status(201).json({ 
          message: 'Student created successfully',
          student: newStudent[0]
        });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Students API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
