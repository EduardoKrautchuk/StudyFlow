import { BookOpen, CalendarDays, CircleCheck, ClipboardList, Clock, Flag, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { PickerModal } from '@/components/PickerModal';
import { StatusBadge } from '@/components/StatusBadge';
import { activityTypeLabels, priorityLabels } from '@/constants/activity';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { StudyActivity, Subject } from '@/types/models';
import { isOverdue } from '@/utils/activity';
import { formatDateLabel } from '@/utils/date';

type ActivityDetailsProps = {
  activity: StudyActivity | null;
  subject: Subject | undefined;
  todayKey: string;
  onClose: () => void;
};

type DetailRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  dotColor?: string;
};

function DetailRow({ icon: Icon, label, value, dotColor }: DetailRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Icon size={16} color={colors.primary} strokeWidth={1.75} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValue}>
        {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
        <Text style={styles.rowValueText} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function ActivityDetails({ activity, subject, todayKey, onClose }: ActivityDetailsProps) {
  const completed = activity?.status === 'completed';
  const overdue = activity ? isOverdue(activity, todayKey) : false;

  return (
    <PickerModal visible={activity !== null} title="Detalhes da atividade" onClose={onClose}>
      {activity ? (
        <>
          <View style={styles.header}>
            <Text style={[styles.title, completed && styles.titleCompleted]}>{activity.title}</Text>
            <StatusBadge
              label={completed ? 'Concluída' : overdue ? 'Atrasada' : 'Pendente'}
              tone={completed ? 'success' : overdue ? 'error' : 'warning'}
            />
          </View>

          <View style={styles.rows}>
            <DetailRow
              icon={BookOpen}
              label="Matéria"
              value={subject?.name ?? 'Sem matéria'}
              dotColor={subject?.color ?? colors.textSecondary}
            />
            <DetailRow icon={ClipboardList} label="Tipo" value={activityTypeLabels[activity.type]} />
            <DetailRow icon={Flag} label="Prioridade" value={priorityLabels[activity.priority]} />
            <DetailRow icon={CalendarDays} label="Entrega" value={formatDateLabel(activity.dueDate)} />
            <DetailRow icon={Clock} label="Horário" value={activity.dueTime ?? 'Sem horário definido'} />
            <DetailRow icon={CircleCheck} label="Status" value={completed ? 'Concluída' : 'Pendente'} />
          </View>

          <View style={styles.description}>
            <Text style={styles.descriptionLabel}>Descrição</Text>
            <Text style={[styles.descriptionText, !activity.description && styles.descriptionEmpty]}>
              {activity.description || 'Nenhuma descrição informada.'}
            </Text>
          </View>

          <AppButton title="Fechar" variant="outline" size="sm" onPress={onClose} />
        </>
      ) : null}
    </PickerModal>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineMd,
    color: colors.text,
  },
  titleCompleted: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  rows: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    width: 80,
  },
  rowValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  rowValueText: {
    ...typography.bodyMd,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.text,
    textAlign: 'right',
    flexShrink: 1,
  },
  description: {
    gap: spacing.xs,
  },
  descriptionLabel: {
    ...typography.labelMd,
    color: colors.textSecondary,
  },
  descriptionText: {
    ...typography.bodyMd,
    lineHeight: 21,
    color: colors.text,
  },
  descriptionEmpty: {
    color: colors.textSecondary,
  },
});
