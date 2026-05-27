import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  completeTaskAndCreateNextTask,
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
  const generatedRecurringSourceIds = useRef(new Set<string>());
  const completionInProgressIds = useRef(new Set<string>());
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
      subtasks: task.subtasks ?? [],
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
    if (completionInProgressIds.current.has(id)) {
      return;
    }

    const task = tasks.find((item) => item.id === id);
    if (!task) {
      return;
    }

    completionInProgressIds.current.add(id);
    const nextCompleted = !task.completed;
    const shouldCreateRecurringTask =
      nextCompleted &&
      !task.completed &&
      task.recurrence &&
      !task.generatedNextTaskId &&
      !hasGeneratedRecurringTask(
        tasks,
        task,
        generatedRecurringSourceIds.current
      );
    const recurringTask = shouldCreateRecurringTask
      ? createNextRecurringTask(task)
      : null;

    if (recurringTask) {
      generatedRecurringSourceIds.current.add(task.id);
    }

    setTasks((prev) =>
      recurringTask
        ? [
            ...prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    completed: nextCompleted,
                    generatedNextTaskId: recurringTask.id,
                  }
                : item
            ),
            recurringTask,
          ]
        : prev.map((item) =>
            item.id === id ? { ...item, completed: nextCompleted } : item
          )
    );

    try {
      if (recurringTask) {
        await completeTaskAndCreateNextTask(id, recurringTask);
      } else {
        await setTaskCompleted(id, nextCompleted);
      }
    } catch (error) {
      console.error("Failed to update recurring task completion in Firebase", error);
    } finally {
      completionInProgressIds.current.delete(id);
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

function createNextRecurringTask(task: Task): Task {
  const createdDate = new Date().toISOString();

  return {
    ...task,
    id: `recurring-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    completed: false,
    dueDate: getNextDueDate(task.dueDate, task.recurrence),
    createdDate,
    notificationId: null,
    generatedFromTaskId: task.id,
    generatedNextTaskId: null,
    subtasks: (task.subtasks ?? []).map((subtask, index) => ({
      ...subtask,
      id: `${createdDate}-${index}`,
      completed: false,
    })),
  };
}

function getNextDueDate(dueDate: string, recurrence: Task["recurrence"]) {
  const nextDate = new Date(dueDate);

  if (Number.isNaN(nextDate.getTime())) {
    return new Date().toISOString();
  }

  if (recurrence === "daily") {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  if (recurrence === "weekly") {
    nextDate.setDate(nextDate.getDate() + 7);
  }

  if (recurrence === "monthly") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate.toISOString();
}

function hasGeneratedRecurringTask(
  taskList: Task[],
  task: Task,
  generatedSourceIds: Set<string>
) {
  if (generatedSourceIds.has(task.id)) {
    return true;
  }

  if (task.generatedNextTaskId) {
    return true;
  }

  const nextDueDate = getNextDueDate(task.dueDate, task.recurrence);

  return taskList.some(
    (item) =>
      item.id !== task.id &&
      (item.generatedFromTaskId === task.id ||
        (item.title === task.title &&
          item.category === task.category &&
          item.recurrence === task.recurrence &&
          item.dueDate === nextDueDate))
  );
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
