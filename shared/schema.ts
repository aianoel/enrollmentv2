import { pgTable, serial, varchar, text, integer, decimal, date, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  roleId: integer('role_id').references(() => roles.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Sections table
export const sections = pgTable('sections', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  gradeLevel: integer('grade_level').notNull(),
  adviserId: integer('adviser_id'),
});

// Enrollments table
export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').notNull(),
  sectionId: integer('section_id'),
  status: varchar('status', { length: 20 }).default('pending'),
  documents: text('documents'),
  paymentStatus: varchar('payment_status', { length: 20 }).default('unpaid'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Grades table
export const grades = pgTable('grades', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').notNull(),
  subject: varchar('subject', { length: 100 }).notNull(),
  quarter: integer('quarter').notNull(),
  grade: decimal('grade', { precision: 5, scale: 2 }),
  teacherId: integer('teacher_id'),
});

// Assignments table
export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  sectionId: integer('section_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 20 }).notNull(),
  dueDate: date('due_date'),
  fileUrl: varchar('file_url', { length: 255 }),
  createdBy: integer('created_by').notNull(),
});

// Chat messages table
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull(),
  receiverId: integer('receiver_id'),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Meetings table
export const meetings = pgTable('meetings', {
  id: serial('id').primaryKey(),
  sectionId: integer('section_id').notNull(),
  title: varchar('title', { length: 255 }),
  meetingLink: varchar('meeting_link', { length: 255 }),
  date: timestamp('date'),
  createdBy: integer('created_by').notNull(),
});

// Hero images table
export const heroImages = pgTable('hero_images', {
  id: serial('id').primaryKey(),
  imageUrl: varchar('image_url', { length: 255 }).notNull(),
  uploadedBy: integer('uploaded_by'),
});

// Announcements table
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  datePosted: date('date_posted').defaultNow(),
  postedBy: integer('posted_by'),
});

// News table
export const news = pgTable('news', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  imageUrl: varchar('image_url', { length: 255 }),
  datePosted: date('date_posted').defaultNow(),
  postedBy: integer('posted_by'),
});

// Events table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  date: date('date'),
  location: varchar('location', { length: 255 }),
  postedBy: integer('posted_by'),
});

// Roles table for flexible role management
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  roleName: varchar('role_name', { length: 50 }).unique().notNull(),
});

// Subjects table
export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  gradeLevel: integer('grade_level').notNull(),
});

// Teacher assignments table
export const teacherAssignments = pgTable('teacher_assignments', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => users.id),
  sectionId: integer('section_id').references(() => sections.id),
  subjectId: integer('subject_id').references(() => subjects.id),
});

// Organizational chart table
export const orgChart = pgTable('org_chart', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  position: varchar('position', { length: 100 }).notNull(),
  photoUrl: varchar('photo_url', { length: 255 }),
  reportsTo: integer('reports_to'),
});

// School settings table
export const schoolSettings = pgTable('school_settings', {
  id: serial('id').primaryKey(),
  schoolYear: varchar('school_year', { length: 20 }).notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
});

// Tuition fees table
export const tuitionFees = pgTable('tuition_fees', {
  id: serial('id').primaryKey(),
  gradeLevel: integer('grade_level').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: date('due_date'),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  sections: many(sections),
  enrollments: many(enrollments),
  grades: many(grades),
  assignments: many(assignments),
  sentMessages: many(chatMessages, { relationName: 'sender' }),
  receivedMessages: many(chatMessages, { relationName: 'receiver' }),
  meetings: many(meetings),
  heroImages: many(heroImages),
  announcements: many(announcements),
  news: many(news),
  events: many(events),
  teacherAssignments: many(teacherAssignments),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  teacherAssignments: many(teacherAssignments),
}));

export const teacherAssignmentsRelations = relations(teacherAssignments, ({ one }) => ({
  teacher: one(users, {
    fields: [teacherAssignments.teacherId],
    references: [users.id],
  }),
  section: one(sections, {
    fields: [teacherAssignments.sectionId],
    references: [sections.id],
  }),
  subject: one(subjects, {
    fields: [teacherAssignments.subjectId],
    references: [subjects.id],
  }),
}));

