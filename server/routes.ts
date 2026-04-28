import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import {
  insertReportSchema,
  insertGoalSchema,
  insertTaskSchema,
  insertContactSchema,
  insertOrganizationSchema,
  insertInvoiceSchema,
  insertAnnouncementSchema,
} from "@shared/schema";
import { z } from "zod";
import { sendEmail, buildNotificationEmail, buildContactInquiryEmail } from "./email";
import { randomBytes } from "crypto";

// Middleware: require super admin
const isSuperAdmin: RequestHandler = async (req: any, res, next) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const user = await storage.getUser(userId);
  if (!user || !user.isSuperAdmin) {
    return res.status(403).json({ message: "Super admin access required" });
  }
  (req as any).currentUser = user;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // ─── AUTH ───
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUserWithRelations(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password, ...safeUser } = user as any;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Complete profile (Google OAuth new users)
  app.patch('/api/auth/complete-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { firstName, lastName, department, role, supervisorId, organizationName, industry, country, phone } = req.body;
      const newRole = role || 'employee';

      const current = await storage.getUser(userId);
      if (!current) return res.status(404).json({ message: "User not found" });

      // Handle org provisioning the same way as registration
      let organizationId: number | null = current.organizationId ?? null;
      if (newRole === "executive" && !organizationId) {
        const orgName = (organizationName && organizationName.trim()) ||
          `${firstName || current.firstName || "New"} ${lastName || current.lastName || "Executive"}'s Organization`.trim();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        const newOrg = await storage.createOrganization({
          name: orgName,
          industry: industry || null,
          country: country || null,
          contactEmail: current.email || null,
          phone: phone || null,
          plan: "trial",
          status: "trial",
          monthlyRateCents: 0,
          trialEndsAt: trialEnd,
          ownerExecutiveId: userId,
          notes: null,
        });
        organizationId = newOrg.id;
        await storage.logActivity({
          organizationId: newOrg.id,
          userId,
          action: "organization_created",
          details: `Organization "${newOrg.name}" was created via profile completion.`,
        });
      } else if (newRole !== "executive" && supervisorId && supervisorId !== "none") {
        const supervisor = await storage.getUser(supervisorId);
        if (supervisor?.organizationId) organizationId = supervisor.organizationId;
      }

      await storage.updateUserRole(userId, newRole, supervisorId && supervisorId !== 'none' ? supervisorId : undefined);
      await storage.updateUserProfile(userId, { firstName, lastName, department });
      if (organizationId) {
        await storage.setUserOrganization(userId, organizationId);
      }

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safeUser } = user as any;
      res.json(safeUser);
    } catch (error) {
      console.error("Complete profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ─── DASHBOARD STATS ───
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const stats = await storage.getDashboardStats(userId, user.role);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // ─── REPORTS ───
  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const reportData = insertReportSchema.parse({
        ...req.body,
        employeeId: userId,
        supervisorId: user.supervisorId,
        organizationId: user.organizationId ?? null,
      });

      const report = await storage.createReport(reportData);

      if (user.supervisorId) {
        const notifTitle = 'New Report Submitted';
        const notifMessage = `${user.firstName} ${user.lastName} has submitted a new ${req.body.type} report`;
        await storage.createNotification({
          organizationId: user.organizationId ?? null,
          userId: user.supervisorId,
          type: 'report_submitted',
          title: notifTitle,
          message: notifMessage,
          relatedReportId: report.id,
        });
        const supervisor = await storage.getUser(user.supervisorId);
        if (supervisor?.email) {
          await sendEmail({
            to: supervisor.email,
            subject: `[The Supervisor] ${notifTitle}`,
            html: buildNotificationEmail(notifTitle, notifMessage),
          });
        }
      }

      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { status, limit = 20, offset = 0, type, search, dateFrom, dateTo } = req.query;
      const filters: any = { limit: parseInt(limit as string), offset: parseInt(offset as string) };

      if (status) filters.status = status;
      if (type) filters.type = type;
      if (search) filters.search = search;
      if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
      if (dateTo) filters.dateTo = new Date(dateTo as string);

      // Tenant scope
      if (user.organizationId !== null && user.organizationId !== undefined) {
        filters.organizationId = user.organizationId;
      }

      // Role scope
      if (user.role === 'employee') {
        filters.employeeId = userId;
      } else if (user.role === 'supervisor') {
        filters.supervisorId = userId;
      }
      // managers/executives see all org reports (no extra filter)

      const reports = await storage.getReports(filters);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get('/api/reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const report = await storage.getReport(reportId);
      if (!report) return res.status(404).json({ message: "Report not found" });

      // Tenant boundary
      if (user.organizationId && report.organizationId && report.organizationId !== user.organizationId && !user.isSuperAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const hasAccess = report.employeeId === userId ||
                       report.supervisorId === userId ||
                       user.role === 'manager' ||
                       user.role === 'executive' ||
                       user.isSuperAdmin;

      if (!hasAccess) return res.status(403).json({ message: "Access denied" });
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.patch('/api/reports/:id/review', isAuthenticated, async (req: any, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      const { feedback, rating, status } = req.body;

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const report = await storage.getReport(reportId);
      if (!report) return res.status(404).json({ message: "Report not found" });

      if (report.supervisorId !== userId) {
        return res.status(403).json({ message: "Only the assigned supervisor can review this report" });
      }

      const updatedReport = await storage.reviewReport(reportId, feedback, rating, status);

      if (report.employeeId) {
        const notificationType = status === 'approved' ? 'report_reviewed' : 'revision_requested';
        const notifTitle = status === 'approved' ? 'Report Approved' : 'Revision Requested';
        const notifMessage = status === 'approved'
          ? `Your ${report.type} report has been approved with rating ${rating}/5`
          : `Your ${report.type} report needs revision. Please review the feedback.`;

        await storage.createNotification({
          organizationId: report.organizationId ?? null,
          userId: report.employeeId,
          type: notificationType,
          title: notifTitle,
          message: notifMessage,
          relatedReportId: reportId,
        });
        const employee = await storage.getUser(report.employeeId);
        if (employee?.email) {
          await sendEmail({
            to: employee.email,
            subject: `[The Supervisor] ${notifTitle}`,
            html: buildNotificationEmail(notifTitle, notifMessage),
          });
        }
      }

      res.json(updatedReport);
    } catch (error) {
      console.error("Error reviewing report:", error);
      res.status(500).json({ message: "Failed to review report" });
    }
  });

  // ─── NOTIFICATIONS ───
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { limit = 10 } = req.query;
      const list = await storage.getUserNotifications(userId, parseInt(limit));
      res.json(list);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // ─── TEAM ───
  app.get('/api/team', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const subordinates = await storage.getSubordinates(userId);
      res.json(subordinates);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.patch('/api/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = req.params.id;
      const userId = (req.session as any).userId;
      const { role, supervisorId } = req.body;

      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'manager' && user.role !== 'executive' && !user.isSuperAdmin)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      // Tenant boundary: target user must be in same org (unless super admin)
      const target = await storage.getUser(targetUserId);
      if (!target) return res.status(404).json({ message: "User not found" });
      if (!user.isSuperAdmin && target.organizationId !== user.organizationId) {
        return res.status(403).json({ message: "Cannot modify users outside your organization" });
      }

      const updated = await storage.updateUserRole(targetUserId, role, supervisorId);
      res.json(updated);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // ─── ADMIN (org-scoped for executives) ───
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'executive' && !user.isSuperAdmin)) {
        return res.status(403).json({ message: "Executive access required" });
      }
      const orgId = user.isSuperAdmin ? undefined : user.organizationId ?? undefined;
      const allUsers = await storage.getAllUsers(orgId);
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'executive' && !user.isSuperAdmin)) {
        return res.status(403).json({ message: "Executive access required" });
      }
      const orgId = user.isSuperAdmin ? undefined : user.organizationId ?? undefined;
      const stats = await storage.getSystemStats(orgId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/users/supervisors/:role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      const orgId = user?.organizationId ?? undefined;
      const supervisors = await storage.getSupervisorsForRole(req.params.role, orgId);
      res.json(supervisors);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      res.status(500).json({ message: "Failed to fetch supervisors" });
    }
  });

  // ─── ANALYTICS ───
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'manager' && user.role !== 'executive' && user.role !== 'supervisor' && !user.isSuperAdmin)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const orgId = user.isSuperAdmin ? undefined : user.organizationId ?? undefined;
      const analytics = await storage.getAnalytics(orgId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // All users in org (for org chart)
  app.get('/api/users/all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'manager' && user.role !== 'executive' && user.role !== 'supervisor' && !user.isSuperAdmin)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const orgId = user.isSuperAdmin ? undefined : user.organizationId ?? undefined;
      const allUsers = await storage.getAllUsers(orgId);
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { department, firstName, lastName } = req.body;
      const updated = await storage.updateUserProfile(userId, { department, firstName, lastName });
      res.json(updated);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ─── GOALS ───
  app.get('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const userGoals = await storage.getGoals(userId);
      res.json(userGoals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      const goalData = insertGoalSchema.parse({
        ...req.body,
        userId,
        organizationId: user?.organizationId ?? null,
      });
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.patch('/api/goals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      const userGoals = await storage.getGoals(userId);
      const owns = userGoals.some(g => g.id === goalId);
      if (!owns) return res.status(403).json({ message: "Access denied" });
      const updated = await storage.updateGoal(goalId, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.delete('/api/goals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      const userGoals = await storage.getGoals(userId);
      const owns = userGoals.some(g => g.id === goalId);
      if (!owns) return res.status(403).json({ message: "Access denied" });
      await storage.deleteGoal(goalId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // ─── TASKS ───
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const filters: any = {};
      if (user.organizationId) filters.organizationId = user.organizationId;
      if (user.role === 'employee') filters.assignedTo = userId;
      else filters.assignedBy = userId;

      const taskList = await storage.getTasks(filters);
      res.json(taskList);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.role === 'employee') return res.status(403).json({ message: "Employees cannot assign tasks" });

      // Tenant guard: assignee must be in same org
      const assignee = await storage.getUser(req.body.assignedTo);
      if (!assignee) return res.status(404).json({ message: "Assignee not found" });
      if (user.organizationId && assignee.organizationId !== user.organizationId) {
        return res.status(403).json({ message: "Cannot assign tasks to users outside your organization" });
      }

      const taskData = insertTaskSchema.parse({
        ...req.body,
        assignedBy: userId,
        organizationId: user.organizationId ?? null,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      });

      const task = await storage.createTask(taskData);

      const taskNotifTitle = 'New Task Assigned';
      const taskNotifMessage = `${user.firstName} ${user.lastName} assigned you a task: "${task.title}"`;
      await storage.createNotification({
        organizationId: user.organizationId ?? null,
        userId: taskData.assignedTo,
        type: 'task_assigned',
        title: taskNotifTitle,
        message: taskNotifMessage,
        relatedTaskId: task.id,
      });
      if (assignee.email) {
        await sendEmail({
          to: assignee.email,
          subject: `[The Supervisor] ${taskNotifTitle}`,
          html: buildNotificationEmail(taskNotifTitle, taskNotifMessage),
        });
      }

      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      const task = await storage.getTask(taskId);
      if (!task) return res.status(404).json({ message: "Task not found" });

      if (task.assignedTo !== userId && task.assignedBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updated = await storage.updateTask(taskId, req.body);

      if (req.body.status === 'completed' && task.assignedTo === userId) {
        const completeTitle = 'Task Completed';
        const completeMessage = `A team member completed the task: "${task.title}"`;
        await storage.createNotification({
          organizationId: task.organizationId ?? null,
          userId: task.assignedBy,
          type: 'task_completed',
          title: completeTitle,
          message: completeMessage,
          relatedTaskId: taskId,
        });
        const assigner = await storage.getUser(task.assignedBy);
        if (assigner?.email) {
          await sendEmail({
            to: assigner.email,
            subject: `[The Supervisor] ${completeTitle}`,
            html: buildNotificationEmail(completeTitle, completeMessage),
          });
        }
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      const task = await storage.getTask(taskId);
      if (!task) return res.status(404).json({ message: "Task not found" });
      if (task.assignedBy !== userId) return res.status(403).json({ message: "Only the assigner can delete this task" });
      await storage.deleteTask(taskId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // ─── TIMELINE ───
  app.get('/api/timeline', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const timeline = await storage.getActivityTimeline(userId, user.role);
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });

  // ─── CONTACT (public) ───
  app.post('/api/contact', async (req, res) => {
    try {
      const parsed = insertContactSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid form data", errors: parsed.error.flatten() });
      }
      const contact = await storage.saveContact(parsed.data);
      const ownerEmail = process.env.CONTACT_RECIPIENT || "omulebrianfredrick@gmail.com";
      await sendEmail({
        to: ownerEmail,
        subject: `New Inquiry from ${contact.name} — THE SUPERVISOR`,
        html: buildContactInquiryEmail(parsed.data),
      });
      res.json({ message: "Inquiry received successfully" });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Failed to submit inquiry" });
    }
  });

  app.get('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "executive" && !user.isSuperAdmin)) {
        return res.status(403).json({ message: "Executives only" });
      }
      const allContacts = await storage.getContacts();
      res.json(allContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.patch('/api/contacts/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "executive" && !user.isSuperAdmin)) {
        return res.status(403).json({ message: "Executives only" });
      }
      await storage.markContactRead(parseInt(req.params.id));
      res.json({ message: "Marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  // ─── ANNOUNCEMENTS (visible to all authed users) ───
  app.get('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      const orgId = user?.organizationId ?? undefined;
      const list = await storage.listAnnouncements(orgId);
      res.json(list);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // ════════════════════════════════════════════════
  // ORGANIZATION SETTINGS (current user's org)
  // ════════════════════════════════════════════════

  app.get('/api/organization', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) return res.status(404).json({ message: "No organization" });
      const org = await storage.getOrganization(user.organizationId);
      res.json(org);
    } catch (error) {
      console.error("Error fetching organization:", error);
      res.status(500).json({ message: "Failed to fetch organization" });
    }
  });

  app.patch('/api/organization', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) return res.status(404).json({ message: "No organization" });
      if (user.role !== "executive" && !user.isSuperAdmin) {
        return res.status(403).json({ message: "Only executives can edit the organization" });
      }
      // Whitelist editable fields (not plan/status/dates)
      const { name, industry, country, contactEmail, phone, notes } = req.body || {};
      const updates: any = {};
      if (typeof name === "string" && name.trim()) updates.name = name.trim();
      if (typeof industry === "string") updates.industry = industry || null;
      if (typeof country === "string") updates.country = country || null;
      if (typeof contactEmail === "string") updates.contactEmail = contactEmail || null;
      if (typeof phone === "string") updates.phone = phone || null;
      if (typeof notes === "string") updates.notes = notes || null;
      const updated = await storage.updateOrganization(user.organizationId, updates);
      await storage.logActivity({
        organizationId: user.organizationId,
        userId: user.id,
        action: "organization_updated",
        details: `${user.email || user.id} updated organization details`,
      });
      res.json(updated);
    } catch (error) {
      console.error("Error updating organization:", error);
      res.status(500).json({ message: "Failed to update organization" });
    }
  });

  app.get('/api/organization/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) return res.status(404).json({ message: "No organization" });
      if (user.role !== "executive" && !user.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const limit = Math.min(parseInt((req.query.limit as string) || "50", 10), 200);
      const logs = await storage.getActivityLogs(user.organizationId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching org activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // ════════════════════════════════════════════════
  // INVITATIONS (Executives invite teammates)
  // ════════════════════════════════════════════════

  app.post('/api/invitations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) return res.status(404).json({ message: "No organization" });
      if (!["executive", "manager", "supervisor"].includes(user.role) && !user.isSuperAdmin) {
        return res.status(403).json({ message: "Not allowed to invite" });
      }
      const { email, role, supervisorId, department } = req.body || {};
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email is required" });
      }
      const allowedRoles = ["employee", "supervisor", "manager"];
      const targetRole = allowedRoles.includes(role) ? role : "employee";

      // Validate supervisor (if provided) belongs to same org
      let validSupervisorId: string | null = null;
      if (supervisorId && supervisorId !== "none") {
        const sup = await storage.getUser(supervisorId);
        if (sup?.organizationId === user.organizationId) validSupervisorId = supervisorId;
      }

      const token = randomBytes(24).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const inv = await storage.createInvitation({
        organizationId: user.organizationId,
        email: email.toLowerCase().trim(),
        role: targetRole,
        supervisorId: validSupervisorId,
        department: department || null,
        token,
        status: "pending",
        invitedById: user.id,
        expiresAt,
      });

      await storage.logActivity({
        organizationId: user.organizationId,
        userId: user.id,
        action: "invitation_sent",
        details: `Invited ${email} as ${targetRole}`,
      });

      // Try to email the invite (best-effort)
      try {
        const baseUrl = process.env.APP_BASE_URL ||
          (req.headers.origin as string) ||
          `https://${req.get("host")}`;
        const link = `${baseUrl}/invite/${token}`;
        const org = await storage.getOrganization(user.organizationId);
        await sendEmail({
          to: email,
          subject: `You're invited to join ${org?.name || "our team"} on The Supervisor`,
          html: `
            <p>Hi,</p>
            <p>${user.firstName || user.email} invited you to join <b>${org?.name || "their team"}</b> as a <b>${targetRole}</b>.</p>
            <p><a href="${link}" style="background:#2563eb;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block">Accept invitation</a></p>
            <p style="color:#666;font-size:12px">This link expires in 7 days. If the button doesn't work, paste this URL: ${link}</p>
          `,
        });
      } catch (e) {
        console.warn("Invite email failed (non-fatal):", e);
      }

      res.json(inv);
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  app.get('/api/invitations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) return res.status(404).json({ message: "No organization" });
      const list = await storage.listInvitationsByOrg(user.organizationId);
      res.json(list);
    } catch (error) {
      console.error("Error listing invitations:", error);
      res.status(500).json({ message: "Failed to list invitations" });
    }
  });

  app.delete('/api/invitations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) return res.status(404).json({ message: "No organization" });
      if (!["executive", "manager", "supervisor"].includes(user.role) && !user.isSuperAdmin) {
        return res.status(403).json({ message: "Not allowed" });
      }
      const id = parseInt(req.params.id, 10);
      await storage.revokeInvitation(id, user.organizationId);
      res.json({ ok: true });
    } catch (error) {
      console.error("Error revoking invitation:", error);
      res.status(500).json({ message: "Failed to revoke invitation" });
    }
  });

  // PUBLIC: fetch invite info by token (used by accept page before login)
  app.get('/api/invitations/by-token/:token', async (req, res) => {
    try {
      const inv = await storage.getInvitationByToken(req.params.token);
      if (!inv) return res.status(404).json({ message: "Invitation not found" });
      const expired = new Date(inv.expiresAt) < new Date();
      const org = await storage.getOrganization(inv.organizationId);
      res.json({
        invitation: {
          id: inv.id,
          email: inv.email,
          role: inv.role,
          status: expired && inv.status === "pending" ? "expired" : inv.status,
          expiresAt: inv.expiresAt,
        },
        organization: org ? { id: org.id, name: org.name, industry: org.industry } : null,
      });
    } catch (error) {
      console.error("Error fetching invite info:", error);
      res.status(500).json({ message: "Failed to fetch invitation" });
    }
  });

  // PUBLIC: accept an invitation — caller must already be logged in (post-register)
  app.post('/api/invitations/accept/:token', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const inv = await storage.getInvitationByToken(req.params.token);
      if (!inv) return res.status(404).json({ message: "Invitation not found" });
      if (inv.status !== "pending") return res.status(400).json({ message: `Invitation is ${inv.status}` });
      if (new Date(inv.expiresAt) < new Date()) return res.status(400).json({ message: "Invitation expired" });

      // Apply org + role + supervisor to the user
      await storage.setUserOrganization(user.id, inv.organizationId);
      await storage.updateUserRole(user.id, inv.role, inv.supervisorId || undefined);
      if (inv.department) {
        await storage.updateUserProfile(user.id, { department: inv.department });
      }
      await storage.acceptInvitation(req.params.token, user.id);

      await storage.logActivity({
        organizationId: inv.organizationId,
        userId: user.id,
        action: "invitation_accepted",
        details: `${user.email || user.id} joined as ${inv.role}`,
      });

      const refreshed = await storage.getUser(user.id);
      const { password: _, ...safeUser } = (refreshed || user) as any;
      res.json(safeUser);
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  });

  // ════════════════════════════════════════════════
  // BILLING (Per-organization — Executives & owners)
  // ════════════════════════════════════════════════

  app.get('/api/billing', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) return res.status(404).json({ message: "No organization" });
      const org = await storage.getOrganization(user.organizationId);
      const invoices = await storage.listInvoices(user.organizationId);
      const plans = [
        { id: "trial", name: "Trial", priceCents: 0, features: ["14-day trial", "Up to 5 users", "Basic reports"] },
        { id: "starter", name: "Starter", priceCents: 4900, features: ["Up to 25 users", "All reports", "Email support"] },
        { id: "professional", name: "Professional", priceCents: 14900, features: ["Up to 100 users", "Analytics", "Priority support"] },
        { id: "enterprise", name: "Enterprise", priceCents: 49900, features: ["Unlimited users", "Custom integrations", "Dedicated support"] },
      ];
      res.json({ organization: org, invoices, plans });
    } catch (error) {
      console.error("Error fetching billing:", error);
      res.status(500).json({ message: "Failed to fetch billing" });
    }
  });

  app.post('/api/billing/plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) return res.status(404).json({ message: "No organization" });
      if (user.role !== "executive" && !user.isSuperAdmin) {
        return res.status(403).json({ message: "Only executives can change the plan" });
      }
      const { plan } = req.body as { plan: string };
      const allowed = ["trial", "starter", "professional", "enterprise"];
      if (!allowed.includes(plan)) return res.status(400).json({ message: "Invalid plan" });

      const updated = await storage.updateOrganization(user.organizationId, {
        plan,
        status: plan === "trial" ? "trial" : "active",
      });
      await storage.logActivity({
        organizationId: user.organizationId,
        userId: user.id,
        action: "plan_changed",
        details: `${user.email || user.id} changed plan to ${plan}`,
      });
      res.json(updated);
    } catch (error) {
      console.error("Error changing plan:", error);
      res.status(500).json({ message: "Failed to change plan" });
    }
  });

  // ════════════════════════════════════════════════
  // MASTER CRM (Super Admin only — Layer 1)
  // ════════════════════════════════════════════════

  app.get('/api/master/stats', isSuperAdmin, async (_req, res) => {
    try {
      const stats = await storage.getMasterStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching master stats:", error);
      res.status(500).json({ message: "Failed to fetch master stats" });
    }
  });

  app.get('/api/master/organizations', isSuperAdmin, async (_req, res) => {
    try {
      const orgs = await storage.listOrganizations();
      res.json(orgs);
    } catch (error) {
      console.error("Error listing organizations:", error);
      res.status(500).json({ message: "Failed to list organizations" });
    }
  });

  app.get('/api/master/organizations/:id', isSuperAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const org = await storage.getOrganization(id);
      if (!org) return res.status(404).json({ message: "Organization not found" });
      const users = await storage.getAllUsers(id);
      const invoiceList = await storage.listInvoices(id);
      const activity = await storage.getActivityLogs(id, 50);
      res.json({ organization: org, users, invoices: invoiceList, activity });
    } catch (error) {
      console.error("Error fetching organization detail:", error);
      res.status(500).json({ message: "Failed to fetch organization" });
    }
  });

  app.post('/api/master/organizations', isSuperAdmin, async (req: any, res) => {
    try {
      const data = insertOrganizationSchema.parse(req.body);
      const org = await storage.createOrganization(data);
      await storage.logActivity({
        organizationId: org.id,
        userId: req.currentUser.id,
        action: "organization_created_by_admin",
        details: `Super admin created organization "${org.name}"`,
      });
      res.json(org);
    } catch (error) {
      console.error("Error creating organization:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create organization" });
    }
  });

  app.patch('/api/master/organizations/:id', isSuperAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      // coerce date fields
      if (updates.trialEndsAt) updates.trialEndsAt = new Date(updates.trialEndsAt);
      if (updates.suspendedAt) updates.suspendedAt = new Date(updates.suspendedAt);
      const updated = await storage.updateOrganization(id, updates);
      await storage.logActivity({
        organizationId: id,
        userId: req.currentUser.id,
        action: "organization_updated",
        details: `Updated fields: ${Object.keys(updates).join(", ")}`,
      });
      res.json(updated);
    } catch (error) {
      console.error("Error updating organization:", error);
      res.status(500).json({ message: "Failed to update organization" });
    }
  });

  app.post('/api/master/organizations/:id/status', isSuperAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!["active", "trial", "suspended", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updates: any = { status };
      if (status === "suspended") updates.suspendedAt = new Date();
      const updated = await storage.updateOrganization(id, updates);
      await storage.logActivity({
        organizationId: id,
        userId: req.currentUser.id,
        action: `status_changed_to_${status}`,
        details: `Organization status changed to ${status}`,
      });
      res.json(updated);
    } catch (error) {
      console.error("Error changing status:", error);
      res.status(500).json({ message: "Failed to change status" });
    }
  });

  app.delete('/api/master/organizations/:id', isSuperAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOrganization(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting organization:", error);
      res.status(500).json({ message: "Failed to delete organization" });
    }
  });

  app.get('/api/master/invoices', isSuperAdmin, async (req, res) => {
    try {
      const orgId = req.query.orgId ? parseInt(req.query.orgId as string) : undefined;
      const invoiceList = await storage.listInvoices(orgId);
      res.json(invoiceList);
    } catch (error) {
      console.error("Error listing invoices:", error);
      res.status(500).json({ message: "Failed to list invoices" });
    }
  });

  app.post('/api/master/invoices', isSuperAdmin, async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.dueDate) body.dueDate = new Date(body.dueDate);
      const data = insertInvoiceSchema.parse(body);
      const invoice = await storage.createInvoice(data);
      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.patch('/api/master/invoices/:id/status', isSuperAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateInvoiceStatus(id, status);
      res.json(updated);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      res.status(500).json({ message: "Failed to update invoice status" });
    }
  });

  app.get('/api/master/activity', isSuperAdmin, async (req, res) => {
    try {
      const orgId = req.query.orgId ? parseInt(req.query.orgId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const list = await storage.getActivityLogs(orgId, limit);
      res.json(list);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  app.post('/api/master/announcements', isSuperAdmin, async (req: any, res) => {
    try {
      const data = insertAnnouncementSchema.parse({ ...req.body, createdBy: req.currentUser.id });
      const a = await storage.createAnnouncement(data);
      res.json(a);
    } catch (error) {
      console.error("Error creating announcement:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
