import {
  doc, setDoc, collection, onSnapshot, Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Presence, PresenceStatus } from '../../types';
import { writeAuditLog } from './audit';
import { addDoc } from 'firebase/firestore';

// ─── Presence 실시간 구독 ─────────────────────────────────────
export function subscribeToPresences(
  roomId: string,
  onData: (presences: Presence[]) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, 'rooms', roomId, 'presence'),
    (snap) => {
      const presences = snap.docs.map((d) => ({ ...d.data(), userId: d.id } as Presence));
      onData(presences);
    },
  );
}

// ─── Presence 업데이트 (본인만) ───────────────────────────────
export async function updatePresence(
  roomId: string,
  userId: string,
  status: PresenceStatus,
): Promise<void> {
  await setDoc(
    doc(db, 'rooms', roomId, 'presence', userId),
    { status, updatedAt: Date.now() },
    { merge: true },
  );

  await writeAuditLog(roomId, {
    actorId: userId,
    action: 'PRESENCE_UPDATE',
    targetType: 'presence',
    targetId: userId,
  });

  await addDoc(collection(db, 'rooms', roomId, 'notifications'), {
    type: 'PRESENCE_CHANGED',
    actorId: userId,
    payload: { status },
    createdAt: Date.now(),
    readBy: {},
  });
}
