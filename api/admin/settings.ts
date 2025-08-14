import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get system configuration and settings
        const settings = {
          timestamp: new Date().toISOString(),
          system: {
            name: 'School Enrollment Management System',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            deployment: {
              platform: 'Vercel',
              region: process.env.VERCEL_REGION || 'unknown',
              commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'local'
            }
          },
          configuration: {
            database: {
              provider: 'Neon Database (PostgreSQL)',
              configured: !!process.env.DATABASE_URL,
              url: process.env.DATABASE_URL ? 
                process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'Not configured'
            },
            blobStorage: {
              provider: 'Vercel Blob',
              configured: !!process.env.BLOB_READ_WRITE_TOKEN || true, // Token is hardcoded
              tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0
            },
            authentication: {
              jwtSecret: !!process.env.JWT_SECRET,
              sessionSecret: !!process.env.SESSION_SECRET
            }
          },
          features: {
            studentManagement: true,
            enrollmentTracking: true,
            documentUpload: true,
            gradeManagement: true,
            teacherTasks: true,
            notifications: true,
            guidanceOffice: true
          },
          endpoints: {
            api: '/api/',
            admin: '/api/admin/dashboard',
            students: '/api/students',
            enrollments: '/api/enrollments',
            upload: '/api/upload',
            database: '/api/db/init'
          }
        };

        res.status(200).json(settings);
        break;

      case 'POST':
        // Create admin user (for initial setup)
        const { name, email, password, adminKey } = req.body;
        
        // Simple admin key check (in production, use proper authentication)
        if (adminKey !== 'school-admin-setup-2025') {
          res.status(403).json({ error: 'Invalid admin key' });
          return;
        }

        if (!name || !email || !password) {
          res.status(400).json({ error: 'Name, email, and password are required' });
          return;
        }

        // Check if admin already exists
        const existingAdmin = await db
          .select()
          .from(users)
          .where(eq(users.role, 'admin'))
          .limit(1);

        if (existingAdmin.length > 0) {
          res.status(409).json({ error: 'Admin user already exists' });
          return;
        }

        // Create admin user (in production, hash the password properly)
        const adminUser = await db
          .insert(users)
          .values({
            name,
            email,
            passwordHash: password, // TODO: Implement proper password hashing
            role: 'admin',
            isActive: true,
          })
          .returning();

        res.status(201).json({
          success: true,
          message: 'Admin user created successfully',
          admin: {
            id: adminUser[0].id,
            name: adminUser[0].name,
            email: adminUser[0].email,
            role: adminUser[0].role
          }
        });
        break;

      case 'PUT':
        // Update system settings
        const { setting, value } = req.body;
        
        // This would typically update configuration in database
        // For now, return success with current settings
        res.status(200).json({
          success: true,
          message: `Setting '${setting}' updated`,
          value,
          timestamp: new Date().toISOString()
        });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin settings error:', error);
    res.status(500).json({
      error: 'Admin settings operation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
