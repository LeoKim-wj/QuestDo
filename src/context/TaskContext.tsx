import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
  updateTask: (id: string, updatedFields: Partial<Task>) => void;
  toggleTaskCompleted: (id: string) => void;
};

const TaskContext = createContext<TaskContextType | null>(null);

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

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    const notifId = notificationIds.current[id];
    if (notifId) {
      await cancelTaskReminder(notifId);
      delete notificationIds.current[id];
    }
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updatedFields } : task
      )
    );
  };

  const toggleTaskCompleted = async (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      // task is being marked complete, cancel notification
      const notifId = notificationIds.current[id];
      if (notifId) {
        await cancelTaskReminder(notifId);
        delete notificationIds.current[id];
      }
    } else if (task && task.completed) {
      // task is being unmarked, reschedule notification
      const notifId = await scheduleTaskReminder(task);
      notificationIds.current[id] = notifId;
    }
  };

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, deleteTask, updateTask, toggleTaskCompleted }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used inside TaskProvider");
  }
  return context;
}