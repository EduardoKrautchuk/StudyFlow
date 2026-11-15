import type { StudyActivity } from '@/types/models';
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

export function countPendingBySubject(activities: StudyActivity[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const activity of activities) {
    if (activity.status === 'pending') {
      counts.set(activity.subjectId, (counts.get(activity.subjectId) ?? 0) + 1);
    }
  }
  return counts;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
