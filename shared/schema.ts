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
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password"), // hashed — null for legacy Replit Auth users
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("employee"), // employee, supervisor, manager, executive
  supervisorId: varchar("supervisor_id"),
  department: varchar("department"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id").notNull(),
  supervisorId: varchar("supervisor_id"),
  type: varchar("type").notNull(), // weekly, project, goal_review, special
  title: varchar("title").notNull(),
  tasksCompleted: text("tasks_completed"),
  challengesFaced: text("challenges_faced"),
  goalsNextPeriod: text("goals_next_period"),
  priority: varchar("priority").default("normal"), // normal, high, urgent
  status: varchar("status").default("pending"), // pending, approved, needs_revision, rejected
  supervisorFeedback: text("supervisor_feedback"),
  rating: integer("rating"), // 1-5 scale
  attachments: jsonb("attachments"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // report_submitted, report_reviewed, revision_requested
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  relatedReportId: integer("related_report_id"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").default("not_started"), // not_started, in_progress, completed
  targetDate: timestamp("target_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id").notNull(),
  period: varchar("period").notNull(), // YYYY-MM format
  totalReports: integer("total_reports").default(0),
  approvedReports: integer("approved_reports").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  onTimeSubmissions: integer("on_time_submissions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const goalRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  supervisor: one(users, {
    fields: [users.supervisorId],
    references: [users.id],
    relationName: "supervisor_subordinate",
  }),
  subordinates: many(users, {
    relationName: "supervisor_subordinate",
  }),
  reports: many(reports, {
    relationName: "employee_reports",
  }),
  supervisedReports: many(reports, {
    relationName: "supervisor_reports",
  }),
  notifications: many(notifications),
  metrics: many(performanceMetrics),
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
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  report: one(reports, {
    fields: [notifications.relatedReportId],
    references: [reports.id],
  }),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  employee: one(users, {
    fields: [performanceMetrics.employeeId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
  reviewedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertPerformanceMetricsSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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

// Extended types with relations
export type UserWithRelations = User & {
  supervisor?: User;
  subordinates?: User[];
  reports?: Report[];
  supervisedReports?: Report[];
};

export type ReportWithRelations = Report & {
  employee?: User;
  supervisor?: User;
};
