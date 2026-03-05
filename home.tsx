import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEventStore, usePresenceStore, useRoomStore, useAuthStore } from '../../store';
import { PresenceBar } from '../../components/home/PresenceBar';
import { QuietModeBanner, EventCard, QuickActions } from '../../components/home/EventItems';
import { EmptyState, Card } from '../../components/common/ui';
import { deleteEvent } from '../../lib/firestore/events';
import { formatDate } from '../../lib/utils';
import { RoomEvent } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const { todayEvents } = useEventStore();
  const { presences } = usePresenceStore();
  const { members, currentRoom } = useRoomStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const quietEvents = useMemo(
    () => todayEvents.filter((e) => e.type === 'QUIET'),
    [todayEvents],
  );

  function handleEventPress(event: RoomEvent) {
    router.push({ pathname: '/main/event-form', params: { eventId: event.id } });
  }

  function handleEventLongPress(event: RoomEvent) {
    const isAuthor = event.createdBy === user?.uid;
    const isAdmin  = members.find((m) => m.userId === user?.uid)?.role !== 'MEMBER';
    if (!isAuthor && !isAdmin) return;

    Alert.alert(event.title, '이 일정을 어떻게 할까요?', [
      { text: '수정', onPress: () => handleEventPress(event) },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          Alert.alert('일정 삭제', '정말 삭제할까요?', [
            { text: '취소', style: 'cancel' },
            {
              text: '삭제',
              style: 'destructive',
              onPress: () => deleteEvent(currentRoom!.id, event.id, user!.uid),
            },
          ]);
        },
      },
      { text: '취소', style: 'cancel' },
    ]);
  }

  async function handleRefresh() {
    setRefreshing(true);
    // 실시간 구독이 자동 갱신하므로 잠깐 대기
    await new Promise((r) => setTimeout(r, 500));
    setRefreshing(false);
  }

  const today = formatDate(Date.now());

  return (
    <View className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-white pt-14 pb-4 px-4 border-b border-gray-100">
        <Text className="text-xs text-gray-400">{currentRoom?.name ?? ''}</Text>
        <Text className="text-xl font-bold text-gray-900 mt-0.5">{today}</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 조용모드 배너 */}
        <View className="pt-4">
          <QuietModeBanner quietEvents={quietEvents} />
        </View>

        {/* Presence 바 */}
        <Card className="mx-4 mb-4 p-3">
          <Text className="text-xs font-medium text-gray-500 mb-3 px-1">오늘 상황</Text>
          <PresenceBar presences={presences} members={members} />
        </Card>

        {/* 오늘의 일정 타임라인 */}
        <View className="mx-4 mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">오늘의 일정</Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            {todayEvents.length === 0 ? (
              <EmptyState icon="📭" message="오늘 공유된 일정이 없어요" />
            ) : (
              todayEvents.map((event, idx) => (
                <View key={event.id}>
                  {idx > 0 && <View className="h-px bg-gray-50 mx-4" />}
                  <EventCard
                    event={event}
                    members={members}
                    onPress={handleEventPress}
                    onLongPress={handleEventLongPress}
                  />
                </View>
              ))
            )}
          </View>
        </View>

        {/* 여백 */}
        <View className="h-4" />
      </ScrollView>

      {/* 빠른 액션 */}
      <View className="bg-white border-t border-gray-100 pt-3">
        <QuickActions />
      </View>
    </View>
  );
}
