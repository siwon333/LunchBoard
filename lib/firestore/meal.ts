import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { MealMenu } from '../../types';

export function subscribeMealMenu(
  date: string,
  onData: (menu: MealMenu | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'mealMenus', date), (snap) => {
    onData(snap.exists() ? (snap.data() as MealMenu) : null);
  });
}

export async function saveMealMenu(date: string, items: string[]): Promise<void> {
  await setDoc(doc(db, 'mealMenus', date), { date, items });
}
