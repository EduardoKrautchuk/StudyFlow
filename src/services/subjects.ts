import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
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

export type SubjectInput = {
  name: string;
  color: string;
};

export async function createSubject(userId: string, input: SubjectInput): Promise<void> {
  await addDoc(subjectsCollection(userId), {
    name: input.name.trim(),
    color: input.color,
    createdAt: serverTimestamp(),
  });
}

export async function updateSubject(userId: string, subjectId: string, input: SubjectInput): Promise<void> {
  await updateDoc(doc(subjectsCollection(userId), subjectId), {
    name: input.name.trim(),
    color: input.color,
  });
}

export async function deleteSubject(userId: string, subjectId: string): Promise<void> {
  await deleteDoc(doc(subjectsCollection(userId), subjectId));
}
