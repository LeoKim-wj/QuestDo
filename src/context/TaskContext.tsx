import React, { createContext, useContext, useEffect, useState } from "react";
import {
  deleteTaskRecord,
  getTasks,
  initializeDatabase,
  insertTask,
  setTaskCompleted,
  updateTaskRecord,
} from "../database/database";
import { Task } from "../types/task";

type TaskContextType = {
  tasks: Task[];
  categories: string[];
  addTask: (task: Task) => Promise<void>;
  addCategory: (category: string) => void;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (id: string, updatedFields: Partial<Task>) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
};

const TaskContext = createContext<TaskContextType | null>(null);
const defaultCategories = ["Study", "Work", "Personal"];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      try {
        await initializeDatabase();
        const storedTasks = await getTasks();

        if (!isMounted) {
          return;
        }

        setTasks(storedTasks);
        setCategories((prev) => mergeCategories(prev, storedTasks));
      } catch (error) {
        console.error("Failed to initialize task database", error);
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const addTask = async (task: Task) => {
    const taskWithCreatedDate = {
      ...task,
      createdDate: task.createdDate ?? new Date().toISOString(),
    };

    setTasks((prev) => [...prev, taskWithCreatedDate]);
    addCategory(taskWithCreatedDate.category);

    try {
      await initializeDatabase();
      await insertTask(taskWithCreatedDate);
    } catch (error) {
      console.error("Failed to save task", error);
    }
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

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      await initializeDatabase();
      await deleteTaskRecord(id);
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const updateTask = async (id: string, updatedFields: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updatedFields } : task
      )
    );

    if (updatedFields.category) {
      addCategory(updatedFields.category);
    }

    try {
      await initializeDatabase();
      await updateTaskRecord(id, updatedFields);
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const toggleTaskCompleted = async (id: string) => {
    const task = tasks.find((item) => item.id === id);
    const nextCompleted = !task?.completed;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: nextCompleted } : task
      )
    );

    try {
      await initializeDatabase();
      await setTaskCompleted(id, nextCompleted);
    } catch (error) {
      console.error("Failed to update task completion", error);
    }
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

function mergeCategories(currentCategories: string[], taskList: Task[]) {
  return taskList.reduce((categories, task) => {
    const cleanedCategory = task.category.trim();

    if (
      !cleanedCategory ||
      categories.some((item) => item.toLowerCase() === cleanedCategory.toLowerCase())
    ) {
      return categories;
    }

    return [...categories, cleanedCategory];
  }, currentCategories);
}
