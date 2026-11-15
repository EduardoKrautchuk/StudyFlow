import { CalendarDays, Check, CircleAlert, Clock } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge, type BadgeTone } from '@/components/StatusBadge';
import { activityTypeLabels, priorityLabels } from '@/constants/activity';
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import type { ActivityPriority, StudyActivity, Subject } from '@/types/models';
import { getDueInfo, type DueTone } from '@/utils/activity';

type ActivityCardProps = {
  activity: StudyActivity;
  subject: Subject | undefined;
  todayKey: string;
  onToggleStatus: (activity: StudyActivity) => void;
  disabled?: boolean;
};

const priorityTones: Record<ActivityPriority, BadgeTone> = {
  high: 'error',
  medium: 'warning',
  low: 'neutral',
};

const dueIcons: Record<DueTone, typeof Clock> = {
  overdue: CircleAlert,
  soon: Clock,
  normal: CalendarDays,
};

export function ActivityCard({ activity, subject, todayKey, onToggleStatus, disabled = false }: ActivityCardProps) {
  const completed = activity.status === 'completed';
  const due = getDueInfo(activity, todayKey);
  const DueIcon = dueIcons[due.tone];
  const dueColor = due.tone === 'normal' || completed ? colors.textSecondary : colors.error;

  return (
    <View style={[styles.card, due.tone === 'overdue' && styles.cardOverdue]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed, disabled }}
        accessibilityLabel={completed ? 'Marcar como pendente' : 'Marcar como concluída'}
        hitSlop={10}
        disabled={disabled}
        onPress={() => onToggleStatus(activity)}
        style={[styles.checkbox, completed && styles.checkboxChecked]}>
        {completed ? <Check size={14} color={colors.onPrimary} strokeWidth={3} /> : null}
      </Pressable>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <Text style={[styles.title, completed && styles.titleCompleted]}>{activity.title}</Text>
            <StatusBadge label={activityTypeLabels[activity.type]} tone="neutral" bordered={false} />
          </View>
          <StatusBadge label={priorityLabels[activity.priority]} tone={priorityTones[activity.priority]} />
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <View style={[styles.dot, { backgroundColor: subject?.color ?? colors.textSecondary }]} />
            <Text style={styles.metaText} numberOfLines={1}>
              {subject?.name ?? 'Sem matéria'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <DueIcon size={13} color={dueColor} strokeWidth={2} />
            <Text style={[styles.metaText, { color: dueColor }, due.tone !== 'normal' && styles.metaStrong]}>
              {due.label}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadow,
  },
  cardOverdue: {
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 1,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyMd,
    fontFamily: typography.labelSm.fontFamily,
    fontSize: 15,
    color: colors.text,
  },
  titleCompleted: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.md,
    rowGap: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  metaText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  metaStrong: {
    fontFamily: typography.labelSm.fontFamily,
  },
});
