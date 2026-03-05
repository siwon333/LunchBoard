import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuditAction } from '../../types';

interface AuditEntry {
  actorId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  diff?: object;
}

export async function writeAuditLog(roomId: string, entry: AuditEntry): Promise<void> {
  await addDoc(collection(db, 'rooms', roomId, 'auditLogs'), {
    ...entry,
    timestamp: Date.now(),
  });
}
