import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/db';
import { users, sections, enrollments, grades, roles } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Test database connection
    console.log('Testing database connection...');
    
    // Simple query to test connection
    const result = await db.select().from(users).limit(1);
    
    console.log('Database connection successful');
    
    res.status(200).json({
      success: true,
      message: 'Database connection established successfully',
      timestamp: new Date().toISOString(),
      connectionTest: 'passed',
      sampleQuery: result.length > 0 ? 'Data found' : 'No data yet'
    });
    
  } catch (error) {
    console.error('Database connection error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
