import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../server/db';
import { users } from '../shared/schema';

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, url } = req;
    console.log(`${method} ${url}`);

    // Test database connection
    let dbStatus = 'unknown';
    let userCount = 0;
    
    try {
      const result = await db.select().from(users).limit(1);
      dbStatus = 'connected';
      
      // Get total user count for dashboard info
      const countResult = await db.select().from(users);
      userCount = countResult.length;
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      dbStatus = 'error';
    }

    // API response with database status
    res.status(200).json({
      message: 'School Enrollment Management System API',
      status: 'running',
      database: {
        status: dbStatus,
        totalUsers: userCount,
        provider: 'Neon Database (PostgreSQL)'
      },
      endpoints: {
        students: '/api/students',
        enrollments: '/api/enrollments',
        database: '/api/db/init',
        fileUpload: '/api/upload',
        studentDocuments: '/api/students/documents?studentId=123',
        adminDashboard: '/api/admin/dashboard',
        adminSettings: '/api/admin/settings'
      },
      storage: {
        provider: 'Vercel Blob',
        status: 'configured',
        features: ['file upload', 'document management', 'public access']
      },
      method,
      url,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
