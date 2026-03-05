import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { MealSchedule, MealMenu } from '../../types';

// ─── 이번달 식단표 구독 (pdfUrl 포함) ───────────────────────
export function subscribeMealSchedule(
  month: string,
  onData: (s: MealSchedule | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'mealSchedules', month), (snap) => {
    onData(snap.exists() ? ({ ...snap.data(), id: snap.id } as MealSchedule) : null);
  });
}

// ─── 날짜별 급식 메뉴 구독 ──────────────────────────────────
export function subscribeMealMenu(
  date: string,
  onData: (menu: MealMenu | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'mealMenus', date), (snap) => {
    onData(snap.exists() ? (snap.data() as MealMenu) : null);
  });
}
