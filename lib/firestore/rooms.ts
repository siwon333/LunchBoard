import {
  doc, collection, getDoc, getDocs, addDoc, setDoc, updateDoc,
  query, where, onSnapshot, Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Room, RoomMember, MemberRole } from '../../types';
import { DEFAULT_ROOM_SETTINGS } from '../../constants';
import { generateInviteCode } from '../utils';
import { writeAuditLog } from './audit';

// ─── 룸 생성 ──────────────────────────────────────────────────
export async function createRoom(ownerId: string, name: string): Promise<Room> {
  const now = Date.now();
  const inviteCode = generateInviteCode();

  const roomData = {
    name,
    ownerId,
    inviteCodeHash: inviteCode,
    settings: DEFAULT_ROOM_SETTINGS,
    createdAt: now,
    updatedAt: now,
  };

  const ref = await addDoc(collection(db, 'rooms'), roomData);

  // Owner 멤버 생성
  await setDoc(doc(db, 'rooms', ref.id, 'members', ownerId), {
    userId: ownerId,
    nickname: '',
    role: 'OWNER' as MemberRole,
    joinedAt: now,
  });

  return { ...roomData, id: ref.id };
}

// ─── 초대코드로 룸 찾기 ───────────────────────────────────────
export async function findRoomByInviteCode(code: string): Promise<Room | null> {
  const q = query(
    collection(db, 'rooms'),
    where('inviteCodeHash', '==', code.toUpperCase()),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { ...d.data(), id: d.id } as Room;
}

// ─── 초대코드로 참여 ──────────────────────────────────────────
export async function joinRoomByCode(
  code: string,
  userId: string,
  nickname: string,
): Promise<Room> {
  const room = await findRoomByInviteCode(code);
  if (!room) throw new Error('유효하지 않은 초대코드입니다.');

  const memberRef = doc(db, 'rooms', room.id, 'members', userId);
  const memberSnap = await getDoc(memberRef);
  if (memberSnap.exists()) return room; // 이미 참여 중

  await setDoc(memberRef, {
    userId,
    nickname,
    role: 'MEMBER' as MemberRole,
    joinedAt: Date.now(),
  });

  return room;
}

// ─── 룸 실시간 구독 ───────────────────────────────────────────
export function subscribeToRoom(
  roomId: string,
  onData: (room: Room) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'rooms', roomId), (snap) => {
    if (snap.exists()) onData({ ...snap.data(), id: snap.id } as Room);
  });
}

// ─── 멤버 목록 실시간 구독 ────────────────────────────────────
export function subscribeToMembers(
  roomId: string,
  onData: (members: RoomMember[]) => void,
): Unsubscribe {
  return onSnapshot(collection(db, 'rooms', roomId, 'members'), (snap) => {
    onData(snap.docs.map((d) => ({ ...d.data() } as RoomMember)));
  });
}

// ─── 룸 설정 업데이트 ─────────────────────────────────────────
export async function updateRoomSettings(
  roomId: string,
  actorId: string,
  patch: Partial<Room['settings']>,
): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId), {
    'settings': patch,
    updatedAt: Date.now(),
  });
  await writeAuditLog(roomId, {
    actorId,
    action: 'SETTINGS_UPDATE',
    targetType: 'room',
    targetId: roomId,
    diff: patch,
  });
}

// ─── 초대코드 재발급 ──────────────────────────────────────────
export async function regenerateInviteCode(roomId: string): Promise<string> {
  const newCode = generateInviteCode();
  await updateDoc(doc(db, 'rooms', roomId), { inviteCodeHash: newCode, updatedAt: Date.now() });
  return newCode;
}

// ─── 유저가 속한 룸 목록 조회 ────────────────────────────────
export async function getUserRooms(userId: string): Promise<Room[]> {
  // members 서브컬렉션은 collectionGroup으로 쿼리 필요 — MVP에서는 roomId 목록을 별도 저장
  // 간략화: 유저 문서에 roomIds 배열 관리 (또는 collectionGroup 인덱스 사용)
  const snap = await getDocs(
    query(
      collection(db, 'rooms'),
      where('ownerId', '==', userId),
    ),
  );
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Room));
}
