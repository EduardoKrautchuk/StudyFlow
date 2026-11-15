import { CalendarDays, Check, CircleAlert, Clock, EllipsisVertical } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge, type BadgeTone } from '@/components/StatusBadge';
import { activityTypeLabels, priorityLabels } from '@/constants/activity';
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import type { ActivityPriority, StudyActivity, Subject } from '@/types/models';
import { getDueInfo, type DueTone } from '@/utils/activity';
import { withAlpha } from '@/utils/color';

type ActivityCardProps = {
  activity: StudyActivity;
  subject: Subject | undefined;
  todayKey: string;
  onToggleStatus: (activity: StudyActivity) => void;
  onOpenMenu?: (activity: StudyActivity) => void;
  disabled?: boolean;
  variant?: 'compact' | 'detailed';
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

export function ActivityCard({
  activity,
  subject,
  todayKey,
  onToggleStatus,
  onOpenMenu,
  disabled = false,
  variant = 'compact',
}: ActivityCardProps) {
  const completed = activity.status === 'completed';
  const due = getDueInfo(activity, todayKey);
  const DueIcon = dueIcons[due.tone];
  const dueColor = due.tone === 'normal' || completed ? colors.textSecondary : colors.error;
  const subjectColor = subject?.color ?? colors.textSecondary;
  const subjectName = subject?.name ?? 'Sem matéria';
  const detailed = variant === 'detailed';

  const dueLabel = (
    <View style={styles.metaItem}>
      <DueIcon size={13} color={dueColor} strokeWidth={2} />
      <Text style={[styles.metaText, { color: dueColor }, due.tone !== 'normal' && !completed && styles.metaStrong]}>
        {due.label}
      </Text>
    </View>
  );

  return (
    <View style={[styles.card, due.tone === 'overdue' && styles.cardOverdue, completed && detailed && styles.cardCompleted]}>
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
            {detailed ? null : (
              <StatusBadge label={activityTypeLabels[activity.type]} tone="neutral" bordered={false} />
            )}
          </View>
          <StatusBadge label={priorityLabels[activity.priority]} tone={priorityTones[activity.priority]} />
          {onOpenMenu ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Opções da atividade ${activity.title}`}
              hitSlop={8}
              onPress={() => onOpenMenu(activity)}
              style={({ pressed }) => [styles.menu, pressed && styles.menuPressed]}>
              <EllipsisVertical size={18} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>

        {detailed && activity.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {activity.description}
          </Text>
        ) : null}

        {detailed ? (
          <View style={styles.meta}>
            <View style={styles.tags}>
              <View style={[styles.tag, { backgroundColor: withAlpha(subjectColor, 0.12) }]}>
                <Text style={[styles.tagText, { color: subjectColor }]} numberOfLines={1}>
                  {subjectName}
                </Text>
              </View>
              <View style={[styles.tag, styles.typeTag]}>
                <Text style={styles.typeTagText}>{activityTypeLabels[activity.type]}</Text>
              </View>
            </View>
            {dueLabel}
          </View>
        ) : (
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <View style={[styles.dot, { backgroundColor: subjectColor }]} />
              <Text style={styles.metaText} numberOfLines={1}>
                {subjectName}
              </Text>
            </View>
            {dueLabel}
          </View>
        )}
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
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  cardCompleted: {
    opacity: 0.75,
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
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  menu: {
    width: 28,
    height: 28,
    marginTop: -spacing.xs,
    marginRight: -spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuPressed: {
    backgroundColor: colors.muted,
  },
  description: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: spacing.md,
    rowGap: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flexShrink: 1,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 180,
  },
  tagText: {
    ...typography.labelSm,
    fontSize: 12,
  },
  typeTag: {
    backgroundColor: colors.muted,
  },
  typeTagText: {
    ...typography.labelSm,
    fontSize: 12,
    color: colors.textSecondary,
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
