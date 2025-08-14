import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./unified-storage";
import { db } from "./db";
import bcrypt from "bcryptjs";

// SMS Service using Semaphore API
class SMSService {
  private apiKey = "ad7e27a483935c25d4960577a031a52e";
  private baseUrl = "https://api.semaphore.co";

  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Format phone number (ensure it starts with +63)
      const formattedPhone = phoneNumber.startsWith('+63') 
        ? phoneNumber 
        : phoneNumber.startsWith('09') 
          ? '+63' + phoneNumber.substring(1)
          : '+63' + phoneNumber;

      const response = await fetch(`${this.baseUrl}/api/v4/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apikey: this.apiKey,
          number: formattedPhone,
          message: message
        })
      });

      const result = await response.json();
      console.log("SMS API Response:", result);
      return response.ok;
    } catch (error) {
      console.error("SMS sending error:", error);
      return false;
    }
  }

  // Generate random password
  generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Create login credentials message
  createLoginMessage(email: string, password: string, name: string): string {
    return `Welcome to EduManage School System!\n\nHi ${name},\n\nYour enrollment is complete! Here are your login credentials:\n\nEmail: ${email}\nPassword: ${password}\n\nYou can now log in to access your student portal.\n\n- EduManage Team`;
  }
}

const smsService = new SMSService();

export function registerRoutes(app: Express): Server {
  const server = createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Convert role_id to role name for compatibility
      let roleName = 'user';
      switch (user.roleId) {
        case 1: roleName = 'admin'; break;
        case 2: roleName = 'principal'; break;
        case 3: roleName = 'academic_coordinator'; break;
        case 4: roleName = 'teacher'; break;
        case 5: roleName = 'student'; break;
        case 6: roleName = 'parent'; break;
        case 7: roleName = 'guidance'; break;
        case 8: roleName = 'registrar'; break;
        case 9: roleName = 'accounting'; break;
      }

      const responseUser = {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: roleName,
        roleId: user.roleId,
        isActive: true,
        createdAt: user.createdAt
      };

      res.json({ user: responseUser });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced Enrollment Routes
  app.post("/api/enrollment/applications", async (req, res) => {
    try {
      const { schoolYear, studentInfo } = req.body;
      
      // Generate automatic login credentials
      const timestamp = Date.now();
      const generatedPassword = smsService.generatePassword();
      const generatedEmail = `${studentInfo.firstName.toLowerCase()}.${studentInfo.lastName.toLowerCase()}.${timestamp}@student.edu`;
      
      // Hash the generated password
      const hashedPassword = await bcrypt.hash(generatedPassword, 12);
      
      // Create user account with generated credentials
      const user = await storage.createUser({
        roleId: 5, // Student role
        firstName: studentInfo.firstName,
        lastName: studentInfo.lastName,
        email: generatedEmail,
        passwordHash: hashedPassword,
        createdAt: new Date()
      });

      // Create enrollment application
      const application = await storage.createEnrollmentApplication({
        studentId: user.id,
        schoolYear,
        status: 'Submitted', // Set as submitted since SMS will be sent
        createdAt: new Date()
      });

      // Send SMS with login credentials if phone number is provided
      if (studentInfo.phoneNumber) {
        const studentName = `${studentInfo.firstName} ${studentInfo.lastName}`;
        const loginMessage = smsService.createLoginMessage(generatedEmail, generatedPassword, studentName);
        
        const smsSent = await smsService.sendSMS(studentInfo.phoneNumber, loginMessage);
        
        if (smsSent) {
          console.log(`SMS sent successfully to ${studentInfo.phoneNumber} for ${studentName}`);
        } else {
          console.error(`Failed to send SMS to ${studentInfo.phoneNumber} for ${studentName}`);
        }
      }

      res.status(201).json({ 
        id: application.id, 
        message: 'Enrollment application submitted successfully! Login credentials have been sent to your phone.',
        credentials: {
          email: generatedEmail,
          password: generatedPassword // Include in response as backup
        }
      });
    } catch (error) {
      console.error('Create enrollment error:', error);
      res.status(500).json({ error: 'Failed to create application' });
    }
  });

  app.patch("/api/enrollment/applications/:id/submit", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      
      // Update application status
      await storage.updateEnrollmentApplication(applicationId, {
        status: 'Submitted',
        submittedAt: new Date()
      });

      // Get application to update progress
      const application = await storage.getEnrollmentApplication(applicationId);
      if (application) {
        await storage.updateEnrollmentProgress(application.studentId, {
          applicationId,
          currentStatus: 'Submitted',
          remarks: 'Application submitted for review'
        });

        // Notify registrars
        const registrars = await storage.getUsersByRole('Registrar');
        for (const registrar of registrars) {
          await storage.createNotification({
            userId: registrar.id,
            title: 'New Enrollment Application',
            body: 'A new enrollment application has been submitted for review',
            type: 'enrollment_submitted',
            relatedId: applicationId
          });
        }
      }

      res.json({ message: 'Application submitted successfully' });
    } catch (error) {
      console.error('Submit application error:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  });

  // Announcements
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // News
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Sections
  app.get("/api/sections", async (req, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Teacher routes
  app.get("/api/teacher/sections", async (req, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching teacher sections:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/teacher/notifications", async (req, res) => {
    try {
      const notifications = [
        {
          id: 1,
          recipientId: 10,
          message: "New assignment due next week",
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ];
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching teacher notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/teacher/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching teacher tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/teacher/meetings", async (req, res) => {
    try {
      const meetings = await storage.getMeetings();
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching teacher meetings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Principal routes
  app.get("/api/principal/stats", async (req, res) => {
    try {
      const stats = await storage.getPrincipalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching principal statistics:", error);
      res.status(500).json({ error: "Failed to fetch principal statistics" });
    }
  });

  app.get("/api/principal/financial", async (req, res) => {
    try {
      const financial = await storage.getPrincipalFinancialData();
      res.json(financial);
    } catch (error) {
      console.error("Error fetching principal financial data:", error);
      res.status(500).json({ error: "Failed to fetch financial data" });
    }
  });

  // Academic Coordinator routes
  app.get("/api/academic/stats", async (req, res) => {
    try {
      const stats = await storage.getAcademicStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching academic statistics:", error);
      res.status(500).json({ error: "Failed to fetch academic statistics" });
    }
  });

  app.get("/api/academic/curriculum", async (req, res) => {
    try {
      const curriculum = await storage.getAcademicCurriculumData();
      res.json(curriculum);
    } catch (error) {
      console.error("Error fetching curriculum data:", error);
      res.status(500).json({ error: "Failed to fetch curriculum data" });
    }
  });

  app.get("/api/academic/teacher-performance", async (req, res) => {
    try {
      const performance = await storage.getAcademicTeacherPerformance();
      res.json(performance);
    } catch (error) {
      console.error("Error fetching teacher performance data:", error);
      res.status(500).json({ error: "Failed to fetch teacher performance data" });
    }
  });

  // Enhanced Academic Coordinator - Teachers API
  app.get("/api/academic/teachers", async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      const formattedTeachers = teachers.map(teacher => ({
        id: teacher.id,
        name: `${teacher.first_name} ${teacher.last_name}`,
        email: teacher.email,
        sectionsCount: parseInt(teacher.sections_count) || 0,
        subjectsCount: parseInt(teacher.subjects_count) || 0,
        tasksCount: parseInt(teacher.tasks_count) || 0,
        meetingsCount: parseInt(teacher.meetings_count) || 0,
        sections: teacher.sections || [],
        subjects: teacher.subjects || [],
        lastLogin: teacher.last_login,
        createdAt: teacher.created_at,
        status: teacher.last_login && new Date(teacher.last_login) > new Date(Date.now() - 7*24*60*60*1000) ? 'Active' : 'Inactive',
        profileImage: teacher.profile_image
      }));
      res.json(formattedTeachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/academic/teachers/stats", async (req, res) => {
    try {
      const stats = await storage.getTeacherPerformanceStats();
      res.json({
        totalTeachers: parseInt(stats.total_teachers) || 0,
        activeTeachers: parseInt(stats.active_teachers) || 0,
        totalTasks: parseInt(stats.total_tasks) || 0,
        totalMeetings: parseInt(stats.total_meetings) || 0,
        avgTaskScore: parseFloat(stats.avg_task_score) || 0,
        totalSubmissions: parseInt(stats.total_submissions) || 0,
        activityRate: stats.total_teachers > 0 ? (parseInt(stats.active_teachers) / parseInt(stats.total_teachers) * 100) : 0
      });
    } catch (error) {
      console.error("Error fetching teacher stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Teacher Assignment Routes
  app.post("/api/academic/teachers/:id/assign-section", async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      const { sectionId, isAdvisory } = req.body;
      
      await storage.assignTeacherToSection(teacherId, sectionId, isAdvisory);
      res.json({ success: true, message: isAdvisory ? "Advisory assigned successfully" : "Section assigned successfully" });
    } catch (error) {
      console.error("Error assigning teacher to section:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/academic/teachers/:id/assign-subject", async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      const { sectionId, subjectId } = req.body;
      
      await storage.assignTeacherSubject(teacherId, sectionId, subjectId);
      res.json({ success: true, message: "Subject assigned successfully" });
    } catch (error) {
      console.error("Error assigning teacher subject:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/academic/schedules", async (req, res) => {
    try {
      const scheduleData = req.body;
      const newSchedule = await storage.createSchedule(scheduleData);
      res.status(201).json(newSchedule);
    } catch (error) {
      console.error("Error creating schedule:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/academic/schedules", async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/academic/modules", async (req, res) => {
    try {
      const moduleData = req.body;
      const newModule = await storage.uploadModule(moduleData);
      res.status(201).json(newModule);
    } catch (error) {
      console.error("Error uploading module:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/academic/modules", async (req, res) => {
    try {
      const modules = await storage.getModules();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all sections and subjects for assignment dropdowns
  app.get("/api/academic/sections", async (req, res) => {
    try {
      const result = await db.execute(`
        SELECT 
          s.id, 
          s.name, 
          s.grade_level,
          COALESCE(u.first_name || ' ' || u.last_name, u.name) as adviser_name
        FROM sections s
        LEFT JOIN users u ON s.adviser_id = u.id
        ORDER BY s.grade_level, s.name
      `);
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/academic/subjects", async (req, res) => {
    try {
      const result = await db.execute(`SELECT * FROM subjects ORDER BY name`);
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Student routes
  app.get("/api/student/grades", async (req, res) => {
    try {
      const studentId = parseInt(req.query.studentId as string);
      if (studentId) {
        const grades = await storage.getGradesByStudent(studentId);
        res.json(grades);
      } else {
        const grades = await storage.getGrades();
        res.json(grades);
      }
    } catch (error) {
      console.error("Error fetching student grades:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Registrar routes (placeholder)
  app.get("/api/registrar/enrollment-requests", async (req, res) => {
    res.json([]);
  });

  app.get("/api/registrar/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/registrar/academic-records", async (req, res) => {
    res.json([]);
  });

  app.get("/api/registrar/graduation-candidates", async (req, res) => {
    res.json([]);
  });

  app.get("/api/registrar/transcript-requests", async (req, res) => {
    res.json([]);
  });

  app.get("/api/registrar/students", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const students = users.filter(user => user.roleId === 5).map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        section: "Not Assigned"
      }));
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Guidance routes (placeholder)
  app.get("/api/guidance/behavior-records", async (req, res) => {
    res.json([]);
  });

  app.get("/api/guidance/counseling-sessions", async (req, res) => {
    res.json([]);
  });

  app.get("/api/guidance/wellness-programs", async (req, res) => {
    res.json([]);
  });

  app.get("/api/guidance/students", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const students = users.filter(user => user.roleId === 5).map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }));
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Accounting routes (placeholder)
  app.get("/api/accounting/fee-structures", async (req, res) => {
    res.json([]);
  });

  app.get("/api/accounting/invoices", async (req, res) => {
    res.json([]);
  });

  app.get("/api/accounting/payments", async (req, res) => {
    try {
      const payments = await storage.getAllUsers(); // Placeholder
      res.json([]);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/accounting/scholarships", async (req, res) => {
    res.json([]);
  });

  app.get("/api/accounting/expenses", async (req, res) => {
    res.json([]);
  });

  app.get("/api/accounting/students", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const students = users.filter(user => user.roleId === 5).map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }));
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.roleId,
        isActive: true,
        createdAt: user.createdAt
      }));
      res.json(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const { name, email, role, password } = req.body;
      
      if (!name || !email || !role || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || 'User';

      // Map role names to role IDs
      let roleId = 1; // default to admin
      switch (role) {
        case 'admin': roleId = 1; break;
        case 'principal': roleId = 2; break;
        case 'academic_coordinator': roleId = 3; break;
        case 'teacher': roleId = 4; break;
        case 'student': roleId = 5; break;
        case 'parent': roleId = 6; break;
        case 'guidance': roleId = 7; break;
        case 'registrar': roleId = 8; break;
        case 'accounting': roleId = 9; break;
      }

      const newUser = await storage.createUser({
        roleId,
        firstName,
        lastName,
        email,
        passwordHash: hashedPassword,
      });

      const responseUser = {
        id: newUser.id,
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        role: newUser.roleId,
        isActive: true,
        createdAt: newUser.createdAt
      };

      res.status(201).json(responseUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // General API routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: 'user',
        isActive: true
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getPrincipalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/enrollments", async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentApplications();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/notifications/count", async (req, res) => {
    try {
      const recipientId = parseInt(req.query.recipientId as string);
      if (!recipientId) {
        return res.status(400).json({ error: "Recipient ID is required" });
      }
      
      const notifications = await storage.getNotifications(recipientId);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      res.json({ count: unreadCount });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/notifications", async (req, res) => {
    try {
      const recipientId = parseInt(req.query.recipientId as string);
      if (!recipientId) {
        return res.status(400).json({ error: "Recipient ID is required" });
      }
      
      const notifications = await storage.getNotifications(recipientId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chat API Routes
  app.get("/api/chat/conversations", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat/conversations", async (req, res) => {
    try {
      const { conversationType, memberIds } = req.body;
      
      if (!conversationType || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ error: "Conversation type and member IDs are required" });
      }
      
      // For private conversations, create a simple conversation ID
      if (conversationType === "private" && memberIds.length === 1) {
        // Get current user from session or authentication
        // For now, we'll pass the current user ID in the request body
        const currentUserId = req.body.currentUserId;
        const partnerId = memberIds[0];
        
        if (!currentUserId) {
          return res.status(400).json({ error: "Current user ID is required" });
        }
        
        // Create conversation ID in format conv_userId1_userId2 (smaller ID first for consistency)
        const id1 = Math.min(currentUserId, partnerId);
        const id2 = Math.max(currentUserId, partnerId);
        
        const conversation = {
          id: `conv_${id1}_${id2}`,
          conversationType: "private",
          createdAt: new Date().toISOString()
        };
        
        res.status(201).json(conversation);
      } else {
        res.status(400).json({ error: "Group conversations not yet implemented" });
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/chat/messages", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const partnerId = parseInt(req.query.partnerId as string);
      
      if (!userId || !partnerId) {
        return res.status(400).json({ error: "User ID and Partner ID are required" });
      }
      
      const messages = await storage.getConversationMessages(userId, partnerId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/chat/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = req.params.id;
      
      // For now, we'll use a simple approach where conversation ID is in format "conv_userId1_userId2"
      // Extract user IDs from conversation ID
      const parts = conversationId.split('_');
      if (parts.length < 3) {
        return res.status(400).json({ error: "Invalid conversation ID format" });
      }
      
      const userId1 = parseInt(parts[1]);
      const userId2 = parseInt(parts[2]);
      
      if (!userId1 || !userId2) {
        return res.status(400).json({ error: "Invalid user IDs in conversation" });
      }
      
      const messages = await storage.getConversationMessages(userId1, userId2);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    try {
      const { senderId, recipientId, messageText, content, conversationId } = req.body;
      const messageContent = messageText || content;
      
      if (!senderId || !recipientId || !messageContent) {
        return res.status(400).json({ error: "Sender ID, Recipient ID, and message content are required" });
      }
      
      const message = await storage.createMessage({
        senderId,
        recipientId,
        messageText: messageContent
      });
      
      // Emit the message via Socket.IO for real-time updates
      const sender = await storage.getUser(senderId);
      const recipient = await storage.getUser(recipientId);
      
      // Send to specific recipient room for targeted notifications
      io.to(`user_${recipientId}`).emit("new_message", {
        ...message,
        senderName: sender ? `${sender.firstName} ${sender.lastName}` : 'Unknown',
        recipientName: recipient ? `${recipient.firstName} ${recipient.lastName}` : 'Unknown'
      });
      
      // Also emit to sender for confirmation
      io.to(`user_${senderId}`).emit("message_sent", {
        ...message,
        senderName: sender ? `${sender.firstName} ${sender.lastName}` : 'Unknown',
        recipientName: recipient ? `${recipient.firstName} ${recipient.lastName}` : 'Unknown'
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/chat/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Return users without password hash for security
      const safeUsers = users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: 'user',
        isActive: true
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching chat users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/chat/online-users", async (req, res) => {
    try {
      const onlineUsers = await storage.getOnlineUsers();
      res.json(onlineUsers);
    } catch (error) {
      console.error("Error fetching online users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/chat/user-status", async (req, res) => {
    try {
      const { userId, isOnline } = req.body;
      
      if (!userId || typeof isOnline !== 'boolean') {
        return res.status(400).json({ error: "User ID and online status are required" });
      }
      
      await storage.updateUserOnlineStatus(userId, isOnline);
      
      // Emit status update via Socket.IO
      io.emit("user_status_update", { userId, isOnline });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Socket.io for real-time features
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user joining with their ID
    socket.on('join_user', async (userId) => {
      socket.join(`user_${userId}`);
      await storage.updateUserOnlineStatus(userId, true);
      
      // Broadcast that user is online
      io.emit('user_status_update', { userId, isOnline: true });
      console.log(`User ${userId} joined and is now online`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const message = await storage.createMessage(data);
        const sender = await storage.getUser(data.senderId);
        
        // Emit to recipient
        io.to(`user_${data.recipientId}`).emit('new_message', {
          ...message,
          senderName: sender?.name || 'Unknown'
        });
        
        // Confirm to sender
        socket.emit('message_sent', message);
      } catch (error) {
        console.error('Error handling socket message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      io.to(`user_${data.recipientId}`).emit('user_typing', {
        userId: data.senderId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      io.to(`user_${data.recipientId}`).emit('user_typing', {
        userId: data.senderId,
        isTyping: false
      });
    });

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return server;
}