export const orgChartRelations = relations(orgChart, ({ one, many }) => ({
  manager: one(orgChart, {
    fields: [orgChart.reportsTo],
    references: [orgChart.id],
    relationName: 'manager',
  }),
  subordinates: many(orgChart, { relationName: 'manager' }),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  adviser: one(users, {
    fields: [sections.adviserId],
    references: [users.id],
  }),
  enrollments: many(enrollments),
  assignments: many(assignments),
  meetings: many(meetings),
  teacherAssignments: many(teacherAssignments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
  section: one(sections, {
    fields: [enrollments.sectionId],
    references: [sections.id],
  }),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
  student: one(users, {
    fields: [grades.studentId],
    references: [users.id],
  }),
  teacher: one(users, {
    fields: [grades.teacherId],
    references: [users.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  section: one(sections, {
    fields: [assignments.sectionId],
    references: [sections.id],
  }),
  creator: one(users, {
    fields: [assignments.createdBy],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  receiver: one(users, {
    fields: [chatMessages.receiverId],
    references: [users.id],
    relationName: 'receiver',
  }),
}));

export const meetingsRelations = relations(meetings, ({ one }) => ({
  section: one(sections, {
    fields: [meetings.sectionId],
    references: [sections.id],
  }),
  creator: one(users, {
    fields: [meetings.createdBy],
    references: [users.id],
  }),
}));

// Schema types
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const selectUserSchema = createSelectSchema(users);
export const insertSectionSchema = createInsertSchema(sections).omit({ id: true });
export const selectSectionSchema = createSelectSchema(sections);
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, createdAt: true });
export const selectEnrollmentSchema = createSelectSchema(enrollments);
export const insertGradeSchema = createInsertSchema(grades).omit({ id: true });
export const selectGradeSchema = createSelectSchema(grades);
export const insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true });
export const selectAssignmentSchema = createSelectSchema(assignments);
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const selectChatMessageSchema = createSelectSchema(chatMessages);
export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true });
export const selectMeetingSchema = createSelectSchema(meetings);
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, datePosted: true });
export const selectAnnouncementSchema = createSelectSchema(announcements);
export const insertNewsSchema = createInsertSchema(news).omit({ id: true, datePosted: true });
export const selectNewsSchema = createSelectSchema(news);
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const selectEventSchema = createSelectSchema(events);

// New schema types for admin functionality
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true });
export const selectRoleSchema = createSelectSchema(roles);
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export const selectSubjectSchema = createSelectSchema(subjects);
export const insertTeacherAssignmentSchema = createInsertSchema(teacherAssignments).omit({ id: true });
export const selectTeacherAssignmentSchema = createSelectSchema(teacherAssignments);
export const insertOrgChartSchema = createInsertSchema(orgChart).omit({ id: true });
export const selectOrgChartSchema = createSelectSchema(orgChart);
export const insertSchoolSettingsSchema = createInsertSchema(schoolSettings).omit({ id: true });
export const selectSchoolSettingsSchema = createSelectSchema(schoolSettings);
export const insertTuitionFeeSchema = createInsertSchema(tuitionFees).omit({ id: true });
export const selectTuitionFeeSchema = createSelectSchema(tuitionFees);

// Inferred types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Section = typeof sections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Grade = typeof grades.$inferSelect;
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

// New inferred types for admin functionality
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type TeacherAssignment = typeof teacherAssignments.$inferSelect;
export type InsertTeacherAssignment = z.infer<typeof insertTeacherAssignmentSchema>;
export type OrgChart = typeof orgChart.$inferSelect;
export type InsertOrgChart = z.infer<typeof insertOrgChartSchema>;
export type SchoolSettings = typeof schoolSettings.$inferSelect;
export type InsertSchoolSettings = z.infer<typeof insertSchoolSettingsSchema>;
export type TuitionFee = typeof tuitionFees.$inferSelect;
export type InsertTuitionFee = z.infer<typeof insertTuitionFeeSchema>;

// User roles enum for validation
export const UserRoles = ['admin', 'teacher', 'student', 'parent', 'guidance', 'registrar', 'accounting'] as const;
export type UserRole = typeof UserRoles[number];