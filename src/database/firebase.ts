import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { EquippedCosmetics } from "../types/cosmetics";
import { RecurrenceFrequency, Subtask, Task, TaskPriority } from "../types/task";

type SubtaskDocument = {
  id: string;
  title: string;
  completed: boolean;
};

type TaskDocument = {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  completed?: boolean;
  status?: string;
  priority?: string;
  dueDate?: string;
  createdDate?: string;
  reminderTime?: string;
  estimatedMinutes?: number;
  notificationId?: string | null;
  recurrence?: string | null;
  generatedFromTaskId?: string | null;
  generatedNextTaskId?: string | null;
  subtasks?: SubtaskDocument[];
};

type RewardStateDocument = {
  redeemedRewardIds?: string[];
};

type CosmeticStateDocument = {
  unlockedCosmeticIds?: string[];
  equippedCosmetics?: {
    accessory?: string | null;
    furColor?: string | null;
    background?: string | null;
  };
  // Legacy field — migrated to equippedCosmetics.accessory on read
  equippedCosmeticId?: string | null;
};

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let database: Firestore | null = null;
let hasWarnedAboutConfig = false;

function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

function getTaskDatabase() {
  if (!hasFirebaseConfig()) {
    if (!hasWarnedAboutConfig) {
      console.warn(
        "Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* values to enable Firestore persistence."
      );
      hasWarnedAboutConfig = true;
    }

    return null;
  }

  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }

  if (!database) {
    database = getFirestore(app);
  }

  return database;
}

function getTasksCollection(firestore: Firestore) {
  return collection(firestore, "tasks");
}

function getRewardStateDocument(firestore: Firestore) {
  return doc(firestore, "rewardState", "currentUser");
}

function getCosmeticStateDocument(firestore: Firestore) {
  return doc(firestore, "cosmeticState", "currentUser");
}

function normalizePriority(priority?: string): TaskPriority {
  if (priority === "high" || priority === "low" || priority === "medium") {
    return priority;
  }

  return "medium";
}

function normalizeRecurrence(recurrence?: string | null): Exclude<RecurrenceFrequency, "none"> | undefined {
  if (recurrence === "daily" || recurrence === "weekly" || recurrence === "monthly") {
    return recurrence;
  }

  return undefined;
}

function normalizeSubtasks(subtasks?: SubtaskDocument[]): Subtask[] {
  if (!Array.isArray(subtasks)) {
    return [];
  }

  return subtasks
    .filter((subtask) => subtask && typeof subtask.title === "string")
    .map((subtask, index) => ({
      id: subtask.id || `subtask-${index}`,
      title: subtask.title,
      completed: Boolean(subtask.completed),
    }));
}

function mapDocumentToTask(id: string, data: TaskDocument): Task {
  return {
    id: data.id ?? id,
    title: data.title ?? "",
    description: data.description ?? "",
    category: data.category ?? "Study",
    completed: Boolean(data.completed),
    priority: normalizePriority(data.priority),
    dueDate: data.dueDate ?? new Date().toISOString(),
    createdDate: data.createdDate ?? new Date().toISOString(),
    reminderTime: data.reminderTime ?? "",
    estimatedMinutes:
      typeof data.estimatedMinutes === "number" ? data.estimatedMinutes : 0,
    notificationId: data.notificationId ?? null,
    recurrence: normalizeRecurrence(data.recurrence),
    generatedFromTaskId: data.generatedFromTaskId ?? null,
    generatedNextTaskId: data.generatedNextTaskId ?? null,
    subtasks: normalizeSubtasks(data.subtasks),
  };
}

function taskToDocument(task: Task): Required<TaskDocument> {
  const createdDate = task.createdDate ?? new Date().toISOString();

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    completed: task.completed,
    status: task.completed ? "completed" : "incomplete",
    priority: task.priority,
    dueDate: task.dueDate,
    createdDate,
    reminderTime: task.reminderTime ?? "",
    estimatedMinutes:
      typeof task.estimatedMinutes === "number" ? task.estimatedMinutes : 0,
    notificationId: task.notificationId ?? null,
    recurrence: task.recurrence ?? null,
    generatedFromTaskId: task.generatedFromTaskId ?? null,
    generatedNextTaskId: task.generatedNextTaskId ?? null,
    subtasks: normalizeSubtasks(task.subtasks),
  };
}

