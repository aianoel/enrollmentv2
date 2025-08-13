import { pgTable, serial, varchar, text, integer, decimal, date, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ===============================
// 1. Users & Roles (Master Schema)
// ===============================
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  roleName: varchar("role_name", { length: 50 }).notNull().unique(),
});

export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  sectionName: varchar("section_name", { length: 100 }).notNull(),
  gradeLevel: varchar("grade_level", { length: 50 }).notNull(),
  adviserId: integer("adviser_id"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  roleId: integer("role_id").references(() => roles.id),
  sectionId: integer("section_id").references(() => sections.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===============================
// 2. Sections & Subjects
// ===============================
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  subjectName: varchar("subject_name", { length: 100 }).notNull(),
  gradeLevel: varchar("grade_level", { length: 50 }).notNull(),
});

// ===============================
// 3. Academic Coordinator & Teacher Functions
// ===============================
export const teacherAssignments = pgTable("teacher_assignments", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => users.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id),
  sectionId: integer("section_id").references(() => sections.id),
  schoolYear: varchar("school_year", { length: 9 }).notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => users.id).notNull(),
  sectionId: integer("section_id").references(() => sections.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  taskType: varchar("task_type", { length: 50 }), // Assignment, Quiz, Test
  timerMinutes: integer("timer_minutes"), // For timed quizzes/tests
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const taskSubmissions = pgTable("task_submissions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  submissionText: text("submission_text"),
  fileUrl: text("file_url"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  grade: decimal("grade", { precision: 5, scale: 2 }),
});

// ===============================
// 4. Meetings (Principal, Coordinator, Teacher, Students)
// ===============================
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  organizerId: integer("organizer_id").references(() => users.id).notNull(),
  sectionId: integer("section_id").references(() => sections.id),
  title: varchar("title", { length: 255 }).notNull(),
  meetingUrl: text("meeting_url").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===============================
// 5. Accounting Functions
// ===============================
export const feeStructures = pgTable("fee_structures", {
  id: serial("id").primaryKey(),
  gradeLevel: varchar("grade_level", { length: 50 }).notNull(),
  tuitionFee: decimal("tuition_fee", { precision: 12, scale: 2 }).notNull(),
  miscFee: decimal("misc_fee", { precision: 12, scale: 2 }).default("0"),
  otherFee: decimal("other_fee", { precision: 12, scale: 2 }).default("0"),
  effectiveSchoolYear: varchar("effective_school_year", { length: 9 }).notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  schoolYear: varchar("school_year", { length: 9 }).notNull(),
  dueDate: date("due_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("Unpaid"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  amountPaid: decimal("amount_paid", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  receiptNumber: varchar("receipt_number", { length: 100 }),
});

export const scholarships = pgTable("scholarships", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  scholarshipName: varchar("scholarship_name", { length: 255 }).notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).notNull(),
  effectiveSchoolYear: varchar("effective_school_year", { length: 9 }).notNull(),
});

export const schoolExpenses = pgTable("school_expenses", {
  id: serial("id").primaryKey(),
  expenseDate: date("expense_date").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  recordedBy: integer("recorded_by").references(() => users.id),
});

// ===============================
// 6. Guidance Functions
// ===============================
export const guidanceReports = pgTable("guidance_reports", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  counselorId: integer("counselor_id").references(() => users.id).notNull(),
  reportType: varchar("report_type", { length: 100 }),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===============================
// 7. Chat System
// ===============================
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  conversationType: varchar("conversation_type", { length: 20 }).default("private"), // private, group
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversationMembers = pgTable("conversation_members", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  messageText: text("message_text"),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

export const userStatus = pgTable("user_status", {
  userId: integer("user_id").primaryKey().references(() => users.id),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
});

// ===============================
// 8. Announcements & Events (Admin, Principal)
// ===============================
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===============================
// Relations
// ===============================
export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  section: one(sections, { fields: [users.sectionId], references: [sections.id] }),
  tasks: many(tasks),
  submissions: many(taskSubmissions),
  meetings: many(meetings),
  sentMessages: many(messages),
  conversations: many(conversationMembers),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  adviser: one(users, { fields: [sections.adviserId], references: [users.id] }),
  students: many(users),
  tasks: many(tasks),
  meetings: many(meetings),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  members: many(conversationMembers),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

// ===============================
// Zod Schemas
// ===============================
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export const insertConversationSchema = createInsertSchema(conversations);
export const selectConversationSchema = createSelectSchema(conversations);

// ===============================
// Types
// ===============================
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;
export type UserStatus = typeof userStatus.$inferSelect;
export type InsertUserStatus = typeof userStatus.$inferInsert;

// Legacy compatibility exports (to maintain existing functionality)
export { users as usersTable };
export { conversations as conversationsTable };
export { messages as messagesTable };
export { userStatus as userStatusTable };
export { conversationMembers as conversationMembersTable };

// Additional types for compatibility
export type ChatMessage = Message;
export type ChatUser = User;