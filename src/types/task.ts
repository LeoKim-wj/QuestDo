export type TaskPriority = "high" | "medium" | "low";

export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string;
  notificationId?: string | null;
};
