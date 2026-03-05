import {
  doc, collection, getDoc, getDocs, addDoc,
  setDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { RoomEvent, EventType } from '../../types';
import { writeAuditLog } from './audit';

// ─── 오늘 이벤트 실시간 구독 ──────────────────────────────────
export function subscribeToTodayEvents(
  roomId: string,
  onData: (events: RoomEvent[]) => void,
): Unsubscribe {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, 'rooms', roomId, 'events'),
    where('startAt', '>=', start.getTime()),
    where('startAt', '<=', end.getTime()),
    where('deletedAt', '==', null),
    orderBy('startAt', 'asc'),
  );

  return onSnapshot(q, (snap) => {
    const events = snap.docs.map((d) => ({ ...d.data(), id: d.id } as RoomEvent));
    onData(events);
  });
}

// ─── 주간 이벤트 실시간 구독 ──────────────────────────────────
export function subscribeToWeekEvents(
  roomId: string,
  weekStart: number,
  weekEnd: number,
  onData: (events: RoomEvent[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'rooms', roomId, 'events'),
    where('startAt', '>=', weekStart),
    where('startAt', '<=', weekEnd),
    orderBy('startAt', 'asc'),
  );

  return onSnapshot(q, (snap) => {
    const events = snap.docs
      .map((d) => ({ ...d.data(), id: d.id } as RoomEvent))
      .filter((e) => !e.deletedAt);
    onData(events);
  });
}

// ─── Event 생성 ───────────────────────────────────────────────
export async function createEvent(
  roomId: string,
  actorId: string,
  data: Omit<RoomEvent, 'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'>,
): Promise<RoomEvent> {
  const now = Date.now();
  const newEvent: Omit<RoomEvent, 'id'> = {
    ...data,
    deletedAt: undefined,
    createdBy: actorId,
    updatedBy: actorId,
    createdAt: now,
    updatedAt: now,
  };

  const ref = await addDoc(
    collection(db, 'rooms', roomId, 'events'),
    newEvent,
  );

  await writeAuditLog(roomId, {
    actorId,
    action: 'EVENT_CREATE',
    targetType: 'event',
    targetId: ref.id,
  });

  // 알림 생성
  await createNotification(roomId, actorId, 'EVENT_CREATED', { eventId: ref.id });

  return { ...newEvent, id: ref.id };
}

// ─── Event 수정 ───────────────────────────────────────────────
export async function updateEvent(
  roomId: string,
  eventId: string,
  actorId: string,
  patch: Partial<Pick<RoomEvent, 'title' | 'startAt' | 'endAt' | 'isAllDay' | 'recurrenceRule' | 'reminders' | 'type'>>,
): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId, 'events', eventId), {
    ...patch,
    updatedBy: actorId,
    updatedAt: Date.now(),
  });

  await writeAuditLog(roomId, {
    actorId,
    action: 'EVENT_UPDATE',
    targetType: 'event',
    targetId: eventId,
    diff: patch,
  });

  await createNotification(roomId, actorId, 'EVENT_UPDATED', { eventId });
}

// ─── Event 삭제 (soft delete) ─────────────────────────────────
export async function deleteEvent(
  roomId: string,
  eventId: string,
  actorId: string,
): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId, 'events', eventId), {
    deletedAt: Date.now(),
    updatedBy: actorId,
    updatedAt: Date.now(),
  });

  await writeAuditLog(roomId, {
    actorId,
    action: 'EVENT_DELETE',
    targetType: 'event',
    targetId: eventId,
  });

  await createNotification(roomId, actorId, 'EVENT_DELETED', { eventId });
}

// ─── 알림 생성 (내부 헬퍼) ────────────────────────────────────
async function createNotification(
  roomId: string,
  actorId: string,
  type: string,
  payload: object,
) {
  await addDoc(collection(db, 'rooms', roomId, 'notifications'), {
    type,
    actorId,
    payload,
    createdAt: Date.now(),
    readBy: {},
  });
}

// ─── 알림 목록 실시간 구독 ────────────────────────────────────
export function subscribeToNotifications(
  roomId: string,
  onData: (notifications: any[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'rooms', roomId, 'notifications'),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
  });
}
