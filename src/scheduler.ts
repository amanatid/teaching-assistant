import { eq, lte, and, sql } from "drizzle-orm";
import { db } from "./db";
import { scheduledTasks } from "./db/schema";

type TaskHandler = (payload: Record<string, unknown>) => Promise<void>;

const handlers = new Map<string, TaskHandler>();

/**
 * Register a handler for a given task type.
 */
export function registerTaskHandler(type: string, handler: TaskHandler) {
  handlers.set(type, handler);
}

/**
 * Start polling every 30 seconds for due tasks.
 */
export function initScheduler() {
  console.log("[scheduler] initialized, polling every 30s");
  setInterval(dispatchDueTasks, 30_000);

  // Run once immediately on boot to catch anything already due
  dispatchDueTasks();
}

/**
 * Schedule a task for future execution.
 */
export async function scheduleTask(
  name: string,
  type: string,
  scheduledFor: string,
  payload: Record<string, unknown>,
) {
  await db.insert(scheduledTasks).values({
    name,
    type,
    scheduledFor,
    payload: JSON.stringify(payload),
  });
  console.log(`[scheduler] scheduled "${name}" for ${scheduledFor}`);
}

/**
 * Find pending tasks that are due, mark them running, execute, then mark completed/failed.
 */
async function dispatchDueTasks() {
  const now = new Date().toISOString();
  console.log('dispatch1');
  const dueTasks = await db
    .select()
    .from(scheduledTasks)
    .where(
      and(eq(scheduledTasks.status, "pending"), lte(scheduledTasks.scheduledFor, now)),
    );
  console.log('dispatch2')
  for (const task of dueTasks) {
    console.log(`[scheduler] dispatching "${task.name}" (type: ${task.type})`);

    await db
      .update(scheduledTasks)
      .set({ status: "running", updatedAt: sql`datetime('now')` })
      .where(eq(scheduledTasks.id, task.id));

    const handler = handlers.get(task.type);
    if (!handler) {
      console.error(`[scheduler] no handler for type "${task.type}"`);
      await db
        .update(scheduledTasks)
        .set({ status: "failed", updatedAt: sql`datetime('now')` })
        .where(eq(scheduledTasks.id, task.id));
      continue;
    }
   
    const payload = JSON.parse(task.payload);
    console.log('dispatch3')
    try {
      await handler(payload);
      await db
        .update(scheduledTasks)
        .set({ status: "completed", updatedAt: sql`datetime('now')` })
        .where(eq(scheduledTasks.id, task.id));
      console.log(`[scheduler] completed "${task.name}"`);
    } catch (err) {
      console.error(`[scheduler] failed "${task.name}":`, err);
      await db
        .update(scheduledTasks)
        .set({ status: "failed", updatedAt: sql`datetime('now')` })
        .where(eq(scheduledTasks.id, task.id));
    }
  }
}