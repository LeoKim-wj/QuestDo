import React, { createContext, useContext, useState } from "react";
import { Task } from "../types/task";

type TaskContextType = {
  tasks: Task[];
  categories: string[];
  addTask: (task: Task) => void;
  addCategory: (category: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updatedFields: Partial<Task>) => void;
  toggleTaskCompleted: (id: string) => void;
};

const TaskContext = createContext<TaskContextType | null>(null);
const defaultCategories = ["Study", "Work", "Personal"];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);

  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
    addCategory(task.category);
  };

  const addCategory = (category: string) => {
    const cleanedCategory = category.trim();

    if (!cleanedCategory) {
      return;
    }

    setCategories((prev) =>
      prev.some((item) => item.toLowerCase() === cleanedCategory.toLowerCase())
        ? prev
        : [...prev, cleanedCategory]
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updatedFields } : task
      )
    );
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        addTask,
        addCategory,
        deleteTask,
        updateTask,
        toggleTaskCompleted,
      }}
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
