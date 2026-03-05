import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { saveMealMenu, uploadMealPdf } from '../../lib/firestore/meal';

const ADMIN_PIN = '1234'; // 원하는 PIN으로 변경하세요

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── PIN 화면 ─────────────────────────────────────────────────
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

// ─── 관리자 패널 ──────────────────────────────────────────────
function AdminPanel({ onLock }: { onLock: () => void }) {
  const [date, setDate] = useState(todayStr());
  const [menuInput, setMenuInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  async function handleUploadPdf() {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (res.canceled || !res.assets?.[0]) return;
    const file = res.assets[0];
    const month = currentMonth();
    setUploading(true);
    setUploadProgress(0);
    try {
      await uploadMealPdf(month, file.uri, file.name ?? 'schedule.pdf', setUploadProgress);
      Alert.alert('완료', `${month} 식단표 PDF가 등록됐어요`);
    } catch {
      Alert.alert('오류', 'PDF 업로드에 실패했어요');
    } finally {
      setUploading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
        {/* 헤더 */}
        <View className="bg-white pt-14 pb-4 px-4 border-b border-gray-100 flex-row items-end justify-between">
          <View>
            <Text className="text-xl font-bold text-gray-900">관리자</Text>
            <Text className="text-xs text-gray-400 mt-0.5">급식 정보를 관리해요</Text>
          </View>
          <TouchableOpacity onPress={onLock} className="bg-gray-100 rounded-xl px-3 py-1.5">
            <Text className="text-xs text-gray-500 font-medium">잠금</Text>
          </TouchableOpacity>
        </View>

        {/* 메뉴 입력 */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-4">
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
            style={{ minHeight: 160, textAlignVertical: 'top' }}
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

        {/* PDF 업로드 */}
        <View className="mx-4 mt-4 mb-8 bg-white rounded-2xl border border-gray-100 p-4">
          <Text className="text-sm font-bold text-gray-800 mb-1">📄 이번 달 식단표 PDF</Text>
          <Text className="text-xs text-gray-400 mb-3">{currentMonth()} 식단표를 업로드하면 사용자가 볼 수 있어요</Text>
          <TouchableOpacity
            onPress={handleUploadPdf}
            disabled={uploading}
            className="bg-gray-100 rounded-2xl py-3 items-center"
          >
            {uploading
              ? <Text className="text-gray-600 font-medium">업로드 중 {Math.round(uploadProgress * 100)}%</Text>
              : <Text className="text-gray-700 font-medium">📤 PDF 선택 및 업로드</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────
export default function AdminScreen() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />;
  return <AdminPanel onLock={() => setUnlocked(false)} />;
}
