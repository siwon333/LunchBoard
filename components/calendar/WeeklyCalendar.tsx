import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { RoomEvent } from '../../types';
import { EVENT_CONFIG } from '../../constants';
import { getWeekDays, dateDayLabel, formatTimeRange, isNowActive } from '../../lib/utils';

interface WeeklyCalendarProps {
  weekStart: number;
  events: RoomEvent[];
  onEventPress: (event: RoomEvent) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export function WeeklyCalendar({ weekStart, events, onEventPress, onPrevWeek, onNextWeek }: WeeklyCalendarProps) {
  const days = getWeekDays(weekStart);
  const today = new Date();

  return (
    <View className="flex-1">
      {/* 주 네비게이터 */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={onPrevWeek} className="p-2">
          <Text className="text-gray-500 text-lg">‹</Text>
        </TouchableOpacity>
        <Text className="text-sm font-semibold text-gray-700">
          {days[0].toLocaleDateString('ko-KR', { month: 'long' })} {days[0].getDate()}일 — {days[6].getDate()}일
        </Text>
        <TouchableOpacity onPress={onNextWeek} className="p-2">
          <Text className="text-gray-500 text-lg">›</Text>
        </TouchableOpacity>
      </View>

      {/* 날짜 헤더 */}
      <View className="flex-row bg-white border-b border-gray-100">
        {days.map((day, i) => {
          const isToday = day.toDateString() === today.toDateString();
          return (
            <View key={i} className="flex-1 items-center py-2">
              <Text className="text-[10px] text-gray-400">
                {day.toLocaleDateString('ko-KR', { weekday: 'short' })}
              </Text>
              <View
                className={`w-7 h-7 rounded-full items-center justify-center mt-0.5 ${isToday ? 'bg-sky-500' : ''}`}
              >
                <Text className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-gray-700'}`}>
                  {day.getDate()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* 일별 이벤트 리스트 */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {days.map((day, i) => {
          const dayEvents = events.filter((e) => {
            const evDay = new Date(e.startAt);
            return evDay.toDateString() === day.toDateString();
          });
          const isToday = day.toDateString() === today.toDateString();

          if (dayEvents.length === 0 && !isToday) return null;

          return (
            <View key={i} className="mx-4 mb-3 mt-2">
              <Text className={`text-xs font-semibold mb-1 ${isToday ? 'text-sky-500' : 'text-gray-400'}`}>
                {dateDayLabel(day)}
              </Text>
              {dayEvents.length === 0 ? (
                <Text className="text-xs text-gray-300 ml-2">일정 없음</Text>
              ) : (
                <View className="bg-white rounded-xl overflow-hidden border border-gray-100">
                  {dayEvents.map((ev, idx) => (
                    <View key={ev.id}>
                      {idx > 0 && <View className="h-px bg-gray-50 mx-3" />}
                      <WeekEventRow event={ev} onPress={onEventPress} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

function WeekEventRow({ event, onPress }: { event: RoomEvent; onPress: (e: RoomEvent) => void }) {
  const cfg = EVENT_CONFIG[event.type];
  const active = isNowActive(event.startAt, event.endAt);

  return (
    <TouchableOpacity
      onPress={() => onPress(event)}
      activeOpacity={0.7}
      className={`flex-row items-center px-3 py-2.5 ${active ? 'bg-sky-50' : ''}`}
    >
      <View style={{ backgroundColor: cfg.color }} className="w-1 h-8 rounded-full mr-3" />
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-800">{event.title}</Text>
        <Text className="text-[11px] text-gray-400">
          {event.isAllDay ? '종일' : formatTimeRange(event.startAt, event.endAt)}
        </Text>
      </View>
      <View style={{ backgroundColor: cfg.bg }} className="rounded-full px-2 py-0.5">
        <Text style={{ color: cfg.color }} className="text-[10px] font-medium">
          {cfg.emoji}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
