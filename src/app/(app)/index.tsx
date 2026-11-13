import { LogOut } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { FormAlert } from '@/components/FormAlert';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { getAuthErrorMessage, logout } from '@/services/auth';

export default function HomeScreen() {
  const { profile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstName = profile?.name.split(' ')[0];

  async function handleLogout() {
    setError(null);
    setLoggingOut(true);
    try {
      await logout();
    } catch (logoutError) {
      setError(getAuthErrorMessage(logoutError));
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{firstName ? `Olá, ${firstName}!` : 'Olá!'}</Text>
        <Text style={styles.subtitle}>{profile?.email}</Text>
        {error ? <FormAlert title="Não foi possível sair" message={error} /> : null}
        <AppButton title="Sair" icon={LogOut} variant="outline" onPress={handleLogout} loading={loggingOut} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    ...typography.headlineLg,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
});
