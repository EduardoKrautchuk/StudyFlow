import type { StudyActivity } from '@/types/models';
import { compareByDueDate } from '@/utils/activity';
import { addDays, parseDateKey, startOfWeek, toDateKey } from '@/utils/date';

const UPCOMING_LIMIT = 3;
const URGENT_WINDOW_DAYS = 2;

export type DashboardSummary = {
  weekTotal: number;
  weekCompleted: number;
  weekPending: number;
  weekProgress: number;
  urgentCount: number;
  pendingCount: number;
  upcoming: StudyActivity[];
};

export function buildDashboardSummary(activities: StudyActivity[], todayKey: string): DashboardSummary {
  const today = parseDateKey(todayKey);
  const weekStart = startOfWeek(today);
  const weekStartKey = toDateKey(weekStart);
  const weekEndKey = toDateKey(addDays(weekStart, 6));
  const urgentLimitKey = toDateKey(addDays(today, URGENT_WINDOW_DAYS));

  const week = activities.filter((activity) => activity.dueDate >= weekStartKey && activity.dueDate <= weekEndKey);
  const weekCompleted = week.filter((activity) => activity.status === 'completed').length;
  const pending = activities.filter((activity) => activity.status === 'pending').sort(compareByDueDate);

  return {
    weekTotal: week.length,
    weekCompleted,
    weekPending: week.length - weekCompleted,
    weekProgress: week.length === 0 ? 0 : Math.round((weekCompleted / week.length) * 100),
    urgentCount: pending.filter((activity) => activity.dueDate <= urgentLimitKey).length,
    pendingCount: pending.length,
    upcoming: pending.slice(0, UPCOMING_LIMIT),
  };
}
