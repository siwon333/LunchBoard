import { useEffect } from 'react';
import { subscribeToRoom, subscribeToMembers } from '../lib/firestore/rooms';
import { subscribeToTodayEvents, subscribeToWeekEvents, subscribeToNotifications } from '../lib/firestore/events';
import { subscribeToPresences } from '../lib/firestore/presence';
import { useRoomStore, useEventStore, usePresenceStore, useNotificationStore } from '../store';
import { getWeekRange } from '../lib/utils';

export function useRoomSubscriptions(roomId: string | null) {
  const { setCurrentRoom, setMembers } = useRoomStore();
  const { setTodayEvents, setWeekEvents } = useEventStore();
  const { setPresences } = usePresenceStore();
  const { setNotifications } = useNotificationStore();

  useEffect(() => {
    if (!roomId) return;

    const { start, end } = getWeekRange(new Date());

    const unsubs = [
      subscribeToRoom(roomId, setCurrentRoom),
      subscribeToMembers(roomId, setMembers),
      subscribeToTodayEvents(roomId, setTodayEvents),
      subscribeToWeekEvents(roomId, start, end, setWeekEvents),
      subscribeToPresences(roomId, setPresences),
      subscribeToNotifications(roomId, setNotifications as any),
    ];

    return () => unsubs.forEach((u) => u());
  }, [roomId, setCurrentRoom, setMembers, setTodayEvents, setWeekEvents, setPresences, setNotifications]);
}
