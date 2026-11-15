import type { StudyActivity } from '@/types/models';
import { compareByDueDate } from '@/utils/activity';
import { addDays, parseDateKey, toDateKey } from '@/utils/date';

const UPCOMING_LIMIT = 3;
const URGENT_WINDOW_DAYS = 2;
const PERIOD_DAYS = 7;

export type DashboardSummary = {
  periodTotal: number;
  periodCompleted: number;
  periodPending: number;
  periodProgress: number;
  urgentCount: number;
  pendingCount: number;
  upcoming: StudyActivity[];
};

function isInPeriod(activity: StudyActivity, todayKey: string, periodEndKey: string, recentLimit: Date): boolean {
  if (activity.dueDate > periodEndKey) {
    return false;
  }
  if (activity.status === 'pending' || activity.dueDate >= todayKey) {
    return true;
  }
  return activity.updatedAt !== null && activity.updatedAt >= recentLimit;
}

export function buildDashboardSummary(activities: StudyActivity[], todayKey: string): DashboardSummary {
  const today = parseDateKey(todayKey);
  const periodEndKey = toDateKey(addDays(today, PERIOD_DAYS - 1));
  const recentLimit = addDays(today, -PERIOD_DAYS);
  const urgentLimitKey = toDateKey(addDays(today, URGENT_WINDOW_DAYS));

  const period = activities.filter((activity) => isInPeriod(activity, todayKey, periodEndKey, recentLimit));
  const periodCompleted = period.filter((activity) => activity.status === 'completed').length;
  const pending = activities.filter((activity) => activity.status === 'pending').sort(compareByDueDate);

  return {
    periodTotal: period.length,
    periodCompleted,
    periodPending: period.length - periodCompleted,
    periodProgress: period.length === 0 ? 0 : Math.round((periodCompleted / period.length) * 100),
    urgentCount: pending.filter((activity) => activity.dueDate <= urgentLimitKey).length,
    pendingCount: pending.length,
    upcoming: pending.slice(0, UPCOMING_LIMIT),
  };
}
