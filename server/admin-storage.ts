import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { 
  systemSettings, 
  schoolYears, 
  studentHistory,
  type SystemSettings,
  type InsertSystemSettings,
  type SchoolYear,
  type InsertSchoolYear,
  type InsertStudentHistory
} from "../shared/admin-schema";
import { users, grades, teacherTasks, taskSubmissions, notifications } from "../shared/schema";

export class AdminStorage {
  // System Settings Operations
  async getSystemSettings(): Promise<SystemSettings | null> {
    try {
      const [settings] = await db.select().from(systemSettings).limit(1);
      return settings || null;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return null;
    }
  }

  async updateSystemSettings(updates: Partial<InsertSystemSettings>): Promise<SystemSettings> {
    try {
      // Check if settings exist
      const existing = await this.getSystemSettings();
      
      if (existing) {
        // Update existing settings
        const [updated] = await db
          .update(systemSettings)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(systemSettings.id, existing.id))
          .returning();
        return updated;
      } else {
        // Create new settings
        const [created] = await db
          .insert(systemSettings)
          .values(updates)
          .returning();
        return created;
      }
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  // School Year Operations
  async getSchoolYears(): Promise<SchoolYear[]> {
    try {
      return await db.select().from(schoolYears).orderBy(desc(schoolYears.createdAt));
    } catch (error) {
      console.error('Error fetching school years:', error);
      return [];
    }
  }

  async createSchoolYear(yearData: InsertSchoolYear & { isActive: boolean }): Promise<SchoolYear> {
    try {
      const [created] = await db
        .insert(schoolYears)
        .values(yearData)
        .returning();
      return created;
    } catch (error) {
      console.error('Error creating school year:', error);
      throw error;
    }
  }

  async deactivateAllSchoolYears(): Promise<void> {
    try {
      await db
        .update(schoolYears)
        .set({ isActive: false });
    } catch (error) {
      console.error('Error deactivating school years:', error);
      throw error;
    }
  }

  // Historical Data Operations
  async getStudentHistoricalData(studentId: string, schoolYear: string): Promise<any> {
    try {
      const history = await db
        .select()
        .from(studentHistory)
        .where(
          and(
            eq(studentHistory.studentId, parseInt(studentId)),
            eq(studentHistory.schoolYear, schoolYear)
          )
        );

      // Organize data by type
      const result: any = {
        grades: [],
        assignments: [],
        attendance: [],
        achievements: []
      };

      history.forEach(record => {
        const data = JSON.parse(record.data);
        if (result[record.dataType]) {
          result[record.dataType].push(data);
        }
      });

      return result;
    } catch (error) {
      console.error('Error fetching student historical data:', error);
      return {
        grades: [],
        assignments: [],
        attendance: [],
        achievements: []
      };
    }
  }

  async resetStudentDashboardsForNewYear(newSchoolYear: string): Promise<void> {
    try {
      // Get all students
      const students = await db
        .select()
        .from(users)
        .where(eq(users.role, 'student'));

      // For each student, archive their current data
      for (const student of students) {
        // Archive grades
        const studentGrades = await db
          .select()
          .from(grades)
          .where(eq(grades.studentId, student.id));
        
        if (studentGrades.length > 0) {
          await db.insert(studentHistory).values({
            studentId: student.id,
            schoolYear: newSchoolYear,
            dataType: 'grades',
            data: JSON.stringify(studentGrades)
          });
        }

        // Archive assignments/tasks
        const studentTasks = await db
          .select()
          .from(taskSubmissions)
          .where(eq(taskSubmissions.studentId, student.id));
        
        if (studentTasks.length > 0) {
          await db.insert(studentHistory).values({
            studentId: student.id,
            schoolYear: newSchoolYear,
            dataType: 'assignments',
            data: JSON.stringify(studentTasks)
          });
        }

        // You can add more data types here (attendance, achievements, etc.)
      }

      console.log(`Student data archived for ${students.length} students for new school year ${newSchoolYear}`);
    } catch (error) {
      console.error('Error resetting student dashboards:', error);
      throw error;
    }
  }

  async createNotificationForAllUsers(
    type: string,
    title: string,
    content: string,
    priority: string,
    targetRoles: string[]
  ): Promise<void> {
    try {
      // Get all users with target roles
      const targetUsers = await db
        .select()
        .from(users)
        .where(eq(users.role, targetRoles[0])); // Simplified for now

      // Create notifications for each user
      const notificationPromises = targetUsers.map(user => 
        db.insert(notifications).values({
          userId: user.id,
          type,
          title,
          content,
          priority: priority as any,
          isRead: false
        })
      );

      await Promise.all(notificationPromises);
      console.log(`Created ${targetUsers.length} notifications for roles: ${targetRoles.join(', ')}`);
    } catch (error) {
      console.error('Error creating notifications:', error);
      throw error;
    }
  }
}

export const adminStorage = new AdminStorage();