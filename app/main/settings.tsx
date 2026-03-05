import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoomStore, useAuthStore } from '../../store';
import { logOut } from '../../hooks/useAuth';
import { regenerateInviteCode, updateRoomSettings } from '../../lib/firestore/rooms';
import { Input, Button, Card, SectionHeader } from '../../components/common/ui';

export default function SettingsScreen() {
  const router = useRouter();
  const { currentRoom, members, setCurrentRoom } = useRoomStore();
  const { user } = useAuthStore();

  const myRole = members.find((m) => m.userId === user?.uid)?.role;
  const isAdmin = myRole === 'OWNER' || myRole === 'ADMIN';

  const [inviteCode, setInviteCode] = useState(currentRoom?.inviteCodeHash ?? '');

  async function handleRegenerateCode() {
    if (!currentRoom) return;
    Alert.alert('초대코드 재발급', '기존 코드는 더 이상 사용할 수 없습니다. 계속할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '재발급',
        onPress: async () => {
          const newCode = await regenerateInviteCode(currentRoom.id);
          setInviteCode(newCode);
          Alert.alert('새 초대코드', newCode);
        },
      },
    ]);
  }

  async function handleLogout() {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          setCurrentRoom(null);
          await logOut();
          router.replace('/auth/login');
        },
      },
    ]);
  }

  async function handleLeaveRoom() {
    Alert.alert('룸 나가기', '정말 이 룸을 떠나시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => {
          setCurrentRoom(null);
          router.replace('/auth/onboarding');
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-white pt-14 pb-3 px-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">설정</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* 룸 정보 */}
        <SectionHeader title="룸 정보" />
        <Card className="p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-3">🏠</Text>
            <View>
              <Text className="text-base font-bold text-gray-900">{currentRoom?.name}</Text>
              <Text className="text-xs text-gray-400">{members.length}명의 멤버</Text>
            </View>
          </View>

          <View className="bg-gray-50 rounded-xl p-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-400 mb-0.5">초대코드</Text>
              <Text className="text-lg font-bold text-gray-900 tracking-widest">{inviteCode}</Text>
            </View>
            {isAdmin && (
              <TouchableOpacity onPress={handleRegenerateCode} className="bg-sky-100 rounded-lg px-3 py-1.5">
                <Text className="text-xs text-sky-600 font-semibold">재발급</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* 멤버 목록 */}
        <SectionHeader title={`멤버 (${members.length})`} />
        <Card className="mb-4 overflow-hidden">
          {members.map((m, i) => (
            <View key={m.userId}>
              {i > 0 && <View className="h-px bg-gray-50 mx-4" />}
              <View className="flex-row items-center px-4 py-3">
                <View className="w-9 h-9 bg-sky-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-sm font-bold text-sky-600">
                    {(m.nickname || m.userId)[0].toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">
                    {m.nickname || m.userId.slice(0, 8)}
                    {m.userId === user?.uid ? ' (나)' : ''}
                  </Text>
                </View>
                <View className={`rounded-full px-2 py-0.5 ${
                  m.role === 'OWNER' ? 'bg-amber-100' :
                  m.role === 'ADMIN' ? 'bg-sky-100' : 'bg-gray-100'
                }`}>
                  <Text className={`text-[10px] font-medium ${
                    m.role === 'OWNER' ? 'text-amber-700' :
                    m.role === 'ADMIN' ? 'text-sky-700' : 'text-gray-500'
                  }`}>
                    {m.role === 'OWNER' ? '👑 Owner' : m.role === 'ADMIN' ? 'Admin' : 'Member'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* 내 계정 */}
        <SectionHeader title="내 계정" />
        <Card className="mb-4 overflow-hidden">
          <View className="px-4 py-3 flex-row items-center">
            <Text className="text-sm text-gray-600 flex-1">{user?.email}</Text>
          </View>
        </Card>

        {/* 액션 버튼 */}
        <Button title="룸 나가기" onPress={handleLeaveRoom} variant="ghost" className="mb-3" />
        <Button title="로그아웃" onPress={handleLogout} variant="danger" />

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
