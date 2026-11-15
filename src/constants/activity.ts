import type { ActivityPriority, ActivityStatus, ActivityType } from '@/types/models';

export const ACTIVITY_TYPES: readonly ActivityType[] = ['exam', 'assignment', 'task'];

export const ACTIVITY_PRIORITIES: readonly ActivityPriority[] = ['low', 'medium', 'high'];

export const ACTIVITY_STATUSES: readonly ActivityStatus[] = ['pending', 'completed'];

export const activityTypeLabels: Record<ActivityType, string> = {
  exam: 'Prova',
  assignment: 'Trabalho',
  task: 'Tarefa',
};

export const priorityLabels: Record<ActivityPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};
