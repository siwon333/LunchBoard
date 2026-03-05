import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { MealMenu } from '../../types';

// ─── 오늘 메뉴 구독 ──────────────────────────────────────────
export function subscribeMealMenu(
  date: string,
  onData: (menu: MealMenu | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'mealMenus', date), (snap) => {
    onData(snap.exists() ? (snap.data() as MealMenu) : null);
  });
}

// ─── 메뉴 저장 (관리자) ──────────────────────────────────────
export async function saveMealMenu(date: string, items: string[]): Promise<void> {
  await setDoc(doc(db, 'mealMenus', date), { date, items });
}

// ─── PDF 업로드 (관리자) ─────────────────────────────────────
export async function uploadMealPdf(
  month: string,
  fileUri: string,
  fileName: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  const blob = await (await fetch(fileUri)).blob();
  const storageRef = ref(storage, `mealSchedules/${month}.pdf`);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, blob, { contentType: 'application/pdf' });
    task.on(
      'state_changed',
      (snap) => onProgress?.(snap.bytesTransferred / snap.totalBytes),
      reject,
      async () => {
        const pdfUrl = await getDownloadURL(task.snapshot.ref);
        await setDoc(doc(db, 'mealSchedules', month), { month, pdfUrl, createdAt: Date.now() });
        resolve();
      },
    );
  });
}
