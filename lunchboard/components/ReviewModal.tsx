'use client';
import { useState } from 'react';
import StarRating from './StarRating';
import MenuItem from './MenuItem';
import { MealMenu, MealReview } from '@/lib/meal';

interface Props {
  date: string;
  menu: MealMenu | null;
  existing: MealReview | null;
  onSave: (stars: number, comment: string, favoriteItems: string[]) => Promise<void>;
  onClose: () => void;
}

const STAR_LABELS = ['', '별로예요', '그냥저냥', '보통이에요', '맛있어요', '최고예요!'];

function reviewTitle(date: string) {
  const today = (() => {
    const d = new Date();
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().slice(0, 10);
  })();
  if (date === today) return '오늘 급식 평가';
  const [, m, day] = date.split('-');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const d = new Date(`${date}T00:00:00+09:00`);
  return `${parseInt(m)}월 ${parseInt(day)}일(${days[d.getDay()]}) 급식 평가`;
}

export default function ReviewModal({ date, menu, existing, onSave, onClose }: Props) {
  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [favs, setFavs] = useState<string[]>(existing?.favoriteItems ?? []);
  const [saving, setSaving] = useState(false);

  function toggleFav(item: string) {
    setFavs((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]);
  }

  async function handleSave() {
    if (stars === 0) { alert('별점을 선택해주세요!'); return; }
    setSaving(true);
    try { await onSave(stars, comment, favs); onClose(); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 pb-8 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">{reviewTitle(date)}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        {/* 별점 */}
        <p className="text-xs font-semibold text-gray-500 mb-2">전체 별점</p>
        <div className="flex flex-col items-center mb-5">
          <StarRating value={stars} onChange={setStars} size={44} />
          <span className="text-xs text-gray-400 mt-1 h-4">{STAR_LABELS[stars]}</span>
        </div>

        {/* 메뉴별 별표 */}
        {menu && menu.items.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-500 mb-2">마음에 드는 메뉴에 별표 눌러줘요 ⬇️</p>
            <div className="mb-4">
              {menu.items.map((item) => (
                <MenuItem
                  key={item}
                  name={item}
                  starred={favs.includes(item)}
                  onToggle={() => toggleFav(item)}
                />
              ))}
            </div>
          </>
        )}

        {/* 한줄평 */}
        <p className="text-xs font-semibold text-gray-500 mb-2">한줄평 (선택)</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="오늘 급식 어땠어요?"
          rows={3}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 resize-none mb-5 focus:outline-none focus:border-sky-400"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {saving ? '저장 중...' : '평가 저장'}
        </button>
      </div>
    </div>
  );
}
