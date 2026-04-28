import {
  users,
  reports,
  notifications,
  performanceMetrics,
  goals,
  tasks,
  contacts,
  type User,
  type UpsertUser,
  type InsertReport,
  type Report,
  type InsertNotification,
  type Notification,
  type InsertGoal,
  type Goal,
  type InsertTask,
  type Task,
  type InsertContact,
  type Contact,
  type UserWithRelations,
  type ReportWithRelations,
  type TaskWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, count, avg, gte, lte, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
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
    type?: string;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
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
    pendingTasks?: number;
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

  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<TaskWithRelations | undefined>;
  getTasks(filters: { assignedTo?: string; assignedBy?: string; status?: string }): Promise<TaskWithRelations[]>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;

  // Activity timeline
  getActivityTimeline(userId: string, role: string): Promise<any[]>;

  // Contact inquiries
  saveContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  markContactRead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
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
        set: { ...userData, updatedAt: new Date() },
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
    const supervisor = user.supervisorId ? await this.getUser(user.supervisorId) : undefined;
    const subordinates = await this.getSubordinates(id);
    return { ...user, supervisor, subordinates };
  }

  async getSubordinates(supervisorId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.supervisorId, supervisorId));
  }

  async updateUserRole(id: string, role: string, supervisorId?: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, supervisorId, updatedAt: new Date() })
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
    const supervisorRoles: Record<string, string[]> = {
      employee: ["supervisor", "manager", "executive"],
      supervisor: ["manager", "executive"],
      manager: ["executive"],
      executive: [],
    };
    const validRoles = supervisorRoles[role] || [];
    if (validRoles.length === 0) return [];
    const conditions = validRoles.map(r => eq(users.role, r));
    return await db.select().from(users).where(or(...conditions));
  }

  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getReport(id: number): Promise<ReportWithRelations | undefined> {
    const [report] = await db
      .select({ report: reports, employee: users })
      .from(reports)
      .leftJoin(users, eq(reports.employeeId, users.id))
      .where(eq(reports.id, id));
    if (!report) return undefined;
    const supervisor = report.report.supervisorId
      ? await this.getUser(report.report.supervisorId)
      : undefined;
    return { ...report.report, employee: report.employee || undefined, supervisor };
  }

  async getReports(filters: {
    employeeId?: string;
    supervisorId?: string;
    status?: string;
    type?: string;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<ReportWithRelations[]> {
    const conditions = [];
    if (filters.employeeId) conditions.push(eq(reports.employeeId, filters.employeeId));
    if (filters.supervisorId) conditions.push(eq(reports.supervisorId, filters.supervisorId));
    if (filters.status) conditions.push(eq(reports.status, filters.status));
    if (filters.type) conditions.push(eq(reports.type, filters.type));
    if (filters.search) conditions.push(ilike(reports.title, `%${filters.search}%`));
    if (filters.dateFrom) conditions.push(gte(reports.submittedAt, filters.dateFrom));
    if (filters.dateTo) conditions.push(lte(reports.submittedAt, filters.dateTo));

    let query = db
      .select({ report: reports, employee: users })
      .from(reports)
      .leftJoin(users, eq(reports.employeeId, users.id))
      .orderBy(desc(reports.submittedAt));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset) query = query.offset(filters.offset);

    const results = await query;
    return results.map(r => ({ ...r.report, employee: r.employee || undefined }));
  }

  async updateReport(id: number, updates: Partial<InsertReport>): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  async reviewReport(id: number, feedback: string, rating: number, status: string): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set({ supervisorFeedback: feedback, rating, status, reviewedAt: new Date(), updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [n] = await db.insert(notifications).values(notification).returning();
    return n;
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
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.count;
  }

  // Dashboard stats
  async getDashboardStats(userId: string, role: string): Promise<any> {
    const stats: any = {};

    if (role === "supervisor" || role === "manager" || role === "executive") {
      const [pendingResult] = await db
        .select({ count: count() })
        .from(reports)
        .where(and(eq(reports.supervisorId, userId), eq(reports.status, "pending")));
      stats.pendingReviews = pendingResult.count;

      const [teamResult] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.supervisorId, userId));
      stats.teamMembers = teamResult.count;

      const [completedResult] = await db
        .select({ count: count() })
        .from(reports)
        .where(and(eq(reports.supervisorId, userId), eq(reports.status, "approved")));
      stats.completedReports = completedResult.count;

      const [avgResult] = await db
        .select({ avg: avg(reports.rating) })
        .from(reports)
        .where(and(eq(reports.supervisorId, userId), eq(reports.status, "approved")));
      stats.averageRating = avgResult.avg ? parseFloat(avgResult.avg) : 0;

      // Pending tasks assigned by this supervisor
      const [pendingTasksResult] = await db
        .select({ count: count() })
        .from(tasks)
        .where(and(eq(tasks.assignedBy, userId), eq(tasks.status, "pending")));
      stats.pendingTasks = pendingTasksResult.count;
    }

    const [myReportsResult] = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.employeeId, userId));
    stats.myReports = myReportsResult.count;

    const [myAvgResult] = await db
      .select({ avg: avg(reports.rating) })
      .from(reports)
      .where(and(eq(reports.employeeId, userId), eq(reports.status, "approved")));
    stats.myAverageRating = myAvgResult.avg ? parseFloat(myAvgResult.avg) : 0;

    // Pending tasks for this employee
    const [myPendingTasks] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(eq(tasks.assignedTo, userId), eq(tasks.status, "pending")));
    stats.pendingTasks = stats.pendingTasks ?? myPendingTasks.count;

    return stats;
  }

  async getSystemStats(): Promise<any> {
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [activeReportsResult] = await db.select({ count: count() }).from(reports).where(eq(reports.status, "pending"));
    const [employeeCountResult] = await db.select({ count: count() }).from(users).where(eq(users.role, "employee"));
    const [supervisorCountResult] = await db.select({ count: count() }).from(users).where(eq(users.role, "supervisor"));
    const [managerCountResult] = await db.select({ count: count() }).from(users).where(eq(users.role, "manager"));
    const [executiveCountResult] = await db.select({ count: count() }).from(users).where(eq(users.role, "executive"));
    return {
      totalUsers: totalUsersResult.count,
      activeReports: activeReportsResult.count,
      pendingReviews: activeReportsResult.count,
      employeeCount: employeeCountResult.count,
      supervisorCount: supervisorCountResult.count,
      managerCount: managerCountResult.count,
      executiveCount: executiveCountResult.count,
    };
  }

  async getAnalytics(): Promise<any> {
    const statusCounts = await db.select({ status: reports.status, count: count() }).from(reports).groupBy(reports.status);
    const typeCounts = await db.select({ type: reports.type, count: count() }).from(reports).groupBy(reports.type);
    const roleCounts = await db.select({ role: users.role, count: count() }).from(users).groupBy(users.role);
    const [totalResult] = await db.select({ count: count() }).from(reports);
    const [approvedResult] = await db.select({ count: count() }).from(reports).where(eq(reports.status, "approved"));
    const [avgResult] = await db.select({ avg: avg(reports.rating) }).from(reports).where(eq(reports.status, "approved"));
    return {
      reportsByStatus: statusCounts.map(r => ({ status: r.status || "unknown", count: r.count })),
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
    return await db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
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

  // Password reset
  async setResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    await db.update(users).set({ resetToken: token, resetTokenExpiry: expiry, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async clearResetToken(userId: string): Promise<void> {
    await db.update(users).set({ resetToken: null, resetTokenExpiry: null, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getTask(id: number): Promise<TaskWithRelations | undefined> {
    const [result] = await db
      .select({ task: tasks, assignee: users })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .where(eq(tasks.id, id));
    if (!result) return undefined;
    const assigner = await this.getUser(result.task.assignedBy);
    return { ...result.task, assignee: result.assignee || undefined, assigner };
  }

  async getTasks(filters: { assignedTo?: string; assignedBy?: string; status?: string }): Promise<TaskWithRelations[]> {
    const conditions = [];
    if (filters.assignedTo) conditions.push(eq(tasks.assignedTo, filters.assignedTo));
    if (filters.assignedBy) conditions.push(eq(tasks.assignedBy, filters.assignedBy));
    if (filters.status) conditions.push(eq(tasks.status, filters.status));

    const assigneeAlias = users;

    let query = db
      .select({ task: tasks, assignee: assigneeAlias })
      .from(tasks)
      .leftJoin(assigneeAlias, eq(tasks.assignedTo, assigneeAlias.id))
      .orderBy(desc(tasks.createdAt));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query;

    // Fetch assigners separately to avoid alias conflicts
    const withAssigners = await Promise.all(
      results.map(async r => {
        const assigner = await this.getUser(r.task.assignedBy);
        return { ...r.task, assignee: r.assignee || undefined, assigner };
      })
    );

    return withAssigners;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Activity timeline
  async getActivityTimeline(userId: string, role: string): Promise<any[]> {
    const activities: any[] = [];

    // Get recent reports submitted by this user
    const myReports = await db
      .select()
      .from(reports)
      .where(eq(reports.employeeId, userId))
      .orderBy(desc(reports.submittedAt))
      .limit(20);

    for (const r of myReports) {
      activities.push({
        id: `report-${r.id}`,
        type: "report_submitted",
        title: "Report Submitted",
        description: r.title,
        status: r.status,
        timestamp: r.submittedAt,
        icon: "file-text",
      });
      if (r.reviewedAt && r.status !== "pending") {
        activities.push({
          id: `report-reviewed-${r.id}`,
          type: r.status === "approved" ? "report_approved" : "report_revised",
          title: r.status === "approved" ? "Report Approved" : "Revision Requested",
          description: r.title,
          status: r.status,
          timestamp: r.reviewedAt,
          icon: r.status === "approved" ? "check-circle" : "alert-circle",
        });
      }
    }

    // Get tasks assigned to this user
    const myTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedTo, userId))
      .orderBy(desc(tasks.createdAt))
      .limit(20);

    for (const t of myTasks) {
      activities.push({
        id: `task-assigned-${t.id}`,
        type: "task_assigned",
        title: "Task Assigned",
        description: t.title,
        status: t.status,
        timestamp: t.createdAt,
        icon: "clipboard",
        priority: t.priority,
        deadline: t.deadline,
      });
      if (t.status === "completed") {
        activities.push({
          id: `task-completed-${t.id}`,
          type: "task_completed",
          title: "Task Completed",
          description: t.title,
          status: t.status,
          timestamp: t.updatedAt,
          icon: "check-square",
        });
      }
    }

    // If supervisor/manager, also get tasks they assigned
    if (role === "supervisor" || role === "manager" || role === "executive") {
      const createdTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.assignedBy, userId))
        .orderBy(desc(tasks.createdAt))
        .limit(10);

      for (const t of createdTasks) {
        activities.push({
          id: `task-created-${t.id}`,
          type: "task_created",
          title: "Task Assigned to Team",
          description: t.title,
          status: t.status,
          timestamp: t.createdAt,
          icon: "send",
          priority: t.priority,
        });
      }

      // Recent team reports reviewed
      const reviewedReports = await db
        .select()
        .from(reports)
        .where(and(eq(reports.supervisorId, userId), eq(reports.status, "approved")))
        .orderBy(desc(reports.reviewedAt))
        .limit(10);

      for (const r of reviewedReports) {
        if (r.reviewedAt) {
          activities.push({
            id: `reviewed-${r.id}`,
            type: "report_reviewed_by_me",
            title: "Report Reviewed",
            description: r.title,
            status: r.status,
            timestamp: r.reviewedAt,
            icon: "star",
            rating: r.rating,
          });
        }
      }
    }

    // Sort all activities by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, 50);
  }

  async saveContact(contact: InsertContact): Promise<Contact> {
    const [saved] = await db.insert(contacts).values(contact).returning();
    return saved;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async markContactRead(id: number): Promise<void> {
    await db.update(contacts).set({ isRead: true }).where(eq(contacts.id, id));
  }
}

export const storage = new DatabaseStorage();
