import { router } from 'expo-router';
import { CalendarCheck, CalendarDays, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActivityDetails } from '@/components/ActivityDetails';
import { AgendaItem } from '@/components/AgendaItem';
import { AppButton } from '@/components/AppButton';
import { AppHeader } from '@/components/AppHeader';
import { Calendar } from '@/components/Calendar';
import { EmptyState } from '@/components/EmptyState';
import { FormAlert } from '@/components/FormAlert';
import { LoadingState } from '@/components/LoadingState';
import { PickerModal } from '@/components/PickerModal';
import { StatusBadge } from '@/components/StatusBadge';
import { ACTIVITY_TYPES } from '@/constants/activity';
import { WeekStrip } from '@/components/WeekStrip';
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import { useAccountMenu } from '@/hooks/use-account-menu';
import { useStudyData } from '@/hooks/use-study-data';
import type { ActivityType, StudyActivity } from '@/types/models';
import { compareByDueDate, groupByDueDate, isOverdue, joinWithAnd, pluralize } from '@/utils/activity';
import { addDays, formatDayHeading, formatMonthShort, formatShortDate, getWeekDays, parseDateKey, toDateKey } from '@/utils/date';

const WINDOW_DAYS = 7;

const typePlurals: Record<ActivityType, [string, string]> = {
  exam: ['prova', 'provas'],
  assignment: ['trabalho', 'trabalhos'],
  task: ['tarefa', 'tarefas'],
};

function getDayIndicator(activities: StudyActivity[], todayKey: string): string {
  if (activities.some((activity) => isOverdue(activity, todayKey))) {
    return colors.error;
  }
  if (activities.some((activity) => activity.status === 'pending')) {
    return colors.primary;
  }
  return colors.success;
}

