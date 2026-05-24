import React, { createContext, useContext, useEffect, useState } from "react";
import {
  deleteTaskRecord,
  getRedeemedRewardIds,
  getTasks,
  initializeFirebase,
  insertTask,
  saveRedeemedRewardIds,
  setTaskCompleted,
  updateTaskRecord,
} from "../database/firebase";
import { bonusRewards } from "../rewards/bonusRewards";
import { Task } from "../types/task";

type TaskContextType = {
  tasks: Task[];
  categories: string[];
  totalPoints: number;
  redeemedRewardIds: string[];
  addTask: (task: Task) => Promise<void>;
  addCategory: (category: string) => void;
  deleteTask: (id: string) => Promise<void>;
  redeemBonusReward: (rewardId: string) => Promise<void>;
  updateTask: (id: string, updatedFields: Partial<Task>) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
};

const TaskContext = createContext<TaskContextType | null>(null);
const defaultCategories = ["Study", "Work", "Personal"];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [redeemedRewardIds, setRedeemedRewardIds] = useState<string[]>([]);
  const completedTaskCount = tasks.filter((task) => task.completed).length;
  const taskPoints = completedTaskCount * 5;
  const bonusPoints = bonusRewards
    .filter((reward) => redeemedRewardIds.includes(reward.id))
    .reduce((total, reward) => total + reward.points, 0);
  const totalPoints = taskPoints + bonusPoints;

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      try {
        await initializeFirebase();
        const [storedTasks, storedRedeemedRewardIds] = await Promise.all([
          getTasks(),
          getRedeemedRewardIds(),
        ]);

        if (!isMounted) {
          return;
        }

        setTasks(storedTasks);
        setRedeemedRewardIds(storedRedeemedRewardIds);
        setCategories((prev) => mergeCategories(prev, storedTasks));
      } catch (error) {
        console.error("Failed to load tasks from Firebase", error);
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
      await insertTask(taskWithCreatedDate);
    } catch (error) {
      console.error("Failed to save task to Firebase", error);
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
      await deleteTaskRecord(id);
    } catch (error) {
      console.error("Failed to delete task from Firebase", error);
    }
  };

  const redeemBonusReward = async (rewardId: string) => {
    const reward = bonusRewards.find((item) => item.id === rewardId);

    if (!reward || completedTaskCount < reward.milestone) {
      return;
    }

    if (redeemedRewardIds.includes(rewardId)) {
      return;
    }

    const nextRedeemedRewardIds = [...redeemedRewardIds, rewardId];
    setRedeemedRewardIds(nextRedeemedRewardIds);

    try {
      await saveRedeemedRewardIds(nextRedeemedRewardIds);
    } catch (error) {
      console.error("Failed to save redeemed bonus reward", error);
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
      await updateTaskRecord(id, updatedFields);
    } catch (error) {
      console.error("Failed to update task in Firebase", error);
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
      await setTaskCompleted(id, nextCompleted);
    } catch (error) {
      console.error("Failed to update task completion in Firebase", error);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        totalPoints,
        redeemedRewardIds,
        addTask,
        addCategory,
        deleteTask,
        redeemBonusReward,
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
