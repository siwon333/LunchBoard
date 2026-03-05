import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEventStore, useRoomStore, useAuthStore } from '../../store';
import { createEvent, updateEvent } from '../../lib/firestore/events';
import { Input, Button } from '../../components/common/ui';
import { EVENT_CONFIG } from '../../constants';
import { EventType, RoomEvent } from '../../types';

const EVENT_TYPES: EventType[] = ['MAIN', 'ARRIVAL', 'QUIET'];

export default function EventFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string; type?: EventType }>();
  const { todayEvents, weekEvents } = useEventStore();
  const { currentRoom } = useRoomStore();
  const { user } = useAuthStore();

  // 수정 모드라면 기존 이벤트 찾기
  const existing = params.eventId
    ? [...todayEvents, ...weekEvents].find((e) => e.id === params.eventId)
    : undefined;

  const [type, setType]         = useState<EventType>(existing?.type ?? params.type ?? 'MAIN');
  const [title, setTitle]       = useState(existing?.title ?? (params.type === 'ARRIVAL' ? '귀가' : ''));
  const [isAllDay, setIsAllDay] = useState(existing?.isAllDay ?? false);
  const [startDate, setStartDate] = useState(() => {
    if (existing) return new Date(existing.startAt);
    const d = new Date(); d.setMinutes(Math.ceil(d.getMinutes() / 30) * 30, 0, 0); return d;
  });
  const [endDate, setEndDate] = useState(() => {
    if (existing) return new Date(existing.endAt);
    const d = new Date(startDate); d.setHours(d.getHours() + 1); return d;
  });
  const [startStr, setStartStr] = useState(toTimeStr(startDate));
  const [endStr, setEndStr]     = useState(toTimeStr(endDate));
  const [loading, setLoading]   = useState(false);

  const isEdit = !!existing;
  const canEdit = isEdit
    ? (existing?.createdBy === user?.uid || ['OWNER','ADMIN'].includes(
        useRoomStore.getState().members.find((m) => m.userId === user?.uid)?.role ?? ''
      ))
    : true;

  useEffect(() => {
    if (type === 'ARRIVAL' && !existing) setTitle('귀가');
  }, [type, existing]);

  function toTimeStr(d: Date) {
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function parseTimeStr(base: Date, str: string): Date {
    const [h, m] = str.split(':').map(Number);
    const d = new Date(base);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  }

  async function handleSave() {
    if (!title.trim()) { Alert.alert('제목을 입력해주세요.'); return; }
    if (!currentRoom || !user) return;

    const start = isAllDay
      ? (() => { const d = new Date(startDate); d.setHours(0,0,0,0); return d.getTime(); })()
      : parseTimeStr(startDate, startStr).getTime();
    const end = isAllDay
      ? (() => { const d = new Date(startDate); d.setHours(23,59,59,999); return d.getTime(); })()
      : parseTimeStr(endDate, endStr).getTime();

    if (end <= start) { Alert.alert('종료 시간은 시작 시간 이후여야 합니다.'); return; }
    if (type === 'QUIET' && end - start < 30 * 60 * 1000) {
      Alert.alert('조용모드는 최소 30분 이상이어야 합니다.'); return;
    }

    setLoading(true);
    try {
      if (isEdit && params.eventId) {
        await updateEvent(currentRoom.id, params.eventId, user.uid, {
          type, title: title.trim(), startAt: start, endAt: end, isAllDay,
        });
      } else {
        await createEvent(currentRoom.id, user.uid, {
          type,
          title: title.trim(),
          startAt: start,
          endAt: end,
          isAllDay,
          reminders: [{ minutesBefore: 30, channel: 'INAPP' }],
        });
      }
      router.back();
    } catch (e: any) {
      Alert.alert('저장 실패', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 헤더 */}
      <View className="pt-14 pb-3 px-4 border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-sky-500 text-base">취소</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900">
          {isEdit ? '일정 수정' : '일정 추가'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text className="text-sky-500 font-bold text-base">{loading ? '저장 중...' : '저장'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* 이벤트 타입 선택 */}
        <Text className="text-xs font-medium text-gray-500 mb-2">이벤트 종류</Text>
        <View className="flex-row gap-2 mb-4">
          {EVENT_TYPES.map((t) => {
            const cfg = EVENT_CONFIG[t];
            const active = type === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={{ backgroundColor: active ? cfg.color : cfg.bg }}
                className="flex-1 rounded-xl py-3 items-center"
              >
                <Text className="text-lg">{cfg.emoji}</Text>
                <Text style={{ color: active ? '#fff' : cfg.color }} className="text-xs font-semibold mt-1">
                  {cfg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 제목 */}
        <Input
          label="제목"
          value={title}
          onChangeText={setTitle}
          placeholder={type === 'ARRIVAL' ? '귀가' : '일정 제목'}
        />

        {/* 종일 여부 */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sm text-gray-700">종일</Text>
          <Switch
            value={isAllDay}
            onValueChange={setIsAllDay}
            trackColor={{ true: '#0ea5e9' }}
          />
        </View>

        {/* 시간 */}
        {!isAllDay && (
          <>
            <Input
              label="시작 시간 (HH:MM)"
              value={startStr}
              onChangeText={setStartStr}
              placeholder="09:00"
              keyboardType="numeric"
            />
            <Input
              label="종료 시간 (HH:MM)"
              value={endStr}
              onChangeText={setEndStr}
              placeholder="10:00"
              keyboardType="numeric"
            />
          </>
        )}

        {/* 타입별 안내 */}
        {type === 'QUIET' && (
          <View className="bg-violet-50 rounded-xl p-3 mb-4">
            <Text className="text-xs text-violet-600">
              🤫 조용모드는 최소 30분 이상이며, 현재 시간에 해당하면 홈에 강조 표시됩니다.
            </Text>
          </View>
        )}
        {type === 'ARRIVAL' && (
          <View className="bg-green-50 rounded-xl p-3 mb-4">
            <Text className="text-xs text-green-600">
              🏠 귀가 예정 시간대를 입력하면 룸메들이 홈에서 확인할 수 있어요.
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
