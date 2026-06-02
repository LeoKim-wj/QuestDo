export type TaskPriority = "high" | "medium" | "low";
export type RecurrenceFrequency = "none" | "daily" | "weekly" | "monthly";

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string;
  createdDate: string;
  reminderTime: string;
  estimatedMinutes: number;
  notificationId?: string | null;

  recurrence?: Exclude<RecurrenceFrequency, "none">;
  generatedFromTaskId?: string | null;
  generatedNextTaskId?: string | null;
  subtasks?: Subtask[];
};
