import * as SQLite from "expo-sqlite";
import { Task, TaskPriority } from "../types/task";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  completed: number;
  status: string;
  priority: string | null;
  dueDate: string | null;
  createdDate: string | null;
  notificationId: string | null;
};

type TableColumn = {
  name: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDatabase = () => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync("questdo.db");
  }

  return databasePromise;
};

const normalizePriority = (priority: string | null): TaskPriority => {
  if (priority === "high" || priority === "low" || priority === "medium") {
    return priority;
  }

  return "medium";
};

const mapRowToTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  category: row.category ?? "Study",
  completed: Boolean(row.completed),
  priority: normalizePriority(row.priority),
  dueDate: row.dueDate ?? new Date().toISOString(),
  createdDate: row.createdDate ?? new Date().toISOString(),
  reminderTime: (row as any).reminderTime ?? "09:00",
  notificationId: row.notificationId,
});

export async function initializeDatabase() {
  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'incomplete',
      priority TEXT,
      dueDate TEXT,
      createdDate TEXT NOT NULL,
      notificationId TEXT
    );
  `);

  await ensureColumn(database, "description", "TEXT");
  await ensureColumn(database, "category", "TEXT");
  await ensureColumn(database, "completed", "INTEGER NOT NULL DEFAULT 0");
  await ensureColumn(database, "status", "TEXT NOT NULL DEFAULT 'incomplete'");
  await ensureColumn(database, "priority", "TEXT");
  await ensureColumn(database, "dueDate", "TEXT");
  await ensureColumn(database, "createdDate", "TEXT");
  await ensureColumn(database, "notificationId", "TEXT");
  await ensureColumn(database, "reminderTime", "TEXT");

  await database.runAsync(
    "UPDATE tasks SET createdDate = ? WHERE createdDate IS NULL OR createdDate = ''",
    [new Date().toISOString()]
  );
  await database.runAsync(
    "UPDATE tasks SET status = CASE WHEN completed = 1 THEN 'completed' ELSE 'incomplete' END WHERE status IS NULL OR status = ''"
  );
}

export async function getTasks() {
  const database = await getDatabase();
  const rows = await database.getAllAsync<TaskRow>(
    "SELECT * FROM tasks ORDER BY datetime(createdDate) DESC"
  );

  return rows.map(mapRowToTask);
}

export async function insertTask(task: Task) {
  const database = await getDatabase();
  const createdDate = task.createdDate ?? new Date().toISOString();

  await database.runAsync(
    `INSERT OR REPLACE INTO tasks (
      id,
      title,
      description,
      category,
      completed,
      status,
      priority,
      dueDate,
      createdDate,
      notificationId,
      reminderTime
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.title,
      task.description,
      task.category,
      task.completed ? 1 : 0,
      task.completed ? "completed" : "incomplete",
      task.priority,
      task.dueDate,
      createdDate,
      task.notificationId ?? null,
      task.reminderTime ?? null,
    ]
  );
}

export async function updateTaskRecord(id: string, updatedFields: Partial<Task>) {
  const database = await getDatabase();

  const currentTask = await database.getFirstAsync<TaskRow>(
    "SELECT * FROM tasks WHERE id = ?",
    [id]
  );

  if (!currentTask) {
    return;
  }

  const mergedTask: Task = {
    ...mapRowToTask(currentTask),
    ...updatedFields,
  };

  await database.runAsync(
    `UPDATE tasks
      SET title = ?,
          description = ?,
          category = ?,
          completed = ?,
          status = ?,
          priority = ?,
          dueDate = ?,
          createdDate = ?,
          notificationId = ?,
          reminderTime = ?
      WHERE id = ?`,
    [
      mergedTask.title,
      mergedTask.description,
      mergedTask.category,
      mergedTask.completed ? 1 : 0,
      mergedTask.completed ? "completed" : "incomplete",
      mergedTask.priority,
      mergedTask.dueDate,
      mergedTask.createdDate,
      mergedTask.notificationId ?? null,
      mergedTask.reminderTime ?? null,
      id,
    ]
  );
}

export async function deleteTaskRecord(id: string) {
  const database = await getDatabase();

  await database.runAsync("DELETE FROM tasks WHERE id = ?", [id]);
}

export async function setTaskCompleted(id: string, completed: boolean) {
  const database = await getDatabase();

  await database.runAsync(
    "UPDATE tasks SET completed = ?, status = ? WHERE id = ?",
    [completed ? 1 : 0, completed ? "completed" : "incomplete", id]
  );
}

async function ensureColumn(
  database: SQLite.SQLiteDatabase,
  columnName: string,
  columnDefinition: string
) {
  const columns = await database.getAllAsync<TableColumn>("PRAGMA table_info(tasks)");
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    await database.execAsync(`ALTER TABLE tasks ADD COLUMN ${columnName} ${columnDefinition};`);
  }
}
