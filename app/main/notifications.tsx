import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNotificationStore, useAuthStore, useRoomStore } from '../../store';
import { formatRelative } from '../../lib/utils';
import { EmptyState } from '../../components/common/ui';
import { RoomNotification } from '../../types';

const NOTIF_ICONS: Record<string, string> = {
  EVENT_CREATED:   '📌',
  EVENT_UPDATED:   '✏️',
  EVENT_DELETED:   '🗑️',
  PRESENCE_CHANGED: '🏃',
};

const NOTIF_LABELS: Record<string, string> = {
  EVENT_CREATED:   '새 일정이 추가됐어요',
  EVENT_UPDATED:   '일정이 수정됐어요',
  EVENT_DELETED:   '일정이 삭제됐어요',
  PRESENCE_CHANGED: '상태가 변경됐어요',
};

export default function NotificationsScreen() {
  const { notifications } = useNotificationStore();
  const { user } = useAuthStore();
  const { currentRoom } = useRoomStore();

  async function markRead(notif: RoomNotification) {
    if (!user || !currentRoom) return;
    if (notif.readBy?.[user.uid]) return;
    await updateDoc(doc(db, 'rooms', currentRoom.id, 'notifications', notif.id), {
      [`readBy.${user.uid}`]: Date.now(),
    });
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-white pt-14 pb-3 px-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">알림</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <EmptyState icon="🔕" message="아직 알림이 없어요" />
        ) : (
          notifications.map((notif) => {
            const isRead = user ? !!notif.readBy?.[user.uid] : true;
            return (
              <TouchableOpacity
                key={notif.id}
                onPress={() => markRead(notif)}
                className={`flex-row items-start px-4 py-3 border-b border-gray-50 ${isRead ? 'bg-white' : 'bg-sky-50'}`}
                activeOpacity={0.7}
              >
                {/* 아이콘 */}
                <View className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Text>{NOTIF_ICONS[notif.type] ?? '📢'}</Text>
                </View>

                {/* 내용 */}
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">
                    {NOTIF_LABELS[notif.type] ?? notif.type}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {formatRelative(notif.createdAt)}
                  </Text>
                </View>

                {/* 읽지 않은 점 */}
                {!isRead && (
                  <View className="w-2 h-2 bg-sky-500 rounded-full mt-2" />
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
