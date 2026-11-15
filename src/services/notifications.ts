import type { ReminderSyncResult } from '@/services/notifications.types';
import type { ReminderPlan } from '@/utils/reminders';

export async function ensureNotificationPermission(): Promise<boolean> {
  return false;
}

export async function syncReminders(_plans: ReminderPlan[], _now: Date): Promise<ReminderSyncResult> {
  return { cancelled: 0, added: 0, pending: 0, next: null };
}

export async function presentReminderNow(_plan: ReminderPlan): Promise<boolean> {
  return false;
}

export async function clearReminders(): Promise<void> {}

export function onReminderOpened(_callback: () => void): () => void {
  return () => undefined;
}
