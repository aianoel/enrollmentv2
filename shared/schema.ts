import { z } from "zod";

// User roles
export const UserRole = z.enum([
  'student',
  'teacher', 
  'admin',
  'registrar',
  'accounting',
  'guidance',
  'parent'
]);

// Base user schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRole,
  profilePicture: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Student specific fields
export const studentSchema = userSchema.extend({
  studentId: z.string(),
  grade: z.string(),
  section: z.string().optional(),
  parentId: z.string().optional(),
  enrollmentStatus: z.enum(['enrolled', 'pending', 'rejected']).default('enrolled'),
  academicYear: z.string(),
});

// Teacher specific fields  
export const teacherSchema = userSchema.extend({
  employeeId: z.string(),
  department: z.string(),
  assignedSections: z.array(z.string()).default([]),
  subjects: z.array(z.string()).default([]),
});

// Parent specific fields
export const parentSchema = userSchema.extend({
  children: z.array(z.string()).default([]), // student IDs
  occupation: z.string().optional(),
});

// Subject schema
export const subjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  teacherId: z.string(),
  gradeLevel: z.string(),
  semester: z.string(),
  credits: z.number().default(1),
  createdAt: z.string(),
});

// Section schema
export const sectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  gradeLevel: z.string(),
  adviserId: z.string(),
  students: z.array(z.string()).default([]),
  subjects: z.array(z.string()).default([]),
  academicYear: z.string(),
  capacity: z.number().default(40),
  createdAt: z.string(),
});

// Grade schema
export const gradeSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  subjectId: z.string(),
  teacherId: z.string(),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  academicYear: z.string(),
  grade: z.number().min(0).max(100),
  remarks: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Assignment schema
export const assignmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  subjectId: z.string(),
  teacherId: z.string(),
  assignedSections: z.array(z.string()),
  dueDate: z.string(),
  points: z.number().default(100),
  type: z.enum(['assignment', 'quiz', 'exam', 'project']),
  attachments: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Assignment submission schema
export const assignmentSubmissionSchema = z.object({
  id: z.string(),
  assignmentId: z.string(),
  studentId: z.string(),
  submissionText: z.string().optional(),
  attachments: z.array(z.string()).default([]),
  submittedAt: z.string(),
  grade: z.number().optional(),
  feedback: z.string().optional(),
  status: z.enum(['submitted', 'graded', 'returned']).default('submitted'),
});

// Learning module schema
export const learningModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  subjectId: z.string(),
  teacherId: z.string(),
  fileUrl: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  assignedSections: z.array(z.string()),
  isPublished: z.boolean().default(false),
  downloadCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Announcement schema
export const announcementSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  targetAudience: z.array(UserRole),
  targetSections: z.array(z.string()).default([]),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  isActive: z.boolean().default(true),
  scheduledAt: z.string().optional(),
  expiresAt: z.string().optional(),
  attachments: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Chat message schema
export const chatMessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  recipientId: z.string().optional(), // For private messages
  roomId: z.string().optional(), // For group chats
  message: z.string(),
  type: z.enum(['text', 'file', 'image']).default('text'),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  isEdited: z.boolean().default(false),
  timestamp: z.string(),
});

// Meeting schema
export const meetingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  hostId: z.string(),
  meetingLink: z.string(),
  scheduledDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  attendees: z.array(z.string()).default([]),
  assignedSections: z.array(z.string()).default([]),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(['daily', 'weekly', 'monthly']).optional(),
  status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).default('scheduled'),
  createdAt: z.string(),
});

// Enrollment application schema
export const enrollmentApplicationSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  dateOfBirth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string(),
  parentName: z.string(),
  parentPhone: z.string(),
  parentEmail: z.string().email().optional(),
  desiredGradeLevel: z.string(),
  desiredStrand: z.string().optional(),
  previousSchool: z.string().optional(),
  previousGPA: z.number().optional(),
  documents: z.array(z.object({
    type: z.string(),
    fileName: z.string(),
    fileUrl: z.string(),
    uploadedAt: z.string(),
  })).default([]),
  paymentStatus: z.enum(['unpaid', 'pending', 'paid']).default('unpaid'),
  paymentAmount: z.number().optional(),
  status: z.enum(['pending', 'under_review', 'approved', 'rejected']).default('pending'),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewNotes: z.string().optional(),
  assignedSection: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Payment record schema
export const paymentRecordSchema = z.object({
  id: z.string(),
  studentId: z.string().optional(),
  enrollmentApplicationId: z.string().optional(),
  amount: z.number(),
  paymentType: z.enum(['tuition', 'enrollment', 'miscellaneous']),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'online', 'check']),
  referenceNumber: z.string().optional(),
  description: z.string(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  processedBy: z.string().optional(),
  processedAt: z.string().optional(),
  createdAt: z.string(),
});

// Counseling record schema
export const counselingRecordSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  counselorId: z.string(),
  sessionDate: z.string(),
  sessionType: z.enum(['individual', 'group', 'crisis', 'academic', 'behavioral']),
  notes: z.string(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  isConfidential: z.boolean().default(true),
  parentNotified: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Export types
export type User = z.infer<typeof userSchema>;
export type Student = z.infer<typeof studentSchema>;
export type Teacher = z.infer<typeof teacherSchema>;
export type Parent = z.infer<typeof parentSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type Grade = z.infer<typeof gradeSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;
export type AssignmentSubmission = z.infer<typeof assignmentSubmissionSchema>;
export type LearningModule = z.infer<typeof learningModuleSchema>;
export type Announcement = z.infer<typeof announcementSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type Meeting = z.infer<typeof meetingSchema>;
export type EnrollmentApplication = z.infer<typeof enrollmentApplicationSchema>;
export type PaymentRecord = z.infer<typeof paymentRecordSchema>;
export type CounselingRecord = z.infer<typeof counselingRecordSchema>;

// Insert schemas (for creating new records)
export const insertUserSchema = userSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertStudentSchema = studentSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeacherSchema = teacherSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertGradeSchema = gradeSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertAssignmentSchema = assignmentSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertEnrollmentApplicationSchema = enrollmentApplicationSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type InsertEnrollmentApplication = z.infer<typeof insertEnrollmentApplicationSchema>;
