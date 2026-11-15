import { Platform } from 'react-native';

import type { ReminderSyncResult } from '@/services/notifications.types';
import { MAX_SCHEDULED_REMINDERS, type ReminderPlan } from '@/utils/reminders';

type NotificationsModule = typeof import('expo-notifications');

const CHANNEL_ID = 'deadline-reminders';

function debugStep(step: string) {
  if (__DEV__) {
    console.log('[lembretes]', step);
  }
}

let modulePromise: Promise<NotificationsModule> | null = null;
let channelReady = false;

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
  debugStep('carregando módulo');
  const Notifications = await loadNotifications();
  debugStep('módulo carregado');
  if (Platform.OS === 'android' && !channelReady) {
    try {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Lembretes de entregas',
        description: 'Avisos antes do prazo das atividades',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
        lightColor: '#B45336',
        enableLights: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        showBadge: true,
        bypassDnd: false,
      });
      channelReady = true;
      debugStep('canal criado');
    } catch (error) {
      debugStep(`canal indisponível, usando canal padrão: ${String(error)}`);
    }
  }
  const current = await Notifications.getPermissionsAsync();
  debugStep(`permissão atual: ${current.status}`);
  if (current.granted) {
    return true;
  }
  if (!current.canAskAgain) {
    return false;
  }
  debugStep('pedindo permissão');
  const requested = await Notifications.requestPermissionsAsync();
  debugStep(`resposta: ${requested.status}`);
  return requested.granted;
}

export async function syncReminders(plans: ReminderPlan[], now: Date): Promise<ReminderSyncResult> {
  const Notifications = await loadNotifications();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const desiredIds = new Set(plans.map((plan) => plan.id));
  const obsolete = scheduled.filter((request) => !desiredIds.has(request.identifier));
  await Promise.all(obsolete.map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)));

  const keptIds = new Set(
    scheduled.filter((request) => desiredIds.has(request.identifier)).map((request) => request.identifier),
  );
  const missing = plans
    .filter((plan) => !keptIds.has(plan.id) && plan.date.getTime() > now.getTime())
    .slice(0, Math.max(MAX_SCHEDULED_REMINDERS - keptIds.size, 0));

  await Promise.all(
    missing.map((plan) =>
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
          channelId: channelReady ? CHANNEL_ID : undefined,
        },
      }),
    ),
  );

  const missingIds = new Set(missing.map((plan) => plan.id));
  const pending = plans.filter((plan) => keptIds.has(plan.id) || missingIds.has(plan.id));
  return {
    cancelled: obsolete.length,
    added: missing.length,
    pending: pending.length,
    next: pending.find((plan) => plan.date.getTime() > now.getTime()) ?? null,
  };
}

export async function presentReminderNow(plan: ReminderPlan): Promise<boolean> {
  const Notifications = await loadNotifications();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  if (!scheduled.some((request) => request.identifier === plan.id)) {
    return false;
  }
  await Notifications.cancelScheduledNotificationAsync(plan.id);
  await Notifications.scheduleNotificationAsync({
    identifier: `${plan.id}-now`,
    content: {
      title: plan.title,
      body: plan.body,
      data: { activityId: plan.activityId },
    },
    trigger: channelReady ? { channelId: CHANNEL_ID } : null,
  });
  return true;
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
