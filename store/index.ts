import { create } from 'zustand';
import { User, Room, RoomMember, RoomEvent, Presence, RoomNotification, MealSchedule, MealMenu, MealReview } from '../types';

// ─── Auth Store ────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

// ─── Room Store ────────────────────────────────────────────────
interface RoomState {
  currentRoom: Room | null;
  members: RoomMember[];
  setCurrentRoom: (room: Room | null) => void;
  setMembers: (members: RoomMember[]) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  currentRoom: null,
  members: [],
  setCurrentRoom: (currentRoom) => set({ currentRoom }),
  setMembers: (members) => set({ members }),
}));

// ─── Event Store ───────────────────────────────────────────────
interface EventState {
  todayEvents: RoomEvent[];
  weekEvents: RoomEvent[];
  setTodayEvents: (events: RoomEvent[]) => void;
  setWeekEvents: (events: RoomEvent[]) => void;
}

export const useEventStore = create<EventState>((set) => ({
  todayEvents: [],
  weekEvents: [],
  setTodayEvents: (todayEvents) => set({ todayEvents }),
  setWeekEvents: (weekEvents) => set({ weekEvents }),
}));

// ─── Presence Store ────────────────────────────────────────────
interface PresenceState {
  presences: Presence[];
  setPresences: (presences: Presence[]) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  presences: [],
  setPresences: (presences) => set({ presences }),
}));

// ─── Notification Store ────────────────────────────────────────
interface NotificationState {
  notifications: RoomNotification[];
  setNotifications: (notifs: RoomNotification[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
}));

// ─── Meal Store ────────────────────────────────────────────────
interface MealState {
  schedule: MealSchedule | null;
  todayMenu: MealMenu | null;
  todayReviews: MealReview[];
  setSchedule: (s: MealSchedule | null) => void;
  setTodayMenu: (m: MealMenu | null) => void;
  setTodayReviews: (r: MealReview[]) => void;
}

export const useMealStore = create<MealState>((set) => ({
  schedule: null,
  todayMenu: null,
  todayReviews: [],
  setSchedule: (schedule) => set({ schedule }),
  setTodayMenu: (todayMenu) => set({ todayMenu }),
  setTodayReviews: (todayReviews) => set({ todayReviews }),
}));
