import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useMealStore } from '../../store';
import { subscribeMealSchedule, subscribeMealMenu } from '../../lib/firestore/meal';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function koreanDate(dateStr: string) {
  const [y, m, day] = dateStr.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(day)}일`;
}

export default function MealScreen() {
  const { schedule, todayMenu, setSchedule, setTodayMenu } = useMealStore();
  const [showPdf, setShowPdf] = useState(false);

  const today = todayStr();
  const month = currentMonth();

  useEffect(() => {
    const unsub1 = subscribeMealSchedule(month, setSchedule);
    const unsub2 = subscribeMealMenu(today, setTodayMenu);
    return () => { unsub1(); unsub2(); };
  }, [today, month]);

  return (
    <View className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-white pt-14 pb-4 px-4 border-b border-gray-100">
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-xl font-bold text-gray-900">오늘의 급식</Text>
            <Text className="text-xs text-gray-400 mt-0.5">{koreanDate(today)}</Text>
          </View>
          {schedule?.pdfUrl && (
            <TouchableOpacity
              onPress={() => setShowPdf(true)}
              className="bg-sky-50 rounded-xl px-3 py-2"
            >
              <Text className="text-xs font-semibold text-sky-600">📄 {month} 식단표</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-4">
          <Text className="text-sm font-bold text-gray-800 mb-3">오늘의 메뉴</Text>
          {todayMenu && todayMenu.items.length > 0 ? (
            todayMenu.items.map((item) => (
              <View
                key={item}
                className="py-2.5 px-3 rounded-xl mb-1 bg-gray-50"
              >
                <Text className="text-sm text-gray-800">{item}</Text>
              </View>
            ))
          ) : (
            <View className="items-center py-8">
              <Text className="text-3xl mb-2">🍱</Text>
              <Text className="text-sm text-gray-400">오늘 메뉴가 아직 등록되지 않았어요</Text>
            </View>
          )}
        </View>
        <View className="h-6" />
      </ScrollView>

      {/* PDF 뷰어 모달 */}
      <Modal visible={showPdf} animationType="slide">
        <View className="flex-1 bg-black">
          <View className="flex-row items-center justify-between px-4 pt-14 pb-3 bg-gray-900">
            <Text className="text-white font-semibold">{month} 급식 식단표</Text>
            <TouchableOpacity onPress={() => setShowPdf(false)}>
              <Text className="text-sky-400 font-medium">닫기</Text>
            </TouchableOpacity>
          </View>
          {schedule?.pdfUrl && (
            <WebView
              source={{
                uri: `https://docs.google.com/viewer?url=${encodeURIComponent(schedule.pdfUrl)}&embedded=true`,
              }}
              style={{ flex: 1 }}
              startInLoadingState
              renderLoading={() => (
                <View className="flex-1 items-center justify-center bg-white">
                  <ActivityIndicator size="large" color="#0ea5e9" />
                  <Text className="text-sm text-gray-500 mt-2">PDF 불러오는 중...</Text>
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
