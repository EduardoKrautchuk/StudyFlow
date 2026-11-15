import type { StudyActivity, Subject } from '@/types/models';
import { diffInDays, formatShortDate } from '@/utils/date';

export type DueTone = 'overdue' | 'soon' | 'normal';

export type DueInfo = {
  label: string;
  tone: DueTone;
};

export function isOverdue(activity: StudyActivity, todayKey: string): boolean {
  return activity.status === 'pending' && activity.dueDate < todayKey;
}

export function getDueInfo(activity: StudyActivity, todayKey: string): DueInfo {
  const days = diffInDays(todayKey, activity.dueDate);
  const time = activity.dueTime;
  if (isOverdue(activity, todayKey)) {
    return { label: `Atrasada • ${formatShortDate(activity.dueDate)}`, tone: 'overdue' };
  }
  if (days === 0) {
    return { label: time ? `Hoje, às ${time}` : 'Hoje', tone: 'soon' };
  }
  if (days === 1) {
    return { label: time ? `Amanhã, às ${time}` : 'Amanhã', tone: 'soon' };
  }
  const date = formatShortDate(activity.dueDate);
  return { label: time ? `${date} • ${time}` : date, tone: 'normal' };
}

export function compareByDueDate(a: StudyActivity, b: StudyActivity): number {
  if (a.dueDate !== b.dueDate) {
    return a.dueDate < b.dueDate ? -1 : 1;
  }
  const timeA = a.dueTime ?? '24:00';
  const timeB = b.dueTime ?? '24:00';
  if (timeA !== timeB) {
    return timeA < timeB ? -1 : 1;
  }
  return a.title.localeCompare(b.title);
}

export type SubjectStats = {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  progress: number;
};

const emptyStats: SubjectStats = { total: 0, completed: 0, pending: 0, overdue: 0, progress: 0 };

export function getSubjectStats(activities: StudyActivity[], todayKey: string): Map<string, SubjectStats> {
  const stats = new Map<string, SubjectStats>();
  for (const activity of activities) {
    const current = stats.get(activity.subjectId) ?? { ...emptyStats };
    current.total += 1;
    if (activity.status === 'completed') {
      current.completed += 1;
    } else {
      current.pending += 1;
      if (activity.dueDate < todayKey) {
        current.overdue += 1;
      }
    }
    current.progress = Math.round((current.completed / current.total) * 100);
    stats.set(activity.subjectId, current);
  }
  return stats;
}

export function getStatsFor(stats: Map<string, SubjectStats>, subjectId: string): SubjectStats {
  return stats.get(subjectId) ?? emptyStats;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export type StatusFilter = 'all' | 'pending' | 'completed';

export type ActivityFilters = {
  query: string;
  status: StatusFilter;
  subjectId: string | null;
  ascending: boolean;
};

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterActivities(
  activities: StudyActivity[],
  subjectsById: Map<string, Subject>,
  filters: ActivityFilters,
): StudyActivity[] {
  const query = normalizeText(filters.query);
  const filtered = activities.filter((activity) => {
    if (filters.status !== 'all' && activity.status !== filters.status) {
      return false;
    }
    if (filters.subjectId && activity.subjectId !== filters.subjectId) {
      return false;
    }
    if (!query) {
      return true;
    }
    const subjectName = subjectsById.get(activity.subjectId)?.name ?? '';
    return normalizeText(activity.title).includes(query) || normalizeText(subjectName).includes(query);
  });
  const sorted = [...filtered].sort(compareByDueDate);
  return filters.ascending ? sorted : sorted.reverse();
}
