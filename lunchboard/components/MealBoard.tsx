'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MealSchedule, MealMenu, MealReview,
  subscribeMealSchedule, subscribeMealMenu, subscribeMealReviews,
  savePdfUrl, saveMealMenu, saveMealReview,
} from '@/lib/meal';
import StarRating from './StarRating';
import MenuItem from './MenuItem';
import PdfModal from './PdfModal';
import ReviewModal from './ReviewModal';
import MenuEditModal from './MenuEditModal';

// ─── 날짜 헬퍼 ───────────────────────────────────────────────
function todayStr() {
  const d = new Date();
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}
function koreanDate(s: string) {
  const [y, m, day] = s.split('-');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const d = new Date(`${s}T00:00:00+09:00`);
  return `${y}년 ${parseInt(m)}월 ${parseInt(day)}일 (${days[d.getDay()]})`;
}

function avg(reviews: MealReview[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
}

function buildStarCounts(reviews: MealReview[], items: string[]) {
  const counts: Record<string, number> = {};
  items.forEach((item) => { counts[item] = 0; });
  reviews.forEach((r) => r.favoriteItems.forEach((item) => {
    if (counts[item] !== undefined) counts[item]++;
  }));
  return counts;
}

// 각 메뉴를 좋아하는 사람들의 닉네임 목록
function buildFansMap(reviews: MealReview[], items: string[]): Record<string, string[]> {
  const fans: Record<string, string[]> = {};
  items.forEach((item) => { fans[item] = []; });
  reviews.forEach((r) => r.favoriteItems.forEach((item) => {
    if (fans[item] !== undefined) fans[item].push(r.nickname);
  }));
  return fans;
}

function useNickname() {
  const [nickname, setNicknameState] = useState('');
  useEffect(() => {
    setNicknameState(localStorage.getItem('meal_nickname') ?? '');
  }, []);
  function setNickname(v: string) {
    localStorage.setItem('meal_nickname', v);
    setNicknameState(v);
  }
  const userId = (() => {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('meal_uid');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('meal_uid', id); }
    return id;
  })();
  return { nickname, setNickname, userId };
}

