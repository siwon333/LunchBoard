import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useMealStore } from '../../store';
import { subscribeMealMenu } from '../../lib/firestore/meal';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function koreanDate(dateStr: string) {
  const [y, m, day] = dateStr.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(day)}일`;
}

export default function MealScreen() {
  const { todayMenu, setTodayMenu } = useMealStore();
  const today = todayStr();

  useEffect(() => {
    return subscribeMealMenu(today, setTodayMenu);
  }, [today]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">오늘의 급식</Text>
        <Text className="text-xs text-gray-400 mt-0.5">{koreanDate(today)}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-4">
          <Text className="text-sm font-bold text-gray-800 mb-3">오늘의 메뉴</Text>
          {todayMenu && todayMenu.items.length > 0 ? (
            todayMenu.items.map((item) => (
              <View key={item} className="py-2.5 px-3 rounded-xl mb-1 bg-gray-50">
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
    </View>
  );
}
