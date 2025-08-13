import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./unified-storage";
import bcrypt from "bcryptjs";
import { 
  insertUserSchema, insertAnnouncementSchema, insertNewsSchema, insertEventSchema,
  insertRoleSchema, insertSectionSchema, insertSubjectSchema, insertTeacherAssignmentSchema,
  insertOrgChartSchema, insertSchoolSettingsSchema, insertTuitionFeeSchema,
  insertEnrollmentSchema, insertGradeSchema, insertChatMessageSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.passwordHash, 12);
      
      const newUser = await storage.createUser({
        ...userData,
        passwordHash: hashedPassword
      });

      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Data routes
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ======================
  // ADMIN ROUTES
  // ======================

  // Users management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.passwordHash, 12);
      const newUser = await storage.createUser({
        ...userData,
        passwordHash: hashedPassword
      });
      const { passwordHash, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      if (updates.passwordHash) {
        updates.passwordHash = await bcrypt.hash(updates.passwordHash, 12);
      }
      const updatedUser = await storage.updateUser(id, updates);
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Roles management
  app.get("/api/admin/roles", async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/roles", async (req, res) => {
    try {
      const roleData = insertRoleSchema.parse(req.body);
      const newRole = await storage.createRole(roleData);
      res.status(201).json(newRole);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedRole = await storage.updateRole(id, updates);
      res.json(updatedRole);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRole(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enrollments management
  app.get("/api/admin/enrollments", async (req, res) => {
    try {
      const enrollments = await storage.getEnrollments();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/enrollments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const enrollment = await storage.getEnrollment(id);
      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }
      res.json(enrollment);
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/enrollments", async (req, res) => {
    try {
      const enrollmentData = insertEnrollmentSchema.parse(req.body);
      const newEnrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(newEnrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/enrollments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedEnrollment = await storage.updateEnrollment(id, updates);
      res.json(updatedEnrollment);
    } catch (error) {
      console.error("Error updating enrollment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Sections management
  app.get("/api/admin/sections", async (req, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/sections", async (req, res) => {
    try {
      const sectionData = insertSectionSchema.parse(req.body);
      const newSection = await storage.createSection(sectionData);
      res.status(201).json(newSection);
    } catch (error) {
      console.error("Error creating section:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/sections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedSection = await storage.updateSection(id, updates);
      res.json(updatedSection);
    } catch (error) {
      console.error("Error updating section:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/sections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSection(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Subjects management
  app.get("/api/admin/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/subjects", async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse(req.body);
      const newSubject = await storage.createSubject(subjectData);
      res.status(201).json(newSubject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedSubject = await storage.updateSubject(id, updates);
      res.json(updatedSubject);
    } catch (error) {
      console.error("Error updating subject:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSubject(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Teacher assignments
  app.get("/api/admin/teacher-assignments", async (req, res) => {
    try {
      const assignments = await storage.getTeacherAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching teacher assignments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/teacher-assignments", async (req, res) => {
    try {
      const assignmentData = insertTeacherAssignmentSchema.parse(req.body);
      const newAssignment = await storage.createTeacherAssignment(assignmentData);
      res.status(201).json(newAssignment);
    } catch (error) {
      console.error("Error creating teacher assignment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/teacher-assignments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTeacherAssignment(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting teacher assignment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Organization chart
  app.get("/api/admin/org-chart", async (req, res) => {
    try {
      const orgChart = await storage.getOrgChart();
      res.json(orgChart);
    } catch (error) {
      console.error("Error fetching organization chart:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/org-chart", async (req, res) => {
    try {
      const orgChartData = insertOrgChartSchema.parse(req.body);
      const newEntry = await storage.createOrgChartEntry(orgChartData);
      res.status(201).json(newEntry);
    } catch (error) {
      console.error("Error creating organization chart entry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/org-chart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedEntry = await storage.updateOrgChartEntry(id, updates);
      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating organization chart entry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/org-chart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOrgChartEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting organization chart entry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // School settings
  app.get("/api/admin/school-settings", async (req, res) => {
    try {
      const settings = await storage.getSchoolSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching school settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/school-settings", async (req, res) => {
    try {
      const settingsData = insertSchoolSettingsSchema.parse(req.body);
      const newSettings = await storage.createSchoolSettings(settingsData);
      res.status(201).json(newSettings);
    } catch (error) {
      console.error("Error creating school settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/school-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedSettings = await storage.updateSchoolSettings(id, updates);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating school settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Tuition fees
  app.get("/api/admin/tuition-fees", async (req, res) => {
    try {
      const fees = await storage.getTuitionFees();
      res.json(fees);
    } catch (error) {
      console.error("Error fetching tuition fees:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/tuition-fees", async (req, res) => {
    try {
      const feeData = insertTuitionFeeSchema.parse(req.body);
      const newFee = await storage.createTuitionFee(feeData);
      res.status(201).json(newFee);
    } catch (error) {
      console.error("Error creating tuition fee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/tuition-fees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedFee = await storage.updateTuitionFee(id, updates);
      res.json(updatedFee);
    } catch (error) {
      console.error("Error updating tuition fee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/tuition-fees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTuitionFee(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tuition fee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Grades management
  app.get("/api/admin/grades", async (req, res) => {
    try {
      const grades = await storage.getGrades();
      res.json(grades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/grades/student/:studentId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const grades = await storage.getGradesByStudent(studentId);
      res.json(grades);
    } catch (error) {
      console.error("Error fetching student grades:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/grades", async (req, res) => {
    try {
      const gradeData = insertGradeSchema.parse(req.body);
      const newGrade = await storage.createGrade(gradeData);
      res.status(201).json(newGrade);
    } catch (error) {
      console.error("Error creating grade:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/grades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedGrade = await storage.updateGrade(id, updates);
      res.json(updatedGrade);
    } catch (error) {
      console.error("Error updating grade:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/grades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGrade(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting grade:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chat messages management
  app.get("/api/admin/chat-messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/chat-messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const newMessage = await storage.createChatMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/chat-messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteChatMessage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting chat message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Content management (admin endpoints for announcements, news, events)
  app.post("/api/admin/announcements", async (req, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse(req.body);
      const newAnnouncement = await storage.createAnnouncement(announcementData);
      res.status(201).json(newAnnouncement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/announcements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedAnnouncement = await storage.updateAnnouncement(id, updates);
      res.json(updatedAnnouncement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/announcements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAnnouncement(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/news", async (req, res) => {
    try {
      const newsData = insertNewsSchema.parse(req.body);
      const newNews = await storage.createNews(newsData);
      res.status(201).json(newNews);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/news/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedNews = await storage.updateNews(id, updates);
      res.json(updatedNews);
    } catch (error) {
      console.error("Error updating news:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/news/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNews(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting news:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedEvent = await storage.updateEvent(id, updates);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Additional admin endpoints
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const enrollments = await storage.getEnrollments();
      const sections = await storage.getSections();
      
      const stats = {
        totalUsers: users.length,
        activeEnrollments: enrollments.filter((e: any) => e.status === 'approved').length,
        totalSections: sections.length,
        pendingApprovals: enrollments.filter((e: any) => e.status === 'pending').length
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/assignments", async (req, res) => {
    try {
      const assignments = await storage.getTeacherAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Additional endpoints needed by role-specific dashboards
  
  // Grades by student (non-admin endpoint)
  app.get("/api/grades/student/:studentId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const grades = await storage.getGradesByStudent(studentId);
      res.json(grades);
    } catch (error) {
      console.error("Error fetching student grades:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Users endpoint (non-admin)
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Sections endpoint (non-admin)
  app.get("/api/sections", async (req, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Tuition fees endpoint (non-admin)
  app.get("/api/tuition-fees", async (req, res) => {
    try {
      const fees = await storage.getTuitionFees();
      res.json(fees);
    } catch (error) {
      console.error("Error fetching tuition fees:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced Teacher API Routes
  app.get("/api/teacher/sections", async (req, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching teacher sections:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/teacher/tasks", async (req, res) => {
    try {
      const teacherId = req.query.teacherId ? parseInt(req.query.teacherId as string) : undefined;
      const tasks = await storage.getTeacherTasks(teacherId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching teacher tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/teacher/tasks", async (req, res) => {
    try {
      const taskData = req.body;
      const newTask = await storage.createTeacherTask(taskData);
      
      // Create notifications for all students in the section
      const users = await storage.getAllUsers();
      const students = users.filter((u: any) => u.role === 'student');
      
      for (const student of students) {
        await storage.createNotification({
          recipientId: student.id,
          message: `New ${taskData.taskType.toLowerCase()}: ${taskData.title}`,
          link: `/student/tasks/${newTask.id}`,
        });
      }
      
      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error creating teacher task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/teacher/meetings", async (req, res) => {
    try {
      const teacherId = req.query.teacherId ? parseInt(req.query.teacherId as string) : undefined;
      const meetings = await storage.getTeacherMeetings(teacherId);
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching teacher meetings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/teacher/meetings", async (req, res) => {
    try {
      const meetingData = req.body;
      const newMeeting = await storage.createTeacherMeeting(meetingData);
      
      // Create notifications for all students in the section
      const users = await storage.getAllUsers();
      const students = users.filter((u: any) => u.role === 'student');
      
      for (const student of students) {
        await storage.createNotification({
          recipientId: student.id,
          message: `New meeting scheduled: ${meetingData.title}`,
          link: meetingData.meetingUrl,
        });
      }
      
      res.status(201).json(newMeeting);
    } catch (error) {
      console.error("Error creating teacher meeting:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/teacher/submissions", async (req, res) => {
    try {
      const taskId = req.query.taskId ? parseInt(req.query.taskId as string) : undefined;
      const submissions = await storage.getTaskSubmissions(taskId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/teacher/notifications", async (req, res) => {
    try {
      const teacherId = req.query.teacherId ? parseInt(req.query.teacherId as string) : undefined;
      const notifications = await storage.getNotifications(teacherId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching teacher notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/teacher/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced Student API Routes
  app.get("/api/student/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTeacherTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching student tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/student/meetings", async (req, res) => {
    try {
      const meetings = await storage.getTeacherMeetings();
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching student meetings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/student/submissions", async (req, res) => {
    try {
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const submissions = await storage.getTaskSubmissions(undefined, studentId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/student/submissions", async (req, res) => {
    try {
      const submissionData = req.body;
      const newSubmission = await storage.createTaskSubmission(submissionData);
      res.status(201).json(newSubmission);
    } catch (error) {
      console.error("Error creating student submission:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/student/grades", async (req, res) => {
    try {
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const grades = studentId ? await storage.getGradesByStudent(studentId) : await storage.getGrades();
      res.json(grades);
    } catch (error) {
      console.error("Error fetching student grades:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/student/notifications", async (req, res) => {
    try {
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const notifications = await storage.getNotifications(studentId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching student notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/student/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced Guidance Office API Routes
  app.get("/api/guidance/behavior-records", async (req, res) => {
    try {
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const records = await storage.getBehaviorRecords(studentId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching behavior records:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/guidance/behavior-records", async (req, res) => {
    try {
      const recordData = req.body;
      const newRecord = await storage.createBehaviorRecord(recordData);
      
      // Notify parent and teacher if status is escalated
      if (recordData.status === "Escalated") {
        const users = await storage.getAllUsers();
        const parents = users.filter((u: any) => u.role === 'parent');
        const teachers = users.filter((u: any) => u.role === 'teacher');
        
        // Notify parents
        for (const parent of parents) {
          await storage.createNotification({
            recipientId: parent.id,
            message: `Behavioral incident escalated for student: ${recordData.incidentType}`,
            link: `/guidance/behavior/${newRecord.id}`,
          });
        }
        
        // Notify teachers
        for (const teacher of teachers) {
          await storage.createNotification({
            recipientId: teacher.id,
            message: `Behavioral incident escalated: ${recordData.incidentType}`,
            link: `/guidance/behavior/${newRecord.id}`,
          });
        }
      }
      
      res.status(201).json(newRecord);
    } catch (error) {
      console.error("Error creating behavior record:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/guidance/behavior-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedRecord = await storage.updateBehaviorRecord(id, updates);
      res.json(updatedRecord);
    } catch (error) {
      console.error("Error updating behavior record:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/guidance/counseling-sessions", async (req, res) => {
    try {
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const counselorId = req.query.counselorId ? parseInt(req.query.counselorId as string) : undefined;
      const sessions = await storage.getCounselingSessions(studentId, counselorId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching counseling sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/guidance/counseling-sessions", async (req, res) => {
    try {
      const sessionData = req.body;
      const newSession = await storage.createCounselingSession(sessionData);
      
      // Notify based on confidentiality level
      if (sessionData.confidentialityLevel === "Share with Parent") {
        const users = await storage.getAllUsers();
        const parents = users.filter((u: any) => u.role === 'parent');
        for (const parent of parents) {
          await storage.createNotification({
            recipientId: parent.id,
            message: `Counseling session update for your child`,
            link: `/guidance/sessions/${newSession.id}`,
          });
        }
      } else if (sessionData.confidentialityLevel === "Share with Teacher") {
        const users = await storage.getAllUsers();
        const teachers = users.filter((u: any) => u.role === 'teacher');
        for (const teacher of teachers) {
          await storage.createNotification({
            recipientId: teacher.id,
            message: `Counseling session update for student`,
            link: `/guidance/sessions/${newSession.id}`,
          });
        }
      }
      
      res.status(201).json(newSession);
    } catch (error) {
      console.error("Error creating counseling session:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/guidance/wellness-programs", async (req, res) => {
    try {
      const programs = await storage.getWellnessPrograms();
      res.json(programs);
    } catch (error) {
      console.error("Error fetching wellness programs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/guidance/wellness-programs", async (req, res) => {
    try {
      const programData = req.body;
      const newProgram = await storage.createWellnessProgram(programData);
      
      // Notify all students about new wellness program
      const users = await storage.getAllUsers();
      const students = users.filter((u: any) => u.role === 'student');
      
      for (const student of students) {
        await storage.createNotification({
          recipientId: student.id,
          message: `New wellness program available: ${programData.programName}`,
          link: `/guidance/programs/${newProgram.id}`,
        });
      }
      
      res.status(201).json(newProgram);
    } catch (error) {
      console.error("Error creating wellness program:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/guidance/program-participants", async (req, res) => {
    try {
      const programId = req.query.programId ? parseInt(req.query.programId as string) : undefined;
      const participants = await storage.getProgramParticipants(programId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching program participants:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/guidance/program-participants", async (req, res) => {
    try {
      const participantData = req.body;
      const newParticipant = await storage.addProgramParticipant(participantData);
      res.status(201).json(newParticipant);
    } catch (error) {
      console.error("Error adding program participant:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/guidance/students", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const students = users.filter((u: any) => u.role === 'student');
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/guidance/teachers", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const teachers = users.filter((u: any) => u.role === 'teacher');
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/guidance/notifications", async (req, res) => {
    try {
      const notificationData = req.body;
      const newNotification = await storage.createNotification(notificationData);
      res.status(201).json(newNotification);
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced Registrar Office API Routes
  app.get("/api/registrar/enrollment-requests", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const requests = await storage.getEnrollmentRequests(status);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching enrollment requests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/registrar/enrollment-requests", async (req, res) => {
    try {
      const requestData = req.body;
      const newRequest = await storage.createEnrollmentRequest(requestData);
      
      // Notify registrar staff about new enrollment
      const users = await storage.getAllUsers();
      const registrars = users.filter((u: any) => u.role === 'registrar');
      
      for (const registrar of registrars) {
        await storage.createNotification({
          recipientId: registrar.id,
          message: `New enrollment request from ${requestData.studentName} for ${requestData.gradeLevel}`,
          link: `/registrar/enrollments/${newRequest.id}`,
        });
      }
      
      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Error creating enrollment request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/registrar/enrollment-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedRequest = await storage.updateEnrollmentRequest(id, updates);
      
      // Notify student about enrollment status change
      if (updates.status && updates.status !== 'Pending') {
        await storage.createNotification({
          recipientId: updatedRequest.studentId,
          message: `Your enrollment request has been ${updates.status.toLowerCase()}`,
          link: `/student/enrollment/${updatedRequest.id}`,
        });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating enrollment request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/registrar/subjects", async (req, res) => {
    try {
      const gradeLevel = req.query.gradeLevel as string | undefined;
      const subjects = await storage.getRegistrarSubjects(gradeLevel);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching registrar subjects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/registrar/subjects", async (req, res) => {
    try {
      const subjectData = req.body;
      const newSubject = await storage.createRegistrarSubject(subjectData);
      res.status(201).json(newSubject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/registrar/academic-records", async (req, res) => {
    try {
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const schoolYear = req.query.schoolYear as string | undefined;
      const records = await storage.getAcademicRecords(studentId, schoolYear);
      res.json(records);
    } catch (error) {
      console.error("Error fetching academic records:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/registrar/academic-records", async (req, res) => {
    try {
      const recordData = req.body;
      const newRecord = await storage.createAcademicRecord(recordData);
      
      // Notify student about new grade
      await storage.createNotification({
        recipientId: recordData.studentId,
        message: `New grade recorded for ${recordData.subjectName || 'subject'}`,
        link: `/student/grades`,
      });
      
      res.status(201).json(newRecord);
    } catch (error) {
      console.error("Error creating academic record:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/registrar/graduation-candidates", async (req, res) => {
    try {
      const schoolYear = req.query.schoolYear as string | undefined;
      const candidates = await storage.getGraduationCandidates(schoolYear);
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching graduation candidates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/registrar/graduation-candidates", async (req, res) => {
    try {
      const candidateData = req.body;
      const newCandidate = await storage.createGraduationCandidate(candidateData);
      
      // Notify student about graduation candidacy
      await storage.createNotification({
        recipientId: candidateData.studentId,
        message: `You have been added to graduation candidates for ${candidateData.schoolYear}`,
        link: `/student/graduation`,
      });
      
      res.status(201).json(newCandidate);
    } catch (error) {
      console.error("Error creating graduation candidate:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/registrar/transcript-requests", async (req, res) => {
    try {
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const requests = await storage.getTranscriptRequests(studentId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching transcript requests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/registrar/transcript-requests", async (req, res) => {
    try {
      const requestData = req.body;
      const newRequest = await storage.createTranscriptRequest(requestData);
      
      // Notify registrar about new transcript request
      const users = await storage.getAllUsers();
      const registrars = users.filter((u: any) => u.role === 'registrar');
      
      for (const registrar of registrars) {
        await storage.createNotification({
          recipientId: registrar.id,
          message: `New transcript request from student`,
          link: `/registrar/transcripts/${newRequest.id}`,
        });
      }
      
      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Error creating transcript request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/registrar/transcript-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedRequest = await storage.updateTranscriptRequest(id, updates);
      
      // Notify student about transcript status change
      if (updates.status) {
        await storage.createNotification({
          recipientId: updatedRequest.studentId,
          message: `Your transcript request status: ${updates.status}`,
          link: `/student/transcripts/${updatedRequest.id}`,
        });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating transcript request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/registrar/students", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const students = users.filter((u: any) => u.role === 'student');
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced Accounting Office API Routes
  app.get("/api/accounting/fee-structures", async (req, res) => {
    try {
      const gradeLevel = req.query.gradeLevel as string | undefined;
      const schoolYear = req.query.schoolYear as string | undefined;
      const feeStructures = await storage.getFeeStructures(gradeLevel, schoolYear);
      res.json(feeStructures);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/accounting/fee-structures", async (req, res) => {
    try {
      const feeStructureData = req.body;
      const newFeeStructure = await storage.createFeeStructure(feeStructureData);
      res.status(201).json(newFeeStructure);
    } catch (error) {
      console.error("Error creating fee structure:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/accounting/invoices", async (req, res) => {
    try {
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const status = req.query.status as string | undefined;
      const invoices = await storage.getInvoices(studentId, status);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/accounting/invoices", async (req, res) => {
    try {
      const invoiceData = req.body;
      const newInvoice = await storage.createInvoice(invoiceData);
      
      // Notify student about new invoice
      await storage.createNotification({
        recipientId: invoiceData.studentId,
        message: `New invoice generated for ${invoiceData.schoolYear} - Amount: ₱${invoiceData.totalAmount}`,
        link: `/student/billing/${newInvoice.id}`,
      });
      
      res.status(201).json(newInvoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/accounting/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedInvoice = await storage.updateInvoice(id, updates);
      res.json(updatedInvoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/accounting/payments", async (req, res) => {
    try {
      const invoiceId = req.query.invoiceId ? parseInt(req.query.invoiceId as string) : undefined;
      const payments = await storage.getPayments(invoiceId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/accounting/payments", async (req, res) => {
    try {
      const paymentData = req.body;
      const newPayment = await storage.createPayment(paymentData);
      
      // Update invoice status based on payment
      const invoiceItems = await storage.getInvoiceItems(paymentData.invoiceId);
      const totalInvoiceAmount = invoiceItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const allPayments = await storage.getPayments(paymentData.invoiceId);
      const totalPaid = allPayments.reduce((sum, payment) => sum + parseFloat(payment.amountPaid), 0);
      
      let newStatus = 'Unpaid';
      if (totalPaid >= totalInvoiceAmount) {
        newStatus = 'Paid';
      } else if (totalPaid > 0) {
        newStatus = 'Partial';
      }
      
      await storage.updateInvoice(paymentData.invoiceId, { status: newStatus });
      
      res.status(201).json(newPayment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/accounting/scholarships", async (req, res) => {
    try {
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const scholarships = await storage.getScholarships(studentId);
      res.json(scholarships);
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/accounting/scholarships", async (req, res) => {
    try {
      const scholarshipData = req.body;
      const newScholarship = await storage.createScholarship(scholarshipData);
      
      // Notify student about scholarship
      await storage.createNotification({
        recipientId: scholarshipData.studentId,
        message: `Scholarship granted: ${scholarshipData.scholarshipName} (${scholarshipData.discountPercentage}% discount)`,
        link: `/student/scholarships`,
      });
      
      res.status(201).json(newScholarship);
    } catch (error) {
      console.error("Error creating scholarship:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/accounting/school-expenses", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const expenses = await storage.getSchoolExpenses(category, startDate, endDate);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching school expenses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/accounting/school-expenses", async (req, res) => {
    try {
      const expenseData = req.body;
      const newExpense = await storage.createSchoolExpense(expenseData);
      res.status(201).json(newExpense);
    } catch (error) {
      console.error("Error creating school expense:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/accounting/students", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const students = users.filter((u: any) => u.role === 'student');
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced Chat System API Routes
  app.get("/api/chat/conversations", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat/conversations", async (req, res) => {
    try {
      const conversationData = req.body;
      const newConversation = await storage.createConversation(conversationData);
      
      // Add members to the conversation
      if (conversationData.memberIds && Array.isArray(conversationData.memberIds)) {
        for (const memberId of conversationData.memberIds) {
          await storage.addConversationMember({
            conversationId: newConversation.id,
            userId: memberId
          });
        }
      }
      
      res.status(201).json(newConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/chat/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getMessages(conversationId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    try {
      const messageData = req.body;
      const newMessage = await storage.createMessage(messageData);
      
      // Emit message to connected clients via WebSocket
      if (global.io) {
        global.io.to(`conversation_${messageData.conversationId}`).emit('new_message', newMessage);
      }
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/chat/conversations/:id/read", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { userId } = req.body;
      await storage.markConversationAsRead(conversationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/chat/users/online", async (req, res) => {
    try {
      const onlineUsers = await storage.getOnlineUsers();
      res.json(onlineUsers);
    } catch (error) {
      console.error("Error fetching online users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/chat/users/:id/status", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const statusData = req.body;
      const updatedStatus = await storage.updateUserStatus(userId, statusData);
      res.json(updatedStatus);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/chat/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const chatUsers = users.map((user: any) => ({
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email
      }));
      res.json(chatUsers);
    } catch (error) {
      console.error("Error fetching chat users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Principal Dashboard Routes
  app.get('/api/principal/stats', async (req, res) => {
    try {
      const stats = await storage.getPrincipalStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching principal stats:', error);
      res.status(500).json({ error: 'Failed to fetch principal statistics' });
    }
  });

  app.get('/api/principal/financial', async (req, res) => {
    try {
      const financialData = await storage.getPrincipalFinancialOverview();
      res.json(financialData);
    } catch (error) {
      console.error('Error fetching principal financial data:', error);
      res.status(500).json({ error: 'Failed to fetch financial overview' });
    }
  });

  // Academic Coordinator Dashboard Routes
  app.get('/api/academic/curriculum', async (req, res) => {
    try {
      const curriculumData = await storage.getAcademicCurriculumData();
      res.json(curriculumData);
    } catch (error) {
      console.error('Error fetching curriculum data:', error);
      res.status(500).json({ error: 'Failed to fetch curriculum data' });
    }
  });

  app.get('/api/academic/teacher-performance', async (req, res) => {
    try {
      const teacherData = await storage.getTeacherPerformanceData();
      res.json(teacherData);
    } catch (error) {
      console.error('Error fetching teacher performance data:', error);
      res.status(500).json({ error: 'Failed to fetch teacher performance data' });
    }
  });

  app.get('/api/academic/stats', async (req, res) => {
    try {
      const stats = await storage.getAcademicStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching academic stats:', error);
      res.status(500).json({ error: 'Failed to fetch academic statistics' });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Make io available globally for route handlers
  (global as any).io = io;

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user joining
    socket.on('join_user', async (userId: number) => {
      try {
        // Update user status to online
        await storage.updateUserStatus(userId, { isOnline: true });
        
        // Join user-specific room
        socket.join(`user_${userId}`);
        
        // Get user's conversations and join conversation rooms
        const conversations = await storage.getConversations(userId);
        for (const conversation of conversations) {
          socket.join(`conversation_${conversation.id}`);
        }
        
        // Broadcast user online status
        socket.broadcast.emit('user_online', { userId, isOnline: true });
        
        console.log(`User ${userId} joined and marked online`);
      } catch (error) {
        console.error('Error handling user join:', error);
      }
    });

    // Handle joining specific conversation
    socket.on('join_conversation', (conversationId: number) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation
    socket.on('leave_conversation', (conversationId: number) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Handle new message
    socket.on('send_message', async (messageData: any) => {
      try {
        const newMessage = await storage.createMessage(messageData);
        
        // Emit to all users in the conversation
        io.to(`conversation_${messageData.conversationId}`).emit('new_message', newMessage);
        
        console.log(`Message sent to conversation ${messageData.conversationId}`);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { conversationId: number, userId: number, userName: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', data);
    });

    socket.on('typing_stop', (data: { conversationId: number, userId: number }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', data);
    });

    // Handle marking messages as read
    socket.on('mark_read', async (data: { conversationId: number, userId: number }) => {
      try {
        await storage.markConversationAsRead(data.conversationId, data.userId);
        socket.to(`conversation_${data.conversationId}`).emit('messages_read', data);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      
      // Note: We can't easily get userId from socket.id without additional tracking
      // In a production app, you'd maintain a userId -> socketId mapping
    });

    // Handle user going offline
    socket.on('user_offline', async (userId: number) => {
      try {
        await storage.updateUserStatus(userId, { isOnline: false });
        socket.broadcast.emit('user_offline', { userId, isOnline: false });
        console.log(`User ${userId} marked offline`);
      } catch (error) {
        console.error('Error handling user offline:', error);
      }
    });
  });

  return httpServer;
}
