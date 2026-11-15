import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { useStudyData } from '@/hooks/use-study-data';
import { clearReminders, ensureNotificationPermission, onReminderOpened, replaceReminders } from '@/services/notifications';
import { planReminders } from '@/utils/reminders';

export function useActivityReminders() {
  const { subjects, activities, loading } = useStudyData();
  const [permitted, setPermitted] = useState(false);
  const lastSignature = useRef('');

  useEffect(() => {
    let active = true;
    ensureNotificationPermission()
      .then((granted) => {
        if (active) {
          setPermitted(granted);
        }
      })
      .catch(() => setPermitted(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => onReminderOpened(() => router.push('/agenda')), []);

  useEffect(
    () => () => {
      lastSignature.current = '';
      clearReminders().catch(() => undefined);
    },
    [],
  );

  useEffect(() => {
    if (!permitted || loading) {
      return;
    }
    const plans = planReminders(activities, subjects, new Date());
    const signature = JSON.stringify(plans.map((plan) => [plan.id, plan.date.getTime(), plan.title, plan.body]));
    if (signature === lastSignature.current) {
      return;
    }
    lastSignature.current = signature;
    replaceReminders(plans).catch(() => {
      lastSignature.current = '';
    });
  }, [permitted, loading, activities, subjects]);
}
