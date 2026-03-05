import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventStore, useRoomStore, useAuthStore } from '../../store';
import { WeeklyCalendar } from '../../components/calendar/WeeklyCalendar';
import { deleteEvent } from '../../lib/firestore/events';
import { getWeekRange } from '../../lib/utils';
import { RoomEvent } from '../../types';

export default function CalendarScreen() {
  const router = useRouter();
  const { weekEvents } = useEventStore();
  const { currentRoom } = useRoomStore();
  const { user } = useAuthStore();
  const [weekStart, setWeekStart] = useState(() => getWeekRange(new Date()).start);

  function goWeek(delta: number) {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta * 7);
      return getWeekRange(d).start;
    });
  }

  function handleEventPress(event: RoomEvent) {
    router.push({ pathname: '/main/event-form', params: { eventId: event.id } });
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-white pt-14 pb-3 px-4 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-900">캘린더</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/main/event-form', params: { type: 'MAIN' } })}
          className="bg-sky-500 rounded-full w-8 h-8 items-center justify-center"
        >
          <Text className="text-white text-lg font-bold">+</Text>
        </TouchableOpacity>
      </View>

      <WeeklyCalendar
        weekStart={weekStart}
        events={weekEvents}
        onEventPress={handleEventPress}
        onPrevWeek={() => goWeek(-1)}
        onNextWeek={() => goWeek(1)}
      />
    </View>
  );
}
