import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { useStudyData } from '@/hooks/use-study-data';
import {
  clearReminders,
  ensureNotificationPermission,
  onReminderOpened,
  presentReminderNow,
  syncReminders,
} from '@/services/notifications';
import type { ReminderSyncResult } from '@/services/notifications.types';
import { planReminders } from '@/utils/reminders';

const LOG_PREFIX = '[lembretes]';
const FOREGROUND_WINDOW_MS = 24 * 60 * 60 * 1000;
const LATE_TOLERANCE_MS = 60 * 1000;

function logSync(result: ReminderSyncResult) {
  if (!__DEV__) {
    return;
  }
  console.log(
    LOG_PREFIX,
    `${result.pending} na fila (+${result.added} novo(s), -${result.cancelled} cancelado(s))`,
    result.next
      ? `próximo: ${result.next.title} em ${result.next.date.toLocaleString('pt-BR')}`
      : 'nenhum lembrete futuro',
  );
}

export function useActivityReminders() {
  const { subjects, activities, loading } = useStudyData();
  const [permitted, setPermitted] = useState(false);
  const lastSignature = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    if (__DEV__) {
      console.log(LOG_PREFIX, 'preparando notificações');
    }
    ensureNotificationPermission()
      .then((granted) => {
        if (__DEV__) {
          console.log(LOG_PREFIX, granted ? 'permissão concedida' : 'permissão negada');
        }
        if (!granted) {
          console.warn(LOG_PREFIX, 'permissão de notificações não concedida');
        }
        if (active) {
          setPermitted(granted);
        }
      })
      .catch((error: unknown) => {
        console.warn(LOG_PREFIX, 'falha ao preparar notificações', error);
        setPermitted(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => onReminderOpened(() => router.push('/agenda')), []);

  useEffect(
    () => () => {
      lastSignature.current = null;
      clearReminders().catch((error: unknown) => console.warn(LOG_PREFIX, 'falha ao cancelar lembretes', error));
    },
    [],
  );

  useEffect(() => {
    if (!permitted || loading) {
      return;
    }
    const plans = planReminders(activities, subjects);
    const signature = plans.map((plan) => plan.id).join('|');
    if (signature === lastSignature.current) {
      return;
    }
    lastSignature.current = signature;
    syncReminders(plans, new Date())
      .then(logSync)
      .catch((error: unknown) => {
        lastSignature.current = null;
        console.warn(LOG_PREFIX, 'falha ao agendar lembretes', error);
      });
  }, [permitted, loading, activities, subjects]);

  useEffect(() => {
    if (!permitted || loading) {
      return;
    }
    const now = Date.now();
    const timers = planReminders(activities, subjects)
      .filter((plan) => {
        const delay = plan.date.getTime() - now;
        return delay > -LATE_TOLERANCE_MS && delay <= FOREGROUND_WINDOW_MS;
      })
      .map((plan) =>
        setTimeout(
          () => {
            presentReminderNow(plan)
              .then((shown) => {
                if (shown && __DEV__) {
                  console.log(LOG_PREFIX, `exibido com o app aberto: ${plan.title}`);
                }
              })
              .catch((error: unknown) => console.warn(LOG_PREFIX, 'falha ao exibir lembrete', error));
          },
          Math.max(plan.date.getTime() - now, 0),
        ),
      );
    return () => timers.forEach(clearTimeout);
  }, [permitted, loading, activities, subjects]);
}
