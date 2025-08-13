import { 
  users, announcements, news, events, enrollments, sections, roles, subjects, 
  teacherAssignments, orgChart, schoolSettings, tuitionFees, grades, chatMessages,
  teacherTasks, taskSubmissions, teacherMeetings, notifications,
  guidanceBehaviorRecords, guidanceCounselingSessions, guidanceWellnessPrograms, guidanceProgramParticipants,
  registrarEnrollmentRequests, registrarSubjects, academicRecords, graduationCandidates, transcriptRequests,
  feeStructures, invoices, invoiceItems, payments, scholarships, schoolExpenses,
  conversations, conversationMembers, messages, userStatus,
  type User, type InsertUser, 
  type Announcement, type InsertAnnouncement, 
  type News, type InsertNews, 
  type Event, type InsertEvent,
  type Enrollment, type InsertEnrollment,
  type Section, type InsertSection,
  type Role, type InsertRole,
  type Subject, type InsertSubject,
  type TeacherAssignment, type InsertTeacherAssignment,
  type OrgChart, type InsertOrgChart,
  type SchoolSettings, type InsertSchoolSettings,
  type TuitionFee, type InsertTuitionFee,
  type Grade, type InsertGrade,
  type ChatMessage, type InsertChatMessage,
  type TeacherTask, type InsertTeacherTask,
  type TaskSubmission, type InsertTaskSubmission,
  type TeacherMeeting, type InsertTeacherMeeting,
  type Notification, type InsertNotification,
  type GuidanceBehaviorRecord, type InsertGuidanceBehaviorRecord,
  type GuidanceCounselingSession, type InsertGuidanceCounselingSession,
  type GuidanceWellnessProgram, type InsertGuidanceWellnessProgram,
  type GuidanceProgramParticipant, type InsertGuidanceProgramParticipant,
  type RegistrarEnrollmentRequest, type InsertRegistrarEnrollmentRequest,
  type RegistrarSubject, type InsertRegistrarSubject,
  type AcademicRecord, type InsertAcademicRecord,
  type GraduationCandidate, type InsertGraduationCandidate,
  type TranscriptRequest, type InsertTranscriptRequest,
  type FeeStructure, type InsertFeeStructure,
  type Invoice, type InsertInvoice,
  type InvoiceItem, type InsertInvoiceItem,
  type Payment, type InsertPayment,
  type Scholarship, type InsertScholarship,
  type SchoolExpense, type InsertSchoolExpense,
  type Conversation, type InsertConversation,
  type ConversationMember, type InsertConversationMember,
  type Message, type InsertMessage,
  type UserStatus, type InsertUserStatus
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, not, gte, lte } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Role management
  getRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, updates: Partial<InsertRole>): Promise<Role>;
  deleteRole(id: number): Promise<void>;
  
  // Enrollment management
  getEnrollments(): Promise<Enrollment[]>;
  getEnrollment(id: number): Promise<Enrollment | undefined>;
  updateEnrollment(id: number, updates: Partial<InsertEnrollment>): Promise<Enrollment>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  
  // Section management
  getSections(): Promise<Section[]>;
  createSection(section: InsertSection): Promise<Section>;
  updateSection(id: number, updates: Partial<InsertSection>): Promise<Section>;
  deleteSection(id: number): Promise<void>;
  
  // Subject management
  getSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, updates: Partial<InsertSubject>): Promise<Subject>;
  deleteSubject(id: number): Promise<void>;
  
  // Teacher assignments
  getTeacherAssignments(): Promise<TeacherAssignment[]>;
  createTeacherAssignment(assignment: InsertTeacherAssignment): Promise<TeacherAssignment>;
  deleteTeacherAssignment(id: number): Promise<void>;
  
  // Org chart management
  getOrgChart(): Promise<OrgChart[]>;
  createOrgChartEntry(entry: InsertOrgChart): Promise<OrgChart>;
  updateOrgChartEntry(id: number, updates: Partial<InsertOrgChart>): Promise<OrgChart>;
  deleteOrgChartEntry(id: number): Promise<void>;
  
  // School settings
  getSchoolSettings(): Promise<SchoolSettings[]>;
  createSchoolSettings(settings: InsertSchoolSettings): Promise<SchoolSettings>;
  updateSchoolSettings(id: number, updates: Partial<InsertSchoolSettings>): Promise<SchoolSettings>;
  
  // Tuition fees
  getTuitionFees(): Promise<TuitionFee[]>;
  createTuitionFee(fee: InsertTuitionFee): Promise<TuitionFee>;
  updateTuitionFee(id: number, updates: Partial<InsertTuitionFee>): Promise<TuitionFee>;
  deleteTuitionFee(id: number): Promise<void>;
  
  // Grades management
  getGrades(): Promise<Grade[]>;
  getGradesByStudent(studentId: number): Promise<Grade[]>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: number, updates: Partial<InsertGrade>): Promise<Grade>;
  deleteGrade(id: number): Promise<void>;
  
  // Chat message management
  getChatMessages(): Promise<ChatMessage[]>;
  deleteChatMessage(id: number): Promise<void>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Content management
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
  getNews(): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;
  updateNews(id: number, updates: Partial<InsertNews>): Promise<News>;
  deleteNews(id: number): Promise<void>;
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  
  // Enhanced teacher features
  getTeacherTasks(teacherId?: number): Promise<TeacherTask[]>;
  createTeacherTask(task: InsertTeacherTask): Promise<TeacherTask>;
  updateTeacherTask(id: number, updates: Partial<InsertTeacherTask>): Promise<TeacherTask>;
  deleteTeacherTask(id: number): Promise<void>;
  
  getTaskSubmissions(taskId?: number, studentId?: number): Promise<TaskSubmission[]>;
  createTaskSubmission(submission: InsertTaskSubmission): Promise<TaskSubmission>;
  updateTaskSubmission(id: number, updates: Partial<InsertTaskSubmission>): Promise<TaskSubmission>;
  
  getTeacherMeetings(teacherId?: number): Promise<TeacherMeeting[]>;
  createTeacherMeeting(meeting: InsertTeacherMeeting): Promise<TeacherMeeting>;
  updateTeacherMeeting(id: number, updates: Partial<InsertTeacherMeeting>): Promise<TeacherMeeting>;
  deleteTeacherMeeting(id: number): Promise<void>;
  
  getNotifications(recipientId?: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  
  // Guidance office features
  getBehaviorRecords(studentId?: number): Promise<GuidanceBehaviorRecord[]>;
  createBehaviorRecord(record: InsertGuidanceBehaviorRecord): Promise<GuidanceBehaviorRecord>;
  updateBehaviorRecord(id: number, updates: Partial<InsertGuidanceBehaviorRecord>): Promise<GuidanceBehaviorRecord>;
  deleteBehaviorRecord(id: number): Promise<void>;
  
  getCounselingSessions(studentId?: number, counselorId?: number): Promise<GuidanceCounselingSession[]>;
  createCounselingSession(session: InsertGuidanceCounselingSession): Promise<GuidanceCounselingSession>;
  updateCounselingSession(id: number, updates: Partial<InsertGuidanceCounselingSession>): Promise<GuidanceCounselingSession>;
  deleteCounselingSession(id: number): Promise<void>;
  
  getWellnessPrograms(): Promise<GuidanceWellnessProgram[]>;
  createWellnessProgram(program: InsertGuidanceWellnessProgram): Promise<GuidanceWellnessProgram>;
  updateWellnessProgram(id: number, updates: Partial<InsertGuidanceWellnessProgram>): Promise<GuidanceWellnessProgram>;
  deleteWellnessProgram(id: number): Promise<void>;
  
  getProgramParticipants(programId?: number): Promise<GuidanceProgramParticipant[]>;
  addProgramParticipant(participant: InsertGuidanceProgramParticipant): Promise<GuidanceProgramParticipant>;
  removeProgramParticipant(id: number): Promise<void>;
  
  // Registrar office features
  getEnrollmentRequests(status?: string): Promise<RegistrarEnrollmentRequest[]>;
  createEnrollmentRequest(request: InsertRegistrarEnrollmentRequest): Promise<RegistrarEnrollmentRequest>;
  updateEnrollmentRequest(id: number, updates: Partial<InsertRegistrarEnrollmentRequest>): Promise<RegistrarEnrollmentRequest>;
  deleteEnrollmentRequest(id: number): Promise<void>;
  
  getRegistrarSubjects(gradeLevel?: string): Promise<RegistrarSubject[]>;
  createRegistrarSubject(subject: InsertRegistrarSubject): Promise<RegistrarSubject>;
  updateRegistrarSubject(id: number, updates: Partial<InsertRegistrarSubject>): Promise<RegistrarSubject>;
  deleteRegistrarSubject(id: number): Promise<void>;
  
  getAcademicRecords(studentId?: number, schoolYear?: string): Promise<AcademicRecord[]>;
  createAcademicRecord(record: InsertAcademicRecord): Promise<AcademicRecord>;
  updateAcademicRecord(id: number, updates: Partial<InsertAcademicRecord>): Promise<AcademicRecord>;
  deleteAcademicRecord(id: number): Promise<void>;
  
  getGraduationCandidates(schoolYear?: string): Promise<GraduationCandidate[]>;
  createGraduationCandidate(candidate: InsertGraduationCandidate): Promise<GraduationCandidate>;
  updateGraduationCandidate(id: number, updates: Partial<InsertGraduationCandidate>): Promise<GraduationCandidate>;
  
  getTranscriptRequests(studentId?: number): Promise<TranscriptRequest[]>;
  createTranscriptRequest(request: InsertTranscriptRequest): Promise<TranscriptRequest>;
  updateTranscriptRequest(id: number, updates: Partial<InsertTranscriptRequest>): Promise<TranscriptRequest>;
  
  // Accounting module features
  getFeeStructures(gradeLevel?: string, schoolYear?: string): Promise<FeeStructure[]>;
  createFeeStructure(feeStructure: InsertFeeStructure): Promise<FeeStructure>;
  updateFeeStructure(id: number, updates: Partial<InsertFeeStructure>): Promise<FeeStructure>;
  deleteFeeStructure(id: number): Promise<void>;
  
  getInvoices(studentId?: number, status?: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: number): Promise<void>;
  
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  deleteInvoiceItem(id: number): Promise<void>;
  
  getPayments(invoiceId?: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment>;
  
  getScholarships(studentId?: number): Promise<Scholarship[]>;
  createScholarship(scholarship: InsertScholarship): Promise<Scholarship>;
  updateScholarship(id: number, updates: Partial<InsertScholarship>): Promise<Scholarship>;
  deleteScholarship(id: number): Promise<void>;
  
  getSchoolExpenses(category?: string, startDate?: string, endDate?: string): Promise<SchoolExpense[]>;
  createSchoolExpense(expense: InsertSchoolExpense): Promise<SchoolExpense>;
  updateSchoolExpense(id: number, updates: Partial<InsertSchoolExpense>): Promise<SchoolExpense>;
  deleteSchoolExpense(id: number): Promise<void>;
  
  // Real-time chat system features
  getConversations(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;
  
  getConversationMembers(conversationId: number): Promise<ConversationMember[]>;
  addConversationMember(member: InsertConversationMember): Promise<ConversationMember>;
  removeConversationMember(conversationId: number, userId: number): Promise<void>;
  
  getMessages(conversationId: number, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: number): Promise<void>;
  markConversationAsRead(conversationId: number, userId: number): Promise<void>;
  
  getUserStatus(userId: number): Promise<UserStatus | null>;
  updateUserStatus(userId: number, status: Partial<InsertUserStatus>): Promise<UserStatus>;
  getOnlineUsers(): Promise<UserStatus[]>;

  // Principal dashboard methods
  getPrincipalStats(): Promise<any>;
  getPrincipalFinancialOverview(): Promise<any>;

  // Academic Coordinator dashboard methods
  getAcademicCurriculumData(): Promise<any>;
  getTeacherPerformanceData(): Promise<any>;
  getAcademicStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.datePosted));
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db
      .insert(announcements)
      .values(insertAnnouncement)
      .returning();
    return announcement;
  }

  async getNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(desc(news.datePosted));
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const [newsItem] = await db
      .insert(news)
      .values(insertNews)
      .returning();
    return newsItem;
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.date));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  // User management methods
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.update(users).set({ isActive: false }).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  // Role management methods
  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values(insertRole).returning();
    return role;
  }

  async updateRole(id: number, updates: Partial<InsertRole>): Promise<Role> {
    const [role] = await db.update(roles).set(updates).where(eq(roles.id, id)).returning();
    return role;
  }

  async deleteRole(id: number): Promise<void> {
    await db.delete(roles).where(eq(roles.id, id));
  }

  // Enrollment management methods
  async getEnrollments(): Promise<Enrollment[]> {
    return await db.select().from(enrollments);
  }

  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id));
    return enrollment || undefined;
  }

  async updateEnrollment(id: number, updates: Partial<InsertEnrollment>): Promise<Enrollment> {
    const [enrollment] = await db.update(enrollments).set(updates).where(eq(enrollments.id, id)).returning();
    return enrollment;
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db.insert(enrollments).values(insertEnrollment).returning();
    return enrollment;
  }

  // Section management methods
  async getSections(): Promise<Section[]> {
    return await db.select().from(sections);
  }

  async createSection(insertSection: InsertSection): Promise<Section> {
    const [section] = await db.insert(sections).values(insertSection).returning();
    return section;
  }

  async updateSection(id: number, updates: Partial<InsertSection>): Promise<Section> {
    const [section] = await db.update(sections).set(updates).where(eq(sections.id, id)).returning();
    return section;
  }

  async deleteSection(id: number): Promise<void> {
    await db.delete(sections).where(eq(sections.id, id));
  }

  // Subject management methods
  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(insertSubject).returning();
    return subject;
  }

  async updateSubject(id: number, updates: Partial<InsertSubject>): Promise<Subject> {
    const [subject] = await db.update(subjects).set(updates).where(eq(subjects.id, id)).returning();
    return subject;
  }

  async deleteSubject(id: number): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  // Teacher assignments methods
  async getTeacherAssignments(): Promise<TeacherAssignment[]> {
    return await db.select().from(teacherAssignments);
  }

  async createTeacherAssignment(insertAssignment: InsertTeacherAssignment): Promise<TeacherAssignment> {
    const [assignment] = await db.insert(teacherAssignments).values(insertAssignment).returning();
    return assignment;
  }

  async deleteTeacherAssignment(id: number): Promise<void> {
    await db.delete(teacherAssignments).where(eq(teacherAssignments.id, id));
  }

  // Org chart methods
  async getOrgChart(): Promise<OrgChart[]> {
    return await db.select().from(orgChart);
  }

  async createOrgChartEntry(insertEntry: InsertOrgChart): Promise<OrgChart> {
    const [entry] = await db.insert(orgChart).values(insertEntry).returning();
    return entry;
  }

  async updateOrgChartEntry(id: number, updates: Partial<InsertOrgChart>): Promise<OrgChart> {
    const [entry] = await db.update(orgChart).set(updates).where(eq(orgChart.id, id)).returning();
    return entry;
  }

  async deleteOrgChartEntry(id: number): Promise<void> {
    await db.delete(orgChart).where(eq(orgChart.id, id));
  }

  // School settings methods
  async getSchoolSettings(): Promise<SchoolSettings[]> {
    return await db.select().from(schoolSettings);
  }

  async createSchoolSettings(insertSettings: InsertSchoolSettings): Promise<SchoolSettings> {
    const [settings] = await db.insert(schoolSettings).values(insertSettings).returning();
    return settings;
  }

  async updateSchoolSettings(id: number, updates: Partial<InsertSchoolSettings>): Promise<SchoolSettings> {
    const [settings] = await db.update(schoolSettings).set(updates).where(eq(schoolSettings.id, id)).returning();
    return settings;
  }

  // Tuition fees methods
  async getTuitionFees(): Promise<TuitionFee[]> {
    return await db.select().from(tuitionFees);
  }

  async createTuitionFee(insertFee: InsertTuitionFee): Promise<TuitionFee> {
    const [fee] = await db.insert(tuitionFees).values(insertFee).returning();
    return fee;
  }

  async updateTuitionFee(id: number, updates: Partial<InsertTuitionFee>): Promise<TuitionFee> {
    const [fee] = await db.update(tuitionFees).set(updates).where(eq(tuitionFees.id, id)).returning();
    return fee;
  }

  async deleteTuitionFee(id: number): Promise<void> {
    await db.delete(tuitionFees).where(eq(tuitionFees.id, id));
  }

  // Grades management methods
  async getGrades(): Promise<Grade[]> {
    return await db.select().from(grades);
  }

  async getGradesByStudent(studentId: number): Promise<Grade[]> {
    return await db.select().from(grades).where(eq(grades.studentId, studentId));
  }

  async createGrade(insertGrade: InsertGrade): Promise<Grade> {
    const [grade] = await db.insert(grades).values(insertGrade).returning();
    return grade;
  }

  async updateGrade(id: number, updates: Partial<InsertGrade>): Promise<Grade> {
    const [grade] = await db.update(grades).set(updates).where(eq(grades.id, id)).returning();
    return grade;
  }

  async deleteGrade(id: number): Promise<void> {
    await db.delete(grades).where(eq(grades.id, id));
  }

  // Chat message management methods
  async getChatMessages(): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt));
  }

  async deleteChatMessage(id: number): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.id, id));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  // Content management methods
  async updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [announcement] = await db.update(announcements).set(updates).where(eq(announcements.id, id)).returning();
    return announcement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  async updateNews(id: number, updates: Partial<InsertNews>): Promise<News> {
    const [newsItem] = await db.update(news).set(updates).where(eq(news.id, id)).returning();
    return newsItem;
  }

  async deleteNews(id: number): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return event;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Enhanced teacher features implementation
  async getTeacherTasks(teacherId?: number): Promise<TeacherTask[]> {
    if (teacherId) {
      return await db.select().from(teacherTasks).where(eq(teacherTasks.teacherId, teacherId)).orderBy(desc(teacherTasks.createdAt));
    }
    return await db.select().from(teacherTasks).orderBy(desc(teacherTasks.createdAt));
  }

  async createTeacherTask(task: InsertTeacherTask): Promise<TeacherTask> {
    const [newTask] = await db.insert(teacherTasks).values(task).returning();
    return newTask;
  }

  async updateTeacherTask(id: number, updates: Partial<InsertTeacherTask>): Promise<TeacherTask> {
    const [updatedTask] = await db.update(teacherTasks).set(updates).where(eq(teacherTasks.id, id)).returning();
    return updatedTask;
  }

  async deleteTeacherTask(id: number): Promise<void> {
    await db.delete(teacherTasks).where(eq(teacherTasks.id, id));
  }

  async getTaskSubmissions(taskId?: number, studentId?: number): Promise<TaskSubmission[]> {
    if (taskId && studentId) {
      return await db.select().from(taskSubmissions).where(and(eq(taskSubmissions.taskId, taskId), eq(taskSubmissions.studentId, studentId)));
    } else if (taskId) {
      return await db.select().from(taskSubmissions).where(eq(taskSubmissions.taskId, taskId)).orderBy(desc(taskSubmissions.submittedAt));
    } else if (studentId) {
      return await db.select().from(taskSubmissions).where(eq(taskSubmissions.studentId, studentId)).orderBy(desc(taskSubmissions.submittedAt));
    }
    return await db.select().from(taskSubmissions).orderBy(desc(taskSubmissions.submittedAt));
  }

  async createTaskSubmission(submission: InsertTaskSubmission): Promise<TaskSubmission> {
    const [newSubmission] = await db.insert(taskSubmissions).values(submission).returning();
    return newSubmission;
  }

  async updateTaskSubmission(id: number, updates: Partial<InsertTaskSubmission>): Promise<TaskSubmission> {
    const [updatedSubmission] = await db.update(taskSubmissions).set(updates).where(eq(taskSubmissions.id, id)).returning();
    return updatedSubmission;
  }

  async getTeacherMeetings(teacherId?: number): Promise<TeacherMeeting[]> {
    if (teacherId) {
      return await db.select().from(teacherMeetings).where(eq(teacherMeetings.teacherId, teacherId)).orderBy(desc(teacherMeetings.scheduledAt));
    }
    return await db.select().from(teacherMeetings).orderBy(desc(teacherMeetings.scheduledAt));
  }

  async createTeacherMeeting(meeting: InsertTeacherMeeting): Promise<TeacherMeeting> {
    const [newMeeting] = await db.insert(teacherMeetings).values(meeting).returning();
    return newMeeting;
  }

  async updateTeacherMeeting(id: number, updates: Partial<InsertTeacherMeeting>): Promise<TeacherMeeting> {
    const [updatedMeeting] = await db.update(teacherMeetings).set(updates).where(eq(teacherMeetings.id, id)).returning();
    return updatedMeeting;
  }

  async deleteTeacherMeeting(id: number): Promise<void> {
    await db.delete(teacherMeetings).where(eq(teacherMeetings.id, id));
  }

  async getNotifications(recipientId?: number): Promise<Notification[]> {
    if (recipientId) {
      return await db.select().from(notifications).where(eq(notifications.recipientId, recipientId)).orderBy(desc(notifications.createdAt));
    }
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Guidance office implementations
  async getBehaviorRecords(studentId?: number): Promise<GuidanceBehaviorRecord[]> {
    if (studentId) {
      return await db.select().from(guidanceBehaviorRecords).where(eq(guidanceBehaviorRecords.studentId, studentId)).orderBy(desc(guidanceBehaviorRecords.dateReported));
    }
    return await db.select().from(guidanceBehaviorRecords).orderBy(desc(guidanceBehaviorRecords.dateReported));
  }

  async createBehaviorRecord(record: InsertGuidanceBehaviorRecord): Promise<GuidanceBehaviorRecord> {
    const [newRecord] = await db.insert(guidanceBehaviorRecords).values(record).returning();
    return newRecord;
  }

  async updateBehaviorRecord(id: number, updates: Partial<InsertGuidanceBehaviorRecord>): Promise<GuidanceBehaviorRecord> {
    const [updatedRecord] = await db.update(guidanceBehaviorRecords).set(updates).where(eq(guidanceBehaviorRecords.id, id)).returning();
    return updatedRecord;
  }

  async deleteBehaviorRecord(id: number): Promise<void> {
    await db.delete(guidanceBehaviorRecords).where(eq(guidanceBehaviorRecords.id, id));
  }

  async getCounselingSessions(studentId?: number, counselorId?: number): Promise<GuidanceCounselingSession[]> {
    if (studentId && counselorId) {
      return await db.select().from(guidanceCounselingSessions).where(and(eq(guidanceCounselingSessions.studentId, studentId), eq(guidanceCounselingSessions.counselorId, counselorId))).orderBy(desc(guidanceCounselingSessions.sessionDate));
    } else if (studentId) {
      return await db.select().from(guidanceCounselingSessions).where(eq(guidanceCounselingSessions.studentId, studentId)).orderBy(desc(guidanceCounselingSessions.sessionDate));
    } else if (counselorId) {
      return await db.select().from(guidanceCounselingSessions).where(eq(guidanceCounselingSessions.counselorId, counselorId)).orderBy(desc(guidanceCounselingSessions.sessionDate));
    }
    return await db.select().from(guidanceCounselingSessions).orderBy(desc(guidanceCounselingSessions.sessionDate));
  }

  async createCounselingSession(session: InsertGuidanceCounselingSession): Promise<GuidanceCounselingSession> {
    const [newSession] = await db.insert(guidanceCounselingSessions).values(session).returning();
    return newSession;
  }

  async updateCounselingSession(id: number, updates: Partial<InsertGuidanceCounselingSession>): Promise<GuidanceCounselingSession> {
    const [updatedSession] = await db.update(guidanceCounselingSessions).set(updates).where(eq(guidanceCounselingSessions.id, id)).returning();
    return updatedSession;
  }

  async deleteCounselingSession(id: number): Promise<void> {
    await db.delete(guidanceCounselingSessions).where(eq(guidanceCounselingSessions.id, id));
  }

  async getWellnessPrograms(): Promise<GuidanceWellnessProgram[]> {
    return await db.select().from(guidanceWellnessPrograms).orderBy(desc(guidanceWellnessPrograms.startDate));
  }

  async createWellnessProgram(program: InsertGuidanceWellnessProgram): Promise<GuidanceWellnessProgram> {
    const [newProgram] = await db.insert(guidanceWellnessPrograms).values(program).returning();
    return newProgram;
  }

  async updateWellnessProgram(id: number, updates: Partial<InsertGuidanceWellnessProgram>): Promise<GuidanceWellnessProgram> {
    const [updatedProgram] = await db.update(guidanceWellnessPrograms).set(updates).where(eq(guidanceWellnessPrograms.id, id)).returning();
    return updatedProgram;
  }

  async deleteWellnessProgram(id: number): Promise<void> {
    await db.delete(guidanceWellnessPrograms).where(eq(guidanceWellnessPrograms.id, id));
  }

  async getProgramParticipants(programId?: number): Promise<GuidanceProgramParticipant[]> {
    if (programId) {
      return await db.select().from(guidanceProgramParticipants).where(eq(guidanceProgramParticipants.programId, programId)).orderBy(desc(guidanceProgramParticipants.joinedAt));
    }
    return await db.select().from(guidanceProgramParticipants).orderBy(desc(guidanceProgramParticipants.joinedAt));
  }

  async addProgramParticipant(participant: InsertGuidanceProgramParticipant): Promise<GuidanceProgramParticipant> {
    const [newParticipant] = await db.insert(guidanceProgramParticipants).values(participant).returning();
    return newParticipant;
  }

  async removeProgramParticipant(id: number): Promise<void> {
    await db.delete(guidanceProgramParticipants).where(eq(guidanceProgramParticipants.id, id));
  }

  // Registrar office implementations
  async getEnrollmentRequests(status?: string): Promise<RegistrarEnrollmentRequest[]> {
    if (status) {
      return await db.select().from(registrarEnrollmentRequests).where(eq(registrarEnrollmentRequests.status, status)).orderBy(desc(registrarEnrollmentRequests.dateRequested));
    }
    return await db.select().from(registrarEnrollmentRequests).orderBy(desc(registrarEnrollmentRequests.dateRequested));
  }

  async createEnrollmentRequest(request: InsertRegistrarEnrollmentRequest): Promise<RegistrarEnrollmentRequest> {
    const [newRequest] = await db.insert(registrarEnrollmentRequests).values(request).returning();
    return newRequest;
  }

  async updateEnrollmentRequest(id: number, updates: Partial<InsertRegistrarEnrollmentRequest>): Promise<RegistrarEnrollmentRequest> {
    const [updatedRequest] = await db.update(registrarEnrollmentRequests).set({
      ...updates,
      dateProcessed: updates.status && updates.status !== 'Pending' ? new Date() : undefined
    }).where(eq(registrarEnrollmentRequests.id, id)).returning();
    return updatedRequest;
  }

  async deleteEnrollmentRequest(id: number): Promise<void> {
    await db.delete(registrarEnrollmentRequests).where(eq(registrarEnrollmentRequests.id, id));
  }

  async getRegistrarSubjects(gradeLevel?: string): Promise<RegistrarSubject[]> {
    if (gradeLevel) {
      return await db.select().from(registrarSubjects).where(eq(registrarSubjects.gradeLevel, gradeLevel)).orderBy(registrarSubjects.subjectCode);
    }
    return await db.select().from(registrarSubjects).orderBy(registrarSubjects.subjectCode);
  }

  async createRegistrarSubject(subject: InsertRegistrarSubject): Promise<RegistrarSubject> {
    const [newSubject] = await db.insert(registrarSubjects).values(subject).returning();
    return newSubject;
  }

  async updateRegistrarSubject(id: number, updates: Partial<InsertRegistrarSubject>): Promise<RegistrarSubject> {
    const [updatedSubject] = await db.update(registrarSubjects).set(updates).where(eq(registrarSubjects.id, id)).returning();
    return updatedSubject;
  }

  async deleteRegistrarSubject(id: number): Promise<void> {
    await db.delete(registrarSubjects).where(eq(registrarSubjects.id, id));
  }

  async getAcademicRecords(studentId?: number, schoolYear?: string): Promise<AcademicRecord[]> {
    if (studentId && schoolYear) {
      return await db.select().from(academicRecords).where(and(eq(academicRecords.studentId, studentId), eq(academicRecords.schoolYear, schoolYear))).orderBy(desc(academicRecords.recordedAt));
    } else if (studentId) {
      return await db.select().from(academicRecords).where(eq(academicRecords.studentId, studentId)).orderBy(desc(academicRecords.recordedAt));
    } else if (schoolYear) {
      return await db.select().from(academicRecords).where(eq(academicRecords.schoolYear, schoolYear)).orderBy(desc(academicRecords.recordedAt));
    }
    return await db.select().from(academicRecords).orderBy(desc(academicRecords.recordedAt));
  }

  async createAcademicRecord(record: InsertAcademicRecord): Promise<AcademicRecord> {
    const [newRecord] = await db.insert(academicRecords).values(record).returning();
    return newRecord;
  }

  async updateAcademicRecord(id: number, updates: Partial<InsertAcademicRecord>): Promise<AcademicRecord> {
    const [updatedRecord] = await db.update(academicRecords).set(updates).where(eq(academicRecords.id, id)).returning();
    return updatedRecord;
  }

  async deleteAcademicRecord(id: number): Promise<void> {
    await db.delete(academicRecords).where(eq(academicRecords.id, id));
  }

  async getGraduationCandidates(schoolYear?: string): Promise<GraduationCandidate[]> {
    if (schoolYear) {
      return await db.select().from(graduationCandidates).where(eq(graduationCandidates.schoolYear, schoolYear)).orderBy(graduationCandidates.status);
    }
    return await db.select().from(graduationCandidates).orderBy(graduationCandidates.status);
  }

  async createGraduationCandidate(candidate: InsertGraduationCandidate): Promise<GraduationCandidate> {
    const [newCandidate] = await db.insert(graduationCandidates).values(candidate).returning();
    return newCandidate;
  }

  async updateGraduationCandidate(id: number, updates: Partial<InsertGraduationCandidate>): Promise<GraduationCandidate> {
    const [updatedCandidate] = await db.update(graduationCandidates).set({
      ...updates,
      dateCleared: updates.status === 'Cleared' ? new Date() : undefined
    }).where(eq(graduationCandidates.id, id)).returning();
    return updatedCandidate;
  }

  async getTranscriptRequests(studentId?: number): Promise<TranscriptRequest[]> {
    if (studentId) {
      return await db.select().from(transcriptRequests).where(eq(transcriptRequests.studentId, studentId)).orderBy(desc(transcriptRequests.requestDate));
    }
    return await db.select().from(transcriptRequests).orderBy(desc(transcriptRequests.requestDate));
  }

  async createTranscriptRequest(request: InsertTranscriptRequest): Promise<TranscriptRequest> {
    const [newRequest] = await db.insert(transcriptRequests).values(request).returning();
    return newRequest;
  }

  async updateTranscriptRequest(id: number, updates: Partial<InsertTranscriptRequest>): Promise<TranscriptRequest> {
    const [updatedRequest] = await db.update(transcriptRequests).set({
      ...updates,
      releaseDate: updates.status === 'Released' ? new Date() : undefined
    }).where(eq(transcriptRequests.id, id)).returning();
    return updatedRequest;
  }

  // Accounting module implementations
  async getFeeStructures(gradeLevel?: string, schoolYear?: string): Promise<FeeStructure[]> {
    if (gradeLevel && schoolYear) {
      return await db.select().from(feeStructures).where(and(eq(feeStructures.gradeLevel, gradeLevel), eq(feeStructures.effectiveSchoolYear, schoolYear)));
    } else if (gradeLevel) {
      return await db.select().from(feeStructures).where(eq(feeStructures.gradeLevel, gradeLevel));
    } else if (schoolYear) {
      return await db.select().from(feeStructures).where(eq(feeStructures.effectiveSchoolYear, schoolYear));
    }
    return await db.select().from(feeStructures).orderBy(feeStructures.gradeLevel);
  }

  async createFeeStructure(feeStructure: InsertFeeStructure): Promise<FeeStructure> {
    const [newFeeStructure] = await db.insert(feeStructures).values(feeStructure).returning();
    return newFeeStructure;
  }

  async updateFeeStructure(id: number, updates: Partial<InsertFeeStructure>): Promise<FeeStructure> {
    const [updatedFeeStructure] = await db.update(feeStructures).set(updates).where(eq(feeStructures.id, id)).returning();
    return updatedFeeStructure;
  }

  async deleteFeeStructure(id: number): Promise<void> {
    await db.delete(feeStructures).where(eq(feeStructures.id, id));
  }

  async getInvoices(studentId?: number, status?: string): Promise<Invoice[]> {
    if (studentId && status) {
      return await db.select().from(invoices).where(and(eq(invoices.studentId, studentId), eq(invoices.status, status))).orderBy(desc(invoices.createdAt));
    } else if (studentId) {
      return await db.select().from(invoices).where(eq(invoices.studentId, studentId)).orderBy(desc(invoices.createdAt));
    } else if (status) {
      return await db.select().from(invoices).where(eq(invoices.status, status)).orderBy(desc(invoices.createdAt));
    }
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice> {
    const [updatedInvoice] = await db.update(invoices).set(updates).where(eq(invoices.id, id)).returning();
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const [newItem] = await db.insert(invoiceItems).values(item).returning();
    return newItem;
  }

  async deleteInvoiceItem(id: number): Promise<void> {
    await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
  }

  async getPayments(invoiceId?: number): Promise<Payment[]> {
    if (invoiceId) {
      return await db.select().from(payments).where(eq(payments.invoiceId, invoiceId)).orderBy(desc(payments.paymentDate));
    }
    return await db.select().from(payments).orderBy(desc(payments.paymentDate));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment> {
    const [updatedPayment] = await db.update(payments).set(updates).where(eq(payments.id, id)).returning();
    return updatedPayment;
  }

  async getScholarships(studentId?: number): Promise<Scholarship[]> {
    if (studentId) {
      return await db.select().from(scholarships).where(eq(scholarships.studentId, studentId));
    }
    return await db.select().from(scholarships);
  }

  async createScholarship(scholarship: InsertScholarship): Promise<Scholarship> {
    const [newScholarship] = await db.insert(scholarships).values(scholarship).returning();
    return newScholarship;
  }

  async updateScholarship(id: number, updates: Partial<InsertScholarship>): Promise<Scholarship> {
    const [updatedScholarship] = await db.update(scholarships).set(updates).where(eq(scholarships.id, id)).returning();
    return updatedScholarship;
  }

  async deleteScholarship(id: number): Promise<void> {
    await db.delete(scholarships).where(eq(scholarships.id, id));
  }

  async getSchoolExpenses(category?: string, startDate?: string, endDate?: string): Promise<SchoolExpense[]> {
    let query = db.select().from(schoolExpenses);
    
    if (category && startDate && endDate) {
      return await query.where(and(
        eq(schoolExpenses.category, category),
        gte(schoolExpenses.expenseDate, startDate),
        lte(schoolExpenses.expenseDate, endDate)
      )).orderBy(desc(schoolExpenses.expenseDate));
    } else if (category) {
      return await query.where(eq(schoolExpenses.category, category)).orderBy(desc(schoolExpenses.expenseDate));
    } else if (startDate && endDate) {
      return await query.where(and(
        gte(schoolExpenses.expenseDate, startDate),
        lte(schoolExpenses.expenseDate, endDate)
      )).orderBy(desc(schoolExpenses.expenseDate));
    }
    
    return await query.orderBy(desc(schoolExpenses.expenseDate));
  }

  async createSchoolExpense(expense: InsertSchoolExpense): Promise<SchoolExpense> {
    const [newExpense] = await db.insert(schoolExpenses).values(expense).returning();
    return newExpense;
  }

  async updateSchoolExpense(id: number, updates: Partial<InsertSchoolExpense>): Promise<SchoolExpense> {
    const [updatedExpense] = await db.update(schoolExpenses).set(updates).where(eq(schoolExpenses.id, id)).returning();
    return updatedExpense;
  }

  async deleteSchoolExpense(id: number): Promise<void> {
    await db.delete(schoolExpenses).where(eq(schoolExpenses.id, id));
  }

  // Real-time chat system implementations
  async getConversations(userId: number): Promise<Conversation[]> {
    const userConversations = await db
      .select({ conversation: conversations })
      .from(conversations)
      .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
      .where(eq(conversationMembers.userId, userId))
      .orderBy(desc(conversations.createdAt));
    
    return userConversations.map(row => row.conversation);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async deleteConversation(id: number): Promise<void> {
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async getConversationMembers(conversationId: number): Promise<ConversationMember[]> {
    return await db.select().from(conversationMembers).where(eq(conversationMembers.conversationId, conversationId));
  }

  async addConversationMember(member: InsertConversationMember): Promise<ConversationMember> {
    const [newMember] = await db.insert(conversationMembers).values(member).returning();
    return newMember;
  }

  async removeConversationMember(conversationId: number, userId: number): Promise<void> {
    await db.delete(conversationMembers).where(
      and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, userId))
    );
  }

  async getMessages(conversationId: number, limit: number = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, messageId));
  }

  async markConversationAsRead(conversationId: number, userId: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(and(eq(messages.conversationId, conversationId), not(eq(messages.senderId, userId))));
  }

  async getUserStatus(userId: number): Promise<UserStatus | null> {
    const [status] = await db.select().from(userStatus).where(eq(userStatus.userId, userId));
    return status || null;
  }

  async updateUserStatus(userId: number, status: Partial<InsertUserStatus>): Promise<UserStatus> {
    const [updatedStatus] = await db
      .insert(userStatus)
      .values({ userId, ...status })
      .onConflictDoUpdate({
        target: userStatus.userId,
        set: { ...status, lastSeen: new Date() }
      })
      .returning();
    return updatedStatus;
  }

  async getOnlineUsers(): Promise<UserStatus[]> {
    return await db.select().from(userStatus).where(eq(userStatus.isOnline, true));
  }

  // Principal dashboard methods
  async getPrincipalStats(): Promise<any> {
    try {
      // Get comprehensive school statistics for principal oversight
      const allUsers = await db.select().from(users);
      const totalStudents = allUsers.filter(user => user.role === 'student').length;
      const totalTeachers = allUsers.filter(user => user.role === 'teacher').length;
      const newEnrollments = await db.select().from(enrollments);
      const allGrades = await db.select().from(grades);
      
      // Calculate average grade if grades exist
      let averageGrade = "N/A";
      if (allGrades.length > 0) {
        const validGrades = allGrades.filter(grade => grade.grade && !isNaN(parseFloat(grade.grade.toString())));
        if (validGrades.length > 0) {
          const sum = validGrades.reduce((acc, grade) => acc + parseFloat(grade.grade.toString()), 0);
          averageGrade = (sum / validGrades.length).toFixed(1);
        }
      }

      return {
        totalStudents,
        totalTeachers,
        newEnrollments: newEnrollments.length,
        activeTeachers: totalTeachers, // Assume all teachers are active for now
        averageGrade,
        studentSatisfaction: 85, // Mock data for now
        facultyRetention: 92,
        academicAchievement: 78,
        budgetEfficiency: 88
      };
    } catch (error) {
      console.error('Error getting principal stats:', error);
      return {
        totalStudents: 0,
        totalTeachers: 0,
        newEnrollments: 0,
        activeTeachers: 0,
        averageGrade: "N/A"
      };
    }
  }

  async getPrincipalFinancialOverview(): Promise<any> {
    try {
      // Get financial overview from accounting tables
      const allPayments = await db.select().from(payments);
      const allExpenses = await db.select().from(schoolExpenses);
      
      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyPayments = allPayments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      });
      
      const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + parseFloat(payment.amountPaid.toString()), 0);
      const yearlyRevenue = allPayments.reduce((sum, payment) => sum + parseFloat(payment.amountPaid.toString()), 0);
      
      // Calculate expenses by category
      const facultyExpenses = allExpenses
        .filter(expense => expense.category === 'Faculty')
        .reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);
      
      const facilityExpenses = allExpenses
        .filter(expense => expense.category === 'Facility')
        .reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);
      
      const academicExpenses = allExpenses
        .filter(expense => expense.category === 'Academic')
        .reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);

      return {
        monthlyRevenue: Math.round(monthlyRevenue),
        yearlyRevenue: Math.round(yearlyRevenue),
        revenueGrowth: 12, // Mock growth percentage
        outstandingPayments: 25000, // Mock data
        facultyExpenses: Math.round(facultyExpenses),
        facilityExpenses: Math.round(facilityExpenses),
        academicExpenses: Math.round(academicExpenses)
      };
    } catch (error) {
      console.error('Error getting principal financial overview:', error);
      return {
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        revenueGrowth: 0,
        outstandingPayments: 0,
        facultyExpenses: 0,
        facilityExpenses: 0,
        academicExpenses: 0
      };
    }
  }

  // Academic Coordinator dashboard methods
  async getAcademicCurriculumData(): Promise<any> {
    try {
      // Get curriculum-related data
      const allSubjects = await db.select().from(subjects);
      // For now, assume first half are core subjects, second half are elective
      const coreSubjects = allSubjects.slice(0, Math.ceil(allSubjects.length / 2));
      const electiveSubjects = allSubjects.slice(Math.ceil(allSubjects.length / 2));
      
      return {
        coreSubjects: coreSubjects.length,
        electiveSubjects: electiveSubjects.length,
        specializedTracks: 3, // Mock data
        grade10Progress: 85,
        grade11Progress: 78,
        grade12Progress: 92
      };
    } catch (error) {
      console.error('Error getting curriculum data:', error);
      return {
        coreSubjects: 0,
        electiveSubjects: 0,
        specializedTracks: 0,
        grade10Progress: 0,
        grade11Progress: 0,
        grade12Progress: 0
      };
    }
  }

  async getTeacherPerformanceData(): Promise<any[]> {
    try {
      // Get teacher performance data
      const teachers = await db.select().from(users).where(eq(users.role, 'teacher'));
      const teacherAssignmentData = await db.select().from(teacherAssignments);
      
      return teachers.map(teacher => {
        const assignments = teacherAssignmentData.filter(assignment => assignment.teacherId === teacher.id);
        return {
          id: teacher.id,
          name: teacher.name,
          subject: assignments.length > 0 ? `${assignments.length} subjects` : 'No assignments',
          performanceScore: Math.floor(Math.random() * 20) + 80, // Mock score 80-100
          studentRating: (Math.random() * 1 + 4).toFixed(1), // Mock rating 4.0-5.0
          classesAssigned: assignments.length
        };
      });
    } catch (error) {
      console.error('Error getting teacher performance data:', error);
      return [];
    }
  }

  async getAcademicStats(): Promise<any> {
    try {
      // Get academic statistics
      const allUsers = await db.select().from(users);
      const students = allUsers.filter(user => user.role === 'student');
      const teachers = allUsers.filter(user => user.role === 'teacher');
      const allSubjects = await db.select().from(subjects);
      const allGrades = await db.select().from(grades);
      
      // Calculate grade level performance (mock data based on actual students)
      const totalSubjects = allSubjects.length;
      const totalGrades = students.length * 3; // Assume 3 grade levels
      
      return {
        totalSubjects,
        totalGrades: totalGrades,
        totalTeachers: teachers.length,
        activeTeachers: teachers.length,
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
      console.error('Error getting academic stats:', error);
      return {
        totalSubjects: 0,
        totalGrades: 0,
        totalTeachers: 0,
        activeTeachers: 0,
        curriculumProgress: 0
      };
    }
  }
}

export const storage = new DatabaseStorage();
