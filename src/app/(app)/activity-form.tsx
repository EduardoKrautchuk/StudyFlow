import { router, useLocalSearchParams } from 'expo-router';
import {
  BookOpen,
  Check,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Flame,
  GraduationCap,
  Plus,
  SearchX,
  Smile,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { DatePickerField } from '@/components/DatePickerField';
import { EmptyState } from '@/components/EmptyState';
import { FieldLabel } from '@/components/FieldLabel';
import { FormAlert } from '@/components/FormAlert';
import { FormHeader } from '@/components/FormHeader';
import { FormScreen } from '@/components/FormScreen';
import { LoadingState } from '@/components/LoadingState';
import { OptionGroup } from '@/components/OptionGroup';
import { SubjectPicker } from '@/components/SubjectPicker';
import { TextField } from '@/components/TextField';
import { TimePickerField } from '@/components/TimePickerField';
import { ACTIVITY_DESCRIPTION_MAX_LENGTH, ACTIVITY_TITLE_MAX_LENGTH } from '@/constants/activity';
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useStudyData } from '@/hooks/use-study-data';
import { createActivity, updateActivity } from '@/services/activities';
import { getDataErrorMessage } from '@/services/firestore-helpers';
import type { ActivityPriority, ActivityType, StudyActivity, Subject } from '@/types/models';

type FormErrors = {
  title?: string;
  subject?: string;
  date?: string;
};

const typeOptions = [
  { value: 'exam' as const, label: 'Prova', icon: GraduationCap },
  { value: 'assignment' as const, label: 'Trabalho', icon: ClipboardList },
  { value: 'task' as const, label: 'Tarefa', icon: CircleCheck },
];

const priorityOptions = [
  { value: 'low' as const, label: 'Baixa', icon: Smile },
  { value: 'medium' as const, label: 'Média', icon: CircleAlert },
  { value: 'high' as const, label: 'Alta', icon: Flame },
];

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/activities');
  }
}

type ActivityFormProps = {
  activity: StudyActivity | null;
  subjects: Subject[];
  userId: string;
};