export function getFirebaseApp(): FirebaseApp {
  if (!hasFirebaseConfig()) {
    throw new Error('Firebase is not configured. Check your .env file.');
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export async function initializeFirebase() {
  getTaskDatabase();
}

export async function getTasks() {
  const firestore = getTaskDatabase();

  if (!firestore) {
    return [];
  }

  const tasksQuery = query(getTasksCollection(firestore), orderBy("createdDate", "desc"));
  const snapshot = await getDocs(tasksQuery);

  return snapshot.docs.map((taskDoc) =>
    mapDocumentToTask(taskDoc.id, taskDoc.data() as TaskDocument)
  );
}

export async function insertTask(task: Task) {
  const firestore = getTaskDatabase();

  if (!firestore) {
    return;
  }

  await setDoc(doc(firestore, "tasks", task.id), taskToDocument(task));
}

export async function completeTaskAndCreateNextTask(id: string, nextTask: Task) {
  const firestore = getTaskDatabase();

  if (!firestore) {
    return;
  }

  const batch = writeBatch(firestore);

  batch.update(doc(firestore, "tasks", id), {
    completed: true,
    status: "completed",
    generatedNextTaskId: nextTask.id,
  });
  batch.set(doc(firestore, "tasks", nextTask.id), taskToDocument(nextTask));

  await batch.commit();
}

export async function updateTaskRecord(id: string, updatedFields: Partial<Task>) {
  const firestore = getTaskDatabase();

  if (!firestore) {
    return;
  }

  const updatePayload = {
    ...updatedFields,
    ...("recurrence" in updatedFields
      ? { recurrence: updatedFields.recurrence ?? null }
      : {}),
    ...(typeof updatedFields.completed === "boolean"
      ? { status: updatedFields.completed ? "completed" : "incomplete" }
      : {}),
  };

  await updateDoc(doc(firestore, "tasks", id), updatePayload);
}

export async function deleteTaskRecord(id: string) {
  const firestore = getTaskDatabase();

  if (!firestore) {
    return;
  }

  await deleteDoc(doc(firestore, "tasks", id));
}

export async function setTaskCompleted(id: string, completed: boolean) {
  const firestore = getTaskDatabase();

  if (!firestore) {
    return;
  }

  await updateDoc(doc(firestore, "tasks", id), {
    completed,
    status: completed ? "completed" : "incomplete",
  });
}

export async function getRedeemedRewardIds() {
  const firestore = getTaskDatabase();

  if (!firestore) {
    return [];
  }

  const snapshot = await getDoc(getRewardStateDocument(firestore));

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.data() as RewardStateDocument;

  return Array.isArray(data.redeemedRewardIds) ? data.redeemedRewardIds : [];
}

export async function saveRedeemedRewardIds(redeemedRewardIds: string[]) {
  const firestore = getTaskDatabase();

  if (!firestore) {
    return;
  }

  await setDoc(
    getRewardStateDocument(firestore),
    { redeemedRewardIds },
    { merge: true }
  );
}

export async function getCosmeticState(): Promise<{ unlockedCosmeticIds: string[]; equippedCosmetics: EquippedCosmetics }> {
  const firestore = getTaskDatabase();

  const defaultState = { unlockedCosmeticIds: [], equippedCosmetics: { accessory: null, furColor: null, background: null } };

  if (!firestore) {
    return defaultState;
  }

  const snapshot = await getDoc(getCosmeticStateDocument(firestore));

  if (!snapshot.exists()) {
    return defaultState;
  }

  const data = snapshot.data() as CosmeticStateDocument;
  const legacyAccessory = data.equippedCosmeticId ?? null;

  const equippedCosmetics: EquippedCosmetics = {
    accessory: data.equippedCosmetics?.accessory ?? legacyAccessory,
    furColor: data.equippedCosmetics?.furColor ?? null,
    background: data.equippedCosmetics?.background ?? null,
  };

  return {
    unlockedCosmeticIds: Array.isArray(data.unlockedCosmeticIds) ? data.unlockedCosmeticIds : [],
    equippedCosmetics,
  };
}

export async function saveCosmeticState(unlockedCosmeticIds: string[], equippedCosmetics: EquippedCosmetics) {
  const firestore = getTaskDatabase();

  if (!firestore) {
    return;
  }

  await setDoc(
    getCosmeticStateDocument(firestore),
    { unlockedCosmeticIds, equippedCosmetics },
    { merge: true }
  );
}
