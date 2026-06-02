import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  completeTaskAndCreateNextTask,
  deleteTaskRecord,
  getCosmeticState,
  getRedeemedRewardIds,
  getTasks,
  initializeFirebase,
  insertTask,
  saveCosmeticState,
  saveRedeemedRewardIds,
  setTaskCompleted,
  updateTaskRecord,
} from "../database/firebase";
import { bonusRewards } from "../rewards/bonusRewards";
import { cosmeticItems } from "../rewards/cosmeticItems";
import { CosmeticType, EquippedCosmetics } from "../types/cosmetics";
import { Task } from "../types/task";

// --- Safeguard types ---

export type TaskActionResult = {
  success: boolean;
  reason?: string;
};

type TaskAction = "complete" | "delete" | "edit";

// --- Validation utility ---

function validateTaskAction(task: Task | undefined, action: TaskAction): TaskActionResult {
  if (!task) {
    return { success: false, reason: "Task not found." };
  }

  if (!task.createdDate || isNaN(new Date(task.createdDate).getTime())) {
    return { success: false, reason: "Task has an invalid creation date." };
  }

  if (action === "complete") {
    if (task.completed) {
      return { success: false, reason: "Task is already completed." };
    }

    const createdAt = new Date(task.createdDate).getTime();
    const now = Date.now();
    const elapsedSeconds = (now - createdAt) / 1000;

    if (elapsedSeconds < 30) {
      return {
        success: false,
        reason: "This task was just created. Try again in 30 seconds.",
      };
    }
  }

  return { success: true };
}

// --- Context type ---

type TaskContextType = {
  tasks: Task[];
  categories: string[];
  totalPoints: number;
  redeemedRewardIds: string[];
  unlockedCosmeticIds: string[];
  equippedCosmetics: EquippedCosmetics;
  newlyUnlockedCosmeticId: string | null;
  addTask: (task: Task) => Promise<void>;
  addCategory: (category: string) => void;
  deleteTask: (id: string) => Promise<TaskActionResult>;
  redeemBonusReward: (rewardId: string) => Promise<void>;
  updateTask: (id: string, updatedFields: Partial<Task>) => Promise<TaskActionResult>;
  toggleTaskCompleted: (id: string) => Promise<TaskActionResult>;
  equipCosmetic: (type: CosmeticType, id: string | null) => Promise<void>;
  clearNewlyUnlocked: () => void;
};

const TaskContext = createContext<TaskContextType | null>(null);
const defaultCategories = ["Study", "Work", "Personal"];
const defaultEquipped: EquippedCosmetics = { accessory: null, furColor: null, background: null };

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [redeemedRewardIds, setRedeemedRewardIds] = useState<string[]>([]);
  const [unlockedCosmeticIds, setUnlockedCosmeticIds] = useState<string[]>([]);
  const [equippedCosmetics, setEquippedCosmetics] = useState<EquippedCosmetics>(defaultEquipped);
  const [newlyUnlockedCosmeticId, setNewlyUnlockedCosmeticId] = useState<string | null>(null);
  const generatedRecurringSourceIds = useRef(new Set<string>());
  const completionInProgressIds = useRef(new Set<string>());
  const initialCosmeticsLoaded = useRef(false);
  const equippedCosmeticsRef = useRef<EquippedCosmetics>(defaultEquipped);
  equippedCosmeticsRef.current = equippedCosmetics;

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
        const [storedTasks, storedRedeemedRewardIds, cosmeticState] = await Promise.all([
          getTasks(),
          getRedeemedRewardIds(),
          getCosmeticState(),
        ]);

        if (!isMounted) {
          return;
        }

        setTasks(storedTasks);
        setRedeemedRewardIds(storedRedeemedRewardIds);
        setUnlockedCosmeticIds(cosmeticState.unlockedCosmeticIds);
        setEquippedCosmetics(cosmeticState.equippedCosmetics);
        setCategories((prev) => mergeCategories(prev, storedTasks));
      } catch (error) {
        console.error("Failed to load tasks from Firebase", error);
      } finally {
        if (isMounted) {
          initialCosmeticsLoaded.current = true;
        }
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-unlock cosmetics when points reach thresholds
  useEffect(() => {
    if (!initialCosmeticsLoaded.current) return;

    const newlyUnlocked = cosmeticItems.filter(
      (item) => totalPoints >= item.pointsRequired && !unlockedCosmeticIds.includes(item.id)
    );

    if (newlyUnlocked.length === 0) return;

    const newIds = newlyUnlocked.map((item) => item.id);
    const nextIds = [...unlockedCosmeticIds, ...newIds];

    setUnlockedCosmeticIds(nextIds);
    setNewlyUnlockedCosmeticId(newIds[newIds.length - 1]);

    saveCosmeticState(nextIds, equippedCosmeticsRef.current).catch((err) =>
      console.error("Failed to save cosmetic state", err)
    );
  }, [totalPoints, unlockedCosmeticIds]);

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

  const deleteTask = async (id: string): Promise<TaskActionResult> => {
    const task = tasks.find((item) => item.id === id);
    const validation = validateTaskAction(task, "delete");

    if (!validation.success) {
      return validation;
    }

    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      await deleteTaskRecord(id);
    } catch (error) {
      console.error("Failed to delete task from Firebase", error);
    }

    return { success: true };
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

  const updateTask = async (id: string, updatedFields: Partial<Task>): Promise<TaskActionResult> => {
    const task = tasks.find((item) => item.id === id);
    const validation = validateTaskAction(task, "edit");

    if (!validation.success) {
      return validation;
    }

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

    return { success: true };
  };

  const toggleTaskCompleted = async (id: string): Promise<TaskActionResult> => {
    if (completionInProgressIds.current.has(id)) {
      return { success: false, reason: "Completion already in progress." };
    }

    const task = tasks.find((item) => item.id === id);
    const nextCompleted = !task?.completed;

    // Only validate when marking as complete (not when undoing)
    if (nextCompleted) {
      const validation = validateTaskAction(task, "complete");
      if (!validation.success) {
        return validation;
      }
    } else {
      // Still check task exists and has valid createdDate for undo
      if (!task) {
        return { success: false, reason: "Task not found." };
      }
    }

    completionInProgressIds.current.add(id);

    const shouldCreateRecurringTask =
      nextCompleted &&
      !task!.completed &&
      task!.recurrence &&
      !task!.generatedNextTaskId &&
      !hasGeneratedRecurringTask(
        tasks,
        task!,
        generatedRecurringSourceIds.current
      );
    const recurringTask = shouldCreateRecurringTask
      ? createNextRecurringTask(task!)
      : null;

    if (recurringTask) {
      generatedRecurringSourceIds.current.add(task!.id);
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

    return { success: true };
  };

  const equipCosmetic = async (type: CosmeticType, id: string | null) => {
    const next: EquippedCosmetics = { ...equippedCosmeticsRef.current, [type]: id };
    setEquippedCosmetics(next);

    try {
      await saveCosmeticState(unlockedCosmeticIds, next);
    } catch (error) {
      console.error("Failed to save equipped cosmetic", error);
    }
  };

  const clearNewlyUnlocked = () => setNewlyUnlockedCosmeticId(null);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        totalPoints,
        redeemedRewardIds,
        unlockedCosmeticIds,
        equippedCosmetics,
        newlyUnlockedCosmeticId,
        addTask,
        addCategory,
        deleteTask,
        redeemBonusReward,
        updateTask,
        toggleTaskCompleted,
        equipCosmetic,
        clearNewlyUnlocked,
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
    completedDate: null,
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