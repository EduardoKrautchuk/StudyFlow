import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/services/firebase';
import { toDate } from '@/services/firestore-helpers';
import type { Subject } from '@/types/models';

function subjectsCollection(userId: string) {
  return collection(db, 'users', userId, 'subjects');
}

function toSubject(snapshot: QueryDocumentSnapshot): Subject | null {
  const data: Record<string, unknown> = snapshot.data();
  if (typeof data.name !== 'string' || typeof data.color !== 'string') {
    return null;
  }
  return {
    id: snapshot.id,
    name: data.name,
    color: data.color,
    createdAt: toDate(data.createdAt),
  };
}

export function subscribeToSubjects(
  userId: string,
  onChange: (subjects: Subject[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(subjectsCollection(userId), orderBy('name')),
    (snapshot) => {
      onChange(snapshot.docs.map(toSubject).filter((subject): subject is Subject => subject !== null));
    },
    onError,
  );
}
