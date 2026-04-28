import {
  users,
  reports,
  notifications,
  performanceMetrics,
  goals,
  tasks,
  contacts,
  organizations,
  invoices,
  activityLogs,
  announcements,
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
  type Organization,
  type InsertOrganization,
  type Invoice,
  type InsertInvoice,
  type ActivityLog,
  type InsertActivityLog,
  type Announcement,
  type InsertAnnouncement,
  type UserWithRelations,
  type ReportWithRelations,
  type TaskWithRelations,
  type OrganizationWithStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, count, avg, gte, lte, ilike, sum, sql, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserWithRelations(id: string): Promise<UserWithRelations | undefined>;
  getSubordinates(supervisorId: string): Promise<User[]>;
  updateUserRole(id: string, role: string, supervisorId?: string): Promise<User | undefined>;
  getAllUsers(orgId?: number): Promise<User[]>;
  getUsersByRole(role: string, orgId?: number): Promise<User[]>;
  getSupervisorsForRole(role: string, orgId?: number): Promise<User[]>;
  setUserOrganization(userId: string, orgId: number): Promise<void>;
  setSuperAdmin(userId: string, isSuperAdmin: boolean): Promise<void>;

  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<ReportWithRelations | undefined>;
  getReports(filters: {
    employeeId?: string;
    supervisorId?: string;
    organizationId?: number;
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
  getDashboardStats(userId: string, role: string): Promise<any>;
  getSystemStats(orgId?: number): Promise<{
    totalUsers: number;
    activeReports: number;
    pendingReviews: number;
    employeeCount: number;
    supervisorCount: number;
    managerCount: number;
    executiveCount: number;
  }>;
  getAnalytics(orgId?: number): Promise<{
    reportsByStatus: { status: string; count: number }[];
    reportsByType: { type: string; count: number }[];
    usersByRole: { role: string; count: number }[];
    totalReports: number;
    approvedReports: number;
    avgRating: number;
  }>;
  updateUserProfile(id: string, updates: { department?: string; firstName?: string; lastName?: string }): Promise<User | undefined>;

  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<void>;

  // Password reset
  setResetToken(userId: string, token: string, expiry: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearResetToken(userId: string): Promise<void>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;

  // Tasks
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<TaskWithRelations | undefined>;
  getTasks(filters: { assignedTo?: string; assignedBy?: string; status?: string; organizationId?: number }): Promise<TaskWithRelations[]>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;

  // Activity timeline
  getActivityTimeline(userId: string, role: string): Promise<any[]>;

  // Contacts
  saveContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  markContactRead(id: number): Promise<void>;

  // ─── Master CRM (Platform) ───
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganization(id: number): Promise<Organization | undefined>;
  listOrganizations(): Promise<OrganizationWithStats[]>;
  updateOrganization(id: number, updates: Partial<InsertOrganization>): Promise<Organization | undefined>;
  deleteOrganization(id: number): Promise<void>;
  getMasterStats(): Promise<{
    totalOrgs: number;
    activeOrgs: number;
    trialOrgs: number;
    suspendedOrgs: number;
    totalUsers: number;
    totalReports: number;
    monthlyRecurringRevenueCents: number;
    orgsByPlan: { plan: string; count: number }[];
  }>;

  // Invoices
  listInvoices(orgId?: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;

  // Activity logs
  logActivity(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(orgId?: number, limit?: number): Promise<ActivityLog[]>;

  // Announcements
  listAnnouncements(orgId?: number): Promise<Announcement[]>;
  createAnnouncement(a: InsertAnnouncement): Promise<Announcement>;

  // Backfill
  ensureDefaultOrganization(): Promise<Organization>;
}

export class DatabaseStorage implements IStorage {
  // ─── USERS ───
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
    const organization = user.organizationId ? await this.getOrganization(user.organizationId) : undefined;
    return { ...user, supervisor, subordinates, organization };
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

  async getAllUsers(orgId?: number): Promise<User[]> {
    if (orgId !== undefined) {
      return await db.select().from(users).where(eq(users.organizationId, orgId)).orderBy(users.createdAt);
    }
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async getUsersByRole(role: string, orgId?: number): Promise<User[]> {
    const conds = [eq(users.role, role)];
    if (orgId !== undefined) conds.push(eq(users.organizationId, orgId));
    return await db.select().from(users).where(and(...conds));
  }

  async getSupervisorsForRole(role: string, orgId?: number): Promise<User[]> {
    const supervisorRoles: Record<string, string[]> = {
      employee: ["supervisor", "manager", "executive"],
      supervisor: ["manager", "executive"],
      manager: ["executive"],
      executive: [],
    };
    const validRoles = supervisorRoles[role] || [];
    if (validRoles.length === 0) return [];
    const roleCond = or(...validRoles.map(r => eq(users.role, r)));
    const conds = [roleCond!];
    if (orgId !== undefined) conds.push(eq(users.organizationId, orgId));
    return await db.select().from(users).where(and(...conds));
  }

  async setUserOrganization(userId: string, orgId: number): Promise<void> {
    await db.update(users).set({ organizationId: orgId, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  async setSuperAdmin(userId: string, isSuperAdmin: boolean): Promise<void> {
    await db.update(users).set({ isSuperAdmin, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  // ─── REPORTS ───
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
    organizationId?: number;
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
    if (filters.organizationId !== undefined) conditions.push(eq(reports.organizationId, filters.organizationId));
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

  // ─── NOTIFICATIONS ───
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

  // ─── DASHBOARD ───
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

    const [myPendingTasks] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(eq(tasks.assignedTo, userId), eq(tasks.status, "pending")));
    stats.pendingTasks = stats.pendingTasks ?? myPendingTasks.count;

    return stats;
  }

  async getSystemStats(orgId?: number): Promise<any> {
    const orgScope = (col: any) => (orgId !== undefined ? eq(col, orgId) : undefined);

    const userOrg = orgScope(users.organizationId);
    const reportOrg = orgScope(reports.organizationId);

    const [totalUsersResult] = await db.select({ count: count() }).from(users)
      .where(userOrg);
    const [activeReportsResult] = await db.select({ count: count() }).from(reports)
      .where(reportOrg ? and(reportOrg, eq(reports.status, "pending")) : eq(reports.status, "pending"));

    const roleCount = async (role: string) => {
      const [r] = await db.select({ count: count() }).from(users)
        .where(userOrg ? and(userOrg, eq(users.role, role)) : eq(users.role, role));
      return r.count;
    };

    return {
      totalUsers: totalUsersResult.count,
      activeReports: activeReportsResult.count,
      pendingReviews: activeReportsResult.count,
      employeeCount: await roleCount("employee"),
      supervisorCount: await roleCount("supervisor"),
      managerCount: await roleCount("manager"),
      executiveCount: await roleCount("executive"),
    };
  }

  async getAnalytics(orgId?: number): Promise<any> {
    const reportOrg = orgId !== undefined ? eq(reports.organizationId, orgId) : undefined;
    const userOrg = orgId !== undefined ? eq(users.organizationId, orgId) : undefined;

    const statusCounts = await db.select({ status: reports.status, count: count() }).from(reports)
      .where(reportOrg).groupBy(reports.status);
    const typeCounts = await db.select({ type: reports.type, count: count() }).from(reports)
      .where(reportOrg).groupBy(reports.type);
    const roleCounts = await db.select({ role: users.role, count: count() }).from(users)
      .where(userOrg).groupBy(users.role);
    const [totalResult] = await db.select({ count: count() }).from(reports).where(reportOrg);
    const [approvedResult] = await db.select({ count: count() }).from(reports)
      .where(reportOrg ? and(reportOrg, eq(reports.status, "approved")) : eq(reports.status, "approved"));
    const [avgResult] = await db.select({ avg: avg(reports.rating) }).from(reports)
      .where(reportOrg ? and(reportOrg, eq(reports.status, "approved")) : eq(reports.status, "approved"));

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

  // ─── GOALS ───
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

  // ─── PASSWORD RESET ───
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

  // ─── TASKS ───
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

  async getTasks(filters: { assignedTo?: string; assignedBy?: string; status?: string; organizationId?: number }): Promise<TaskWithRelations[]> {
    const conditions = [];
    if (filters.assignedTo) conditions.push(eq(tasks.assignedTo, filters.assignedTo));
    if (filters.assignedBy) conditions.push(eq(tasks.assignedBy, filters.assignedBy));
    if (filters.status) conditions.push(eq(tasks.status, filters.status));
    if (filters.organizationId !== undefined) conditions.push(eq(tasks.organizationId, filters.organizationId));

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

  // ─── TIMELINE ───
  async getActivityTimeline(userId: string, role: string): Promise<any[]> {
    const activities: any[] = [];

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

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities.slice(0, 50);
  }

  // ─── CONTACTS ───
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

  // ─── ORGANIZATIONS / MASTER CRM ───
  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [created] = await db.insert(organizations).values(org).returning();
    return created;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async listOrganizations(): Promise<OrganizationWithStats[]> {
    const orgs = await db.select().from(organizations).orderBy(desc(organizations.createdAt));
    const result: OrganizationWithStats[] = [];
    for (const org of orgs) {
      const [u] = await db.select({ c: count() }).from(users).where(eq(users.organizationId, org.id));
      const [r] = await db.select({ c: count() }).from(reports).where(eq(reports.organizationId, org.id));
      const ownerExecutive = org.ownerExecutiveId ? await this.getUser(org.ownerExecutiveId) : undefined;
      const accountManager = org.accountManagerId ? await this.getUser(org.accountManagerId) : undefined;
      result.push({
        ...org,
        userCount: u.c,
        reportCount: r.c,
        ownerExecutive,
        accountManager,
      });
    }
    return result;
  }

  async updateOrganization(id: number, updates: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const [updated] = await db
      .update(organizations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return updated;
  }

  async deleteOrganization(id: number): Promise<void> {
    await db.delete(organizations).where(eq(organizations.id, id));
  }

  async getMasterStats(): Promise<any> {
    const [totalOrgs] = await db.select({ c: count() }).from(organizations);
    const [activeOrgs] = await db.select({ c: count() }).from(organizations).where(eq(organizations.status, "active"));
    const [trialOrgs] = await db.select({ c: count() }).from(organizations).where(eq(organizations.status, "trial"));
    const [suspendedOrgs] = await db.select({ c: count() }).from(organizations).where(eq(organizations.status, "suspended"));
    const [totalUsers] = await db.select({ c: count() }).from(users);
    const [totalReports] = await db.select({ c: count() }).from(reports);
    const [mrrResult] = await db
      .select({ total: sum(organizations.monthlyRateCents) })
      .from(organizations)
      .where(eq(organizations.status, "active"));
    const planCounts = await db
      .select({ plan: organizations.plan, count: count() })
      .from(organizations)
      .groupBy(organizations.plan);

    return {
      totalOrgs: totalOrgs.c,
      activeOrgs: activeOrgs.c,
      trialOrgs: trialOrgs.c,
      suspendedOrgs: suspendedOrgs.c,
      totalUsers: totalUsers.c,
      totalReports: totalReports.c,
      monthlyRecurringRevenueCents: mrrResult.total ? parseInt(mrrResult.total as any) : 0,
      orgsByPlan: planCounts.map(p => ({ plan: p.plan || "unknown", count: p.count })),
    };
  }

  // ─── INVOICES ───
  async listInvoices(orgId?: number): Promise<Invoice[]> {
    if (orgId !== undefined) {
      return await db.select().from(invoices).where(eq(invoices.organizationId, orgId)).orderBy(desc(invoices.issuedAt));
    }
    return await db.select().from(invoices).orderBy(desc(invoices.issuedAt));
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [created] = await db.insert(invoices).values(invoice).returning();
    return created;
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    const [updated] = await db
      .update(invoices)
      .set({ status, paidAt: status === "paid" ? new Date() : null })
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  // ─── ACTIVITY LOGS ───
  async logActivity(log: InsertActivityLog): Promise<ActivityLog> {
    const [created] = await db.insert(activityLogs).values(log).returning();
    return created;
  }

  async getActivityLogs(orgId?: number, limit = 100): Promise<ActivityLog[]> {
    if (orgId !== undefined) {
      return await db.select().from(activityLogs)
        .where(eq(activityLogs.organizationId, orgId))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);
    }
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
  }

  // ─── ANNOUNCEMENTS ───
  async listAnnouncements(orgId?: number): Promise<Announcement[]> {
    if (orgId !== undefined) {
      return await db.select().from(announcements)
        .where(or(eq(announcements.audience, "all"), eq(announcements.organizationId, orgId)))
        .orderBy(desc(announcements.createdAt));
    }
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(a: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(a).returning();
    return created;
  }

  // ─── BACKFILL ───
  async ensureDefaultOrganization(): Promise<Organization> {
    const existing = await db.select().from(organizations).limit(1);
    let defaultOrg: Organization;
    if (existing.length === 0) {
      const [created] = await db.insert(organizations).values({
        name: "Legacy Organization",
        plan: "enterprise",
        status: "active",
        monthlyRateCents: 0,
        notes: "Auto-created during multi-tenant migration. Holds all pre-existing users and data.",
      }).returning();
      defaultOrg = created;
    } else {
      defaultOrg = existing[0];
    }

    // Backfill orphan rows
    await db.update(users).set({ organizationId: defaultOrg.id })
      .where(isNull(users.organizationId));
    await db.update(reports).set({ organizationId: defaultOrg.id })
      .where(isNull(reports.organizationId));
    await db.update(notifications).set({ organizationId: defaultOrg.id })
      .where(isNull(notifications.organizationId));
    await db.update(goals).set({ organizationId: defaultOrg.id })
      .where(isNull(goals.organizationId));
    await db.update(tasks).set({ organizationId: defaultOrg.id })
      .where(isNull(tasks.organizationId));
    await db.update(performanceMetrics).set({ organizationId: defaultOrg.id })
      .where(isNull(performanceMetrics.organizationId));

    // If default org has no owner yet, link the first executive in it
    if (!defaultOrg.ownerExecutiveId) {
      const [exec] = await db.select().from(users)
        .where(and(eq(users.role, "executive"), eq(users.organizationId, defaultOrg.id)))
        .limit(1);
      if (exec) {
        const [updated] = await db.update(organizations)
          .set({ ownerExecutiveId: exec.id, contactEmail: exec.email, updatedAt: new Date() })
          .where(eq(organizations.id, defaultOrg.id))
          .returning();
        defaultOrg = updated;
      }
    }

    // Promote SUPERADMIN_EMAIL if defined
    const superEmail = process.env.SUPERADMIN_EMAIL;
    if (superEmail) {
      const superUser = await this.getUserByEmail(superEmail);
      if (superUser && !superUser.isSuperAdmin) {
        await this.setSuperAdmin(superUser.id, true);
      }
    }

    return defaultOrg;
  }
}

export const storage = new DatabaseStorage();
