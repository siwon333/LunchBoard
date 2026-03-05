// ─── User & Auth ───────────────────────────────────────────────
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

// ─── Room ──────────────────────────────────────────────────────
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface RoomSettings {
  permissions: {
    onlyAuthorCanEdit: boolean;
    adminCanEditAll: boolean;
  };
  defaultReminders: {
    mainEventMinutes: number;   // 기본 30
    quietModeMinutes: number;   // 기본 30
  };
  timezone: string;             // 기본 'Asia/Seoul'
}

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  inviteCodeHash: string;
  settings: RoomSettings;
  createdAt: number;
  updatedAt: number;
}

export interface RoomMember {
  userId: string;
  nickname: string;
  role: MemberRole;
  joinedAt: number;
}

// ─── Event ─────────────────────────────────────────────────────
export type EventType = 'MAIN' | 'ARRIVAL' | 'QUIET';

export interface RoomEvent {
  id: string;
  type: EventType;
  title: string;
  startAt: number;    // timestamp ms
  endAt: number;      // timestamp ms
  isAllDay: boolean;
  recurrenceRule?: string;  // RRULE string
  createdBy: string;
  updatedBy: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  reminders: Reminder[];
}

export interface Reminder {
  minutesBefore: number;
  channel: 'INAPP' | 'PUSH';
}

// ─── Presence ──────────────────────────────────────────────────
export type PresenceStatus = 'HOME' | 'OUT' | 'COMING' | 'TRIP';

export interface Presence {
  userId: string;
  status: PresenceStatus;
  updatedAt: number;
}

// ─── Notification ──────────────────────────────────────────────
export type NotificationType =
  | 'EVENT_CREATED'
  | 'EVENT_UPDATED'
  | 'EVENT_DELETED'
  | 'PRESENCE_CHANGED';

export interface RoomNotification {
  id: string;
  type: NotificationType;
  actorId: string;
  actorName: string;
  message: string;
  payload?: { eventId?: string; date?: number };
  createdAt: number;
  readBy: Record<string, number>;
}

// ─── Audit Log ─────────────────────────────────────────────────
export type AuditAction =
  | 'EVENT_CREATE'
  | 'EVENT_UPDATE'
  | 'EVENT_DELETE'
  | 'PRESENCE_UPDATE'
  | 'SETTINGS_UPDATE';

export interface AuditLog {
  id: string;
  actorId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  timestamp: number;
  diff?: object;
}
