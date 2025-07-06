import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertReportSchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserWithRelations(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

      // Create notification for supervisor
      if (user.supervisorId) {
        await storage.createNotification({
          userId: user.supervisorId,
          type: 'report_submitted',
          title: 'New Report Submitted',
          message: `${user.firstName} ${user.lastName} has submitted a new ${req.body.type} report`,
          relatedReportId: report.id,
        });
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { status, limit = 20, offset = 0 } = req.query;

      let filters: any = { limit: parseInt(limit), offset: parseInt(offset) };

      if (status) {
        filters.status = status;
      }

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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

      // Create notification for employee
      if (report.employeeId) {
        const notificationType = status === 'approved' ? 'report_reviewed' : 'revision_requested';
        const message = status === 'approved' 
          ? `Your ${report.type} report has been approved with rating ${rating}/5`
          : `Your ${report.type} report needs revision. Please review the feedback.`;

        await storage.createNotification({
          userId: report.employeeId,
          type: notificationType,
          title: status === 'approved' ? 'Report Approved' : 'Revision Requested',
          message,
          relatedReportId: reportId,
        });
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);
  return httpServer;
}
