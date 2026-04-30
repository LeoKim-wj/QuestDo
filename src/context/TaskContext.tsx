import { createContext, useState, useEffect, useRef } from "react";
import { Task } from "../types/task";
import {
  requestNotificationPermissions,
  scheduleTaskReminder,
  cancelTaskReminder,
} from "../services/NotificationService";

type TaskContextType = {
  tasks: Task[];
  addTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
};

export const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const notificationIds = useRef<Record<string, string>>({});

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const addTask = async (task: Task) => {
    setTasks((prev) => [...prev, task]);
    const notifId = await scheduleTaskReminder(task);
    notificationIds.current[task.id] = notifId;
  };

  const completeTask = async (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true } : t))
    );
    const notifId = notificationIds.current[id];
    if (notifId) {
      await cancelTaskReminder(notifId);
      delete notificationIds.current[id];
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const notifId = notificationIds.current[id];
    if (notifId) {
      await cancelTaskReminder(notifId);
      delete notificationIds.current[id];
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, deleteTask, completeTask }}>
      {children}
    </TaskContext.Provider>
  );
}