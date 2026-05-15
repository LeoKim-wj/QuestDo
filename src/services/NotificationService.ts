import { Platform } from "react-native";
import type * as ExpoNotifications from "expo-notifications";
import { Task } from "../types/task";

const TASK_NOTIFICATION_CHANNEL_ID = "questdo_tasks";

type NotificationsModule = typeof ExpoNotifications;

let notificationsModule: NotificationsModule | null | undefined;
let notificationHandlerReady = false;

async function getNotifications() {
  if (Platform.OS === "web") {
    return null;
  }

  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  try {
    notificationsModule = await import("expo-notifications");
  } catch {
    notificationsModule = null;
  }

  if (notificationsModule && !notificationHandlerReady) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    notificationHandlerReady = true;
  }

  return notificationsModule;
}

function getReminderDate(dueDate: string, reminderTime: string) {
  const due = new Date(dueDate);

  if (Number.isNaN(due.getTime())) {
    return null;
  }

  let reminderDate: Date;

  if (reminderTime.startsWith("offset:")) {
    const offsetMinutes = Number(reminderTime.slice(7));
    reminderDate = new Date(due.getTime() - offsetMinutes * 60 * 1000);
  } else {
    const [hours, minutes] = reminderTime.split(":").map(Number);
    reminderDate = new Date(due);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(hours, minutes, 0, 0);
  }

  if (reminderDate.getTime() <= Date.now()) {
    return null;
  }

  return reminderDate;
}

async function ensureNotificationChannel(notifications: NotificationsModule) {
  if (Platform.OS !== "android") {
    return;
  }

  await notifications.setNotificationChannelAsync(TASK_NOTIFICATION_CHANNEL_ID, {
    name: "QuestDo Tasks",
    importance: notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#8a008a",
  });
}

export async function scheduleTaskNotification(task: Task) {
  const notifications = await getNotifications();
  const notificationDate = getReminderDate(task.dueDate, task.reminderTime ?? "09:00");

  if (!notifications || !notificationDate) {
    return null;
  }

  const permissions = await notifications.getPermissionsAsync();
  const finalPermissions =
    permissions.status === "granted"
      ? permissions
      : await notifications.requestPermissionsAsync();

  if (finalPermissions.status !== "granted") {
    return null;
  }

  await ensureNotificationChannel(notifications);

  return notifications.scheduleNotificationAsync({
    content: {
      title: `QuestDo: ${task.title}`,
      body: `${task.category} task is due on ${new Date(task.dueDate).toLocaleDateString()}.`,
      data: { taskId: task.id },
      sound: true,
    },
    trigger: {
      type: notifications.SchedulableTriggerInputTypes.DATE,
      date: notificationDate,
      channelId: TASK_NOTIFICATION_CHANNEL_ID,
    },
  });
}

export async function cancelTaskNotification(notificationId?: string | null) {
  const notifications = await getNotifications();

  if (!notifications || !notificationId) {
    return;
  }

  await notifications.cancelScheduledNotificationAsync(notificationId);
}
