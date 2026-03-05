import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { WebView } from 'react-native-webview';
import { useRoomStore, useAuthStore, useMealStore } from '../../store';
import { Card, Button, EmptyState } from '../../components/common/ui';
import {
  uploadMealSchedulePdf,
  subscribeMealSchedule,
  subscribeMealMenu,
  subscribeMealReviews,
  saveMealMenu,
  saveMealReview,
} from '../../lib/firestore/meal';
import { MealReview } from '../../types';

// ─── 날짜 helpers ─────────────────────────────────────────────
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

// ─── 별점 컴포넌트 ────────────────────────────────────────────
function StarRating({
  value, onChange, size = 28,
}: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity
          key={s}
          onPress={() => onChange?.(s)}
          disabled={!onChange}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: size, color: s <= value ? '#f59e0b' : '#d1d5db' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── 메뉴 아이템 (별표 가능) ──────────────────────────────────
function MenuItem({
  name, starred, onToggle,
}: { name: string; starred: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      className="flex-row items-center py-2 px-3 rounded-xl mb-1"
      style={{ backgroundColor: starred ? '#fef3c7' : '#f9fafb' }}
    >
      <Text style={{ fontSize: 18, color: starred ? '#f59e0b' : '#d1d5db', marginRight: 8 }}>★</Text>
      <Text
        className="flex-1 text-sm"
        style={{ color: starred ? '#92400e' : '#374151', fontWeight: starred ? '600' : '400' }}
      >
        {name}
      </Text>
      {starred && <Text className="text-xs text-amber-500 font-medium">맛있어요!</Text>}
    </TouchableOpacity>
  );
}

// ─── 리뷰 카드 ───────────────────────────────────────────────
function ReviewCard({ review }: { review: MealReview }) {
  return (
    <View className="py-3 border-b border-gray-50">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-semibold text-gray-800">{review.nickname}</Text>
        <StarRating value={review.stars} size={14} />
      </View>
      {review.favoriteItems.length > 0 && (
        <View className="flex-row flex-wrap gap-1 mb-1">
          {review.favoriteItems.map((item) => (
            <View key={item} className="bg-amber-50 rounded-full px-2 py-0.5">
              <Text className="text-xs text-amber-700">★ {item}</Text>
            </View>
          ))}
        </View>
      )}
      {review.comment !== '' && (
        <Text className="text-sm text-gray-600">{review.comment}</Text>
      )}
    </View>
  );
}

// ─── 메인 화면 ───────────────────────────────────────────────
export default function MealScreen() {
  const { currentRoom, members } = useRoomStore();
  const { user } = useAuthStore();
  const { schedule, todayMenu, todayReviews, setSchedule, setTodayMenu, setTodayReviews } = useMealStore();

  const today = todayStr();
  const month = currentMonth();

  // 내 리뷰
  const myReview = todayReviews.find((r) => r.userId === user?.uid);

  // PDF 뷰어
  const [showPdf, setShowPdf] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 메뉴 입력 모달
  const [showMenuEdit, setShowMenuEdit] = useState(false);
  const [menuInput, setMenuInput] = useState('');

  // 평가 모달
  const [showReview, setShowReview] = useState(false);
  const [stars, setStars] = useState(myReview?.stars ?? 0);
  const [comment, setComment] = useState(myReview?.comment ?? '');
  const [favItems, setFavItems] = useState<string[]>(myReview?.favoriteItems ?? []);
  const [saving, setSaving] = useState(false);

  const isAdmin = members.find((m) => m.userId === user?.uid)?.role !== 'MEMBER';

  // Firestore 구독
  useEffect(() => {
    if (!currentRoom) return;
    const unsub1 = subscribeMealSchedule(currentRoom.id, month, setSchedule);
    const unsub2 = subscribeMealMenu(currentRoom.id, today, setTodayMenu);
    const unsub3 = subscribeMealReviews(currentRoom.id, today, setTodayReviews);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [currentRoom?.id, today, month]);

  // 내 리뷰가 바뀌면 폼 동기화
  useEffect(() => {
    if (myReview) {
      setStars(myReview.stars);
      setComment(myReview.comment);
      setFavItems(myReview.favoriteItems);
    }
  }, [myReview]);

  // ── PDF 업로드 ──────────────────────────────────────────────
  async function handleUploadPdf() {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (res.canceled || !res.assets?.[0]) return;
    if (!currentRoom || !user) return;

    const file = res.assets[0];
    setUploading(true);
    setUploadProgress(0);
    try {
      await uploadMealSchedulePdf(
        currentRoom.id, month,
        file.uri, file.name ?? 'schedule.pdf',
        user.uid,
        (pct) => setUploadProgress(pct),
      );
      Alert.alert('완료', `${month} 급식 식단표가 등록됐어요!`);
    } catch (e) {
      Alert.alert('오류', 'PDF 업로드에 실패했어요.');
    } finally {
      setUploading(false);
    }
  }

  // ── 메뉴 저장 ───────────────────────────────────────────────
  async function handleSaveMenu() {
    if (!currentRoom || !user) return;
    const items = menuInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) return;
    await saveMealMenu(currentRoom.id, today, items, user.uid);
    setShowMenuEdit(false);
  }

  // ── 평가 저장 ───────────────────────────────────────────────
  async function handleSaveReview() {
    if (!currentRoom || !user || stars === 0) {
      Alert.alert('별점을 선택해주세요');
      return;
    }
    const nickname = members.find((m) => m.userId === user.uid)?.nickname ?? user.displayName;
    setSaving(true);
    try {
      await saveMealReview(currentRoom.id, today, user.uid, nickname, stars, comment, favItems);
      setShowReview(false);
    } catch {
      Alert.alert('오류', '저장에 실패했어요.');
    } finally {
      setSaving(false);
    }
  }

  // ── 별표 토글 ───────────────────────────────────────────────
  function toggleFav(item: string) {
    setFavItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  }

  // ── 평균 별점 ───────────────────────────────────────────────
  const avgStars =
    todayReviews.length > 0
      ? todayReviews.reduce((s, r) => s + r.stars, 0) / todayReviews.length
      : 0;

  return (
    <View className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-white pt-14 pb-4 px-4 border-b border-gray-100">
        <Text className="text-xs text-gray-400">{currentRoom?.name ?? ''}</Text>
        <View className="flex-row items-end justify-between mt-0.5">
          <View>
            <Text className="text-xl font-bold text-gray-900">오늘의 급식</Text>
            <Text className="text-xs text-gray-400 mt-0.5">{koreanDate(today)}</Text>
          </View>
          {/* PDF 뷰어 버튼 */}
          {schedule && (
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
        {/* PDF 업로드 카드 (관리자만) */}
        {isAdmin && (
          <Card className="mx-4 mt-4 p-4">
            <Text className="text-xs font-semibold text-gray-500 mb-3">관리자 · 식단표 관리</Text>
            <View className="flex-row gap-2">
              <Button
                title={uploading ? `업로드 중 ${Math.round(uploadProgress * 100)}%` : '📤 PDF 등록'}
                onPress={handleUploadPdf}
                variant="secondary"
                loading={uploading}
                className="flex-1"
              />
              <Button
                title="🍽️ 메뉴 입력"
                onPress={() => {
                  setMenuInput(todayMenu?.items.join('\n') ?? '');
                  setShowMenuEdit(true);
                }}
                variant="secondary"
                className="flex-1"
              />
            </View>
          </Card>
        )}

        {/* 오늘의 메뉴 */}
        <Card className="mx-4 mt-4 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-bold text-gray-800">오늘의 메뉴</Text>
            {todayReviews.length > 0 && (
              <View className="flex-row items-center">
                <Text className="text-amber-400 text-sm mr-1">★</Text>
                <Text className="text-sm font-semibold text-gray-700">
                  {avgStars.toFixed(1)}
                </Text>
                <Text className="text-xs text-gray-400 ml-1">({todayReviews.length}명)</Text>
              </View>
            )}
          </View>

          {todayMenu && todayMenu.items.length > 0 ? (
            <View>
              {todayMenu.items.map((item) => (
                <MenuItem
                  key={item}
                  name={item}
                  starred={favItems.includes(item)}
                  onToggle={() => toggleFav(item)}
                />
              ))}
              <Text className="text-xs text-gray-400 mt-2 text-center">
                별표 누르면 평가에 반영돼요
              </Text>
            </View>
          ) : (
            <EmptyState icon="🍱" message="오늘 메뉴가 아직 등록되지 않았어요" />
          )}
        </Card>

        {/* 평가 버튼 */}
        <View className="mx-4 mt-3">
          <Button
            title={myReview ? '⭐ 내 평가 수정하기' : '⭐ 오늘 급식 평가하기'}
            onPress={() => setShowReview(true)}
            variant="primary"
          />
        </View>

        {/* 리뷰 목록 */}
        {todayReviews.length > 0 && (
          <Card className="mx-4 mt-4 mb-6 px-4 pt-4 pb-2">
            <Text className="text-sm font-bold text-gray-800 mb-1">룸메들의 한마디</Text>
            {todayReviews.map((r) => (
              <ReviewCard key={r.userId} review={r} />
            ))}
          </Card>
        )}

        <View className="h-6" />
      </ScrollView>

      {/* ── PDF WebView 모달 ─────────────────────────────────── */}
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

      {/* ── 메뉴 입력 모달 ──────────────────────────────────── */}
      <Modal visible={showMenuEdit} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
        >
          <View className="bg-white rounded-t-3xl px-4 pt-4 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-bold text-gray-900">오늘 메뉴 입력</Text>
              <TouchableOpacity onPress={() => setShowMenuEdit(false)}>
                <Text className="text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-gray-500 mb-2">한 줄에 메뉴 하나씩 입력하세요</Text>
            <TextInput
              value={menuInput}
              onChangeText={setMenuInput}
              placeholder={'밥\n된장찌개\n김치\n불고기'}
              placeholderTextColor="#9ca3af"
              multiline
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 mb-4"
              style={{ minHeight: 160, textAlignVertical: 'top' }}
            />
            <Button title="저장" onPress={handleSaveMenu} />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── 평가 모달 ────────────────────────────────────────── */}
      <Modal visible={showReview} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
        >
          <ScrollView
            className="bg-white rounded-t-3xl"
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-base font-bold text-gray-900">오늘 급식 평가</Text>
              <TouchableOpacity onPress={() => setShowReview(false)}>
                <Text className="text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            {/* 별점 */}
            <Text className="text-xs font-semibold text-gray-500 mb-2">전체 별점</Text>
            <View className="items-center mb-4">
              <StarRating value={stars} onChange={setStars} size={40} />
              <Text className="text-xs text-gray-400 mt-1">
                {['', '별로예요', '그냥저냥', '보통이에요', '맛있어요', '최고예요'][stars]}
              </Text>
            </View>

            {/* 메뉴 별 별표 */}
            {todayMenu && todayMenu.items.length > 0 && (
              <>
                <Text className="text-xs font-semibold text-gray-500 mb-2">
                  마음에 드는 메뉴에 별표 눌러줘요
                </Text>
                <View className="mb-4">
                  {todayMenu.items.map((item) => (
                    <MenuItem
                      key={item}
                      name={item}
                      starred={favItems.includes(item)}
                      onToggle={() => toggleFav(item)}
                    />
                  ))}
                </View>
              </>
            )}

            {/* 한줄평 */}
            <Text className="text-xs font-semibold text-gray-500 mb-2">한줄평 (선택)</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="오늘 급식 어땠어요?"
              placeholderTextColor="#9ca3af"
              multiline
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 mb-5"
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            <Button title="평가 저장" onPress={handleSaveReview} loading={saving} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
