import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../auth/jwt';
import { upload, validateFile, getFileUrl } from '../middleware/upload';
import { storage } from '../unified-storage';

const router = Router();

// Schema for module creation
const createModuleSchema = z.object({
  sectionId: z.string().transform(Number),
  title: z.string().min(1).max(255),
  description: z.string().optional()
});

// Upload module (Teacher only)
router.post('/', 
  requireAuth, 
  requireRole(['Teacher']), 
  upload.single('file'),
  async (req, res) => {
    try {
      const { sectionId, title, description } = createModuleSchema.parse(req.body);
      const teacherId = (req as any).user.id;

      // Validate file
      const fileError = validateFile(req.file, { 
        required: true,
        maxSize: 100 * 1024 * 1024, // 100MB for educational content
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'video/mp4',
          'video/avi',
          'video/quicktime',
          'text/plain'
        ]
      });

      if (fileError) {
        return res.status(400).json({ error: fileError });
      }

      // Create module record
      const moduleData = {
        teacherId,
        sectionId,
        title,
        description: description || '',
        fileUrl: getFileUrl(req.file!.path),
        fileName: req.file!.originalname,
        fileSize: req.file!.size,
        uploadedAt: new Date()
      };

      const moduleId = await storage.createModule(moduleData);

      // Send notifications to students in the section
      const students = await storage.getStudentsBySection(sectionId);
      for (const student of students) {
        await storage.createNotification({
          userId: student.id,
          title: 'New Learning Module Available',
          body: `${title} has been uploaded for your section`,
          type: 'module_upload',
          relatedId: moduleId
        });
      }

      res.status(201).json({
        id: moduleId,
        message: 'Module uploaded successfully',
        ...moduleData
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: error.errors 
        });
      }
      console.error('Module upload error:', error);
      res.status(500).json({ error: 'Failed to upload module' });
    }
  }
);

// Get modules for a section
router.get('/section/:sectionId', requireAuth, async (req, res) => {
  try {
    const sectionId = parseInt(req.params.sectionId);
    const user = (req as any).user;

    // Verify user has access to this section
    const hasAccess = await storage.verifyUserSectionAccess(user.id, sectionId, user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this section' });
    }

    const modules = await storage.getModulesBySection(sectionId);
    
    res.json(modules);

  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get all modules by teacher
router.get('/my-modules', 
  requireAuth, 
  requireRole(['Teacher']), 
  async (req, res) => {
    try {
      const teacherId = (req as any).user.id;
      const modules = await storage.getModulesByTeacher(teacherId);
      
      res.json(modules);

    } catch (error) {
      console.error('Get teacher modules error:', error);
      res.status(500).json({ error: 'Failed to fetch modules' });
    }
  }
);

// Delete module (Teacher only)
router.delete('/:id', 
  requireAuth, 
  requireRole(['Teacher']), 
  async (req, res) => {
    try {
      const moduleId = parseInt(req.params.id);
      const teacherId = (req as any).user.id;

      // Verify teacher owns this module
      const module = await storage.getModuleById(moduleId);
      if (!module || module.teacherId !== teacherId) {
        return res.status(404).json({ error: 'Module not found or access denied' });
      }

      await storage.deleteModule(moduleId);
      
      res.json({ message: 'Module deleted successfully' });

    } catch (error) {
      console.error('Delete module error:', error);
      res.status(500).json({ error: 'Failed to delete module' });
    }
  }
);

// Update module details (Teacher only)
router.patch('/:id', 
  requireAuth, 
  requireRole(['Teacher']), 
  async (req, res) => {
    try {
      const moduleId = parseInt(req.params.id);
      const teacherId = (req as any).user.id;
      const { title, description } = req.body;

      // Verify teacher owns this module
      const module = await storage.getModuleById(moduleId);
      if (!module || module.teacherId !== teacherId) {
        return res.status(404).json({ error: 'Module not found or access denied' });
      }

      const updateData: any = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;

      await storage.updateModule(moduleId, updateData);
      
      res.json({ message: 'Module updated successfully' });

    } catch (error) {
      console.error('Update module error:', error);
      res.status(500).json({ error: 'Failed to update module' });
    }
  }
);

export default router;