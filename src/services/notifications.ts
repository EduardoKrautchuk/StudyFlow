import type { ReminderPlan } from '@/utils/reminders';

export async function ensureNotificationPermission(): Promise<boolean> {
  return false;
}

export async function replaceReminders(_plans: ReminderPlan[]): Promise<void> {}

export async function clearReminders(): Promise<void> {}

export function onReminderOpened(_callback: () => void): () => void {
  return () => undefined;
}
