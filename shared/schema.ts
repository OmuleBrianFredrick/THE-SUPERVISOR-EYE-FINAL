import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// ─── ORGANIZATIONS (multi-tenant root) ───
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  industry: varchar("industry"),
  country: varchar("country"),
  contactEmail: varchar("contact_email"),
  phone: varchar("phone"),
  plan: varchar("plan").default("trial"), // trial, starter, professional, enterprise
  status: varchar("status").default("active"), // active, trial, suspended, pending
  monthlyRateCents: integer("monthly_rate_cents").default(0),
  trialEndsAt: timestamp("trial_ends_at"),
  suspendedAt: timestamp("suspended_at"),
  ownerExecutiveId: varchar("owner_executive_id"),
  accountManagerId: varchar("account_manager_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Users table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("employee"),
  supervisorId: varchar("supervisor_id"),
  department: varchar("department"),
  organizationId: integer("organization_id"),
  isSuperAdmin: boolean("is_super_admin").default(false),
  isActive: boolean("is_active").default(true),
  resetToken: varchar("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  employeeId: varchar("employee_id").notNull(),
  supervisorId: varchar("supervisor_id"),
  type: varchar("type").notNull(),
  title: varchar("title").notNull(),
  tasksCompleted: text("tasks_completed"),
  challengesFaced: text("challenges_faced"),
  goalsNextPeriod: text("goals_next_period"),
  priority: varchar("priority").default("normal"),
  status: varchar("status").default("pending"),
  supervisorFeedback: text("supervisor_feedback"),
  rating: integer("rating"),
  attachments: jsonb("attachments"),
  location: varchar("location"),
  taskId: integer("task_id"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  relatedReportId: integer("related_report_id"),
  relatedTaskId: integer("related_task_id"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").default("not_started"),
  targetDate: timestamp("target_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  employeeId: varchar("employee_id").notNull(),
  period: varchar("period").notNull(),
  totalReports: integer("total_reports").default(0),
  approvedReports: integer("approved_reports").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  onTimeSubmissions: integer("on_time_submissions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task assignment table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  title: varchar("title").notNull(),
  description: text("description"),
  assignedTo: varchar("assigned_to").notNull(),
  assignedBy: varchar("assigned_by").notNull(),
  status: varchar("status").default("pending"),
  priority: varchar("priority").default("normal"),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── PLATFORM CRM TABLES ───
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: varchar("status").default("pending"), // pending, paid, overdue, cancelled
  description: text("description"),
  issuedAt: timestamp("issued_at").defaultNow(),
  paidAt: timestamp("paid_at"),
  dueDate: timestamp("due_date"),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  userId: varchar("user_id"),
  action: varchar("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  audience: varchar("audience").default("all"), // all, executives, single_org
  organizationId: integer("organization_id"), // when audience=single_org
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const organizationRelations = relations(organizations, ({ many, one }) => ({
  members: many(users),
  reports: many(reports),
  invoices: many(invoices),
  ownerExecutive: one(users, {
    fields: [organizations.ownerExecutiveId],
    references: [users.id],
    relationName: "org_owner",
  }),
  accountManager: one(users, {
    fields: [organizations.accountManagerId],
    references: [users.id],
    relationName: "org_account_manager",
  }),
}));

export const goalRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
}));

export const taskRelations = relations(tasks, ({ one }) => ({
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
    relationName: "task_assignee",
  }),
  assigner: one(users, {
    fields: [tasks.assignedBy],
    references: [users.id],
    relationName: "task_assigner",
  }),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  supervisor: one(users, {
    fields: [users.supervisorId],
    references: [users.id],
    relationName: "supervisor_subordinate",
  }),
  subordinates: many(users, { relationName: "supervisor_subordinate" }),
  reports: many(reports, { relationName: "employee_reports" }),
  supervisedReports: many(reports, { relationName: "supervisor_reports" }),
  notifications: many(notifications),
  metrics: many(performanceMetrics),
  assignedTasks: many(tasks, { relationName: "task_assignee" }),
  createdTasks: many(tasks, { relationName: "task_assigner" }),
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const reportRelations = relations(reports, ({ one }) => ({
  employee: one(users, {
    fields: [reports.employeeId],
    references: [users.id],
    relationName: "employee_reports",
  }),
  supervisor: one(users, {
    fields: [reports.supervisorId],
    references: [users.id],
    relationName: "supervisor_reports",
  }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  report: one(reports, { fields: [notifications.relatedReportId], references: [reports.id] }),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  employee: one(users, { fields: [performanceMetrics.employeeId], references: [users.id] }),
}));

export const invoiceRelations = relations(invoices, ({ one }) => ({
  organization: one(organizations, {
    fields: [invoices.organizationId],
    references: [organizations.id],
  }),
}));

export const activityLogRelations = relations(activityLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [activityLogs.organizationId],
    references: [organizations.id],
  }),
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));

// Contact inquiries table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  organization: varchar("organization"),
  phone: varchar("phone"),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, isRead: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({
  id: true, createdAt: true, updatedAt: true, submittedAt: true, reviewedAt: true,
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertPerformanceMetricsSchema = createInsertSchema(performanceMetrics).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, issuedAt: true, paidAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertPerformanceMetrics = z.infer<typeof insertPerformanceMetricsSchema>;
export type PerformanceMetrics = typeof performanceMetrics.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

// Extended types
export type UserWithRelations = User & {
  supervisor?: User;
  subordinates?: User[];
  reports?: Report[];
  supervisedReports?: Report[];
  organization?: Organization;
};

export type ReportWithRelations = Report & {
  employee?: User;
  supervisor?: User;
};

export type TaskWithRelations = Task & {
  assignee?: User;
  assigner?: User;
};

export type OrganizationWithStats = Organization & {
  userCount: number;
  reportCount: number;
  ownerExecutive?: User;
  accountManager?: User;
};
