import { router } from 'expo-router';
import { BookOpen, CalendarDays, CircleCheck, Plus, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActivityCard } from '@/components/ActivityCard';
import { AppButton } from '@/components/AppButton';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { FormAlert } from '@/components/FormAlert';
import { LoadingState } from '@/components/LoadingState';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionHeader } from '@/components/SectionHeader';
import { SubjectCard } from '@/components/SubjectCard';
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import { useAccountMenu } from '@/hooks/use-account-menu';
import { useAuth } from '@/hooks/use-auth';
import { useStudyData } from '@/hooks/use-study-data';
import { setActivityStatus } from '@/services/activities';
import { getDataErrorMessage } from '@/services/firestore-helpers';
import type { StudyActivity, Subject } from '@/types/models';
import { getStatsFor, getSubjectStats, pluralize } from '@/utils/activity';
import { withAlpha } from '@/utils/color';
import { buildDashboardSummary } from '@/utils/dashboard';
import { formatLongDate, getGreeting, toDateKey } from '@/utils/date';
import { getFirstName } from '@/utils/user';

const SUBJECT_PREVIEW_LIMIT = 4;

function chunkPairs(items: Subject[]): Subject[][] {
  const rows: Subject[][] = [];
  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }
  return rows;
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const { subjects, activities, loading, error } = useStudyData();
  const { initials, openAccountMenu, accountError } = useAccountMenu();
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const now = new Date();
  const todayKey = toDateKey(now);
  const firstName = getFirstName(profile?.name ?? '');

  const summary = buildDashboardSummary(activities, todayKey);
  const subjectsById = new Map(subjects.map((subject) => [subject.id, subject]));
  const subjectStats = getSubjectStats(activities, todayKey);
  const bannerError = actionError ?? accountError;
  const subjectRows = chunkPairs(subjects.slice(0, SUBJECT_PREVIEW_LIMIT));

  async function handleToggleStatus(activity: StudyActivity) {
    if (!profile) {
      return;
    }
    setActionError(null);
    setUpdatingId(activity.id);
    try {
      await setActivityStatus(profile.uid, activity.id, activity.status === 'completed' ? 'pending' : 'completed');
    } catch (toggleError) {
      setActionError(getDataErrorMessage(toggleError));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <View style={styles.root}>
      <AppHeader initials={initials} onAvatarPress={openAccountMenu} />

      {loading ? (
        <LoadingState message="Carregando seus estudos..." />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>
              {getGreeting(now)}, {firstName || 'estudante'}
            </Text>
            <Text style={styles.title}>Seu dia de estudos</Text>
            <View style={styles.dateRow}>
              <CalendarDays size={15} color={colors.primary} strokeWidth={2} />
              <Text style={styles.dateText}>{formatLongDate(now)}</Text>
            </View>
          </View>

          {error ? <FormAlert title="Não foi possível carregar seus dados" message={error} /> : null}
          {bannerError ? <FormAlert title="Algo deu errado" message={bannerError} /> : null}

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressTexts}>
                <Text style={styles.cardTitle}>Progresso dos próximos 7 dias</Text>
                <Text style={styles.cardSubtitle}>
                  {summary.periodTotal === 0
                    ? 'Nenhuma entrega atrasada ou nos próximos 7 dias'
                    : `${summary.periodCompleted} de ${summary.periodTotal} atividades concluídas`}
                </Text>
              </View>
              <View style={styles.percentBadge}>
                <TrendingUp size={14} color={colors.primary} strokeWidth={2} />
                <Text style={styles.percentText}>{summary.periodProgress}%</Text>
              </View>
            </View>

            <ProgressBar progress={summary.periodProgress} />

            <View style={styles.stats}>
              <View style={[styles.stat, styles.statNeutral]}>
                <View style={[styles.statDot, { backgroundColor: colors.textSecondary }]} />
                <View style={styles.statTexts}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Restantes</Text>
                  <Text style={styles.statValue}>{pluralize(summary.periodPending, 'pendente', 'pendentes')}</Text>
                </View>
              </View>
              <View style={[styles.stat, styles.statWarning]}>
                <View style={[styles.statDot, { backgroundColor: colors.warning }]} />
                <View style={styles.statTexts}>
                  <Text style={[styles.statLabel, { color: colors.warning }]}>Urgência</Text>
                  <Text style={styles.statValue}>
                    {pluralize(summary.urgentCount, 'próxima entrega', 'próximas entregas')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Próximas atividades"
              count={summary.pendingCount}
              actionLabel="Ver todas"
              showActionChevron
              onAction={() => router.push('/activities')}
            />
            {summary.upcoming.length === 0 ? (
              <EmptyState
                icon={CircleCheck}
                title="Nenhuma atividade pendente"
                message="Quando você cadastrar atividades, as próximas entregas aparecem aqui."
              />
            ) : (
              <View style={styles.list}>
                {summary.upcoming.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    subject={subjectsById.get(activity.subjectId)}
                    todayKey={todayKey}
                    onToggleStatus={handleToggleStatus}
                    disabled={updatingId === activity.id}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Suas matérias"
              count={subjects.length}
              actionLabel="Gerenciar"
              onAction={() => router.push('/subjects')}
            />
            {subjects.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Nenhuma matéria cadastrada"
                message="Cadastre suas matérias para organizar as atividades por disciplina."
              />
            ) : (
              <View style={styles.grid}>
                {subjectRows.map((row) => (
                  <View key={row.map((subject) => subject.id).join('-')} style={styles.gridRow}>
                    {row.map((subject) => (
                      <SubjectCard
                        key={subject.id}
                        subject={subject}
                        pendingCount={getStatsFor(subjectStats, subject.id).pending}
                      />
                    ))}
                    {row.length === 1 ? <View style={styles.gridSpacer} /> : null}
                  </View>
                ))}
              </View>
            )}
          </View>

          <AppButton title="Nova atividade" icon={Plus} iconPosition="start" onPress={() => router.push('/activity-form')} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xxl,
  },
  greeting: {
    gap: 2,
  },
  greetingText: {
    ...typography.labelMd,
    fontFamily: typography.labelSm.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },
  title: {
    ...typography.headlineLg,
    fontSize: 26,
    lineHeight: 34,
    color: colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dateText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  progressCard: {
    padding: spacing.xl,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.lg,
    ...shadow,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  progressTexts: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    ...typography.headlineSm,
    fontSize: 17,
    color: colors.text,
  },
  cardSubtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  percentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryBackground,
  },
  percentText: {
    ...typography.labelMd,
    color: colors.primary,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  statNeutral: {
    backgroundColor: colors.muted,
    borderColor: colors.border,
  },
  statWarning: {
    backgroundColor: colors.warningBackground,
    borderColor: withAlpha(colors.warning, 0.2),
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  statTexts: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    ...typography.labelSm,
    fontFamily: typography.labelMd.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    ...typography.bodyMd,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.text,
  },
  section: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  grid: {
    gap: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gridSpacer: {
    flex: 1,
  },
});
