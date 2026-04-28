import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertReportSchema, insertNotificationSchema, insertGoalSchema, insertTaskSchema, insertContactSchema } from "@shared/schema";
import { z } from "zod";
import { sendEmail, buildNotificationEmail, buildContactInquiryEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
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

  // Complete profile (for Google OAuth new users)
  app.patch('/api/auth/complete-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { firstName, lastName, department, role, supervisorId } = req.body;
      const updated = await storage.updateUserRole(userId, role || 'employee', supervisorId && supervisorId !== 'none' ? supervisorId : undefined);
      if (updated) {
        await storage.updateUserProfile(userId, { firstName, lastName, department });
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

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const stats = await storage.getDashboardStats(userId, user.role);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Reports routes
  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const reportData = insertReportSchema.parse({
        ...req.body,
        employeeId: userId,
        supervisorId: user.supervisorId,
      });

      const report = await storage.createReport(reportData);

      // Create notification for supervisor + send email
      if (user.supervisorId) {
        const notifTitle = 'New Report Submitted';
        const notifMessage = `${user.firstName} ${user.lastName} has submitted a new ${req.body.type} report`;
        await storage.createNotification({
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
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { status, limit = 20, offset = 0, type, search, dateFrom, dateTo } = req.query;
      let filters: any = { limit: parseInt(limit as string), offset: parseInt(offset as string) };

      if (status) filters.status = status;
      if (type) filters.type = type;
      if (search) filters.search = search;
      if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
      if (dateTo) filters.dateTo = new Date(dateTo as string);

      // Filter based on role
      if (user.role === 'employee') {
        filters.employeeId = userId;
      } else {
        // Supervisors see reports from their team
        filters.supervisorId = userId;
      }

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
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const report = await storage.getReport(reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Check if user has access to this report
      const hasAccess = report.employeeId === userId || 
                       report.supervisorId === userId ||
                       user.role === 'manager' ||
                       user.role === 'executive';

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

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
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const report = await storage.getReport(reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Check if user is the supervisor for this report
      if (report.supervisorId !== userId) {
        return res.status(403).json({ message: "Only the assigned supervisor can review this report" });
      }

      const updatedReport = await storage.reviewReport(reportId, feedback, rating, status);

      // Create notification for employee + send email
      if (report.employeeId) {
        const notificationType = status === 'approved' ? 'report_reviewed' : 'revision_requested';
        const notifTitle = status === 'approved' ? 'Report Approved' : 'Revision Requested';
        const notifMessage = status === 'approved'
          ? `Your ${report.type} report has been approved with rating ${rating}/5`
          : `Your ${report.type} report needs revision. Please review the feedback.`;

        await storage.createNotification({
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

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { limit = 10 } = req.query;

      const notifications = await storage.getUserNotifications(userId, parseInt(limit));
      res.json(notifications);
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

  // Team routes
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
      if (!user || (user.role !== 'manager' && user.role !== 'executive')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const updatedUser = await storage.updateUserRole(targetUserId, role, supervisorId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'executive') {
        return res.status(403).json({ message: "Executive access required" });
      }

      const allUsers = await storage.getAllUsers();
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
      
      if (!user || user.role !== 'executive') {
        return res.status(403).json({ message: "Executive access required" });
      }

      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/users/supervisors/:role', isAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.params;
      const supervisors = await storage.getSupervisorsForRole(role);
      res.json(supervisors);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      res.status(500).json({ message: "Failed to fetch supervisors" });
    }
  });

  // Analytics route (manager + executive)
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'manager' && user.role !== 'executive' && user.role !== 'supervisor')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // All users route (for org chart - manager+executive)
  app.get('/api/users/all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'manager' && user.role !== 'executive' && user.role !== 'supervisor')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // User profile update
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

  // Goals routes
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
      const goalData = insertGoalSchema.parse({ ...req.body, userId });
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
      if (!owns) {
        return res.status(403).json({ message: "Access denied" });
      }
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
      if (!owns) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteGoal(goalId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      let filters: any = {};
      if (user.role === 'employee') {
        filters.assignedTo = userId;
      } else {
        // supervisors/managers/executives see tasks they assigned
        filters.assignedBy = userId;
      }

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

      const taskData = insertTaskSchema.parse({
        ...req.body,
        assignedBy: userId,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      });

      const task = await storage.createTask(taskData);

      // Notify assigned user + send email
      const taskNotifTitle = 'New Task Assigned';
      const taskNotifMessage = `${user.firstName} ${user.lastName} assigned you a task: "${task.title}"`;
      await storage.createNotification({
        userId: taskData.assignedTo,
        type: 'task_assigned',
        title: taskNotifTitle,
        message: taskNotifMessage,
        relatedTaskId: task.id,
      });
      const assignee = await storage.getUser(taskData.assignedTo);
      if (assignee?.email) {
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

      // Employees can only update tasks assigned to them; supervisors can update their own tasks
      if (task.assignedTo !== userId && task.assignedBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updated = await storage.updateTask(taskId, req.body);

      // Notify assigner when employee completes a task + send email
      if (req.body.status === 'completed' && task.assignedTo === userId) {
        const completeTitle = 'Task Completed';
        const completeMessage = `A team member completed the task: "${task.title}"`;
        await storage.createNotification({
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

  // Activity timeline route
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

  // ── CONTACT INQUIRY (public — no auth required) ──
  app.post('/api/contact', async (req, res) => {
    try {
      const parsed = insertContactSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid form data", errors: parsed.error.flatten() });
      }
      const contact = await storage.saveContact(parsed.data);
      // Send email notification to platform owner
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

  // ── GET ALL CONTACTS (exec only) ──
  app.get('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "executive") {
        return res.status(403).json({ message: "Executives only" });
      }
      const allContacts = await storage.getContacts();
      res.json(allContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // ── MARK CONTACT READ (exec only) ──
  app.patch('/api/contacts/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "executive") {
        return res.status(403).json({ message: "Executives only" });
      }
      await storage.markContactRead(parseInt(req.params.id));
      res.json({ message: "Marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
