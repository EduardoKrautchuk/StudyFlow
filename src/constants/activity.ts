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

export const SUBJECT_COLORS: readonly string[] = [
  '#B45336',
  '#D97706',
  '#15803D',
  '#0F766E',
  '#2563EB',
  '#4F46E5',
  '#9333EA',
  '#DB2777',
  '#78716C',
];

export const SUBJECT_NAME_MAX_LENGTH = 60;

export const ACTIVITY_TITLE_MAX_LENGTH = 120;

export const ACTIVITY_DESCRIPTION_MAX_LENGTH = 1000;
