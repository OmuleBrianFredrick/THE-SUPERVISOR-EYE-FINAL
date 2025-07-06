import {
  users,
  reports,
  notifications,
  performanceMetrics,
  type User,
  type UpsertUser,
  type InsertReport,
  type Report,
  type InsertNotification,
  type Notification,
  type UserWithRelations,
  type ReportWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, avg, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Additional user operations
  getUserWithRelations(id: string): Promise<UserWithRelations | undefined>;
  getSubordinates(supervisorId: string): Promise<User[]>;
  updateUserRole(id: string, role: string, supervisorId?: string): Promise<User | undefined>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<ReportWithRelations | undefined>;
  getReports(filters: {
    employeeId?: string;
    supervisorId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ReportWithRelations[]>;
  updateReport(id: number, updates: Partial<InsertReport>): Promise<Report | undefined>;
  reviewReport(id: number, feedback: string, rating: number, status: string): Promise<Report | undefined>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  
  // Dashboard stats
  getDashboardStats(userId: string, role: string): Promise<{
    pendingReviews?: number;
    teamMembers?: number;
    completedReports?: number;
    averageRating?: number;
    myReports?: number;
    myAverageRating?: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserWithRelations(id: string): Promise<UserWithRelations | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const supervisor = user.supervisorId 
      ? await this.getUser(user.supervisorId)
      : undefined;

    const subordinates = await this.getSubordinates(id);

    return {
      ...user,
      supervisor,
      subordinates,
    };
  }

  async getSubordinates(supervisorId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.supervisorId, supervisorId));
  }

  async updateUserRole(id: string, role: string, supervisorId?: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        role, 
        supervisorId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values(report)
      .returning();
    return newReport;
  }

  async getReport(id: number): Promise<ReportWithRelations | undefined> {
    const [report] = await db
      .select({
        report: reports,
        employee: users,
      })
      .from(reports)
      .leftJoin(users, eq(reports.employeeId, users.id))
      .where(eq(reports.id, id));

    if (!report) return undefined;

    const supervisor = report.report.supervisorId
      ? await this.getUser(report.report.supervisorId)
      : undefined;

    return {
      ...report.report,
      employee: report.employee || undefined,
      supervisor,
    };
  }

  async getReports(filters: {
    employeeId?: string;
    supervisorId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ReportWithRelations[]> {
    let query = db
      .select({
        report: reports,
        employee: users,
      })
      .from(reports)
      .leftJoin(users, eq(reports.employeeId, users.id))
      .orderBy(desc(reports.submittedAt));

    const conditions = [];
    if (filters.employeeId) {
      conditions.push(eq(reports.employeeId, filters.employeeId));
    }
    if (filters.supervisorId) {
      conditions.push(eq(reports.supervisorId, filters.supervisorId));
    }
    if (filters.status) {
      conditions.push(eq(reports.status, filters.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const results = await query;

    return results.map(result => ({
      ...result.report,
      employee: result.employee || undefined,
    }));
  }

  async updateReport(id: number, updates: Partial<InsertReport>): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set({ 
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  async reviewReport(id: number, feedback: string, rating: number, status: string): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set({
        supervisorFeedback: feedback,
        rating,
        status,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, limit = 10): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    return result.count;
  }

  // Dashboard stats
  async getDashboardStats(userId: string, role: string): Promise<{
    pendingReviews?: number;
    teamMembers?: number;
    completedReports?: number;
    averageRating?: number;
    myReports?: number;
    myAverageRating?: number;
  }> {
    const stats: any = {};

    if (role === 'supervisor' || role === 'manager' || role === 'executive') {
      // Get pending reviews count
      const [pendingResult] = await db
        .select({ count: count() })
        .from(reports)
        .where(and(
          eq(reports.supervisorId, userId),
          eq(reports.status, 'pending')
        ));
      stats.pendingReviews = pendingResult.count;

      // Get team members count
      const [teamResult] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.supervisorId, userId));
      stats.teamMembers = teamResult.count;

      // Get completed reports count for team
      const [completedResult] = await db
        .select({ count: count() })
        .from(reports)
        .where(and(
          eq(reports.supervisorId, userId),
          eq(reports.status, 'approved')
        ));
      stats.completedReports = completedResult.count;

      // Get average rating for team
      const [avgResult] = await db
        .select({ avg: avg(reports.rating) })
        .from(reports)
        .where(and(
          eq(reports.supervisorId, userId),
          eq(reports.status, 'approved')
        ));
      stats.averageRating = avgResult.avg ? parseFloat(avgResult.avg) : 0;
    }

    // Get personal stats for all roles
    const [myReportsResult] = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.employeeId, userId));
    stats.myReports = myReportsResult.count;

    const [myAvgResult] = await db
      .select({ avg: avg(reports.rating) })
      .from(reports)
      .where(and(
        eq(reports.employeeId, userId),
        eq(reports.status, 'approved')
      ));
    stats.myAverageRating = myAvgResult.avg ? parseFloat(myAvgResult.avg) : 0;

    return stats;
  }
}

export const storage = new DatabaseStorage();
