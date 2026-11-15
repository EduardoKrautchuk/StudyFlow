import { Platform } from 'react-native';

import type { ReminderPlan } from '@/utils/reminders';

type NotificationsModule = typeof import('expo-notifications');

const CHANNEL_ID = 'deadline-reminders';

let modulePromise: Promise<NotificationsModule> | null = null;

function loadNotifications(): Promise<NotificationsModule> {
  if (!modulePromise) {
    modulePromise = import('expo-notifications')
      .then((Notifications) => {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });
        return Notifications;
      })
      .catch((error: unknown) => {
        modulePromise = null;
        throw error;
      });
  }
  return modulePromise;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Lembretes de entregas',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  if (!current.canAskAgain) {
    return false;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function replaceReminders(plans: ReminderPlan[]): Promise<void> {
  const Notifications = await loadNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Promise.all(
    plans.map((plan) =>
      Notifications.scheduleNotificationAsync({
        identifier: plan.id,
        content: {
          title: plan.title,
          body: plan.body,
          data: { activityId: plan.activityId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: plan.date,
          channelId: CHANNEL_ID,
        },
      }),
    ),
  );
}

export async function clearReminders(): Promise<void> {
  const Notifications = await loadNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function onReminderOpened(callback: () => void): () => void {
  let subscription: { remove: () => void } | null = null;
  let cancelled = false;
  loadNotifications()
    .then((Notifications) => {
      if (!cancelled) {
        subscription = Notifications.addNotificationResponseReceivedListener(() => callback());
      }
    })
    .catch(() => undefined);
  return () => {
    cancelled = true;
    subscription?.remove();
  };
}
