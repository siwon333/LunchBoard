import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { RoomEvent, RoomMember } from '../../types';
import { EVENT_CONFIG } from '../../constants';
import { formatTimeRange, mergeQuietRanges, isNowActive } from '../../lib/utils';

// ─── QuietModeBanner ──────────────────────────────────────────
export function QuietModeBanner({ quietEvents }: { quietEvents: RoomEvent[] }) {
  const now = Date.now();
  const active = quietEvents.filter((e) => isNowActive(e.startAt, e.endAt));
  if (active.length === 0) return null;

  const merged = mergeQuietRanges(active);

  return (
    <View className="mx-4 mb-3 bg-violet-600 rounded-2xl px-4 py-3 flex-row items-center gap-3">
      <Text className="text-2xl">🤫</Text>
      <View className="flex-1">
        <Text className="text-white font-bold text-sm">조용히 해주세요</Text>
        {merged.map((r, i) => (
          <Text key={i} className="text-violet-200 text-xs">
            {formatTimeRange(r.start, r.end)}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─── EventCard ────────────────────────────────────────────────
interface EventCardProps {
  event: RoomEvent;
  members: RoomMember[];
  onPress: (event: RoomEvent) => void;
  onLongPress: (event: RoomEvent) => void;
}

export function EventCard({ event, members, onPress, onLongPress }: EventCardProps) {
  const cfg = EVENT_CONFIG[event.type];
  const active = isNowActive(event.startAt, event.endAt);
  const author = members.find((m) => m.userId === event.createdBy);

  return (
    <TouchableOpacity
      onPress={() => onPress(event)}
      onLongPress={() => onLongPress(event)}
      activeOpacity={0.7}
      className={`flex-row items-start px-4 py-3 ${active ? 'bg-sky-50' : ''}`}
    >
      {/* 타임라인 인디케이터 */}
      <View className="items-center mr-3 pt-1">
        <View style={{ backgroundColor: cfg.color }} className="w-2 h-2 rounded-full" />
        <View style={{ backgroundColor: cfg.color + '33' }} className="w-px flex-1 mt-1" />
      </View>

      <View className="flex-1">
        {/* 시간 */}
        <Text className="text-[11px] text-gray-400 mb-0.5">
          {event.isAllDay ? '종일' : formatTimeRange(event.startAt, event.endAt)}
        </Text>

        {/* 제목 */}
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="text-sm font-semibold text-gray-900">{event.title}</Text>
          <View style={{ backgroundColor: cfg.bg }} className="rounded-full px-2 py-0.5">
            <Text style={{ color: cfg.color }} className="text-[10px] font-medium">
              {cfg.emoji} {cfg.label}
            </Text>
          </View>
          {active && (
            <View className="bg-sky-500 rounded-full px-2 py-0.5">
              <Text className="text-[10px] text-white font-bold">진행 중</Text>
            </View>
          )}
        </View>

        {/* 작성자 */}
        {author && (
          <Text className="text-[10px] text-gray-400 mt-0.5">
            {author.nickname || author.userId.slice(0, 6)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── QuickActions ─────────────────────────────────────────────
export function QuickActions() {
  const router = useRouter();

  const actions = [
    { label: '귀가', emoji: '🏠', type: 'ARRIVAL' },
    { label: '일정', emoji: '📌', type: 'MAIN' },
    { label: '조용', emoji: '🤫', type: 'QUIET' },
  ] as const;

  return (
    <View className="flex-row justify-around px-6 pb-4">
      {actions.map((a) => (
        <TouchableOpacity
          key={a.type}
          onPress={() => router.push({ pathname: '/main/event-form', params: { type: a.type } })}
          className="items-center gap-1"
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center">
            <Text className="text-xl">{a.emoji}</Text>
          </View>
          <Text className="text-[11px] text-gray-500">{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
