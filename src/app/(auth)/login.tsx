import { Link } from 'expo-router';
import { ArrowRight, BookOpen, Lock, Mail } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type TextInputInstance } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { FormAlert } from '@/components/FormAlert';
import { FormScreen } from '@/components/FormScreen';
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import { getAuthErrorMessage, requestPasswordReset, signIn } from '@/services/auth';
import { validateEmail } from '@/utils/validation';

type LoginErrors = {
  email?: string;
  password?: string;
};

type Feedback = {
  variant: 'error' | 'success';
  title: string;
  message: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const passwordRef = useRef<TextInputInstance>(null);

  async function handleSubmit() {
    const nextErrors: LoginErrors = {
      email: validateEmail(email),
      password: password ? undefined : 'Informe sua senha.',
    };
    setErrors(nextErrors);
    setFeedback(null);
    if (nextErrors.email || nextErrors.password) {
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (error) {
      setFeedback({
        variant: 'error',
        title: 'Não foi possível entrar',
        message: getAuthErrorMessage(error),
      });
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    const emailError = validateEmail(email);
    setFeedback(null);
    if (emailError) {
      setErrors({ email: 'Informe seu e-mail acima para recuperar a senha.' });
      return;
    }
    setErrors({});
    setSendingReset(true);
    try {
      await requestPasswordReset(email);
      setFeedback({
        variant: 'success',
        title: 'E-mail enviado',
        message: `Se existir uma conta para ${email.trim()}, você receberá um link para redefinir a senha.`,
      });
    } catch (error) {
      setFeedback({
        variant: 'error',
        title: 'Não foi possível enviar o e-mail',
        message: getAuthErrorMessage(error),
      });
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <FormScreen>
      <View style={styles.brand}>
        <View style={styles.brandOuter}>
          <View style={styles.brandInner}>
            <BookOpen size={28} color={colors.primary} strokeWidth={2} />
          </View>
        </View>
        <Text style={styles.brandName}>StudyFlow</Text>
        <Text style={styles.brandTagline}>Organize seus estudos em um só lugar.</Text>
      </View>

      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>Bem-vindo de volta</Text>
        <Text style={styles.welcomeText}>Entre na sua conta para continuar organizando seus estudos.</Text>
      </View>

      <View style={styles.card}>
        {feedback ? (
          <FormAlert variant={feedback.variant} title={feedback.title} message={feedback.message} />
        ) : null}

        <AppInput
          label="E-mail"
          labelAccessory={<Text style={styles.labelHint}>Institucional ou pessoal</Text>}
          icon={Mail}
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
          labelAccessory={
            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              disabled={sendingReset || submitting}
              onPress={handleForgotPassword}>
              {({ pressed }) => (
                <Text style={[styles.forgotLink, (pressed || sendingReset) && styles.linkPressed]}>
                  {sendingReset ? 'Enviando...' : 'Esqueceu sua senha?'}
                </Text>
              )}
            </Pressable>
          }
          icon={Lock}
          value={password}
          onChangeText={setPassword}
          placeholder="Digite sua senha"
          password
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          error={errors.password}
          editable={!submitting}
        />

        <View style={styles.submit}>
          <AppButton title="Entrar" icon={ArrowRight} onPress={handleSubmit} loading={submitting} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ainda não tem uma conta?</Text>
        <Link href="/register" asChild>
          <Pressable accessibilityRole="link" hitSlop={8} disabled={submitting}>
            {({ pressed }) => <Text style={[styles.footerLink, pressed && styles.linkPressed]}>Criar conta</Text>}
          </Pressable>
        </Link>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brandOuter: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brandInner: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    ...typography.headlineMd,
    fontFamily: typography.headlineLg.fontFamily,
    color: colors.text,
    letterSpacing: -0.2,
  },
  brandTagline: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  welcome: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  welcomeTitle: {
    ...typography.headlineLg,
    fontFamily: typography.headlineMd.fontFamily,
    color: colors.text,
    textAlign: 'center',
  },
  welcomeText: {
    ...typography.bodyLg,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    maxWidth: 300,
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
  forgotLink: {
    ...typography.labelMd,
    color: colors.primary,
  },
  linkPressed: {
    opacity: 0.6,
  },
  submit: {
    marginTop: spacing.sm,
  },
  footer: {
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
});
