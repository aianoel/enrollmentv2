import { pgTable, serial, varchar, text, integer, date, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

// System settings table
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  primaryColor: varchar("primary_color", { length: 50 }).default("#3b82f6"),
  secondaryColor: varchar("secondary_color", { length: 50 }).default("#64748b"),
  accentColor: varchar("accent_color", { length: 50 }).default("#10b981"),
  logoUrl: varchar("logo_url", { length: 500 }),
  bannerImages: text("banner_images").array(),
  organizationChartUrl: varchar("organization_chart_url", { length: 500 }),
  schoolYear: varchar("school_year", { length: 20 }),
  schoolName: varchar("school_name", { length: 255 }).default("Your School Name"),
  schoolAddress: text("school_address"),
  schoolMotto: varchar("school_motto", { length: 500 }),
  principalMessage: text("principal_message"),
  visionStatement: text("vision_statement"),
  missionStatement: text("mission_statement"),
  updatedAt: timestamp("updated_at").defaultNow()
});

// School years table
export const schoolYears = pgTable("school_years", {
  id: serial("id").primaryKey(),
  year: varchar("year", { length: 20 }).notNull().unique(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Historical student data table
export const studentHistory = pgTable("student_history", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  schoolYear: varchar("school_year", { length: 20 }).notNull(),
  data: text("data").notNull(), // Store JSON data as text
  dataType: varchar("data_type", { length: 50 }).notNull(), // 'grades', 'assignments', 'attendance', etc.
  createdAt: timestamp("created_at").defaultNow()
});

// Admin control schemas
export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({ id: true, updatedAt: true });
export const selectSystemSettingsSchema = createSelectSchema(systemSettings);
export const insertSchoolYearSchema = createInsertSchema(schoolYears).omit({ id: true, createdAt: true });
export const selectSchoolYearSchema = createSelectSchema(schoolYears);
export const insertStudentHistorySchema = createInsertSchema(studentHistory).omit({ id: true, createdAt: true });
export const selectStudentHistorySchema = createSelectSchema(studentHistory);

// Type exports
export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SchoolYear = typeof schoolYears.$inferSelect;
export type InsertSchoolYear = z.infer<typeof insertSchoolYearSchema>;
export type StudentHistory = typeof studentHistory.$inferSelect;
export type InsertStudentHistory = z.infer<typeof insertStudentHistorySchema>;