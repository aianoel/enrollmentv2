import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list, del } from '@vercel/blob';

// Set the blob token
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
    switch (req.method) {
      case 'POST':
        // Upload file to Vercel Blob
        const { filename, content, contentType = 'application/octet-stream' } = req.body;
        
        if (!filename || !content) {
          res.status(400).json({ error: 'Filename and content are required' });
          return;
        }

        // Convert base64 content to buffer if needed
        let fileBuffer: Buffer;
        if (typeof content === 'string') {
          // Assume base64 encoded content
          fileBuffer = Buffer.from(content, 'base64');
        } else {
          fileBuffer = Buffer.from(content);
        }

        // Upload to Vercel Blob with student/enrollment folder structure
        const blob = await put(`school-files/${filename}`, fileBuffer, {
          access: 'public',
          contentType,
          token: BLOB_READ_WRITE_TOKEN,
        });

        res.status(200).json({
          success: true,
          message: 'File uploaded successfully',
          url: blob.url,
          downloadUrl: blob.downloadUrl,
          pathname: blob.pathname,
          size: fileBuffer.length,
          uploadedAt: new Date().toISOString()
        });
        break;

      case 'GET':
        // List files in blob storage
        const { prefix = 'school-files/' } = req.query;
        
        const { blobs } = await list({
          prefix: prefix as string,
          token: BLOB_READ_WRITE_TOKEN,
        });

        res.status(200).json({
          success: true,
          files: blobs.map(blob => ({
            url: blob.url,
            downloadUrl: blob.downloadUrl,
            pathname: blob.pathname,
            size: blob.size,
            uploadedAt: blob.uploadedAt
          })),
          total: blobs.length
        });
        break;

      case 'DELETE':
        // Delete file from blob storage
        const { pathname } = req.query;
        
        if (!pathname) {
          res.status(400).json({ error: 'Pathname is required' });
          return;
        }

        await del(pathname as string, {
          token: BLOB_READ_WRITE_TOKEN,
        });

        res.status(200).json({
          success: true,
          message: 'File deleted successfully',
          pathname
        });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Blob storage error:', error);
    res.status(500).json({
      success: false,
      error: 'File operation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
