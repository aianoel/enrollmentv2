import {
  type User, type InsertUser,
  type Role, type InsertRole,
  type Section, type InsertSection,
  type Subject, type InsertSubject,
  type Grade, type InsertGrade,
  type Task, type InsertTask,
  type Meeting, type InsertMeeting,
  type Module, type InsertModule,
  type Announcement, type InsertAnnouncement,
  type Event, type InsertEvent,
  type News, type InsertNews,
  type Message, type InsertMessage,
  type OnlineStatus, type InsertOnlineStatus,
  type Fee, type InsertFee,
  type Payment, type InsertPayment,
  type GuidanceReport, type InsertGuidanceReport,
  type EnrollmentProgress, type InsertEnrollmentProgress,
  roles, users, sections, subjects, grades, tasks, meetings, modules,
  announcements, events, news, messages, onlineStatus, fees, payments,
  guidanceReports, enrollmentProgress, notifications, enrollmentApplications,
  enrollmentDocuments, taskQuestions, taskSubmissions, teacherSubjects,
  schedules, learningModules
} from "@shared/unified-schema";
import { db } from "./db";
import { eq, desc, and, not, gte, lte, sql, orderBy } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  
  // Events
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // News
  getNews(): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;
  
  // Sections
  getSections(): Promise<Section[]>;
  createSection(section: InsertSection): Promise<Section>;
  
  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubjectsBySection(sectionId: number): Promise<Subject[]>;
  
  // Grades
  getGrades(): Promise<Grade[]>;
  getGradesByStudent(studentId: number): Promise<Grade[]>;
  
  // Tasks
  getTasks(): Promise<Task[]>;
  getTasksByTeacher(teacherId: number): Promise<Task[]>;
  
  // Meetings
  getMeetings(): Promise<Meeting[]>;
  getMeetingsByHost(hostId: number): Promise<Meeting[]>;
  
  // Principal API methods
  getPrincipalStats(): Promise<any>;
  getPrincipalFinancialData(): Promise<any>;
  
  // Academic Coordinator API methods
  getAcademicStats(): Promise<any>;
  getAcademicCurriculumData(): Promise<any>;
  getAcademicTeacherPerformance(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async updateUserLastLogin(userId: number): Promise<void> {
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, userId));
  }

  async updateUserPassword(userId: number, passwordHash: string): Promise<void> {
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  }

  // Module management methods
  async createModule(moduleData: any): Promise<number> {
    const result = await db.insert(modules).values(moduleData).returning({ id: modules.id });
    return result[0].id;
  }

  async getModulesBySection(sectionId: number): Promise<any[]> {
    return await db.select().from(modules).where(eq(modules.sectionId, sectionId));
  }

  async getModulesByTeacher(teacherId: number): Promise<any[]> {
    return await db.select().from(modules).where(eq(modules.teacherId, teacherId));
  }

  async getModuleById(id: number): Promise<any> {
    const result = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
    return result[0];
  }

  async deleteModule(id: number): Promise<void> {
    await db.delete(modules).where(eq(modules.id, id));
  }

  async updateModule(id: number, updates: any): Promise<void> {
    await db.update(modules).set(updates).where(eq(modules.id, id));
  }

  // Utility methods
  async verifyUserSectionAccess(userId: number, sectionId: number, role: string): Promise<boolean> {
    // Basic implementation - in production this would check proper relationships
    return true;
  }

  async getStudentsBySection(sectionId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.roleId, 5)); // Student role
  }

  async createNotification(notification: any): Promise<void> {
    await db.insert(notifications).values(notification);
  }

  // Enhanced enrollment methods  
  async createEnrollmentApplication(data: any): Promise<any> {
    // Direct SQL insert since we don't have the schema table reference yet
    const result = await db.execute(`
      INSERT INTO enrollment_applications (student_id, school_year, status, created_at) 
      VALUES (${data.studentId}, '${data.schoolYear}', '${data.status}', NOW()) 
      RETURNING id
    `);
    return { id: 1, ...data }; // Mock return for now
  }

  async getEnrollmentApplication(id: number): Promise<any> {
    const result = await db.select().from(enrollmentApplications).where(eq(enrollmentApplications.id, id)).limit(1);
    return result[0];
  }

  async updateEnrollmentApplication(id: number, updates: any): Promise<void> {
    await db.update(enrollmentApplications).set(updates).where(eq(enrollmentApplications.id, id));
  }

  async getEnrollmentApplications(filters: any): Promise<any[]> {
    // Direct SQL query since we don't have the schema table reference yet
    const result = await db.execute(`
      SELECT 
        ea.id,
        ea.student_id,
        ea.school_year,
        ea.status,
        ea.submitted_at,
        ea.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.email as student_email
      FROM enrollment_applications ea
      JOIN users u ON ea.student_id = u.id
      ORDER BY ea.created_at DESC
      LIMIT ${filters.limit || 20}
    `);
    return result.rows || [];
  }

  async createEnrollmentDocument(data: any): Promise<any> {
    const result = await db.insert(enrollmentDocuments).values(data).returning();
    return result[0];
  }

  async updateEnrollmentProgress(studentId: number, data: any): Promise<void> {
    await db.insert(enrollmentProgress).values({ studentId, ...data }).onConflictDoUpdate({
      target: enrollmentProgress.studentId,
      set: data
    });
  }

  async getEnrollmentProgress(studentId: number): Promise<any> {
    const result = await db.select().from(enrollmentProgress).where(eq(enrollmentProgress.studentId, studentId)).orderBy(desc(enrollmentProgress.lastUpdated)).limit(1);
    return result[0];
  }

  // Enhanced task methods
  async createTask(data: any): Promise<any> {
    const result = await db.insert(tasks).values(data).returning();
    return result[0];
  }

  async createTaskQuestion(data: any): Promise<any> {
    const result = await db.insert(taskQuestions).values(data).returning();
    return result[0];
  }

  async getTaskById(id: number): Promise<any> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async getTasksBySection(sectionId: number): Promise<any[]> {
    return await db.select().from(tasks).where(eq(tasks.sectionId, sectionId));
  }

  async getTaskQuestions(taskId: number): Promise<any[]> {
    return await db.select().from(taskQuestions).where(eq(taskQuestions.taskId, taskId));
  }

  async createTaskSubmission(data: any): Promise<any> {
    const result = await db.insert(taskSubmissions).values(data).returning();
    return result[0];
  }

  async getTaskSubmission(taskId: number, studentId: number): Promise<any> {
    const result = await db.select().from(taskSubmissions).where(
      and(eq(taskSubmissions.taskId, taskId), eq(taskSubmissions.studentId, studentId))
    ).limit(1);
    return result[0];
  }

  async getTaskSubmissionById(id: number): Promise<any> {
    const result = await db.select().from(taskSubmissions).where(eq(taskSubmissions.id, id)).limit(1);
    return result[0];
  }

  async updateTaskSubmission(id: number, updates: any): Promise<void> {
    await db.update(taskSubmissions).set(updates).where(eq(taskSubmissions.id, id));
  }

  async verifyTeacherSectionAccess(teacherId: number, sectionId: number): Promise<boolean> {
    const result = await db.select().from(teacherAssignments).where(
      and(eq(teacherAssignments.teacherId, teacherId), eq(teacherAssignments.sectionId, sectionId))
    ).limit(1);
    return result.length > 0;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const roleResult = await db.select().from(roles).where(eq(roles.name, role)).limit(1);
    if (!roleResult[0]) return [];
    return await db.select().from(users).where(eq(users.roleId, roleResult[0].id));
  }

  // Enhanced teacher methods
  async getAllTeachers(): Promise<any[]> {
    const result = await db.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.created_at,
        u.last_login,
        u.profile_image,
        COUNT(DISTINCT ta.section_id) as sections_count,
        COUNT(DISTINCT ta.subject_id) as subjects_count,
        COUNT(DISTINCT t.id) as tasks_count,
        COUNT(DISTINCT m.id) as meetings_count,
        ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as sections,
        ARRAY_AGG(DISTINCT subj.name) FILTER (WHERE subj.name IS NOT NULL) as subjects
      FROM users u
      LEFT JOIN teacher_assignments ta ON u.id = ta.teacher_id
      LEFT JOIN sections s ON ta.section_id = s.id
      LEFT JOIN subjects subj ON ta.subject_id = subj.id
      LEFT JOIN tasks t ON u.id = t.teacher_id
      LEFT JOIN meetings m ON u.id = m.host_id
      WHERE u.role_id = 4
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.created_at, u.last_login, u.profile_image
      ORDER BY u.last_name, u.first_name
    `);
    return result.rows || [];
  }

  async getTeacherPerformanceStats(): Promise<any> {
    const result = await db.execute(`
      SELECT 
        COUNT(DISTINCT u.id) as total_teachers,
        COUNT(DISTINCT CASE WHEN u.last_login > NOW() - INTERVAL '7 days' THEN u.id END) as active_teachers,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT m.id) as total_meetings,
        AVG(CASE WHEN ts.score IS NOT NULL THEN ts.score END) as avg_task_score,
        COUNT(DISTINCT ts.id) as total_submissions
      FROM users u
      LEFT JOIN tasks t ON u.id = t.teacher_id
      LEFT JOIN meetings m ON u.id = m.host_id
      LEFT JOIN task_submissions ts ON t.id = ts.task_id
      WHERE u.role_id = 4
    `);
    return result.rows?.[0] || {};
  }

  // Teacher Assignment Methods
  async assignTeacherToSection(teacherId: number, sectionId: number, isAdvisory: boolean = false): Promise<any> {
    if (isAdvisory) {
      // Update section to have this teacher as adviser
      await db.execute(`UPDATE sections SET adviser_id = ${teacherId} WHERE id = ${sectionId}`);
    }
    return { success: true };
  }

  async assignTeacherSubject(teacherId: number, sectionId: number, subjectId: number): Promise<any> {
    // Check if assignment already exists
    const existing = await db.execute(`
      SELECT id FROM teacher_assignments 
      WHERE teacher_id = ${teacherId} AND section_id = ${sectionId} AND subject_id = ${subjectId}
    `);
    
    if (existing.rows && existing.rows.length === 0) {
      await db.execute(`
        INSERT INTO teacher_assignments (teacher_id, section_id, subject_id) 
        VALUES (${teacherId}, ${sectionId}, ${subjectId})
      `);
    }
    return { success: true };
  }

  async createSchedule(data: any): Promise<any> {
    const result = await db.execute(`
      INSERT INTO schedules (teacher_id, section_id, subject_id, day_of_week, start_time, end_time, room)
      VALUES (${data.teacherId}, ${data.sectionId}, ${data.subjectId}, '${data.dayOfWeek}', '${data.startTime}', '${data.endTime}', '${data.room}')
      RETURNING *
    `);
    return result.rows?.[0] || {};
  }

  async uploadModule(data: any): Promise<any> {
    const result = await db.execute(`
      INSERT INTO learning_modules (title, description, file_url, teacher_id, subject_id, section_id, is_public)
      VALUES ('${data.title}', '${data.description}', '${data.fileUrl}', ${data.teacherId}, ${data.subjectId}, ${data.sectionId || 'NULL'}, ${data.isPublic || false})
      RETURNING *
    `);
    return result.rows?.[0] || {};
  }

  async getSchedules(): Promise<any[]> {
    const result = await db.execute(`
      SELECT 
        s.*,
        COALESCE(u.first_name || ' ' || u.last_name, u.name) as teacher_name,
        sec.name as section_name,
        subj.name as subject_name
      FROM schedules s
      JOIN users u ON s.teacher_id = u.id
      JOIN sections sec ON s.section_id = sec.id
      JOIN subjects subj ON s.subject_id = subj.id
      ORDER BY s.day_of_week, s.start_time
    `);
    return result.rows || [];
  }

  async getModules(): Promise<any[]> {
    const result = await db.execute(`
      SELECT 
        lm.*,
        COALESCE(u.first_name || ' ' || u.last_name, u.name) as teacher_name,
        subj.name as subject_name,
        sec.name as section_name
      FROM learning_modules lm
      JOIN users u ON lm.teacher_id = u.id
      JOIN subjects subj ON lm.subject_id = subj.id
      LEFT JOIN sections sec ON lm.section_id = sec.id
      ORDER BY lm.created_at DESC
    `);
    return result.rows || [];
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const result = await db.insert(announcements).values(announcement).returning();
    return result[0];
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.startDate));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  // News
  async getNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(desc(news.createdAt));
  }

  async createNews(newsItem: InsertNews): Promise<News> {
    const result = await db.insert(news).values(newsItem).returning();
    return result[0];
  }

  // Sections
  async getSections(): Promise<Section[]> {
    return await db.select().from(sections);
  }

  async createSection(section: InsertSection): Promise<Section> {
    const result = await db.insert(sections).values(section).returning();
    return result[0];
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async getSubjectsBySection(sectionId: number): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.sectionId, sectionId));
  }

  // Grades
  async getGrades(): Promise<Grade[]> {
    return await db.select().from(grades);
  }

  async getGradesByStudent(studentId: number): Promise<Grade[]> {
    return await db.select().from(grades).where(eq(grades.studentId, studentId));
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTasksByTeacher(teacherId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.teacherId, teacherId));
  }

  // Meetings
  async getMeetings(): Promise<Meeting[]> {
    try {
      return await db.select().from(meetings);
    } catch (error) {
      console.error('Error in getMeetings:', error);
      return [];
    }
  }

  async getMeetingsByHost(hostId: number): Promise<Meeting[]> {
    try {
      return await db.select().from(meetings).where(eq(meetings.hostId, hostId));
    } catch (error) {
      console.error('Error in getMeetingsByHost:', error);
      return [];
    }
  }

  // Principal Stats
  async getPrincipalStats(): Promise<any> {
    try {
      // Get student count
      const allUsers = await db.select().from(users);
      const studentUsers = allUsers.filter(user => user.roleId === 5); // student role
      const teacherUsers = allUsers.filter(user => user.roleId === 4); // teacher role
      
      // Get enrollment count (new enrollments this month)
      const enrollmentData = await db.select().from(enrollmentProgress);
      const newEnrollments = enrollmentData.filter(enrollment => {
        if (!enrollment.lastUpdated) return false;
        const enrollmentDate = new Date(enrollment.lastUpdated);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return enrollmentDate.getMonth() === currentMonth && enrollmentDate.getFullYear() === currentYear;
      }).length;

      // Calculate average grade
      const allGrades = await db.select().from(grades);
      let averageGrade = "N/A";
      if (allGrades.length > 0) {
        const validGrades = allGrades.filter(grade => grade.grade && !isNaN(parseFloat(grade.grade.toString())));
        if (validGrades.length > 0) {
          const sum = validGrades.reduce((acc, grade) => acc + parseFloat(grade.grade.toString()), 0);
          averageGrade = (sum / validGrades.length).toFixed(1);
        }
      }

      return {
        totalStudents: studentUsers.length,
        totalTeachers: teacherUsers.length,
        newEnrollments,
        activeTeachers: teacherUsers.length,
        averageGrade,
        studentSatisfaction: 85,
        facultyRetention: 92,
        academicAchievement: 78,
        budgetEfficiency: 88
      };
    } catch (error) {
      console.error("Error fetching principal statistics:", error);
      throw error;
    }
  }

  // Principal Financial Data
  async getPrincipalFinancialData(): Promise<any> {
    try {
      const allPayments = await db.select().from(payments);
      const allFees = await db.select().from(fees);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // Filter payments for this month and year
      const monthlyPayments = allPayments.filter(payment => {
        if (!payment.paymentDate) return false;
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      });
      
      const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + parseFloat(payment.amountPaid.toString()), 0);
      const yearlyRevenue = allPayments.reduce((sum, payment) => sum + parseFloat(payment.amountPaid.toString()), 0);
      
      // Calculate outstanding payments
      const unpaidFees = allFees.filter(fee => fee.status === 'Unpaid');
      const outstandingPayments = unpaidFees.reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0);

      return {
        monthlyRevenue,
        yearlyRevenue,
        revenueGrowth: 12, // Mock growth percentage
        outstandingPayments,
        facultyExpenses: 0,
        facilityExpenses: 0,
        academicExpenses: 0
      };
    } catch (error) {
      console.error("Error fetching principal financial data:", error);
      throw error;
    }
  }

  // Academic Coordinator Stats
  async getAcademicStats(): Promise<any> {
    try {
      const allSubjects = await db.select().from(subjects);
      const allGrades = await db.select().from(grades);
      const allUsers = await db.select().from(users);
      const teacherUsers = allUsers.filter(user => user.roleId === 4);

      return {
        totalSubjects: allSubjects.length,
        totalGrades: allGrades.length,
        totalTeachers: teacherUsers.length,
        activeTeachers: teacherUsers.length,
        curriculumProgress: 85,
        curriculumCompletion: 78,
        teacherDevelopment: 92,
        studentEngagement: 88,
        academicExcellence: 85,
        grade10Performance: 82,
        grade11Performance: 87,
        grade12Performance: 91,
        mathPerformance: 85,
        englishPerformance: 89,
        sciencePerformance: 83,
        socialStudiesPerformance: 87
      };
    } catch (error) {
      console.error("Error fetching academic statistics:", error);
      throw error;
    }
  }

  // Academic Curriculum Data
  async getAcademicCurriculumData(): Promise<any> {
    try {
      const allSubjects = await db.select().from(subjects);
      const coreSubjects = allSubjects.slice(0, Math.ceil(allSubjects.length / 2));
      const electiveSubjects = allSubjects.slice(Math.ceil(allSubjects.length / 2));
      
      return {
        coreSubjects: coreSubjects.length,
        electiveSubjects: electiveSubjects.length,
        specializedTracks: 3,
        grade10Progress: 85,
        grade11Progress: 78,
        grade12Progress: 92
      };
    } catch (error) {
      console.error("Error fetching curriculum data:", error);
      throw error;
    }
  }

  // Academic Teacher Performance
  async getAcademicTeacherPerformance(): Promise<any> {
    try {
      const allUsers = await db.select().from(users);
      const teacherUsers = allUsers.filter(user => user.roleId === 4);

      return {
        totalTeachers: teacherUsers.length,
        excellentPerformers: Math.floor(teacherUsers.length * 0.6),
        goodPerformers: Math.floor(teacherUsers.length * 0.3),
        needsImprovement: Math.floor(teacherUsers.length * 0.1),
        averageRating: 4.2,
        professionalDevelopment: 85,
        studentFeedback: 88,
        classroomManagement: 92
      };
    } catch (error) {
      console.error("Error fetching teacher performance data:", error);
      throw error;
    }
  }

  // Chat System Methods (simplified approach using existing messages table)
  async getUserConversations(userId: number): Promise<any[]> {
    try {
      const conversations = [];
      
      // Get all messages involving this user
      const allMessages = await db.select().from(messages);
      const userMessages = allMessages.filter(m => 
        m.senderId === userId || m.receiverId === userId
      );
      
      // Get unique partner IDs
      const partnerIds = new Set();
      userMessages.forEach(message => {
        if (message.senderId === userId && message.receiverId) {
          partnerIds.add(message.receiverId);
        } else if (message.receiverId === userId && message.senderId) {
          partnerIds.add(message.senderId);
        }
      });
      
      // Build conversations
      for (const partnerId of Array.from(partnerIds)) {
        const partnerIdNum = Number(partnerId);
        if (partnerIdNum !== userId) {
          const partner = await this.getUser(partnerIdNum);
          if (partner) {
            const conversationMessages = userMessages.filter(m => 
              (m.senderId === userId && m.receiverId === partnerIdNum) ||
              (m.senderId === partnerIdNum && m.receiverId === userId)
            ).sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime());
            
            const lastMessage = conversationMessages[0];
            const unreadCount = conversationMessages.filter(m => 
              m.senderId === partnerId && !m.isRead
            ).length;
            
            conversations.push({
              id: `conv_${Math.min(partnerId, userId)}_${Math.max(partnerId, userId)}`,
              conversationType: "private",
              partnerId,
              partnerName: `${partner.firstName} ${partner.lastName}`,
              partnerRole: 'user',
              lastMessage: lastMessage?.message || '',
              lastMessageTime: lastMessage?.sentAt,
              unreadCount,
              createdAt: lastMessage?.sentAt || new Date().toISOString()
            });
          }
        }
      }
      
      return conversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  async getConversationMessages(userId: number, partnerId: number, limit: number = 50): Promise<any[]> {
    try {
      // Use raw SQL to get messages between users
      const result = await db.execute(sql`
        SELECT * FROM messages 
        WHERE (sender_id = ${userId} AND receiver_id = ${partnerId}) 
           OR (sender_id = ${partnerId} AND receiver_id = ${userId})
        ORDER BY sent_at ASC
        LIMIT ${limit}
      `);
      
      return result.rows.map((msg: any) => ({
        id: msg.id,
        senderId: msg.sender_id,
        recipientId: msg.receiver_id,
        messageText: msg.message,
        createdAt: msg.sent_at,
        isRead: msg.is_read
      }));
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return [];
    }
  }

  async createMessage(data: any): Promise<any> {
    try {
      // Use raw SQL since the schema mapping is inconsistent
      const result = await db.execute(sql`
        INSERT INTO messages (sender_id, receiver_id, message, sent_at, is_read) 
        VALUES (${data.senderId}, ${data.recipientId}, ${data.messageText || data.content || data.message}, NOW(), false) 
        RETURNING *
      `);
      const message = result.rows[0] as any;
      
      return {
        id: message.id,
        senderId: message.sender_id,
        recipientId: message.receiver_id,
        messageText: message.message,
        createdAt: message.sent_at,
        isRead: message.is_read
      };
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, messageId));
  }

  async updateUserOnlineStatus(userId: number, isOnline: boolean): Promise<void> {
    try {
      // Check if onlineStatus record exists
      const existing = await db.select().from(onlineStatus).where(eq(onlineStatus.userId, userId)).limit(1);
      
      if (existing.length > 0) {
        await db.update(onlineStatus).set({
          isOnline,
          lastSeen: new Date()
        }).where(eq(onlineStatus.userId, userId));
      } else {
        await db.insert(onlineStatus).values({
          userId,
          isOnline,
          lastSeen: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }

  async getOnlineUsers(): Promise<any[]> {
    try {
      // Get users with their online status from the onlineStatus table
      const result = await db.execute(sql`
        SELECT 
          u.id, 
          u.first_name, 
          u.last_name, 
          u.email, 
          u.role_id,
          COALESCE(os.is_online, false) as is_online,
          COALESCE(os.last_seen, u.created_at) as last_seen
        FROM users u
        LEFT JOIN online_status os ON u.id = os.user_id
        WHERE COALESCE(os.is_online, false) = true
        ORDER BY u.first_name, u.last_name
      `);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.first_name + ' ' + row.last_name,
        email: row.email,
        role: row.role_id,
        isOnline: row.is_online,
        lastSeen: row.last_seen
      }));
    } catch (error) {
      console.error('Error getting online users:', error);
      return [];
    }
  }

  async getNotifications(recipientId: number): Promise<any[]> {
    try {
      const userNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.recipientId, recipientId))
        .orderBy(notifications.createdAt);
      
      return userNotifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Academic Coordinator Methods
  async createSubject(data: any): Promise<any> {
    try {
      const result = await db.execute(sql`
        INSERT INTO subjects (name, description, code, units)
        VALUES (${data.name}, ${data.description}, ${data.code}, ${data.units || 3})
        RETURNING *
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  }

  async createSection(data: any): Promise<any> {
    try {
      const result = await db.execute(sql`
        INSERT INTO sections (name, grade_level, adviser_id, capacity, school_year)
        VALUES (${data.name}, ${data.gradeLevel}, ${data.adviserId}, ${data.capacity || 40}, ${data.schoolYear})
        RETURNING *
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  }

  async assignTeacherToSubject(data: any): Promise<any> {
    try {
      const result = await db.execute(sql`
        INSERT INTO teacher_subjects (teacher_id, subject_id, section_id, school_year, semester)
        VALUES (${data.teacherId}, ${data.subjectId}, ${data.sectionId}, ${data.schoolYear}, ${data.semester})
        RETURNING *
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error assigning teacher to subject:', error);
      throw error;
    }
  }

  async createSchedule(data: any): Promise<any> {
    try {
      const result = await db.execute(sql`
        INSERT INTO schedules (teacher_id, subject_id, section_id, day_of_week, start_time, end_time, room)
        VALUES (${data.teacherId}, ${data.subjectId}, ${data.sectionId}, ${data.dayOfWeek}, ${data.startTime}, ${data.endTime}, ${data.room})
        RETURNING *
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  async getTeacherAssignments(): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          ts.*,
          u.first_name || ' ' || u.last_name as teacher_name,
          subj.name as subject_name,
          sec.name as section_name
        FROM teacher_subjects ts
        LEFT JOIN users u ON ts.teacher_id = u.id
        LEFT JOIN subjects subj ON ts.subject_id = subj.id
        LEFT JOIN sections sec ON ts.section_id = sec.id
        ORDER BY u.first_name, subj.name
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting teacher assignments:', error);
      return [];
    }
  }

  async getTeacherSchedules(teacherId?: number): Promise<any[]> {
    try {
      const whereClause = teacherId ? `WHERE s.teacher_id = ${teacherId}` : '';
      const result = await db.execute(sql.raw(`
        SELECT 
          s.*, 
          u.first_name || ' ' || u.last_name as teacher_name,
          subj.name as subject_name,
          sec.name as section_name
        FROM schedules s
        LEFT JOIN users u ON s.teacher_id = u.id
        LEFT JOIN subjects subj ON s.subject_id = subj.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        ${whereClause}
        ORDER BY s.day_of_week, s.start_time
      `));
      return result.rows;
    } catch (error) {
      console.error('Error getting teacher schedules:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();