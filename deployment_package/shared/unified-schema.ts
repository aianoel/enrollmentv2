import { pgTable, serial, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =====================
// USERS & ROLES
// =====================
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => roles.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

// =====================
// SECTIONS & SUBJECTS
// =====================
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gradeLevel: text("grade_level").notNull(),
  adviserId: integer("adviser_id").references(() => users.id, { onDelete: "set null" }),
  capacity: integer("capacity").default(40),
  schoolYear: text("school_year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id"),
  name: text("name").notNull(),
  description: text("description"),
});

// Teacher-Subject Assignments
export const teacherSubjects = pgTable("teacher_subjects", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => users.id, { onDelete: "cascade" }),
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
  sectionId: integer("section_id").references(() => sections.id, { onDelete: "cascade" }),
  schoolYear: text("school_year").notNull(),
  semester: text("semester").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// Teacher Schedules
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => users.id, { onDelete: "cascade" }),
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
  sectionId: integer("section_id").references(() => sections.id, { onDelete: "cascade" }),
  dayOfWeek: text("day_of_week").notNull(), // Monday, Tuesday, etc.
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  room: text("room"),
  schoolYear: text("school_year").notNull(),
  semester: text("semester").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================
// ENROLLMENT PROGRESS
// =====================
export const enrollmentProgress = pgTable("enrollment_progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id, { onDelete: "cascade" }),
  currentStatus: text("current_status").notNull(),
  remarks: text("remarks"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// =====================
// TEACHER MODULES
// =====================
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => users.id, { onDelete: "cascade" }),
  sectionId: integer("section_id").references(() => sections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// =====================
// TASKS
// =====================
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => users.id, { onDelete: "cascade" }),
  sectionId: integer("section_id").references(() => sections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  taskType: text("task_type").notNull(),
  timerMinutes: integer("timer_minutes"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================
// MEETINGS
// =====================
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").references(() => users.id, { onDelete: "cascade" }),
  sectionId: integer("section_id").references(() => sections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  meetingLink: text("meeting_link").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================
// CHAT SYSTEM
// =====================
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id, { onDelete: "cascade" }),
  receiverId: integer("receiver_id").references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

export const onlineStatus = pgTable("online_status", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen"),
});

// =====================
// ANNOUNCEMENTS & EVENTS
// =====================
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  postedBy: integer("posted_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
});

// =====================
// ACCOUNTING
// =====================
export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id, { onDelete: "cascade" }),
  feeType: text("fee_type").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  status: text("status").default("Unpaid"),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  feeId: integer("fee_id").references(() => fees.id, { onDelete: "cascade" }),
  studentId: integer("student_id").references(() => users.id, { onDelete: "cascade" }),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  paymentMethod: text("payment_method"), // 'cash', 'online', 'promissory_note'
  paymentStatus: text("payment_status").default("pending"), // 'pending', 'verified', 'rejected'
  referenceNumber: text("reference_number"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  recordedBy: integer("recorded_by").references(() => users.id, { onDelete: "set null" }),
  verifiedBy: integer("verified_by").references(() => users.id, { onDelete: "set null" }),
  verifiedAt: timestamp("verified_at"),
});

// =====================
// GUIDANCE
// =====================
export const guidanceReports = pgTable("guidance_reports", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id, { onDelete: "cascade" }),
  counselorId: integer("counselor_id").references(() => users.id, { onDelete: "set null" }),
  report: text("report").notNull(),
  reportDate: timestamp("report_date").defaultNow(),
});

// =====================
// GRADES
// =====================
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id, { onDelete: "cascade" }),
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
  teacherId: integer("teacher_id").references(() => users.id, { onDelete: "cascade" }),
  grade: numeric("grade", { precision: 5, scale: 2 }).notNull(),
  quarter: integer("quarter").notNull(),
  schoolYear: text("school_year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================
// NEWS
// =====================
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  content: text("content"),
  postedBy: integer("posted_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================
// MISSING SCHEMA TABLES
// =====================

// Enrollment Applications
export const enrollmentApplications = pgTable("enrollment_applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id, { onDelete: "cascade" }),
  schoolYear: text("school_year").notNull(),
  status: text("status").default("Draft"),
  submittedAt: timestamp("submitted_at"),
  decidedAt: timestamp("decided_at"),
  decidedBy: integer("decided_by").references(() => users.id, { onDelete: "set null" }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enrollment Documents
export const enrollmentDocuments = pgTable("enrollment_documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => enrollmentApplications.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Task Questions
export const taskQuestions = pgTable("task_questions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  questionType: text("question_type").notNull(),
  options: text("options"),
  correctAnswer: text("correct_answer"),
  points: integer("points").default(1),
});

// Task Submissions
export const taskSubmissions = pgTable("task_submissions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  studentId: integer("student_id").references(() => users.id, { onDelete: "cascade" }),
  answers: text("answers"),
  fileUrls: text("file_urls"),
  score: numeric("score", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  gradedAt: timestamp("graded_at"),
});



// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  recipientId: integer("recipient_id").references(() => users.id, { onDelete: "cascade" }),
  senderId: integer("sender_id").references(() => users.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});



// Learning Modules
export const learningModules = pgTable("learning_modules", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => users.id, { onDelete: "cascade" }),
  sectionId: integer("section_id").references(() => sections.id, { onDelete: "set null" }),
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================
// ZOD SCHEMAS
// =====================

// Roles
export const insertRoleSchema = createInsertSchema(roles);
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// Users
export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Sections
export const insertSectionSchema = createInsertSchema(sections);
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Section = typeof sections.$inferSelect;

// Subjects
export const insertSubjectSchema = createInsertSchema(subjects);
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

// Enrollment Progress
export const insertEnrollmentProgressSchema = createInsertSchema(enrollmentProgress);
export type InsertEnrollmentProgress = z.infer<typeof insertEnrollmentProgressSchema>;
export type EnrollmentProgress = typeof enrollmentProgress.$inferSelect;

// Modules
export const insertModuleSchema = createInsertSchema(modules);
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

// Tasks
export const insertTaskSchema = createInsertSchema(tasks);
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Meetings
export const insertMeetingSchema = createInsertSchema(meetings);
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;

// Messages
export const insertMessageSchema = createInsertSchema(messages);
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Online Status
export const insertOnlineStatusSchema = createInsertSchema(onlineStatus);
export type InsertOnlineStatus = z.infer<typeof insertOnlineStatusSchema>;
export type OnlineStatus = typeof onlineStatus.$inferSelect;

// Announcements
export const insertAnnouncementSchema = createInsertSchema(announcements);
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

// Events
export const insertEventSchema = createInsertSchema(events);
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Fees
export const insertFeeSchema = createInsertSchema(fees);
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type Fee = typeof fees.$inferSelect;

// Payments
export const insertPaymentSchema = createInsertSchema(payments);
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Guidance Reports
export const insertGuidanceReportSchema = createInsertSchema(guidanceReports);
export type InsertGuidanceReport = z.infer<typeof insertGuidanceReportSchema>;
export type GuidanceReport = typeof guidanceReports.$inferSelect;

// Teacher Subjects
export const insertTeacherSubjectSchema = createInsertSchema(teacherSubjects);
export type InsertTeacherSubject = z.infer<typeof insertTeacherSubjectSchema>;
export type TeacherSubject = typeof teacherSubjects.$inferSelect;

// Schedules
export const insertScheduleSchema = createInsertSchema(schedules);
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

// Grades
export const insertGradeSchema = createInsertSchema(grades);
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Grade = typeof grades.$inferSelect;

// News
export const insertNewsSchema = createInsertSchema(news);
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;