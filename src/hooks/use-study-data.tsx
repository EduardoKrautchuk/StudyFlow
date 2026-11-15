import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { subscribeToActivities } from '@/services/activities';
import { getDataErrorMessage } from '@/services/firestore-helpers';
import { subscribeToSubjects } from '@/services/subjects';
import type { StudyActivity, Subject } from '@/types/models';

type StudyDataValue = {
  subjects: Subject[];
  activities: StudyActivity[];
  loading: boolean;
  error: string | null;
};

const StudyDataContext = createContext<StudyDataValue | null>(null);

export function StudyDataProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const userId = profile?.uid;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activities, setActivities] = useState<StudyActivity[]>([]);
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }
    const startedAt = Date.now();
    const logLoaded = (collectionName: string, count: number) => {
      if (__DEV__) {
        console.log('[dados]', `${collectionName}: ${count} em ${Date.now() - startedAt} ms`);
      }
    };
    const handleError = (subscriptionError: Error) => {
      setError(getDataErrorMessage(subscriptionError));
      setSubjectsLoaded(true);
      setActivitiesLoaded(true);
    };
    const unsubscribeSubjects = subscribeToSubjects(
      userId,
      (items) => {
        logLoaded('matérias', items.length);
        setSubjects(items);
        setSubjectsLoaded(true);
      },
      handleError,
    );
    const unsubscribeActivities = subscribeToActivities(
      userId,
      (items) => {
        logLoaded('atividades', items.length);
        setActivities(items);
        setActivitiesLoaded(true);
      },
      handleError,
    );
    return () => {
      unsubscribeSubjects();
      unsubscribeActivities();
    };
  }, [userId]);

  const value = useMemo(
    () => ({ subjects, activities, loading: !subjectsLoaded || !activitiesLoaded, error }),
    [subjects, activities, subjectsLoaded, activitiesLoaded, error],
  );

  return <StudyDataContext.Provider value={value}>{children}</StudyDataContext.Provider>;
}

export function useStudyData(): StudyDataValue {
  const context = useContext(StudyDataContext);
  if (!context) {
    throw new Error('useStudyData must be used within StudyDataProvider');
  }
  return context;
}
