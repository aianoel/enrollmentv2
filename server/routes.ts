import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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

  const httpServer = createServer(app);

  return httpServer;
}
