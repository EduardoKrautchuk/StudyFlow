import { router, useLocalSearchParams } from 'expo-router';
import { BookOpen, Check, SearchX } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ColorPicker } from '@/components/ColorPicker';
import { EmptyState } from '@/components/EmptyState';
import { FieldLabel } from '@/components/FieldLabel';
import { FormAlert } from '@/components/FormAlert';
import { FormHeader } from '@/components/FormHeader';
import { FormScreen } from '@/components/FormScreen';
import { LoadingState } from '@/components/LoadingState';
import { TextField } from '@/components/TextField';
import { SUBJECT_COLORS, SUBJECT_NAME_MAX_LENGTH } from '@/constants/activity';
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useStudyData } from '@/hooks/use-study-data';
import { getDataErrorMessage } from '@/services/firestore-helpers';
import { createSubject, updateSubject } from '@/services/subjects';
import type { Subject } from '@/types/models';
import { withAlpha } from '@/utils/color';

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/subjects');
  }
}

type SubjectFormProps = {
  subject: Subject | null;
  existingSubjects: Subject[];
  userId: string;
};

function SubjectForm({ subject, existingSubjects, userId }: SubjectFormProps) {
  const isEditing = subject !== null;
  const [name, setName] = useState(subject?.name ?? '');
  const [color, setColor] = useState(subject?.color ?? SUBJECT_COLORS[0]);
  const [nameError, setNameError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function validateName(): string | undefined {
    const trimmed = name.trim();
    if (!trimmed) {
      return 'Informe o nome da matéria.';
    }
    if (trimmed.length > SUBJECT_NAME_MAX_LENGTH) {
      return `O nome deve ter no máximo ${SUBJECT_NAME_MAX_LENGTH} caracteres.`;
    }
    const duplicate = existingSubjects.some(
      (item) => item.id !== subject?.id && item.name.trim().toLocaleLowerCase('pt-BR') === trimmed.toLocaleLowerCase('pt-BR'),
    );
    if (duplicate) {
      return 'Já existe uma matéria com esse nome.';
    }
    return undefined;
  }

  async function handleSave() {
    const error = validateName();
    setNameError(error);
    setSubmitError(null);
    if (error) {
      return;
    }
    setSaving(true);
    try {
      if (subject) {
        await updateSubject(userId, subject.id, { name, color });
      } else {
        await createSubject(userId, { name, color });
      }
      goBack();
    } catch (saveError) {
      setSubmitError(getDataErrorMessage(saveError));
      setSaving(false);
    }
  }

  return (
    <FormScreen header={<FormHeader title={isEditing ? 'Editar matéria' : 'Nova matéria'} onBack={goBack} />} centered={false}>
      <View style={styles.card}>
        {submitError ? <FormAlert title="Não foi possível salvar" message={submitError} /> : null}

        <TextField
          label="Nome da matéria"
          required
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Banco de Dados"
          autoCapitalize="sentences"
          maxLength={SUBJECT_NAME_MAX_LENGTH}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          error={nameError}
          editable={!saving}
        />

        <View style={styles.field}>
          <FieldLabel label="Cor identificadora" />
          <ColorPicker options={SUBJECT_COLORS} value={color} onChange={setColor} />
        </View>

        <View style={styles.field}>
          <FieldLabel label="Pré-visualização" />
          <View style={styles.preview}>
            <View style={[styles.previewIcon, { backgroundColor: withAlpha(color, 0.12) }]}>
              <BookOpen size={18} color={color} strokeWidth={1.75} />
            </View>
            <Text style={[styles.previewName, !name.trim() && styles.previewPlaceholder]} numberOfLines={1}>
              {name.trim() || 'Nome da matéria'}
            </Text>
            <View style={[styles.previewDot, { backgroundColor: color }]} />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          title={isEditing ? 'Salvar alterações' : 'Salvar matéria'}
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

export default function SubjectFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { profile } = useAuth();
  const { subjects, loading } = useStudyData();

  if (loading || !profile) {
    return <LoadingState message="Carregando..." />;
  }

  const subject = id ? (subjects.find((item) => item.id === id) ?? null) : null;

  if (id && !subject) {
    return (
      <FormScreen header={<FormHeader title="Editar matéria" onBack={goBack} />}>
        <EmptyState
          icon={SearchX}
          title="Matéria não encontrada"
          message="Ela pode ter sido excluída. Volte para a lista de matérias."
        />
      </FormScreen>
    );
  }

  return <SubjectForm key={subject?.id ?? 'new'} subject={subject} existingSubjects={subjects} userId={profile.uid} />;
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
    gap: spacing.sm + 2,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  previewIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    flex: 1,
    ...typography.headlineSm,
    fontSize: 15,
    color: colors.text,
  },
  previewPlaceholder: {
    color: colors.textSecondary,
  },
  previewDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
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
