import {
  collection, doc, setDoc, getDoc, getDocs,
  query, orderBy, onSnapshot, Unsubscribe, serverTimestamp,
} from 'firebase/firestore';
import {
  ref, uploadBytesResumable, getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../firebase';
import { MealSchedule, MealMenu, MealReview } from '../../types';

// ─── 급식 식단표 PDF 업로드 ───────────────────────────────────
export async function uploadMealSchedulePdf(
  roomId: string,
  month: string,           // 'YYYY-MM'
  fileUri: string,
  fileName: string,
  uploadedBy: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const storageRef = ref(storage, `rooms/${roomId}/meal-schedules/${month}.pdf`);
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, blob, { contentType: 'application/pdf' });

    task.on(
      'state_changed',
      (snap) => onProgress && onProgress(snap.bytesTransferred / snap.totalBytes),
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await setDoc(doc(db, 'rooms', roomId, 'mealSchedules', month), {
          roomId, month, pdfUrl: url, uploadedBy,
          createdAt: Date.now(),
        } satisfies Omit<MealSchedule, 'id'>);
        resolve(url);
      },
    );
  });
}

// ─── 이번달 식단표 가져오기 ──────────────────────────────────
export async function getMealSchedule(
  roomId: string,
  month: string,
): Promise<MealSchedule | null> {
  const snap = await getDoc(doc(db, 'rooms', roomId, 'mealSchedules', month));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as MealSchedule;
}

// ─── 식단표 실시간 구독 ──────────────────────────────────────
export function subscribeMealSchedule(
  roomId: string,
  month: string,
  onData: (s: MealSchedule | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'rooms', roomId, 'mealSchedules', month), (snap) => {
    onData(snap.exists() ? ({ ...snap.data(), id: snap.id } as MealSchedule) : null);
  });
}

// ─── 날짜별 급식 메뉴 저장 ──────────────────────────────────
export async function saveMealMenu(
  roomId: string,
  date: string,
  items: string[],
  updatedBy: string,
): Promise<void> {
  await setDoc(doc(db, 'rooms', roomId, 'mealMenus', date), {
    date, items, updatedBy, updatedAt: Date.now(),
  } satisfies MealMenu);
}

// ─── 날짜별 급식 메뉴 구독 ──────────────────────────────────
export function subscribeMealMenu(
  roomId: string,
  date: string,
  onData: (menu: MealMenu | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'rooms', roomId, 'mealMenus', date), (snap) => {
    onData(snap.exists() ? (snap.data() as MealMenu) : null);
  });
}

// ─── 급식 평가 저장/수정 ─────────────────────────────────────
export async function saveMealReview(
  roomId: string,
  date: string,
  userId: string,
  nickname: string,
  stars: number,
  comment: string,
  favoriteItems: string[],
): Promise<void> {
  const reviewRef = doc(db, 'rooms', roomId, 'mealReviews', date, 'reviews', userId);
  const now = Date.now();

  const existing = await getDoc(reviewRef);
  await setDoc(reviewRef, {
    id: userId,
    date, userId, nickname, stars, comment, favoriteItems,
    createdAt: existing.exists() ? existing.data().createdAt : now,
    updatedAt: now,
  } satisfies MealReview);
}

// ─── 날짜별 급식 평가 실시간 구독 ───────────────────────────
export function subscribeMealReviews(
  roomId: string,
  date: string,
  onData: (reviews: MealReview[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'rooms', roomId, 'mealReviews', date, 'reviews'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ ...d.data() } as MealReview)));
  });
}
