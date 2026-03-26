import {
  users,
  reports,
  notifications,
  performanceMetrics,
  goals,
  type User,
  type UpsertUser,
  type InsertReport,
  type Report,
  type InsertNotification,
  type Notification,
  type InsertGoal,
  type Goal,
  type UserWithRelations,
  type ReportWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, count, avg, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Additional user operations
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserWithRelations(id: string): Promise<UserWithRelations | undefined>;
  getSubordinates(supervisorId: string): Promise<User[]>;
  updateUserRole(id: string, role: string, supervisorId?: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  getSupervisorsForRole(role: string): Promise<User[]>;
  
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
  
  // Dashboard stats & admin
  getDashboardStats(userId: string, role: string): Promise<{
    pendingReviews?: number;
    teamMembers?: number;
    completedReports?: number;
    averageRating?: number;
    myReports?: number;
    myAverageRating?: number;
  }>;
  getSystemStats(): Promise<{
    totalUsers: number;
    activeReports: number;
    pendingReviews: number;
    employeeCount: number;
    supervisorCount: number;
    managerCount: number;
    executiveCount: number;
  }>;
  getAnalytics(): Promise<{
    reportsByStatus: { status: string; count: number }[];
    reportsByType: { type: string; count: number }[];
    usersByRole: { role: string; count: number }[];
    totalReports: number;
    approvedReports: number;
    avgRating: number;
  }>;
  updateUserProfile(id: string, updates: { department?: string; firstName?: string; lastName?: string }): Promise<User | undefined>;

  // Goals operations
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<void>;

  // Password reset operations
  setResetToken(userId: string, token: string, expiry: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearResetToken(userId: string): Promise<void>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async getSupervisorsForRole(role: string): Promise<User[]> {
    // Return users who can supervise this role based on hierarchy
    const supervisorRoles: Record<string, string[]> = {
      'employee': ['supervisor', 'manager', 'executive'],
      'supervisor': ['manager', 'executive'],
      'manager': ['executive'],
      'executive': []
    };
    
    const validRoles = supervisorRoles[role] || [];
    if (validRoles.length === 0) return [];

    const conditions = validRoles.map(r => eq(users.role, r));
    return await db
      .select()
      .from(users)
      .where(or(...conditions));
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

  async getSystemStats(): Promise<{
    totalUsers: number;
    activeReports: number;
    pendingReviews: number;
    employeeCount: number;
    supervisorCount: number;
    managerCount: number;
    executiveCount: number;
  }> {
    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users);

    const [activeReportsResult] = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.status, 'pending'));

    const [pendingReviewsResult] = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.status, 'pending'));

    const [employeeCountResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'employee'));

    const [supervisorCountResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'supervisor'));

    const [managerCountResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'manager'));

    const [executiveCountResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'executive'));

    return {
      totalUsers: totalUsersResult.count,
      activeReports: activeReportsResult.count,
      pendingReviews: pendingReviewsResult.count,
      employeeCount: employeeCountResult.count,
      supervisorCount: supervisorCountResult.count,
      managerCount: managerCountResult.count,
      executiveCount: executiveCountResult.count,
    };
  }

  async getAnalytics(): Promise<{
    reportsByStatus: { status: string; count: number }[];
    reportsByType: { type: string; count: number }[];
    usersByRole: { role: string; count: number }[];
    totalReports: number;
    approvedReports: number;
    avgRating: number;
  }> {
    const statusCounts = await db
      .select({ status: reports.status, count: count() })
      .from(reports)
      .groupBy(reports.status);

    const typeCounts = await db
      .select({ type: reports.type, count: count() })
      .from(reports)
      .groupBy(reports.type);

    const roleCounts = await db
      .select({ role: users.role, count: count() })
      .from(users)
      .groupBy(users.role);

    const [totalResult] = await db.select({ count: count() }).from(reports);
    const [approvedResult] = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.status, 'approved'));

    const [avgResult] = await db
      .select({ avg: avg(reports.rating) })
      .from(reports)
      .where(eq(reports.status, 'approved'));

    return {
      reportsByStatus: statusCounts.map(r => ({ status: r.status || 'unknown', count: r.count })),
      reportsByType: typeCounts.map(r => ({ type: r.type, count: r.count })),
      usersByRole: roleCounts.map(r => ({ role: r.role, count: r.count })),
      totalReports: totalResult.count,
      approvedReports: approvedResult.count,
      avgRating: avgResult.avg ? parseFloat(avgResult.avg) : 0,
    };
  }

  async updateUserProfile(id: string, updates: { department?: string; firstName?: string; lastName?: string }): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // Goals operations
  async getGoals(userId: string): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: number, updates: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updated] = await db
      .update(goals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(goals.id, id))
      .returning();
    return updated;
  }

  async deleteGoal(id: number): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }

  async setResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    await db
      .update(users)
      .set({ resetToken: token, resetTokenExpiry: expiry, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, token));
    return user;
  }

  async clearResetToken(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ resetToken: null, resetTokenExpiry: null, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
