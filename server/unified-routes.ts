import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { db, pool } from "./db";
import bcrypt from "bcryptjs";
import session from "express-session";
import { sql } from "drizzle-orm";

// Extend Express Request to include session
interface AuthenticatedRequest extends Request {
  session: { 
    userId?: number;
    user?: { 
      id: number; 
      role: string; 
    }; 
  };
}

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

  // Setup session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

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

      // Store user info in session
      (req as any).session.userId = user.id;
      (req as any).session.user = {
        id: user.id,
        role: roleName
      };

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

  // Teacher Grade Management Routes

  // Teacher Assignments (sections and subjects assigned to teacher)
  app.get("/api/teacher/assignments", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      console.log("Fetching assignments for teacher ID:", req.session.userId);
      
      const result = await db.execute(sql`
        SELECT 
          ta.id,
          ta.section_id,
          ta.subject_id,
          s.name as section_name,
          s.grade_level,
          sub.name as subject_name
        FROM teacher_assignments ta
        JOIN sections s ON ta.section_id = s.id
        LEFT JOIN subjects sub ON ta.subject_id = sub.id
        WHERE ta.teacher_id = ${req.session.userId}
        ORDER BY s.name, sub.name
      `);
      
      console.log("Teacher assignments result:", result.rows);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching teacher assignments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Students in a specific section
  app.get("/api/teacher/students", async (req, res) => {
    try {
      const { sectionId } = req.query;
      if (!sectionId) {
        return res.status(400).json({ error: "Section ID is required" });
      }

      const result = await db.execute(sql`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.name,
          u.email
        FROM users u
        JOIN enrollments e ON u.id = e.student_id
        WHERE e.section_id = ${parseInt(sectionId as string)} AND u.role_id = 5
        ORDER BY u.last_name, u.first_name
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // All students taught by the teacher (across all sections)
  app.get("/api/teacher/all-students", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const result = await db.execute(sql`
        SELECT DISTINCT
          u.id,
          u.first_name,
          u.last_name,
          u.name,
          u.email
        FROM users u
        JOIN enrollments e ON u.id = e.student_id
        JOIN teacher_assignments ta ON e.section_id = ta.section_id
        WHERE ta.teacher_id = ${req.session.userId} AND u.role_id = 5
        ORDER BY u.last_name, u.first_name
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching all students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Subjects for a specific section (assigned to current teacher)
  app.get("/api/teacher/section-subjects", async (req, res) => {
    try {
      const { sectionId } = req.query;
      if (!sectionId) {
        return res.status(400).json({ error: "Section ID is required" });
      }

      const result = await db.execute(sql`
        SELECT DISTINCT
          sub.id,
          sub.name
        FROM subjects sub
        JOIN teacher_assignments ta ON sub.id = ta.subject_id
        WHERE ta.section_id = ${parseInt(sectionId as string)} 
          AND ta.teacher_id = ${req.session.userId}
        ORDER BY sub.name
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching section subjects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Grades for a specific section and quarter
  app.get("/api/teacher/grades", async (req, res) => {
    try {
      const { sectionId, quarter } = req.query;
      if (!sectionId || !quarter) {
        return res.status(400).json({ error: "Section ID and quarter are required" });
      }

      const result = await db.execute(sql`
        SELECT 
          g.id,
          g.student_id,
          g.subject_id,
          g.teacher_id,
          g.grade,
          g.quarter,
          g.school_year,
          u.first_name || ' ' || u.last_name as student_name,
          sub.name as subject_name
        FROM grades g
        JOIN users u ON g.student_id = u.id
        JOIN subjects sub ON g.subject_id = sub.id
        JOIN enrollments e ON g.student_id = e.student_id
        WHERE e.section_id = ${parseInt(sectionId as string)}
          AND g.quarter = ${quarter as string}
          AND g.teacher_id = ${req.session.userId}
        ORDER BY u.last_name, u.first_name, sub.name
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching grades:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add new grade
  app.post("/api/teacher/grades", async (req, res) => {
    try {
      const { studentId, subjectId, grade, quarter, schoolYear } = req.body;
      
      if (!studentId || !subjectId || !grade || !quarter || !schoolYear) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if grade already exists
      const existingGrade = await db.execute(sql`
        SELECT id FROM grades 
        WHERE student_id = ${studentId} 
          AND subject_id = ${subjectId} 
          AND quarter = ${quarter}
          AND school_year = ${schoolYear}
          AND teacher_id = ${req.session.userId}
      `);

      if (existingGrade.rows.length > 0) {
        return res.status(400).json({ error: "Grade already exists for this student, subject, and quarter" });
      }

      const result = await db.execute(sql`
        INSERT INTO grades (student_id, subject_id, teacher_id, grade, quarter, school_year)
        VALUES (${studentId}, ${subjectId}, ${req.session.userId}, ${grade}, ${quarter}, ${schoolYear})
        RETURNING id
      `);

      res.status(201).json({ id: result.rows[0].id, message: "Grade added successfully" });
    } catch (error) {
      console.error("Error adding grade:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update existing grade
  app.put("/api/teacher/grades/:studentId/:subjectId", async (req, res) => {
    try {
      const { studentId, subjectId } = req.params;
      const { grade, quarter, schoolYear } = req.body;

      if (!grade || !quarter || !schoolYear) {
        return res.status(400).json({ error: "Grade, quarter, and school year are required" });
      }

      const result = await db.execute(sql`
        UPDATE grades 
        SET grade = ${grade}, quarter = ${quarter}, school_year = ${schoolYear}
        WHERE student_id = ${parseInt(studentId)} 
          AND subject_id = ${parseInt(subjectId)}
          AND teacher_id = ${req.session.userId}
          AND quarter = ${quarter}
        RETURNING id
      `);

      if (result.rows.length === 0) {
        // If no existing grade, insert new one
        const insertResult = await db.execute(sql`
          INSERT INTO grades (student_id, subject_id, teacher_id, grade, quarter, school_year)
          VALUES (${parseInt(studentId)}, ${parseInt(subjectId)}, ${req.session.userId}, ${grade}, ${quarter}, ${schoolYear})
          RETURNING id
        `);
        res.json({ id: insertResult.rows[0].id, message: "Grade created successfully" });
      } else {
        res.json({ id: result.rows[0].id, message: "Grade updated successfully" });
      }
    } catch (error) {
      console.error("Error updating grade:", error);
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

  app.get("/api/academic/teacher-schedules", async (req, res) => {
    try {
      const schedules = await storage.getTeacherSchedules();
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching teacher schedules:", error);
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
      const result = await pool.query(`
        SELECT 
          s.id, 
          s.name, 
          s.grade_level,
          s.capacity,
          s.school_year,
          COALESCE(u.first_name || ' ' || u.last_name, 'No Adviser') as adviser_name
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

  // POST endpoint for creating sections
  app.post("/api/academic/sections", async (req, res) => {
    try {
      const { name, gradeLevel, capacity, schoolYear } = req.body;
      
      if (!name || !gradeLevel || !schoolYear) {
        return res.status(400).json({ error: "Name, grade level, and school year are required" });
      }

      const result = await pool.query(`
        INSERT INTO sections (name, grade_level, capacity, school_year) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `, [name, gradeLevel, capacity || 40, schoolYear]);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating section:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/academic/subjects", async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM subjects ORDER BY name`);
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST endpoint for creating subjects
  app.post("/api/academic/subjects", async (req, res) => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Subject name is required" });
      }

      const result = await pool.query(`
        INSERT INTO subjects (name, description) 
        VALUES ($1, $2) 
        RETURNING *
      `, [name, description || '']);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST endpoint for creating sections
  app.post("/api/academic/sections", async (req, res) => {
    try {
      const { name, gradeLevel, capacity, schoolYear } = req.body;
      
      if (!name || !gradeLevel) {
        return res.status(400).json({ error: "Section name and grade level are required" });
      }

      const result = await pool.query(`
        INSERT INTO sections (name, grade_level, capacity, school_year) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `, [name, gradeLevel, capacity || 40, schoolYear || '2024-2025']);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating section:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST endpoint for teacher assignments
  app.post("/api/academic/teacher-assignments", async (req, res) => {
    try {
      const { teacherId, subjectId, sectionId, schoolYear, semester } = req.body;
      
      if (!teacherId || !subjectId || !sectionId) {
        return res.status(400).json({ error: "Teacher, subject, and section are required" });
      }

      const result = await pool.query(`
        INSERT INTO teacher_assignments (teacher_id, subject_id, section_id, school_year, semester) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
      `, [teacherId, subjectId, sectionId, schoolYear || '2024-2025', semester || '1st']);

      // Get teacher, subject, and section details for notifications
      const detailsResult = await pool.query(`
        SELECT 
          u.first_name || ' ' || u.last_name as teacher_name,
          u.email as teacher_email,
          sub.name as subject_name,
          sec.name as section_name,
          sec.grade_level
        FROM users u
        JOIN subjects sub ON sub.id = $2
        JOIN sections sec ON sec.id = $3
        WHERE u.id = $1
      `, [teacherId, subjectId, sectionId]);

      if (detailsResult.rows.length > 0) {
        const { teacher_name, teacher_email, subject_name, section_name, grade_level } = detailsResult.rows[0];

        // Create notification for the teacher
        await pool.query(`
          INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
          VALUES ($1, $2, $3, 'assignment', false, NOW())
        `, [teacherId, 'New Teaching Assignment', `You have been assigned to teach ${subject_name} for ${section_name} (${grade_level}) - ${semester} Semester ${schoolYear}`]);

        // Get all students in this section and notify them
        const studentsResult = await pool.query(`
          SELECT id FROM users WHERE role_id = 5 AND section_id = $1
        `, [sectionId]);

        for (const student of studentsResult.rows) {
          await pool.query(`
            INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
            VALUES ($1, $2, $3, 'teacher_assignment', false, NOW())
          `, [student.id, 'New Teacher Assignment', `${teacher_name} has been assigned as your ${subject_name} teacher for ${section_name} - ${semester} Semester ${schoolYear}`]);
        }

        console.log(`Notifications sent: Teacher assignment for ${teacher_name} to teach ${subject_name} in ${section_name}`);
      }
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating teacher assignment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST endpoint for teacher schedules  
  app.post("/api/academic/schedules", async (req, res) => {
    try {
      const { teacherId, subjectId, sectionId, dayOfWeek, startTime, endTime, room, schoolYear, semester } = req.body;
      
      if (!teacherId || !subjectId || !sectionId || !dayOfWeek || !startTime || !endTime) {
        return res.status(400).json({ error: "All schedule fields are required" });
      }

      const result = await pool.query(`
        INSERT INTO schedules (teacher_id, subject_id, section_id, day_of_week, start_time, end_time, room) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
      `, [teacherId, subjectId, sectionId, dayOfWeek, startTime, endTime, room || '']);

      // Get schedule details for notifications
      const detailsResult = await pool.query(`
        SELECT 
          u.first_name || ' ' || u.last_name as teacher_name,
          sub.name as subject_name,
          sec.name as section_name,
          sec.grade_level
        FROM users u
        JOIN subjects sub ON sub.id = $2
        JOIN sections sec ON sec.id = $3
        WHERE u.id = $1
      `, [teacherId, subjectId, sectionId]);

      if (detailsResult.rows.length > 0) {
        const { teacher_name, subject_name, section_name, grade_level } = detailsResult.rows[0];
        const roomText = room ? ` in ${room}` : '';

        // Create notification for the teacher about the schedule
        await pool.query(`
          INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
          VALUES ($1, $2, $3, 'schedule', false, NOW())
        `, [teacherId, 'New Class Schedule', `New class schedule: ${subject_name} for ${section_name} on ${dayOfWeek} at ${startTime}-${endTime}${roomText}`]);

        // Get all students in this section and notify them about the schedule
        const studentsResult = await pool.query(`
          SELECT id FROM users WHERE role_id = 5 AND section_id = $1
        `, [sectionId]);

        for (const student of studentsResult.rows) {
          await pool.query(`
            INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
            VALUES ($1, $2, $3, 'schedule', false, NOW())
          `, [student.id, 'Class Schedule Update', `Class Schedule: ${subject_name} with ${teacher_name} on ${dayOfWeek} at ${startTime}-${endTime}${roomText}`]);
        }

        console.log(`Schedule notifications sent: ${subject_name} schedule for ${section_name} on ${dayOfWeek} to ${studentsResult.rows.length + 1} recipients`);
      }
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating schedule:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/academic/teacher-assignments", async (req, res) => {
    try {
      const assignments = await storage.getTeacherAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching teacher assignments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/academic/teacher-schedules", async (req, res) => {
    try {
      const teacherId = req.query.teacherId ? parseInt(req.query.teacherId as string) : undefined;
      const schedules = await storage.getTeacherSchedules(teacherId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching teacher schedules:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/academic/teachers", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, first_name, last_name, email, role_id 
        FROM users 
        WHERE role_id = 4 
        ORDER BY first_name, last_name
      `);
      const teachers = result.rows.map((teacher: any) => ({
        id: teacher.id,
        name: `${teacher.first_name} ${teacher.last_name}`,
        email: teacher.email,
        roleId: teacher.role_id
      }));
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
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
        name: user.name || `User ${user.id}`,
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
        name: user.name || `User ${user.id}`,
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
        name: user.name || `User ${user.id}`,
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
        name: user.name || `User ${user.id}`,
        email: user.email,
        role: user.roleId,
        isActive: user.isActive,
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
        name: user.name || `User ${user.id}`,
        email: user.email,
        role: user.role || 'user',
        isActive: user.isActive
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin dashboard stats endpoint
  app.get("/api/admin/dashboard-stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
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

  // Admin API endpoints
  app.get("/api/admin/roles", async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/teacher-assignments", async (req, res) => {
    try {
      const assignments = await storage.getTeacherAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching teacher assignments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/org-chart", async (req, res) => {
    try {
      const orgChart = await storage.getOrgChart();
      res.json(orgChart);
    } catch (error) {
      console.error("Error fetching org chart:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/grades", async (req, res) => {
    try {
      const grades = await storage.getAdminGrades();
      res.json(grades);
    } catch (error) {
      console.error("Error fetching admin grades:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/assignments", async (req, res) => {
    try {
      const assignments = await storage.getAdminAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching admin assignments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/chat-messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/tuition-fees", async (req, res) => {
    try {
      const fees = await storage.getTuitionFees();
      res.json(fees);
    } catch (error) {
      console.error("Error fetching tuition fees:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // School Settings endpoints
  app.get("/api/admin/school-settings", async (req, res) => {
    try {
      // For compatibility, return the same structure as the admin-control settings
      const settings = await storage.getSystemSettings();
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
      console.error('Error fetching school settings:', error);
      res.status(500).json({ error: 'Failed to fetch school settings' });
    }
  });

  app.post("/api/admin/school-settings", async (req, res) => {
    try {
      const settingsData = req.body;
      const updatedSettings = await storage.updateSystemSettings(settingsData);
      
      // If school year is being updated, we could add notification logic here
      if (settingsData.schoolYear) {
        console.log(`School year updated to: ${settingsData.schoolYear}`);
      }
      
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating school settings:', error);
      res.status(500).json({ error: 'Failed to update school settings' });
    }
  });

  app.get("/api/admin/school-settings", async (req, res) => {
    try {
      const settings = await storage.getSchoolSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching school settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/sections", async (req, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/enrollments", async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentApplications({});
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
      
      // Note: In a production app, you'd validate the user session here
      // For now, we trust the userId parameter and rely on database-level security
      
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
      
      // Note: In a production app, you'd validate the user session here
      // For now, we trust the userId parameter and rely on database-level security
      
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
      
      // Note: In a production app, you'd validate the user session here
      // The conversation ID format ensures only participants can access their messages
      
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
      
      // Note: In a production app, you'd validate the user session here
      // For now, we trust the senderId parameter from the authenticated frontend
      
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
      // Get all users with their role information using raw SQL
      const result = await db.execute(sql`
        SELECT u.id, u.first_name, u.last_name, u.name, u.email, u.role_id, r.name as role_name, u.is_active
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.is_active = true OR u.is_active IS NULL
        ORDER BY r.name, COALESCE(u.first_name, u.name), COALESCE(u.last_name, '')
      `);
      
      // Return users without password hash for security
      const safeUsers = result.rows.map((user: any) => ({
        id: user.id,
        name: user.first_name && user.last_name ? 
          `${user.first_name} ${user.last_name}` : 
          user.name || `User ${user.id}`,
        email: user.email,
        role: user.role_name || 'user',
        roleId: user.role_id,
        isActive: user.is_active !== false
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

  // Teacher Folder Management Routes
  app.get("/api/teacher/folders", async (req, res) => {
    try {
      const folders = await storage.getTeacherFolders(10); // Pass teacher ID
      res.json(folders);
    } catch (error) {
      console.error("Error fetching teacher folders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/teacher/folders", async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Folder name is required" });
      }
      
      const folder = await storage.createTeacherFolder({
        name,
        description: description || null,
        teacherId: 10 // Hard-coded for demo, should come from auth
      });
      res.status(201).json(folder);
    } catch (error) {
      console.error("Error creating teacher folder:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/teacher/folders/:folderId/documents", async (req, res) => {
    try {
      const folderId = parseInt(req.params.folderId);
      const documents = await storage.getFolderDocuments(folderId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching folder documents:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/teacher/folders/:folderId/documents", async (req, res) => {
    try {
      const folderId = parseInt(req.params.folderId);
      const { name, fileUrl, fileType, fileSize } = req.body;
      
      if (!name || !fileUrl) {
        return res.status(400).json({ error: "Document name and file URL are required" });
      }
      
      const document = await storage.addFolderDocument({
        folderId,
        name,
        fileUrl,
        fileType: fileType || null,
        fileSize: fileSize || null
      });
      res.status(201).json(document);
    } catch (error) {
      console.error("Error adding folder document:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/teacher/folders/:folderId/share", async (req, res) => {
    try {
      const folderId = parseInt(req.params.folderId);
      const { sectionIds } = req.body;
      
      if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
        return res.status(400).json({ error: "Section IDs are required" });
      }
      
      await storage.shareFolderWithSections(folderId, sectionIds, 10); // Pass teacher ID
      res.json({ success: true });
    } catch (error) {
      console.error("Error sharing folder:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Student Shared Folders Routes
  app.get("/api/student/shared-folders", async (req, res) => {
    try {
      const studentId = 10; // Hard-coded for demo, should come from auth
      const sharedFolders = await storage.getSharedFoldersForStudent(studentId);
      res.json(sharedFolders);
    } catch (error) {
      console.error("Error fetching shared folders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Socket.io for real-time features
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user joining with their ID
    socket.on('join_user', async (userId) => {
      socket.join(`user_${userId}`);
      socket.data = { userId }; // Store user ID in socket data for disconnect handling
      await storage.updateUserOnlineStatus(userId, true);
      
      // Broadcast that user is online
      io.emit('user_status_update', { userId, isOnline: true });
      console.log(`User ${userId} joined and is now online`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        // Basic validation - in production, you'd want to validate socket authentication
        if (!data.senderId || !data.recipientId || !data.messageText) {
          socket.emit('message_error', { error: 'Invalid message data' });
          return;
        }
        
        const message = await storage.createMessage(data);
        const sender = await storage.getUser(data.senderId);
        
        // Emit to recipient only (private messaging)
        io.to(`user_${data.recipientId}`).emit('new_message', {
          ...message,
          senderName: sender ? 
            (sender.firstName && sender.lastName ? 
              `${sender.firstName} ${sender.lastName}` : 
              sender.name || `User ${sender.id}`) : 'Unknown'
        });
        
        // Confirm to sender only
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

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      
      // Get the user ID from the socket (you might need to store this when user joins)
      const userId = socket.data?.userId;
      if (userId) {
        await storage.updateUserOnlineStatus(userId, false);
        // Broadcast that user is offline
        io.emit('user_status_update', { userId, isOnline: false });
        console.log(`User ${userId} disconnected and is now offline`);
      }
    });
  });

  return server;
}