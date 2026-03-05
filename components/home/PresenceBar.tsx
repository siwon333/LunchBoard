import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Presence, RoomMember, PresenceStatus } from '../../types';
import { PRESENCE_CONFIG } from '../../constants';
import { formatRelative } from '../../lib/utils';
import { updatePresence } from '../../lib/firestore/presence';
import { useAuthStore, useRoomStore } from '../../store';

interface PresenceBarProps {
  presences: Presence[];
  members: RoomMember[];
}

export function PresenceBar({ presences, members }: PresenceBarProps) {
  const { user } = useAuthStore();
  const { currentRoom } = useRoomStore();

  function getPresence(userId: string): Presence | undefined {
    return presences.find((p) => p.userId === userId);
  }

  if (members.length === 0) {
    return (
      <View className="items-center py-4">
        <Text className="text-sm text-gray-400">멤버가 없습니다</Text>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {members.map((member) => {
        const presence = getPresence(member.userId);
        const cfg = PRESENCE_CONFIG[presence?.status ?? 'OUT'];
        const isMe = member.userId === user?.uid;

        return (
          <View key={member.userId} className="items-center gap-1 min-w-[60px]">
            <TouchableOpacity
              style={{ backgroundColor: cfg.bg }}
              className="w-12 h-12 rounded-full items-center justify-center"
              onPress={() => {
                if (!isMe || !currentRoom) return;
                // Me → 상태 변경 (간단히 다음 상태로 순환)
              }}
              disabled={!isMe}
            >
              <Text className="text-xl">{cfg.emoji}</Text>
            </TouchableOpacity>
            <Text className="text-xs font-medium text-gray-700" numberOfLines={1}>
              {member.nickname || member.userId.slice(0, 4)}
            </Text>
            <Text className="text-[10px] text-gray-400">{cfg.label}</Text>
            {presence && (
              <Text className="text-[9px] text-gray-300">{formatRelative(presence.updatedAt)}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── PresenceSelector (내 상태 변경 모달용) ───────────────────
interface PresenceSelectorProps {
  currentStatus: PresenceStatus;
  onSelect: (status: PresenceStatus) => void;
}

export function PresenceSelector({ currentStatus, onSelect }: PresenceSelectorProps) {
  const statuses: PresenceStatus[] = ['HOME', 'OUT', 'COMING', 'TRIP'];
  return (
    <View className="flex-row justify-around py-2">
      {statuses.map((s) => {
        const cfg = PRESENCE_CONFIG[s];
        const active = s === currentStatus;
        return (
          <TouchableOpacity
            key={s}
            onPress={() => onSelect(s)}
            style={{ backgroundColor: active ? cfg.color : cfg.bg }}
            className="items-center rounded-xl px-3 py-2 gap-1"
          >
            <Text className="text-2xl">{cfg.emoji}</Text>
            <Text style={{ color: active ? '#fff' : cfg.color }} className="text-xs font-medium">
              {cfg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
