import {
  AlarmClock,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Clock,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge, type BadgeTone } from '@/components/StatusBadge';
import { activityTypeLabels, priorityLabels } from '@/constants/activity';
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import type { ActivityPriority, ActivityType, StudyActivity, Subject } from '@/types/models';
import { isOverdue } from '@/utils/activity';
import { diffInDays, formatShortDate } from '@/utils/date';

type AgendaItemProps = {
  activity: StudyActivity;
  subject: Subject | undefined;
  todayKey: string;
  onPress: (activity: StudyActivity) => void;
};

const priorityTones: Record<ActivityPriority, BadgeTone> = {
  high: 'error',
  medium: 'warning',
  low: 'neutral',
};

const priorityColors: Record<ActivityPriority, string> = {
  high: colors.error,
  medium: colors.warning,
  low: colors.border,
};

const typeIcons: Record<ActivityType, LucideIcon> = {
  exam: GraduationCap,
  assignment: ClipboardList,
  task: CircleCheck,
};

function getDeadline(activity: StudyActivity, todayKey: string): { label: string; icon: LucideIcon; color: string } {
  if (activity.status === 'completed') {
    return { label: 'Concluída', icon: CircleCheck, color: colors.success };
  }
  if (isOverdue(activity, todayKey)) {
    return { label: `Atrasada desde ${formatShortDate(activity.dueDate)}`, icon: CircleAlert, color: colors.error };
  }
  const days = diffInDays(todayKey, activity.dueDate);
  const soonColor = activity.priority === 'low' ? colors.primary : priorityColors[activity.priority];
  const color = days <= 1 ? soonColor : colors.textSecondary;
  if (!activity.dueTime) {
    return { label: 'Prazo: até o fim do dia', icon: Clock, color };
  }
  if (days === 0) {
    return { label: `Prazo: Hoje, ${activity.dueTime}`, icon: AlarmClock, color };
  }
  if (days === 1) {
    return { label: `Prazo: Amanhã, ${activity.dueTime}`, icon: AlarmClock, color };
  }
  return { label: `Prazo: ${activity.dueTime}`, icon: Clock, color };
}

export function AgendaItem({ activity, subject, todayKey, onPress }: AgendaItemProps) {
  const completed = activity.status === 'completed';
  const overdue = isOverdue(activity, todayKey);
  const deadline = getDeadline(activity, todayKey);
  const DeadlineIcon = deadline.icon;
  const TypeIcon = typeIcons[activity.type];
  const accent = completed ? colors.success : overdue ? colors.error : priorityColors[activity.priority];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes da atividade ${activity.title}`}
      onPress={() => onPress(activity)}
      style={({ pressed }) => [
        styles.card,
        { borderLeftColor: accent },
        completed && styles.completed,
        pressed && styles.pressed,
      ]}>
      <View style={styles.topRow}>
        <View style={styles.deadline}>
          <DeadlineIcon size={15} color={deadline.color} strokeWidth={2} />
          <Text style={[styles.deadlineText, { color: deadline.color }]} numberOfLines={1}>
            {deadline.label}
          </Text>
        </View>
        <StatusBadge label={`Prioridade ${priorityLabels[activity.priority]}`} tone={priorityTones[activity.priority]} />
      </View>

      <Text style={[styles.title, completed && styles.titleCompleted]}>{activity.title}</Text>

      <View style={styles.tags}>
        <View style={styles.subjectTag}>
          <View style={[styles.dot, { backgroundColor: subject?.color ?? colors.textSecondary }]} />
          <Text style={styles.subjectText} numberOfLines={1}>
            {subject?.name ?? 'Sem matéria'}
          </Text>
        </View>
        <View style={styles.type}>
          <TypeIcon size={14} color={colors.textSecondary} strokeWidth={1.75} />
          <Text style={styles.typeText}>{activityTypeLabels[activity.type]}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    paddingLeft: spacing.lg + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    ...shadow,
  },
  completed: {
    opacity: 0.7,
  },
  pressed: {
    backgroundColor: colors.muted,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  deadline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineText: {
    ...typography.labelMd,
    fontFamily: typography.labelSm.fontFamily,
    fontSize: 14,
    flexShrink: 1,
  },
  title: {
    ...typography.headlineSm,
    fontSize: 17,
    color: colors.text,
  },
  titleCompleted: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
  },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '70%',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    backgroundColor: colors.muted,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  subjectText: {
    ...typography.labelMd,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  type: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeText: {
    ...typography.labelMd,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.textSecondary,
  },
});
