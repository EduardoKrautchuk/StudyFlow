import { router } from 'expo-router';
import {
  ArrowDownUp,
  BookOpen,
  CircleAlert,
  ClipboardList,
  ListChecks,
  Pencil,
  Plus,
  SearchX,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionSheet } from '@/components/ActionSheet';
import { ActivityCard } from '@/components/ActivityCard';
import { AppButton } from '@/components/AppButton';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { FilterChip } from '@/components/FilterChip';
import { FormAlert } from '@/components/FormAlert';
import { LoadingState } from '@/components/LoadingState';
import { SearchInput } from '@/components/SearchInput';
import { SegmentedControl } from '@/components/SegmentedControl';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAccountMenu } from '@/hooks/use-account-menu';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import { useStudyData } from '@/hooks/use-study-data';
import { deleteActivity, setActivityStatus } from '@/services/activities';
import { getDataErrorMessage } from '@/services/firestore-helpers';
import type { StudyActivity } from '@/types/models';
import { compareByDueDate, filterActivities, isOverdue, pluralize, type StatusFilter } from '@/utils/activity';
import { formatShortDate, toDateKey } from '@/utils/date';

function openActivityForm(activityId?: string) {
  router.push(activityId ? { pathname: '/activity-form', params: { id: activityId } } : '/activity-form');
}

