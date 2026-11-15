import { router } from 'expo-router';
import { BookOpen, Link2, Pencil, Plus, Trash2, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ActionSheet } from '@/components/ActionSheet';
import { AppButton } from '@/components/AppButton';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { FormAlert } from '@/components/FormAlert';
import { LoadingState } from '@/components/LoadingState';
import { StatCard } from '@/components/StatCard';
import { SubjectListItem } from '@/components/SubjectListItem';
import { colors, spacing, typography } from '@/constants/theme';
import { useAccountMenu } from '@/hooks/use-account-menu';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import { useStudyData } from '@/hooks/use-study-data';
import { getDataErrorMessage } from '@/services/firestore-helpers';
import { deleteSubject } from '@/services/subjects';
import type { Subject } from '@/types/models';
import { getStatsFor, getSubjectStats, pluralize } from '@/utils/activity';
import { toDateKey } from '@/utils/date';

type Feedback = {
  title: string;
  message: string;
};

function openForm(subjectId?: string) {
  router.push(subjectId ? { pathname: '/subject-form', params: { id: subjectId } } : '/subject-form');
}

export default function SubjectsScreen() {
  const { profile } = useAuth();
  const { subjects, activities, loading, error } = useStudyData();
  const { initials, openAccountMenu, accountError } = useAccountMenu();
  const showDialog = useDialog();
  const [menuSubject, setMenuSubject] = useState<Subject | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const stats = getSubjectStats(activities, toDateKey(new Date()));
  const completedTotal = activities.filter((activity) => activity.status === 'completed').length;
  const overallProgress = activities.length === 0 ? 0 : Math.round((completedTotal / activities.length) * 100);

  async function handleDelete(subject: Subject) {
    if (!profile) {
      return;
    }
    setFeedback(null);
    const linked = getStatsFor(stats, subject.id).total;
    if (linked > 0) {
      await showDialog({
        title: 'Matéria com atividades',
        message: `"${subject.name}" possui ${pluralize(linked, 'atividade vinculada', 'atividades vinculadas')}. Exclua essas atividades antes de remover a matéria.`,
        confirmLabel: 'Entendi',
        cancelLabel: null,
        icon: Link2,
      });
      return;
    }
    const confirmed = await showDialog({
      title: 'Excluir matéria?',
      message: `"${subject.name}" será removida permanentemente. Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      tone: 'danger',
      icon: Trash2,
    });
    if (!confirmed) {
      return;
    }
    try {
      await deleteSubject(profile.uid, subject.id);
    } catch (deleteError) {
      setFeedback({ title: 'Não foi possível excluir a matéria', message: getDataErrorMessage(deleteError) });
    }
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.titleTexts}>
          <Text style={styles.title}>Matérias</Text>
          <Text style={styles.subtitle}>Organize suas disciplinas</Text>
        </View>
        <AppButton title="Nova matéria" icon={Plus} iconPosition="start" size="sm" onPress={() => openForm()} />
      </View>

      {error ? <FormAlert title="Não foi possível carregar seus dados" message={error} /> : null}
      {accountError ? <FormAlert title="Não foi possível sair" message={accountError} /> : null}
      {feedback ? <FormAlert title={feedback.title} message={feedback.message} /> : null}

      <View style={styles.stats}>
        <StatCard
          label="Cursando"
          value={String(subjects.length)}
          caption={pluralize(subjects.length, 'matéria cadastrada', 'matérias cadastradas')}
          icon={BookOpen}
        />
        <StatCard
          label="Progresso geral"
          value={`${overallProgress}%`}
          caption={`${completedTotal} de ${activities.length} entregas`}
          icon={TrendingUp}
          highlight
        />
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>Todas as matérias</Text>
        <Text style={styles.sectionCount}>
          {pluralize(subjects.length, 'cadastrada', 'cadastradas')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <AppHeader initials={initials} onAvatarPress={openAccountMenu} />
      {loading ? (
        <LoadingState message="Carregando matérias..." />
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(subject) => subject.id}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <EmptyState
              icon={BookOpen}
              title="Nenhuma matéria cadastrada"
              message="Cadastre suas disciplinas para organizar provas, trabalhos e tarefas."
              action={<AppButton title="Cadastrar matéria" icon={Plus} iconPosition="start" onPress={() => openForm()} />}
            />
          }
          renderItem={({ item }) => (
            <SubjectListItem
              subject={item}
              stats={getStatsFor(stats, item.id)}
              onOpenMenu={() => setMenuSubject(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ActionSheet
        visible={menuSubject !== null}
        title={menuSubject?.name ?? ''}
        onClose={() => setMenuSubject(null)}
        options={
          menuSubject
            ? [
                { label: 'Editar matéria', icon: Pencil, onPress: () => openForm(menuSubject.id) },
                { label: 'Excluir matéria', icon: Trash2, destructive: true, onPress: () => handleDelete(menuSubject) },
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
    paddingBottom: spacing.xxxl,
  },
  header: {
    gap: spacing.xl,
    marginBottom: spacing.md,
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
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sectionLabel: {
    ...typography.labelMd,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionCount: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  separator: {
    height: spacing.md,
  },
});