export default function MealBoard({ isAdmin }: { isAdmin: boolean }) {
  const today = todayStr();
  const { nickname, setNickname, userId } = useNickname();

  // ── 날짜 상태 (오늘 기본값) ──────────────────────────────
  const [selectedDate, setSelectedDate] = useState(today);
  const selectedMonth = selectedDate.slice(0, 7);
  const isToday = selectedDate === today;

  // ── 개인 즐겨찾기 (형광펜) ──────────────────────────────
  const [myFavorites, setMyFavorites] = useState<string[]>([]);

  const [schedule, setSchedule] = useState<MealSchedule | null>(null);
  const [menu, setMenu] = useState<MealMenu | null>(null);
  const [reviews, setReviews] = useState<MealReview[]>([]);

  const [showPdf, setShowPdf] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showMenuEdit, setShowMenuEdit] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [nickEdit, setNickEdit] = useState(false);
  const [nickInput, setNickInput] = useState('');

  const dateInputRef = useRef<HTMLInputElement>(null);

  // 개인 즐겨찾기 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('meal_favorites');
      if (saved) setMyFavorites(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // 날짜가 바뀌면 해당 날짜 데이터 구독
  useEffect(() => {
    setMenu(null);
    setReviews([]);
    const u1 = subscribeMealSchedule(selectedMonth, setSchedule);
    const u2 = subscribeMealMenu(selectedDate, setMenu);
    const u3 = subscribeMealReviews(selectedDate, setReviews);
    return () => { u1(); u2(); u3(); };
  }, [selectedDate, selectedMonth]);

  // ── 개인 즐겨찾기 토글 ──────────────────────────────────
  function toggleMyFavorite(item: string) {
    setMyFavorites((prev) => {
      const next = prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item];
      localStorage.setItem('meal_favorites', JSON.stringify(next));
      return next;
    });
  }

  // ── 날짜 이동 ────────────────────────────────────────────
  function navigateDate(delta: number) {
    const d = new Date(`${selectedDate}T00:00:00+09:00`);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  function openDatePicker() {
    const input = dateInputRef.current;
    if (!input) return;
    try {
      (input as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
    } catch {
      input.click();
    }
  }

  const myReview = reviews.find((r) => r.userId === userId) ?? null;
  const average = avg(reviews);
  const starCounts = buildStarCounts(reviews, menu?.items ?? []);
  const fansMap = buildFansMap(reviews, menu?.items ?? []);
  const sortedItems = [...(menu?.items ?? [])].sort(
    (a, b) => (starCounts[b] ?? 0) - (starCounts[a] ?? 0),
  );

  // ── PDF URL 저장 ───────────────────────────────────────────
  async function handleSaveUrl() {
    const url = urlInput.trim();
    if (!url) return;
    const converted = convertGoogleDriveUrl(url);
    await savePdfUrl(selectedMonth, converted);
    setShowUrlInput(false);
    setUrlInput('');
    alert(`${selectedMonth} 식단표 링크가 등록됐어요!`);
  }

  function convertGoogleDriveUrl(url: string): string {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  }

  // ── 평가 저장 ──────────────────────────────────────────────
  async function handleSaveReview(stars: number, comment: string, favoriteItems: string[]) {
    if (!nickname) { alert('닉네임을 먼저 설정해주세요'); return; }
    await saveMealReview(selectedDate, userId, { userId, nickname, stars, comment, favoriteItems });
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      {/* ── 헤더 + 날짜 네비게이션 ───────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        {/* 날짜 이동 바 */}
        <div className="flex items-center gap-1 mb-3">
          <button
            onClick={() => navigateDate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl font-bold transition-colors flex-shrink-0"
            title="이전 날"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={openDatePicker}
            className="flex-1 text-center text-xs text-gray-400 hover:text-sky-500 font-medium transition-colors flex items-center justify-center gap-1"
          >
            {koreanDate(selectedDate)}
            <span className="opacity-50">📅</span>
          </button>
          {/* 숨겨진 날짜 입력 */}
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="sr-only"
          />
          <button
            onClick={() => navigateDate(1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl font-bold transition-colors flex-shrink-0"
            title="다음 날"
          >
            ›
          </button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isToday ? '🍱 오늘의 급식' : '🍱 급식 메뉴'}
            </h1>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(today)}
                className="text-xs text-sky-500 hover:text-sky-700 font-medium mt-0.5"
              >
                오늘로 돌아가기 →
              </button>
            )}
          </div>
          {schedule && (
            <button
              onClick={() => setShowPdf(true)}
              className="text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              📄 {selectedMonth} 식단표
            </button>
          )}
        </div>
        {reviews.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-amber-400">★</span>
            <span className="font-bold text-gray-800">{average.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({reviews.length}명 평가)</span>
          </div>
        )}
      </div>

      {/* ── 닉네임 설정 ──────────────────────────────────── */}
      {!nickname || nickEdit ? (
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {nickEdit ? '닉네임 변경' : '닉네임을 설정하면 평가와 댓글에 이름이 표시돼요'}
          </p>
          <div className="flex gap-2">
            <input
              value={nickInput}
              onChange={(e) => setNickInput(e.target.value)}
              placeholder="닉네임 입력"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && nickInput.trim()) {
                  setNickname(nickInput.trim());
                  setNickEdit(false);
                }
              }}
            />
            <button
              onClick={() => { if (!nickInput.trim()) return; setNickname(nickInput.trim()); setNickEdit(false); }}
              className="bg-sky-500 text-white text-sm font-semibold px-4 rounded-xl hover:bg-sky-600"
            >
              확인
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-500">반갑습니다, <strong>{nickname}</strong>님!</span>
          <button
            onClick={() => { setNickInput(nickname); setNickEdit(true); }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            닉네임 변경
          </button>
        </div>
      )}

      {/* ── 오늘 메뉴 ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-gray-800 text-sm">메뉴</h2>
            {myFavorites.some((f) => sortedItems.includes(f)) && (
              <p className="text-xs text-yellow-600 mt-0.5">♥ 내가 좋아하는 메뉴가 포함돼 있어요!</p>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowMenuEdit(true)}
              className="text-xs text-sky-500 font-medium hover:text-sky-700"
            >
              메뉴 입력
            </button>
          )}
        </div>
        {sortedItems.length > 0 ? (
          <>
            {sortedItems.map((item) => (
              <MenuItem
                key={item}
                name={item}
                starred={(starCounts[item] ?? 0) > 0}
                onToggle={() => {}}
                readonly
                starCount={starCounts[item]}
                highlighted={myFavorites.includes(item)}
                onHighlight={() => toggleMyFavorite(item)}
                fans={fansMap[item]}
              />
            ))}
            <p className="text-xs text-gray-400 text-center mt-2">
              ♡ 눌러 즐겨찾기 · 다음에 같은 메뉴가 나와도 자동으로 표시돼요
            </p>
          </>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">🍽️</p>
            <p className="text-sm">아직 메뉴가 등록되지 않았어요</p>
          </div>
        )}
      </div>

      {/* ── 관리자: PDF 링크 등록 ─────────────────────────── */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 text-sm mb-3">관리자 · 식단표 관리</h2>

          {showUrlInput ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                구글 드라이브 공유 링크 또는 PDF 직접 링크를 붙여넣으세요
              </p>
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveUrl}
                  className="flex-1 bg-sky-500 text-white text-sm font-semibold py-2 rounded-xl hover:bg-sky-600"
                >
                  등록
                </button>
                <button
                  onClick={() => setShowUrlInput(false)}
                  className="flex-1 bg-gray-100 text-gray-600 text-sm font-semibold py-2 rounded-xl hover:bg-gray-200"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setUrlInput(schedule?.pdfUrl ?? ''); setShowUrlInput(true); }}
              className="w-full bg-gray-50 border border-gray-200 hover:border-sky-300 hover:bg-sky-50 rounded-xl py-3 text-sm font-semibold text-gray-600 transition-colors"
            >
              🔗 {selectedMonth} 식단표 링크 {schedule ? '변경' : '등록'}
            </button>
          )}

          <p className="text-xs text-gray-400 mt-2">
            구글 드라이브에 PDF 올리고 &quot;링크 있는 모든 사용자&quot;로 공유 후 링크 붙여넣기
          </p>
        </div>
      )}

      {/* ── 평가 버튼 ─────────────────────────────────────── */}
      <button
        onClick={() => {
          if (!nickname) { alert('닉네임을 먼저 설정해주세요'); return; }
          setShowReview(true);
        }}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-2xl text-sm shadow-sm transition-colors"
      >
        {myReview ? '⭐ 내 평가 수정하기' : '⭐ 이 날 급식 평가하기'}
      </button>

      {/* ── 리뷰 목록 ─────────────────────────────────────── */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 text-sm mb-3">모두의 한마디</h2>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.userId} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-800">{r.nickname}</span>
                  <StarRating value={r.stars} size={14} />
                </div>
                {r.favoriteItems.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {r.favoriteItems.map((item) => (
                      <span key={item} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        ★ {item}
                      </span>
                    ))}
                  </div>
                )}
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 모달들 ─────────────────────────────────────────── */}
      {showPdf && schedule && (
        <PdfModal pdfUrl={schedule.pdfUrl} month={selectedMonth} onClose={() => setShowPdf(false)} />
      )}
      {showReview && (
        <ReviewModal
          date={selectedDate}
          menu={menu}
          existing={myReview}
          onSave={handleSaveReview}
          onClose={() => setShowReview(false)}
        />
      )}
      {showMenuEdit && (
        <MenuEditModal
          initialItems={menu?.items ?? []}
          onSave={(items) => saveMealMenu(selectedDate, items)}
          onClose={() => setShowMenuEdit(false)}
        />
      )}
    </div>
  );
}
