import type { StudyActivity, Subject } from '@/types/models';
import { parseDateKey } from '@/utils/date';

const MINUTES_BEFORE_DEADLINE = [60, 5];
const ALL_DAY_REMINDER_HOUR = 8;
export const MAX_SCHEDULED_REMINDERS = 50;

export type ReminderPlan = {
  id: string;
  activityId: string;
  date: Date;
  title: string;
  body: string;
};

function hashText(text: string): string {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33 + text.charCodeAt(index)) % 2147483647;
  }
  return hash.toString(36);
}

function withId(plan: Omit<ReminderPlan, 'id'>, slot: string): ReminderPlan {
  return {
    ...plan,
    id: `activity-${plan.activityId}-${slot}-${plan.date.getTime()}-${hashText(plan.title + plan.body)}`,
  };
}

function formatLeadTime(minutes: number): string {
  return minutes >= 60 ? `${minutes / 60} hora${minutes >= 120 ? 's' : ''}` : `${minutes} minutos`;
}

function planActivityReminders(activity: StudyActivity, subjectName: string): ReminderPlan[] {
  const dueDate = parseDateKey(activity.dueDate);

  if (!activity.dueTime) {
    dueDate.setHours(ALL_DAY_REMINDER_HOUR, 0, 0, 0);
    return [
      withId(
        {
          activityId: activity.id,
          date: dueDate,
          title: `Entrega hoje: ${activity.title}`,
          body: `${subjectName} • prazo até o fim do dia`,
        },
        'day',
      ),
    ];
  }

  const [hours, minutes] = activity.dueTime.split(':').map(Number);
  return MINUTES_BEFORE_DEADLINE.map((leadMinutes) => {
    const date = new Date(dueDate);
    date.setHours(hours, minutes - leadMinutes, 0, 0);
    return withId(
      {
        activityId: activity.id,
        date,
        title: `Entrega em ${formatLeadTime(leadMinutes)}: ${activity.title}`,
        body: `${subjectName} • prazo às ${activity.dueTime}`,
      },
      String(leadMinutes),
    );
  });
}

export function planReminders(activities: StudyActivity[], subjects: Subject[]): ReminderPlan[] {
  const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]));

  return activities
    .filter((activity) => activity.status === 'pending')
    .flatMap((activity) => planActivityReminders(activity, subjectNames.get(activity.subjectId) ?? 'Sem matéria'))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