export default function AgendaScreen() {
  const { subjects, activities, loading, error } = useStudyData();
  const { initials, openAccountMenu, accountError } = useAccountMenu();
  const todayKey = toDateKey(new Date());
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const selectedDate = parseDateKey(selectedKey);
  const weekDays = getWeekDays(selectedDate);
  const windowEndKey = toDateKey(addDays(selectedDate, WINDOW_DAYS - 1));
  const subjectsById = new Map(subjects.map((subject) => [subject.id, subject]));
  const viewing = activities.find((activity) => activity.id === viewingId) ?? null;

  const indicators = new Map(
    groupByDueDate(activities).map(([dateKey, items]) => [dateKey, getDayIndicator(items, todayKey)] as const),
  );
  const overdue = selectedKey === todayKey ? activities.filter((activity) => isOverdue(activity, todayKey)).sort(compareByDueDate) : [];
  const groups = groupByDueDate(
    activities.filter((activity) => activity.dueDate >= selectedKey && activity.dueDate <= windowEndKey),
  );

  const nextWeekEndKey = toDateKey(addDays(parseDateKey(todayKey), WINDOW_DAYS - 1));
  const upcoming = activities.filter(
    (activity) => activity.status === 'pending' && activity.dueDate >= todayKey && activity.dueDate <= nextWeekEndKey,
  );
  const overdueTotal = activities.filter((activity) => isOverdue(activity, todayKey)).length;
  const typeSummary = joinWithAnd(
    ACTIVITY_TYPES.map((type) => [type, upcoming.filter((activity) => activity.type === type).length] as const)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => pluralize(count, typePlurals[type][0], typePlurals[type][1])),
  );

  function selectDate(dateKey: string) {
    setSelectedKey(dateKey);
    setCalendarOpen(false);
  }

  return (
    <View style={styles.root}>
      <AppHeader initials={initials} onAvatarPress={openAccountMenu} />
      {loading ? (
        <LoadingState message="Carregando agenda..." />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleRow}>
            <View style={styles.titleTexts}>
              <Text style={styles.title}>Agenda</Text>
              <Text style={styles.subtitle}>Seus próximos compromissos</Text>
            </View>
            <View style={styles.monthPill}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Semana anterior"
                hitSlop={6}
                onPress={() => setSelectedKey(toDateKey(addDays(selectedDate, -7)))}
                style={styles.monthArrow}>
                <ChevronLeft size={16} color={colors.textSecondary} strokeWidth={2} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Abrir calendário" onPress={() => setCalendarOpen(true)}>
                {({ pressed }) => (
                  <Text style={[styles.monthText, pressed && styles.pressedText]}>{formatMonthShort(selectedDate)}</Text>
                )}
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Próxima semana"
                hitSlop={6}
                onPress={() => setSelectedKey(toDateKey(addDays(selectedDate, 7)))}
                style={styles.monthArrow}>
                <ChevronRight size={16} color={colors.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>
          </View>

          {error ? <FormAlert title="Não foi possível carregar seus dados" message={error} /> : null}
          {accountError ? <FormAlert title="Não foi possível sair" message={accountError} /> : null}

          <WeekStrip
            days={weekDays}
            selectedKey={selectedKey}
            todayKey={todayKey}
            indicators={indicators}
            onSelect={setSelectedKey}
          />

          <View style={styles.summary}>
            <View style={styles.summaryIcon}>
              <CalendarCheck size={20} color={colors.primary} strokeWidth={1.75} />
            </View>
            <View style={styles.summaryTexts}>
              <Text style={styles.summaryTitle}>
                {pluralize(upcoming.length, 'entrega', 'entregas')} nos próximos 7 dias
              </Text>
              <Text style={styles.summaryText}>
                {upcoming.length === 0 ? 'Nenhuma pendência no período' : `${typeSummary} pendentes`}
              </Text>
            </View>
            <StatusBadge
              label={overdueTotal > 0 ? pluralize(overdueTotal, 'ATRASADA', 'ATRASADAS') : 'EM DIA'}
              tone={overdueTotal > 0 ? 'error' : 'success'}
            />
          </View>

          {selectedKey !== todayKey ? (
            <Pressable accessibilityRole="button" onPress={() => setSelectedKey(todayKey)} style={styles.backToday}>
              {({ pressed }) => (
                <Text style={[styles.backTodayText, pressed && styles.pressedText]}>Voltar para hoje</Text>
              )}
            </Pressable>
          ) : null}

          {overdue.length > 0 ? (
            <View style={styles.group}>
              <View style={styles.groupHeader}>
                <View style={[styles.groupDot, { backgroundColor: colors.error }]} />
                <Text style={[styles.groupTitle, { color: colors.error }]}>Atrasadas</Text>
              </View>
              {overdue.map((activity) => (
                <AgendaItem
                  key={activity.id}
                  activity={activity}
                  subject={subjectsById.get(activity.subjectId)}
                  todayKey={todayKey}
                  onPress={(activity) => setViewingId(activity.id)}
                />
              ))}
            </View>
          ) : null}

          {groups.map(([dateKey, items]) => {
            const indicator = getDayIndicator(items, todayKey);
            const isToday = dateKey === todayKey;
            return (
              <View key={dateKey} style={styles.group}>
                <View style={styles.groupHeader}>
                  <View style={[styles.groupDot, { backgroundColor: indicator }]} />
                  <Text style={[styles.groupTitle, isToday && { color: colors.primary }]}>
                    {formatDayHeading(dateKey, todayKey)}
                  </Text>
                </View>
                {items.map((activity) => (
                  <AgendaItem
                    key={activity.id}
                    activity={activity}
                    subject={subjectsById.get(activity.subjectId)}
                    todayKey={todayKey}
                    onPress={(activity) => setViewingId(activity.id)}
                  />
                ))}
              </View>
            );
          })}

          {activities.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="Nenhuma atividade cadastrada"
              message="Suas provas, trabalhos e tarefas aparecem aqui organizadas por data."
              action={
                subjects.length > 0 ? (
                  <AppButton title="Nova atividade" onPress={() => router.push('/activity-form')} />
                ) : undefined
              }
            />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title={groups.length === 0 ? 'Nenhuma entrega neste período' : 'Não há mais atividades no período'}
              message={`Exibindo de ${formatShortDate(selectedKey)} até ${formatShortDate(windowEndKey)}.`}
            />
          )}
        </ScrollView>
      )}

      <ActivityDetails
        activity={viewing}
        subject={viewing ? subjectsById.get(viewing.subjectId) : undefined}
        todayKey={todayKey}
        onClose={() => setViewingId(null)}
      />

      <PickerModal visible={calendarOpen} title="Ir para data" onClose={() => setCalendarOpen(false)}>
        <Calendar key={selectedKey} value={selectedKey} onChange={selectDate} />
        <AppButton title="Hoje" size="sm" variant="outline" onPress={() => selectDate(todayKey)} />
      </PickerModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleTexts: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.headlineLg,
    fontSize: 28,
    lineHeight: 36,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyMd,
    fontSize: 15,
    color: colors.textSecondary,
  },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  monthArrow: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    ...typography.labelMd,
    fontSize: 14,
    color: colors.text,
  },
  pressedText: {
    opacity: 0.6,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadow,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTexts: {
    flex: 1,
    gap: 2,
  },
  summaryTitle: {
    ...typography.labelMd,
    fontSize: 15,
    color: colors.text,
  },
  summaryText: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.textSecondary,
  },
  backToday: {
    alignSelf: 'flex-start',
  },
  backTodayText: {
    ...typography.labelMd,
    fontSize: 14,
    color: colors.primary,
  },
  group: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  groupTitle: {
    flex: 1,
    ...typography.labelMd,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
