import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list, del } from '@vercel/blob';
import { db } from '../../server/db';
import { enrollments, users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_fy8GdRLMhpGvIW7Y_Uvhws9tXqLX4Tj5X8A8BEOwsXsodyk";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { studentId } = req.query;

    if (!studentId) {
      res.status(400).json({ error: 'Student ID is required' });
      return;
    }

    switch (req.method) {
      case 'POST':
        // Upload student document
        const { filename, content, contentType = 'application/pdf', documentType = 'enrollment' } = req.body;
        
        if (!filename || !content) {
          res.status(400).json({ error: 'Filename and content are required' });
          return;
        }

        // Verify student exists
        const student = await db
          .select()
          .from(users)
          .where(and(eq(users.id, parseInt(studentId as string)), eq(users.role, 'student')))
          .limit(1);

        if (student.length === 0) {
          res.status(404).json({ error: 'Student not found' });
          return;
        }

        // Convert base64 content to buffer
        const fileBuffer = Buffer.from(content, 'base64');
        
        // Create organized file path
        const timestamp = new Date().toISOString().split('T')[0];
        const filePath = `students/${studentId}/${documentType}/${timestamp}-${filename}`;

        // Upload to Vercel Blob
        const blob = await put(filePath, fileBuffer, {
          access: 'public',
          contentType,
          token: BLOB_READ_WRITE_TOKEN,
        });

        // Update enrollment record with document URL
        const enrollment = await db
          .select()
          .from(enrollments)
          .where(eq(enrollments.studentId, parseInt(studentId as string)))
          .limit(1);

        if (enrollment.length > 0) {
          // Update existing documents JSON
          const existingDocs = enrollment[0].documents ? JSON.parse(enrollment[0].documents) : {};
          existingDocs[documentType] = existingDocs[documentType] || [];
          existingDocs[documentType].push({
            filename,
            url: blob.url,
            uploadedAt: new Date().toISOString(),
            size: fileBuffer.length
          });

          await db
            .update(enrollments)
            .set({ documents: JSON.stringify(existingDocs) })
            .where(eq(enrollments.studentId, parseInt(studentId as string)));
        }

        res.status(200).json({
          success: true,
          message: 'Document uploaded successfully',
          document: {
            filename,
            url: blob.url,
            downloadUrl: blob.downloadUrl,
            pathname: blob.pathname,
            size: fileBuffer.length,
            documentType,
            uploadedAt: new Date().toISOString()
          }
        });
        break;

      case 'GET':
        // Get all documents for a student
        const studentDocs = await list({
          prefix: `students/${studentId}/`,
          token: BLOB_READ_WRITE_TOKEN,
        });

        // Get enrollment documents from database
        const enrollmentRecord = await db
          .select()
          .from(enrollments)
          .where(eq(enrollments.studentId, parseInt(studentId as string)))
          .limit(1);

        const documentsFromDB = enrollmentRecord.length > 0 && enrollmentRecord[0].documents 
          ? JSON.parse(enrollmentRecord[0].documents) 
          : {};

        res.status(200).json({
          success: true,
          studentId,
          documents: {
            files: studentDocs.blobs.map(blob => ({
              filename: blob.pathname.split('/').pop(),
              url: blob.url,
              downloadUrl: blob.downloadUrl,
              pathname: blob.pathname,
              size: blob.size,
              uploadedAt: blob.uploadedAt
            })),
            organized: documentsFromDB
          },
          totalFiles: studentDocs.blobs.length
        });
        break;

      case 'DELETE':
        // Delete student document
        const { pathname } = req.body;
        
        if (!pathname) {
          res.status(400).json({ error: 'Pathname is required' });
          return;
        }

        // Delete from blob storage
        await del(pathname, {
          token: BLOB_READ_WRITE_TOKEN,
        });

        res.status(200).json({
          success: true,
          message: 'Document deleted successfully',
          pathname
        });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Student documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Document operation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
