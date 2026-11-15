import type { ReminderPlan } from '@/utils/reminders';

export type ReminderSyncResult = {
  cancelled: number;
  added: number;
  pending: number;
  next: ReminderPlan | null;
};
