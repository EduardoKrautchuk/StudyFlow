import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import { ACTIVITY_PRIORITIES, ACTIVITY_STATUSES, ACTIVITY_TYPES } from '@/constants/activity';
import { db } from '@/services/firebase';
import { isOneOf, toDate } from '@/services/firestore-helpers';
import type { ActivityStatus, StudyActivity } from '@/types/models';

function activitiesCollection(userId: string) {
  return collection(db, 'users', userId, 'activities');
}

function toActivity(snapshot: QueryDocumentSnapshot): StudyActivity | null {
  const data: Record<string, unknown> = snapshot.data();
  if (
    typeof data.title !== 'string' ||
    typeof data.subjectId !== 'string' ||
    typeof data.dueDate !== 'string' ||
    !isOneOf(data.type, ACTIVITY_TYPES) ||
    !isOneOf(data.priority, ACTIVITY_PRIORITIES) ||
    !isOneOf(data.status, ACTIVITY_STATUSES)
  ) {
    return null;
  }
  return {
    id: snapshot.id,
    title: data.title,
    description: typeof data.description === 'string' ? data.description : '',
    subjectId: data.subjectId,
    type: data.type,
    priority: data.priority,
    status: data.status,
    dueDate: data.dueDate,
    dueTime: typeof data.dueTime === 'string' && data.dueTime ? data.dueTime : null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function subscribeToActivities(
  userId: string,
  onChange: (activities: StudyActivity[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(activitiesCollection(userId), orderBy('dueDate')),
    (snapshot) => {
      onChange(snapshot.docs.map(toActivity).filter((activity): activity is StudyActivity => activity !== null));
    },
    onError,
  );
}

export async function setActivityStatus(userId: string, activityId: string, status: ActivityStatus): Promise<void> {
  await updateDoc(doc(activitiesCollection(userId), activityId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
