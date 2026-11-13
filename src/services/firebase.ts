import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { app } from '@/services/firebase-config';

export const auth = getAuth(app);
export const db = getFirestore(app);
