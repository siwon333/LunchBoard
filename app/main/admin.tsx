import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { saveMealMenu } from '../../lib/firestore/meal';

const ADMIN_PIN = '1234'; // 원하는 PIN으로 변경하세요

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');

  function handleConfirm() {
    if (pin === ADMIN_PIN) {
      onUnlock();
    } else {
      Alert.alert('PIN이 틀렸습니다');
      setPin('');
    }
  }

  return (
    <View className="flex-1 bg-gray-50 items-center justify-center px-8">
      <Text className="text-3xl mb-2">🔒</Text>
      <Text className="text-lg font-bold text-gray-800 mb-1">관리자 전용</Text>
      <Text className="text-sm text-gray-400 mb-8">PIN을 입력하세요</Text>
      <TextInput
        value={pin}
        onChangeText={setPin}
        placeholder="PIN"
        placeholderTextColor="#9ca3af"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={8}
        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-center text-xl tracking-widest text-gray-900 mb-4"
      />
      <TouchableOpacity
        onPress={handleConfirm}
        className="w-full bg-sky-500 rounded-2xl py-3 items-center"
      >
        <Text className="text-white font-semibold text-base">입장</Text>
      </TouchableOpacity>
    </View>
  );
}

function AdminPanel({ onLock }: { onLock: () => void }) {
  const [date, setDate] = useState(todayStr());
  const [menuInput, setMenuInput] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSaveMenu() {
    const items = menuInput.split('\n').map((s) => s.trim()).filter(Boolean);
    if (items.length === 0) { Alert.alert('메뉴를 입력해주세요'); return; }
    setSaving(true);
    try {
      await saveMealMenu(date, items);
      Alert.alert('저장 완료', `${date} 메뉴가 저장됐어요`);
    } catch {
      Alert.alert('오류', '저장에 실패했어요');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
        <View className="bg-white pt-14 pb-4 px-4 border-b border-gray-100 flex-row items-end justify-between">
          <View>
            <Text className="text-xl font-bold text-gray-900">관리자</Text>
            <Text className="text-xs text-gray-400 mt-0.5">급식 메뉴를 등록해요</Text>
          </View>
          <TouchableOpacity onPress={onLock} className="bg-gray-100 rounded-xl px-3 py-1.5">
            <Text className="text-xs text-gray-500 font-medium">잠금</Text>
          </TouchableOpacity>
        </View>

        <View className="mx-4 mt-4 mb-8 bg-white rounded-2xl border border-gray-100 p-4">
          <Text className="text-sm font-bold text-gray-800 mb-3">📝 메뉴 입력</Text>
          <Text className="text-xs text-gray-500 mb-1">날짜</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 mb-3"
          />
          <Text className="text-xs text-gray-500 mb-1">메뉴 (한 줄에 하나씩)</Text>
          <TextInput
            value={menuInput}
            onChangeText={setMenuInput}
            placeholder={'밥\n된장찌개\n김치\n불고기'}
            placeholderTextColor="#9ca3af"
            multiline
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 mb-4"
            style={{ minHeight: 200, textAlignVertical: 'top' }}
          />
          <TouchableOpacity
            onPress={handleSaveMenu}
            disabled={saving}
            className="bg-sky-500 rounded-2xl py-3 items-center"
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-white font-semibold">저장</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function AdminScreen() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />;
  return <AdminPanel onLock={() => setUnlocked(false)} />;
}
