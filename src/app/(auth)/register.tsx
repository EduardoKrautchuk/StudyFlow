import { router } from 'expo-router';
import { ArrowRight, AtSign, Circle, CircleCheck, GraduationCap, Lock, ShieldCheck, User } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type TextInputInstance } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { FormAlert } from '@/components/FormAlert';
import { FormScreen } from '@/components/FormScreen';
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { getAuthErrorMessage, signUp } from '@/services/auth';
import { hasMinPasswordLength, isStrongPassword, validateEmail, validatePassword } from '@/utils/validation';

type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type PasswordRuleProps = {
  label: string;
  satisfied: boolean;
};

function PasswordRule({ label, satisfied }: PasswordRuleProps) {
  const Icon = satisfied ? CircleCheck : Circle;
  const color = satisfied ? colors.success : colors.textSecondary;
  return (
    <View style={styles.rule}>
      <Icon size={14} color={color} strokeWidth={2} />
      <Text style={[styles.ruleText, { color }]}>{label}</Text>
    </View>
  );
}

export default function RegisterScreen() {
  const { refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  async function handleSubmit() {
    const nextErrors: RegisterErrors = {
      name: name.trim() ? undefined : 'Informe seu nome.',
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: !confirmPassword
        ? 'Confirme sua senha.'
        : confirmPassword !== password
          ? 'As senhas precisam ser idênticas.'
          : undefined,
    };
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }
    setSubmitting(true);
    try {
      await signUp(name, email, password);
      refreshProfile();
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <FormScreen>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <GraduationCap size={18} color={colors.primary} strokeWidth={2} />
          <Text style={styles.badgeText}>StudyFlow</Text>
        </View>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>Comece a organizar suas matérias, provas e atividades acadêmicas.</Text>
      </View>

      <View style={styles.card}>
        {submitError ? <FormAlert title="Não foi possível criar a conta" message={submitError} /> : null}

        <AppInput
          label="Nome"
          labelAccessory={<Text style={styles.labelHint}>Como prefere ser chamado</Text>}
          icon={User}
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          error={errors.name}
          editable={!submitting}
        />

        <AppInput
          ref={emailRef}
          label="E-mail"
          icon={AtSign}
          value={email}
          onChangeText={setEmail}
          placeholder="seuemail@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={errors.email}
          editable={!submitting}
        />

        <AppInput
          ref={passwordRef}
          label="Senha"
          icon={Lock}
          value={password}
          onChangeText={setPassword}
          placeholder="Crie uma senha (mínimo 6 caracteres)"
          password
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          error={errors.password}
          editable={!submitting}
          footer={
            <View style={styles.rules}>
              <PasswordRule label="Mínimo 6 caracteres" satisfied={hasMinPasswordLength(password)} />
              <PasswordRule label="Segura" satisfied={isStrongPassword(password)} />
            </View>
          }
        />

        <AppInput
          ref={confirmRef}
          label="Confirmar senha"
          icon={ShieldCheck}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repita sua senha"
          password
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          error={errors.confirmPassword}
          editable={!submitting}
        />

        <View style={styles.submit}>
          <AppButton title="Criar conta" icon={ArrowRight} onPress={handleSubmit} loading={submitting} />
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Já tem uma conta?</Text>
        <Pressable accessibilityRole="link" hitSlop={8} disabled={submitting} onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}>
          {({ pressed }) => <Text style={[styles.footerLink, pressed && styles.linkPressed]}>Entrar</Text>}
        </Pressable>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.muted,
    marginBottom: spacing.md,
  },
  badgeText: {
    ...typography.labelMd,
    fontSize: 14,
    color: colors.primary,
    letterSpacing: 0.3,
  },
  title: {
    ...typography.headlineLg,
    fontSize: 28,
    lineHeight: 36,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 290,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadow,
  },
  labelHint: {
    ...typography.labelSm,
    color: colors.textSecondary,
  },
  rules: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 2,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ruleText: {
    ...typography.labelSm,
  },
  submit: {
    marginTop: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxxl,
  },
  footerText: {
    ...typography.bodyMd,
    fontSize: 15,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.labelMd,
    fontSize: 15,
    color: colors.primary,
  },
  linkPressed: {
    opacity: 0.6,
  },
});
