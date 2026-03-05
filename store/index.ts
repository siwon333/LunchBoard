import { create } from 'zustand';
import { MealMenu } from '../types';

interface MealState {
  todayMenu: MealMenu | null;
  setTodayMenu: (m: MealMenu | null) => void;
}

export const useMealStore = create<MealState>((set) => ({
  todayMenu: null,
  setTodayMenu: (todayMenu) => set({ todayMenu }),
}));
