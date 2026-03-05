import {
  collection, doc, setDoc, getDoc, onSnapshot,
  query, orderBy, Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface MealSchedule {
  month: string;     // 'YYYY-MM'
  pdfUrl: string;
  uploadedAt: number;
}

export interface MealMenu {
  date: string;      // 'YYYY-MM-DD'
  items: string[];
  updatedAt: number;
}

export interface MealReview {
  userId: string;
  nickname: string;
  stars: number;
  comment: string;
  favoriteItems: string[];
  createdAt: number;
  updatedAt: number;
}

// ─── PDF URL 저장 (구글 드라이브 / Dropbox 등 링크 입력) ────────
export async function savePdfUrl(month: string, pdfUrl: string): Promise<void> {
  await setDoc(doc(db, 'mealSchedules', month), {
    month, pdfUrl, uploadedAt: Date.now(),
  });
}

// ─── 식단표 구독 ──────────────────────────────────────────────
export function subscribeMealSchedule(
  month: string,
  cb: (s: MealSchedule | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'mealSchedules', month), (snap) => {
    cb(snap.exists() ? (snap.data() as MealSchedule) : null);
  });
}

// ─── 메뉴 저장 ────────────────────────────────────────────────
export async function saveMealMenu(date: string, items: string[]): Promise<void> {
  await setDoc(doc(db, 'mealMenus', date), { date, items, updatedAt: Date.now() });
}

// ─── 메뉴 구독 ────────────────────────────────────────────────
export function subscribeMealMenu(
  date: string,
  cb: (m: MealMenu | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'mealMenus', date), (snap) => {
    cb(snap.exists() ? (snap.data() as MealMenu) : null);
  });
}

// ─── 평가 저장 ────────────────────────────────────────────────
export async function saveMealReview(
  date: string,
  userId: string,
  review: Omit<MealReview, 'createdAt' | 'updatedAt'>,
): Promise<void> {
  const reviewRef = doc(db, 'mealReviews', date, 'reviews', userId);
  const existing = await getDoc(reviewRef);
  await setDoc(reviewRef, {
    ...review,
    createdAt: existing.exists() ? existing.data().createdAt : Date.now(),
    updatedAt: Date.now(),
  });
}

// ─── 평가 목록 구독 ───────────────────────────────────────────
export function subscribeMealReviews(
  date: string,
  cb: (reviews: MealReview[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'mealReviews', date, 'reviews'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as MealReview));
  });
}
