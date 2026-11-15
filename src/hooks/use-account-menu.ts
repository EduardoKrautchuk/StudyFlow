import { LogOut } from 'lucide-react-native';
import { useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import { getAuthErrorMessage, logout } from '@/services/auth';
import { getInitials } from '@/utils/user';

export function useAccountMenu() {
  const { profile } = useAuth();
  const showDialog = useDialog();
  const [accountError, setAccountError] = useState<string | null>(null);
  const email = profile?.email ?? '';

  async function openAccountMenu() {
    const confirmed = await showDialog({
      title: 'Sair da conta?',
      message: `Você está conectado como ${email}.`,
      confirmLabel: 'Sair',
      tone: 'danger',
      icon: LogOut,
    });
    if (!confirmed) {
      return;
    }
    setAccountError(null);
    try {
      await logout();
    } catch (error) {
      setAccountError(getAuthErrorMessage(error));
    }
  }

  return {
    initials: getInitials(profile?.name ?? '', email),
    openAccountMenu,
    accountError,
  };
}