export default function ActivitiesScreen() {
  const { profile } = useAuth();
  const { subjects, activities, loading, error } = useStudyData();
  const { initials, openAccountMenu, accountError } = useAccountMenu();
  const showDialog = useDialog();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('pending');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [ascending, setAscending] = useState(true);
  const [menuActivity, setMenuActivity] = useState<StudyActivity | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const todayKey = toDateKey(new Date());
  const subjectsById = new Map(subjects.map((subject) => [subject.id, subject]));
  const pendingCount = activities.filter((activity) => activity.status === 'pending').length;
  const completedCount = activities.length - pendingCount;
  const overdue = activities.filter((activity) => isOverdue(activity, todayKey)).sort(compareByDueDate);
  const visible = filterActivities(activities, subjectsById, { query, status, subjectId, ascending });
  const bannerError = actionError ?? accountError;

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

  async function handleDelete(activity: StudyActivity) {
    if (!profile) {
      return;
    }
    const confirmed = await showDialog({
      title: 'Excluir atividade?',
      message: `"${activity.title}" será removida permanentemente. Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      tone: 'danger',
      icon: Trash2,
    });
    if (!confirmed) {
      return;
    }
    setActionError(null);
    try {
      await deleteActivity(profile.uid, activity.id);
    } catch (deleteError) {
      setActionError(getDataErrorMessage(deleteError));
    }
  }

  function renderEmpty() {
    if (subjects.length === 0) {
      return (
        <EmptyState
          icon={BookOpen}
          title="Cadastre uma matéria primeiro"
          message="Toda atividade pertence a uma matéria. Comece cadastrando suas disciplinas."
          action={
            <AppButton title="Cadastrar matéria" icon={Plus} iconPosition="start" onPress={() => router.push('/subject-form')} />
          }
        />
      );
    }
    if (activities.length === 0) {
      return (
        <EmptyState
          icon={ListChecks}
          title="Nenhuma atividade cadastrada"
          message="Registre provas, trabalhos e tarefas para acompanhar suas entregas."
        />
      );
    }
    return (
      <EmptyState
        icon={SearchX}
        title="Nenhuma atividade encontrada"
        message="Ajuste a busca ou os filtros para ver outras atividades."
      />
    );
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.titleTexts}>
          <Text style={styles.title}>Atividades</Text>
          <Text style={styles.subtitle}>Acompanhe suas entregas</Text>
        </View>
        <View style={styles.pendingPill}>
          <ClipboardList size={16} color={colors.primary} strokeWidth={2} />
          <Text style={styles.pendingText}>{pluralize(pendingCount, 'pendência', 'pendências')}</Text>
        </View>
      </View>

      {error ? <FormAlert title="Não foi possível carregar seus dados" message={error} /> : null}
      {bannerError ? <FormAlert title="Algo deu errado" message={bannerError} /> : null}

      <SearchInput value={query} onChangeText={setQuery} placeholder="Buscar atividade ou matéria..." />

      <SegmentedControl
        value={status}
        onChange={setStatus}
        options={[
          { value: 'all', label: `Todas (${activities.length})` },
          { value: 'pending', label: `Pendentes (${pendingCount})` },
          { value: 'completed', label: `Concluídas (${completedCount})` },
        ]}
      />

      {subjects.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chips}>
          <FilterChip
            label="Todas as matérias"
            selected={subjectId === null}
            onPress={() => setSubjectId(null)}
            dotColor={subjectId === null ? colors.primary : undefined}
          />
          {subjects.map((subject) => (
            <FilterChip
              key={subject.id}
              label={subject.name}
              selected={subjectId === subject.id}
              onPress={() => setSubjectId(subject.id)}
              dotColor={subject.color}
            />
          ))}
        </ScrollView>
      ) : null}

      {overdue.length > 0 ? (
        <View style={styles.overdue}>
          <View style={styles.overdueIcon}>
            <CircleAlert size={20} color={colors.error} strokeWidth={2} />
          </View>
          <View style={styles.overdueTexts}>
            <Text style={styles.overdueTitle}>
              {pluralize(overdue.length, 'atividade em atraso', 'atividades em atraso')}
            </Text>
            <Text style={styles.overdueText} numberOfLines={1}>
              Mais antiga: {overdue[0].title} ({formatShortDate(overdue[0].dueDate)})
            </Text>
          </View>
        </View>
      ) : null}

      {activities.length > 0 ? (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>{pluralize(visible.length, 'resultado', 'resultados')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Alternar ordenação por data"
            hitSlop={8}
            onPress={() => setAscending((value) => !value)}
            style={styles.sortButton}>
            {({ pressed }) => (
              <>
                <ArrowDownUp size={15} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.sortText, pressed && styles.pressed]}>
                  {ascending ? 'Mais próximas primeiro' : 'Mais distantes primeiro'}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.root}>
      <AppHeader initials={initials} onAvatarPress={openAccountMenu} />
      {loading ? (
        <LoadingState message="Carregando atividades..." />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(activity) => activity.id}
          ListHeaderComponent={header}
          ListEmptyComponent={renderEmpty()}
          renderItem={({ item }) => (
            <ActivityCard
              activity={item}
              subject={subjectsById.get(item.subjectId)}
              todayKey={todayKey}
              onToggleStatus={handleToggleStatus}
              onOpenMenu={setMenuActivity}
              disabled={updatingId === item.id}
              variant="detailed"
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        />
      )}

      {!loading && subjects.length > 0 ? (
        <View style={styles.fab}>
          <AppButton title="Nova atividade" icon={Plus} iconPosition="start" onPress={() => openActivityForm()} />
        </View>
      ) : null}

      <ActionSheet
        visible={menuActivity !== null}
        title={menuActivity?.title ?? ''}
        onClose={() => setMenuActivity(null)}
        options={
          menuActivity
            ? [
                { label: 'Editar atividade', icon: Pencil, onPress: () => openActivityForm(menuActivity.id) },
                { label: 'Excluir atividade', icon: Trash2, destructive: true, onPress: () => handleDelete(menuActivity) },
              ]
            : []
        }
      />
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
    paddingBottom: 112,
  },
  header: {
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
  },
  pendingText: {
    ...typography.labelMd,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.text,
  },
  chipsScroll: {
    marginHorizontal: -spacing.xxl,
  },
  chips: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  overdue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 14,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    backgroundColor: colors.errorBackground,
  },
  overdueIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overdueTexts: {
    flex: 1,
    gap: 2,
  },
  overdueTitle: {
    ...typography.labelMd,
    fontSize: 14,
    color: colors.error,
  },
  overdueText: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.error,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortText: {
    ...typography.labelMd,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
  separator: {
    height: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.xxl,
    bottom: spacing.lg,
    borderRadius: radius.md,
    shadowColor: '#92432B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
});
