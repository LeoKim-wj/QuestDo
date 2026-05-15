import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Task, TaskPriority } from "../types/task";

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
  notificationId?: string | null;
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

function normalizePriority(priority?: string): TaskPriority {
  if (priority === "high" || priority === "low" || priority === "medium") {
    return priority;
  }

  return "medium";
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
    notificationId: data.notificationId ?? null,
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
    notificationId: task.notificationId ?? null,
  };
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

export async function updateTaskRecord(id: string, updatedFields: Partial<Task>) {
  const firestore = getTaskDatabase();

  if (!firestore) {
    return;
  }

  const updatePayload = {
    ...updatedFields,
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
