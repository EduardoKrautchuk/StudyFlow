import { BookOpen, CircleCheck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import type { Subject } from '@/types/models';
import { pluralize } from '@/utils/activity';
import { withAlpha } from '@/utils/color';

type SubjectCardProps = {
  subject: Subject;
  pendingCount: number;
};

export function SubjectCard({ subject, pendingCount }: SubjectCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: withAlpha(subject.color, 0.12) }]}>
          <BookOpen size={18} color={subject.color} strokeWidth={1.75} />
        </View>
        <View style={[styles.dot, { backgroundColor: subject.color }]} />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {subject.name}
      </Text>
      {pendingCount > 0 ? (
        <Text style={styles.pending}>{pluralize(pendingCount, 'tarefa pendente', 'tarefas pendentes')}</Text>
      ) : (
        <View style={styles.upToDate}>
          <CircleCheck size={14} color={colors.success} strokeWidth={2} />
          <Text style={styles.upToDateText}>Em dia</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadow,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  name: {
    ...typography.headlineSm,
    fontSize: 15,
    color: colors.text,
  },
  pending: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  upToDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  upToDateText: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.success,
  },
});
