import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./unified-storage";
import bcrypt from "bcryptjs";

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
      
      // Create user first (for enrollment demo)
      const hashedPassword = await bcrypt.hash('student123', 12);
      const user = await storage.createUser({
        roleId: 5, // Student role
        firstName: studentInfo.firstName,
        lastName: studentInfo.lastName,
        email: `${studentInfo.firstName.toLowerCase()}.${studentInfo.lastName.toLowerCase()}@student.edu`,
        passwordHash: hashedPassword,
        isActive: true,
        createdAt: new Date()
      });

      // Create enrollment application
      const application = await storage.createEnrollmentApplication({
        studentId: user.id,
        schoolYear,
        status: 'Draft',
        createdAt: new Date()
      });

      res.status(201).json({ id: application.id, message: 'Application created successfully' });
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

  // Socket.io for real-time features
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message', (data) => {
      socket.to(data.roomId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return server;
}