function ActivityForm({ activity, subjects, userId }: ActivityFormProps) {
  const isEditing = activity !== null;
  const [title, setTitle] = useState(activity?.title ?? '');
  const [description, setDescription] = useState(activity?.description ?? '');
  const [subjectId, setSubjectId] = useState<string | null>(activity?.subjectId ?? null);
  const [type, setType] = useState<ActivityType>(activity?.type ?? 'assignment');
  const [priority, setPriority] = useState<ActivityPriority>(activity?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState<string | null>(activity?.dueDate ?? null);
  const [dueTime, setDueTime] = useState<string | null>(activity?.dueTime ?? null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const validSubjectId = subjectId && subjects.some((subject) => subject.id === subjectId) ? subjectId : null;

  async function handleSave() {
    const nextErrors: FormErrors = {
      title: title.trim() ? undefined : 'Informe o título da atividade.',
      subject: validSubjectId ? undefined : 'Selecione a matéria.',
      date: dueDate ? undefined : 'Selecione a data de entrega.',
    };
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.values(nextErrors).some(Boolean) || !dueDate || !validSubjectId) {
      return;
    }
    const input = {
      title,
      description,
      subjectId: validSubjectId,
      type,
      priority,
      dueDate,
      dueTime,
    };
    setSaving(true);
    try {
      if (activity) {
        await updateActivity(userId, activity.id, input);
      } else {
        await createActivity(userId, input);
      }
      goBack();
    } catch (saveError) {
      setSubmitError(getDataErrorMessage(saveError));
      setSaving(false);
    }
  }

  return (
    <FormScreen
      header={<FormHeader title={isEditing ? 'Editar atividade' : 'Nova atividade'} onBack={goBack} />}
      centered={false}>
      <View style={styles.card}>
        {submitError ? <FormAlert title="Não foi possível salvar" message={submitError} /> : null}

        <TextField
          label="Título da atividade"
          required
          value={title}
          onChangeText={setTitle}
          placeholder="Ex.: Lista de exercícios 03"
          maxLength={ACTIVITY_TITLE_MAX_LENGTH}
          error={errors.title}
          editable={!saving}
        />

        <TextField
          label="Descrição (opcional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Adicione detalhes, orientações ou links úteis..."
          multiline
          maxLength={ACTIVITY_DESCRIPTION_MAX_LENGTH}
          editable={!saving}
        />

        <View style={styles.field}>
          <FieldLabel label="Matéria" required />
          <SubjectPicker
            subjects={subjects}
            value={validSubjectId}
            onChange={setSubjectId}
            error={Boolean(errors.subject)}
            disabled={saving}
          />
          {errors.subject ? <Text style={styles.errorText}>{errors.subject}</Text> : null}
        </View>

        <View style={styles.field}>
          <FieldLabel label="Tipo de atividade" />
          <OptionGroup options={typeOptions} value={type} onChange={setType} />
        </View>

        <View style={styles.field}>
          <FieldLabel label="Data e horário de entrega" />
          <View style={styles.dateRow}>
            <DatePickerField value={dueDate} onChange={setDueDate} error={Boolean(errors.date)} disabled={saving} />
            <TimePickerField value={dueTime} onChange={setDueTime} disabled={saving} />
          </View>
          {errors.date ? (
            <Text style={styles.errorText}>{errors.date}</Text>
          ) : (
            <Text style={styles.hint}>O horário é opcional.</Text>
          )}
        </View>

        <View style={styles.field}>
          <FieldLabel label="Prioridade" />
          <OptionGroup options={priorityOptions} value={priority} onChange={setPriority} appearance="soft" />
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          title={isEditing ? 'Salvar alterações' : 'Salvar atividade'}
          icon={Check}
          iconPosition="start"
          onPress={handleSave}
          loading={saving}
        />
        <Pressable accessibilityRole="button" onPress={goBack} disabled={saving} style={styles.cancel} hitSlop={8}>
          {({ pressed }) => <Text style={[styles.cancelText, pressed && styles.pressed]}>Cancelar</Text>}
        </Pressable>
      </View>
    </FormScreen>
  );
}

export default function ActivityFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { profile } = useAuth();
  const { subjects, activities, loading } = useStudyData();

  if (loading || !profile) {
    return <LoadingState message="Carregando..." />;
  }

  const activity = id ? (activities.find((item) => item.id === id) ?? null) : null;
  const title = id ? 'Editar atividade' : 'Nova atividade';

  if (id && !activity) {
    return (
      <FormScreen header={<FormHeader title={title} onBack={goBack} />}>
        <EmptyState
          icon={SearchX}
          title="Atividade não encontrada"
          message="Ela pode ter sido excluída. Volte para a lista de atividades."
        />
      </FormScreen>
    );
  }

  if (subjects.length === 0) {
    return (
      <FormScreen header={<FormHeader title={title} onBack={goBack} />}>
        <EmptyState
          icon={BookOpen}
          title="Cadastre uma matéria primeiro"
          message="Toda atividade precisa estar vinculada a uma matéria."
          action={
            <AppButton title="Cadastrar matéria" icon={Plus} iconPosition="start" onPress={() => router.replace('/subject-form')} />
          }
        />
      </FormScreen>
    );
  }

  return <ActivityForm key={activity?.id ?? 'new'} activity={activity} subjects={subjects} userId={profile.uid} />;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    borderRadius: radius.lg + 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xxl,
    ...shadow,
  },
  field: {
    gap: spacing.sm,
  },
  dateRow: {
    gap: spacing.sm,
  },
  hint: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.labelSm,
    color: colors.error,
  },
  actions: {
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },
  cancel: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
  cancelText: {
    ...typography.bodyLg,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.6,
  },
});
