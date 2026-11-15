import { BookOpen, CircleAlert, CircleCheck, Clock, EllipsisVertical, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import type { Subject } from '@/types/models';
import { pluralize, type SubjectStats } from '@/utils/activity';
import { withAlpha } from '@/utils/color';

type SubjectListItemProps = {
  subject: Subject;
  stats: SubjectStats;
  onOpenMenu: () => void;
};

type Pill = {
  label: string;
  icon: LucideIcon;
  color: string;
  background: string;
};

function getPill(stats: SubjectStats): Pill {
  if (stats.total === 0) {
    return { label: 'Nenhuma atividade', icon: Clock, color: colors.textSecondary, background: colors.muted };
  }
  if (stats.overdue > 0) {
    return {
      label: pluralize(stats.overdue, 'atividade atrasada', 'atividades atrasadas'),
      icon: CircleAlert,
      color: colors.error,
      background: colors.errorBackground,
    };
  }
  if (stats.pending > 0) {
    return {
      label: pluralize(stats.pending, 'atividade pendente', 'atividades pendentes'),
      icon: Clock,
      color: colors.warning,
      background: colors.warningBackground,
    };
  }
  return { label: 'Tudo em dia • 0 pendentes', icon: CircleCheck, color: colors.success, background: colors.successBackground };
}

export function SubjectListItem({ subject, stats, onOpenMenu }: SubjectListItemProps) {
  const pill = getPill(stats);
  const PillIcon = pill.icon;
  const done = stats.total > 0 && stats.completed === stats.total;
  const accent = done ? colors.success : colors.primary;

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={[styles.icon, { backgroundColor: withAlpha(subject.color, 0.12) }]}>
            <BookOpen size={20} color={subject.color} strokeWidth={1.75} />
          </View>
          <View style={styles.texts}>
            <Text style={styles.name} numberOfLines={2}>
              {subject.name}
            </Text>
            <Text style={styles.caption}>{pluralize(stats.total, 'atividade', 'atividades')} no total</Text>
          </View>
        </View>

        <View style={[styles.pill, { backgroundColor: pill.background, borderColor: withAlpha(pill.color, 0.2) }]}>
          <PillIcon size={13} color={pill.color} strokeWidth={2} />
          <Text style={[styles.pillText, { color: pill.color }]}>{pill.label}</Text>
        </View>

        <View style={styles.progress}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {stats.total === 0 ? 'Sem entregas cadastradas' : `${stats.completed} de ${stats.total} entregues`}
            </Text>
            {stats.total > 0 ? <Text style={[styles.percent, { color: accent }]}>{stats.progress}%</Text> : null}
          </View>
          <ProgressBar progress={stats.progress} color={accent} />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Opções da matéria ${subject.name}`}
        hitSlop={8}
        onPress={onOpenMenu}
        style={({ pressed }) => [styles.menu, pressed && styles.menuPressed]}>
        <EllipsisVertical size={20} color={colors.textSecondary} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadow,
  },
  body: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md + 2,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.xxl,
  },
  name: {
    ...typography.headlineSm,
    fontSize: 17,
    color: colors.text,
  },
  caption: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  menu: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuPressed: {
    backgroundColor: colors.border,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  pillText: {
    ...typography.labelMd,
    fontFamily: typography.labelSm.fontFamily,
  },
  progress: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  percent: {
    ...typography.labelMd,
  },
});
