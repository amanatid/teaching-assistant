import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const scheduledTasks = sqliteTable("scheduled_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'follow-up'
  status: text("status").notNull().default("pending"), // 'pending' | 'running' | 'completed' | 'failed'
  scheduledFor: text("scheduled_for").notNull(), // ISO datetime
  payload: text("payload").notNull(), // JSON: { threadId, message }
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});