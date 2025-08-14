import { Router } from 'express';
import { adminStorage } from '../admin-storage';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// System settings schema
const SystemSettingsSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerImages: z.array(z.string()).optional(),
  organizationChartUrl: z.string().optional(),
  schoolYear: z.string().optional(),
  schoolName: z.string().optional(),
  schoolAddress: z.string().optional(),
  schoolMotto: z.string().optional(),
  principalMessage: z.string().optional(),
  visionStatement: z.string().optional(),
  missionStatement: z.string().optional(),
});

const SchoolYearSchema = z.object({
  year: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

// Get system settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await adminStorage.getSystemSettings();
    res.json(settings || {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#10b981',
      logoUrl: '',
      bannerImages: [],
      organizationChartUrl: '',
      schoolYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      schoolName: 'Your School Name',
      schoolAddress: '',
      schoolMotto: '',
      principalMessage: '',
      visionStatement: '',
      missionStatement: '',
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
});

// Update system settings
router.put('/settings', async (req, res) => {
  try {
    const validatedData = SystemSettingsSchema.parse(req.body);
    const updatedSettings = await adminStorage.updateSystemSettings(validatedData);
    
    // If school year is being updated, notify all students
    if (validatedData.schoolYear) {
      await adminStorage.createNotificationForAllUsers(
        'system',
        'School Year Updated',
        `The active school year has been changed to ${validatedData.schoolYear}. Your dashboard has been refreshed for the new academic year.`,
        'normal',
        ['student']
      );
    }
    
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({ error: 'Failed to update system settings' });
  }
});

// Upload images
router.post('/upload-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type } = req.body;
    const allowedTypes = ['logo', 'banner', 'organization-chart'];
    
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid image type' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Move file to permanent location
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${type}-${Date.now()}${fileExtension}`;
    const targetPath = path.join(uploadsDir, fileName);
    
    await fs.rename(req.file.path, targetPath);
    
    const imageUrl = `/uploads/${fileName}`;
    
    // Update system settings based on type
    const currentSettings = await adminStorage.getSystemSettings() || {};
    let updatedSettings: any = { ...currentSettings };
    
    switch (type) {
      case 'logo':
        updatedSettings.logoUrl = imageUrl;
        break;
      case 'banner':
        if (!updatedSettings.bannerImages) {
          updatedSettings.bannerImages = [];
        }
        updatedSettings.bannerImages.push(imageUrl);
        break;
      case 'organization-chart':
        updatedSettings.organizationChartUrl = imageUrl;
        break;
    }
    
    await adminStorage.updateSystemSettings(updatedSettings);
    
    res.json({ 
      message: 'Image uploaded successfully',
      url: imageUrl,
      type 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get school years
router.get('/school-years', async (req, res) => {
  try {
    const schoolYears = await adminStorage.getSchoolYears();
    res.json(schoolYears || []);
  } catch (error) {
    console.error('Error fetching school years:', error);
    res.status(500).json({ error: 'Failed to fetch school years' });
  }
});

// Create new school year
router.post('/school-years', async (req, res) => {
  try {
    const validatedData = SchoolYearSchema.parse(req.body);
    
    // Deactivate all existing school years
    await adminStorage.deactivateAllSchoolYears();
    
    // Create new school year
    const newSchoolYear = await adminStorage.createSchoolYear({
      ...validatedData,
      isActive: true
    });
    
    // Reset student dashboards for new school year
    await adminStorage.resetStudentDashboardsForNewYear(validatedData.year);
    
    // Notify all users about the new school year
    await adminStorage.createNotificationForAllUsers(
      'system',
      'New School Year Started',
      `Welcome to the ${validatedData.year} academic year! Student dashboards have been reset for the new year. Previous year data remains accessible in your history.`,
      'high',
      ['student', 'teacher', 'parent']
    );
    
    // Update system settings with new school year
    await adminStorage.updateSystemSettings({ schoolYear: validatedData.year });
    
    res.json(newSchoolYear);
  } catch (error) {
    console.error('Error creating school year:', error);
    res.status(500).json({ error: 'Failed to create school year' });
  }
});

// Get student historical data
router.get('/students/:studentId/history/:schoolYear', async (req, res) => {
  try {
    const { studentId, schoolYear } = req.params;
    
    const historyData = await adminStorage.getStudentHistoricalData(studentId, schoolYear);
    res.json(historyData || {
      grades: [],
      assignments: [],
      attendance: [],
      achievements: []
    });
  } catch (error) {
    console.error('Error fetching student historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

export { router as adminControlRouter };