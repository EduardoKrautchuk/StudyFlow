import type { StudyActivity, Subject } from '@/types/models';
import { parseDateKey } from '@/utils/date';

const MINUTES_BEFORE_DEADLINE = [60, 5];
const ALL_DAY_REMINDER_HOUR = 8;
const MAX_SCHEDULED_REMINDERS = 50;

export type ReminderPlan = {
  id: string;
  activityId: string;
  date: Date;
  title: string;
  body: string;
};

function formatLeadTime(minutes: number): string {
  return minutes >= 60 ? `${minutes / 60} hora${minutes >= 120 ? 's' : ''}` : `${minutes} minutos`;
}

function planActivityReminders(activity: StudyActivity, subjectName: string): ReminderPlan[] {
  const dueDate = parseDateKey(activity.dueDate);

  if (!activity.dueTime) {
    dueDate.setHours(ALL_DAY_REMINDER_HOUR, 0, 0, 0);
    return [
      {
        id: `activity-${activity.id}-day`,
        activityId: activity.id,
        date: dueDate,
        title: `Entrega hoje: ${activity.title}`,
        body: `${subjectName} • prazo até o fim do dia`,
      },
    ];
  }

  const [hours, minutes] = activity.dueTime.split(':').map(Number);
  return MINUTES_BEFORE_DEADLINE.map((leadMinutes) => {
    const date = new Date(dueDate);
    date.setHours(hours, minutes - leadMinutes, 0, 0);
    return {
      id: `activity-${activity.id}-${leadMinutes}`,
      activityId: activity.id,
      date,
      title: `Entrega em ${formatLeadTime(leadMinutes)}: ${activity.title}`,
      body: `${subjectName} • prazo às ${activity.dueTime}`,
    };
  });
}

export function planReminders(activities: StudyActivity[], subjects: Subject[], now: Date): ReminderPlan[] {
  const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]));

  return activities
    .filter((activity) => activity.status === 'pending')
    .flatMap((activity) => planActivityReminders(activity, subjectNames.get(activity.subjectId) ?? 'Sem matéria'))
    .filter((plan) => plan.date.getTime() > now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_SCHEDULED_REMINDERS);
}
