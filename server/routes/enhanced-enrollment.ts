import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../auth/jwt';
import { upload, validateFile, getFileUrl } from '../middleware/upload';
import { storage } from '../unified-storage';

const router = Router();

// Schema for enrollment application
const createApplicationSchema = z.object({
  schoolYear: z.string(),
  studentInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    birthDate: z.string(),
    address: z.string().min(1),
    parentContact: z.string().min(1)
  })
});

// Create enrollment application (Student/Parent)
router.post('/applications', 
  requireAuth, 
  requireRole(['Student', 'Parent']), 
  async (req, res) => {
    try {
      const { schoolYear, studentInfo } = createApplicationSchema.parse(req.body);
      const userId = (req as any).user.id;

      // Create application
      const application = await storage.createEnrollmentApplication({
        studentId: userId,
        schoolYear,
        status: 'Draft',
        createdAt: new Date()
      });

      // Update enrollment progress
      await storage.updateEnrollmentProgress(userId, {
        applicationId: application.id,
        currentStatus: 'Draft',
        remarks: 'Application created'
      });

      res.status(201).json({
        id: application.id,
        message: 'Enrollment application created successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: error.errors 
        });
      }
      console.error('Create enrollment error:', error);
      res.status(500).json({ error: 'Failed to create application' });
    }
  }
);

// Upload enrollment documents
router.post('/applications/:id/documents', 
  requireAuth, 
  requireRole(['Student', 'Parent']), 
  upload.array('documents', 5),
  async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const { docType } = req.body;

      // Verify application ownership
      const application = await storage.getEnrollmentApplication(applicationId);
      if (!application || application.studentId !== userId) {
        return res.status(404).json({ error: 'Application not found or access denied' });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No documents uploaded' });
      }

      // Process each document
      const documents = [];
      for (const file of files) {
        const fileError = validateFile(file, {
          required: true,
          allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
          maxSize: 10 * 1024 * 1024 // 10MB
        });

        if (fileError) {
          return res.status(400).json({ error: fileError });
        }

        const document = await storage.createEnrollmentDocument({
          applicationId,
          docType: docType || 'General',
          fileUrl: getFileUrl(file.path),
          uploadedAt: new Date()
        });

        documents.push(document);
      }

      // Update progress
      await storage.updateEnrollmentProgress(userId, {
        applicationId,
        currentStatus: 'Pending Documents',
        remarks: `${documents.length} document(s) uploaded`
      });

      res.json({
        message: 'Documents uploaded successfully',
        documents
      });

    } catch (error) {
      console.error('Upload documents error:', error);
      res.status(500).json({ error: 'Failed to upload documents' });
    }
  }
);

// Submit application for review
router.patch('/applications/:id/submit', 
  requireAuth, 
  requireRole(['Student', 'Parent']), 
  async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const userId = (req as any).user.id;

      // Verify application ownership
      const application = await storage.getEnrollmentApplication(applicationId);
      if (!application || application.studentId !== userId) {
        return res.status(404).json({ error: 'Application not found or access denied' });
      }

      // Update application status
      await storage.updateEnrollmentApplication(applicationId, {
        status: 'Submitted',
        submittedAt: new Date()
      });

      // Update progress
      await storage.updateEnrollmentProgress(userId, {
        applicationId,
        currentStatus: 'Submitted',
        remarks: 'Application submitted for review'
      });

      // Notify registrar
      const registrars = await storage.getUsersByRole('Registrar');
      for (const registrar of registrars) {
        await storage.createNotification({
          userId: registrar.id,
          title: 'New Enrollment Application',
          body: `A new enrollment application has been submitted for review`,
          type: 'enrollment_submitted',
          relatedId: applicationId
        });
      }

      res.json({ message: 'Application submitted successfully' });

    } catch (error) {
      console.error('Submit application error:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  }
);

// Get enrollment progress (Student/Parent)
router.get('/progress/me', 
  requireAuth, 
  requireRole(['Student', 'Parent']), 
  async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const progress = await storage.getEnrollmentProgress(userId);
      
      res.json(progress || { status: 'No application found' });

    } catch (error) {
      console.error('Get enrollment progress error:', error);
      res.status(500).json({ error: 'Failed to fetch progress' });
    }
  }
);

// Review enrollment applications (Registrar/Admin)
router.get('/applications', 
  requireAuth, 
  requireRole(['Registrar', 'Admin']), 
  async (req, res) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const applications = await storage.getEnrollmentApplications({
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      res.json(applications);

    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }
);

// Approve/Reject application (Registrar/Admin)
router.patch('/applications/:id/decision', 
  requireAuth, 
  requireRole(['Registrar', 'Admin']), 
  async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { decision, remarks } = req.body;
      const reviewerId = (req as any).user.id;

      if (!['Approved', 'Rejected'].includes(decision)) {
        return res.status(400).json({ error: 'Invalid decision. Must be Approved or Rejected' });
      }

      // Update application
      await storage.updateEnrollmentApplication(applicationId, {
        status: decision,
        decidedAt: new Date(),
        decidedBy: reviewerId,
        remarks
      });

      // Get application to notify student
      const application = await storage.getEnrollmentApplication(applicationId);
      if (application) {
        // Update progress
        await storage.updateEnrollmentProgress(application.studentId, {
          applicationId,
          currentStatus: decision,
          remarks: remarks || `Application ${decision.toLowerCase()}`
        });

        // Notify student
        await storage.createNotification({
          userId: application.studentId,
          title: `Enrollment Application ${decision}`,
          body: `Your enrollment application has been ${decision.toLowerCase()}${remarks ? ': ' + remarks : ''}`,
          type: 'enrollment_decision',
          relatedId: applicationId
        });
      }

      res.json({ message: `Application ${decision.toLowerCase()} successfully` });

    } catch (error) {
      console.error('Application decision error:', error);
      res.status(500).json({ error: 'Failed to process decision' });
    }
  }
);

export default router;