import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createRoom, joinRoomByCode } from '../../lib/firestore/rooms';
import { useAuthStore, useRoomStore } from '../../store';
import { Input, Button } from '../../components/common/ui';

type Mode = 'choose' | 'create' | 'join';

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setCurrentRoom } = useRoomStore();
  const [mode, setMode]       = useState<Mode>('choose');
  const [roomName, setRoomName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleCreate() {
    if (!roomName.trim()) { Alert.alert('룸 이름을 입력해주세요.'); return; }
    setLoading(true);
    try {
      const room = await createRoom(user!.uid, roomName.trim());
      setCurrentRoom(room);
      Alert.alert('룸 생성 완료!', `초대코드: ${room.inviteCodeHash}`, [
        { text: '확인', onPress: () => router.replace('/main/home') },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!inviteCode.trim()) { Alert.alert('초대코드를 입력해주세요.'); return; }
    setLoading(true);
    try {
      const nickname = user?.displayName ?? '사용자';
      const room = await joinRoomByCode(inviteCode.trim().toUpperCase(), user!.uid, nickname);
      setCurrentRoom(room);
      router.replace('/main/home');
    } catch (e: any) {
      Alert.alert('참여 실패', e.message);
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'choose') {
    return (
      <View className="flex-1 bg-white px-6 justify-center">
        <View className="items-center mb-12">
          <Text className="text-4xl mb-3">🏠</Text>
          <Text className="text-2xl font-bold text-gray-900">룸 설정</Text>
          <Text className="text-sm text-gray-400 mt-2 text-center">
            새 룸을 만들거나{'\n'}초대코드로 기존 룸에 참여하세요
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setMode('create')}
          className="bg-sky-500 rounded-2xl p-5 mb-3 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-2xl mb-1">🏗️</Text>
          <Text className="text-white font-bold text-base">새 룸 만들기</Text>
          <Text className="text-sky-100 text-sm mt-1">초대코드를 생성하고 룸을 운영해요</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode('join')}
          className="bg-gray-100 rounded-2xl p-5 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-2xl mb-1">🔑</Text>
          <Text className="text-gray-800 font-bold text-base">초대코드로 참여</Text>
          <Text className="text-gray-400 text-sm mt-1">룸장에게 초대코드를 받아 참여해요</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mode === 'create') {
    return (
      <View className="flex-1 bg-white px-6 justify-center">
        <TouchableOpacity onPress={() => setMode('choose')} className="absolute top-14 left-6">
          <Text className="text-sky-500 text-base">← 뒤로</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 mb-1">새 룸 만들기</Text>
        <Text className="text-sm text-gray-400 mb-8">룸 이름을 입력하면 초대코드가 자동 생성됩니다</Text>
        <Input label="룸 이름" value={roomName} onChangeText={setRoomName} placeholder="예) 302호 하우스" />
        <Button title="룸 생성하기" onPress={handleCreate} loading={loading} className="mt-2" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <TouchableOpacity onPress={() => setMode('choose')} className="absolute top-14 left-6">
        <Text className="text-sky-500 text-base">← 뒤로</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-gray-900 mb-1">초대코드로 참여</Text>
      <Text className="text-sm text-gray-400 mb-8">룸장에게 받은 6자리 코드를 입력하세요</Text>
      <Input
        label="초대코드"
        value={inviteCode}
        onChangeText={setInviteCode}
        placeholder="ABC123"
        autoCapitalize="characters"
      />
      <Button title="참여하기" onPress={handleJoin} loading={loading} className="mt-2" />
    </View>
  );
}
