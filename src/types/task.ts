export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  category?: string;
  completed: boolean;
};
