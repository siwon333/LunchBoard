import { PresenceStatus, EventType } from '../types';

export const PRESENCE_CONFIG: Record<
  PresenceStatus,
  { label: string; emoji: string; color: string; bg: string }
> = {
  HOME:   { label: '집에 있음', emoji: '🏠', color: '#16a34a', bg: '#dcfce7' },
  OUT:    { label: '외출 중',   emoji: '🚶', color: '#d97706', bg: '#fef3c7' },
  COMING: { label: '귀가 중',   emoji: '🚌', color: '#2563eb', bg: '#dbeafe' },
  TRIP:   { label: '여행 중',   emoji: '✈️',  color: '#7c3aed', bg: '#ede9fe' },
};

export const EVENT_CONFIG: Record<
  EventType,
  { label: string; emoji: string; color: string; bg: string }
> = {
  MAIN:    { label: '주요 일정', emoji: '📌', color: '#2563eb', bg: '#dbeafe' },
  ARRIVAL: { label: '귀가',     emoji: '🏠', color: '#16a34a', bg: '#dcfce7' },
  QUIET:   { label: '조용모드', emoji: '🤫', color: '#7c3aed', bg: '#ede9fe' },
};

export const DEFAULT_ROOM_SETTINGS = {
  permissions: {
    onlyAuthorCanEdit: true,
    adminCanEditAll: true,
  },
  defaultReminders: {
    mainEventMinutes: 30,
    quietModeMinutes: 30,
  },
  timezone: 'Asia/Seoul',
};
