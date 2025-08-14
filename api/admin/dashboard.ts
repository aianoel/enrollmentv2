import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/db';
import { users, enrollments, sections } from '../../shared/schema';
import { put, list } from '@vercel/blob';
import { eq } from 'drizzle-orm';

const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_fy8GdRLMhpGvIW7Y_Uvhws9tXqLX4Tj5X8A8BEOwsXsodyk";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const dashboardData = {
      timestamp: new Date().toISOString(),
      system: {
        status: 'operational',
        environment: process.env.NODE_ENV || 'development',
        vercel: {
          region: process.env.VERCEL_REGION || 'unknown',
          deployment: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'local'
        }
      },
      database: {
        status: 'unknown',
        provider: 'Neon Database (PostgreSQL)',
        connectionTest: false,
        statistics: {
          totalUsers: 0,
          totalStudents: 0,
          totalEnrollments: 0,
          totalSections: 0
        },
        lastError: null as string | null
      },
      blobStorage: {
        status: 'unknown',
        provider: 'Vercel Blob',
        tokenConfigured: !!BLOB_READ_WRITE_TOKEN,
        connectionTest: false,
        statistics: {
          totalFiles: 0,
          storageUsed: '0 MB'
        },
        lastError: null as string | null
      }
    };

    // Test Database Connection
    try {
      console.log('Testing database connection...');
      
      // Test basic connection
      const testQuery = await db.select().from(users).limit(1);
      dashboardData.database.connectionTest = true;
      dashboardData.database.status = 'connected';

      // Get database statistics
      const [allUsers, students, allEnrollments, allSections] = await Promise.all([
        db.select().from(users),
        db.select().from(users).where(eq(users.role, 'student')),
        db.select().from(enrollments),
        db.select().from(sections)
      ]);

      dashboardData.database.statistics = {
        totalUsers: allUsers.length,
        totalStudents: students.length,
        totalEnrollments: allEnrollments.length,
        totalSections: allSections.length
      };

      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      dashboardData.database.status = 'error';
      dashboardData.database.connectionTest = false;
      dashboardData.database.lastError = dbError instanceof Error ? dbError.message : 'Unknown database error';
    }

    // Test Blob Storage Connection
    try {
      console.log('Testing blob storage connection...');
      
      if (!BLOB_READ_WRITE_TOKEN) {
        throw new Error('BLOB_READ_WRITE_TOKEN not configured');
      }

      // Test blob storage by listing files
      const { blobs } = await list({
        prefix: 'school-files/',
        token: BLOB_READ_WRITE_TOKEN,
        limit: 100
      });

      dashboardData.blobStorage.connectionTest = true;
      dashboardData.blobStorage.status = 'connected';
      dashboardData.blobStorage.statistics.totalFiles = blobs.length;

      // Calculate approximate storage used
      const totalSize = blobs.reduce((sum, blob) => sum + (blob.size || 0), 0);
      dashboardData.blobStorage.statistics.storageUsed = formatBytes(totalSize);

      console.log('Blob storage connection successful');
    } catch (blobError) {
      console.error('Blob storage connection failed:', blobError);
      dashboardData.blobStorage.status = 'error';
      dashboardData.blobStorage.connectionTest = false;
      dashboardData.blobStorage.lastError = blobError instanceof Error ? blobError.message : 'Unknown blob storage error';
    }

    // Determine overall system status
    if (dashboardData.database.status === 'connected' && dashboardData.blobStorage.status === 'connected') {
      dashboardData.system.status = 'fully_operational';
    } else if (dashboardData.database.status === 'connected' || dashboardData.blobStorage.status === 'connected') {
      dashboardData.system.status = 'partially_operational';
    } else {
      dashboardData.system.status = 'degraded';
    }

    res.status(200).json(dashboardData);

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      error: 'Admin dashboard failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
