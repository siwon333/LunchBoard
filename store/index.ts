import { create } from 'zustand';
import { MealSchedule, MealMenu } from '../types';

interface MealState {
  schedule: MealSchedule | null;
  todayMenu: MealMenu | null;
  setSchedule: (s: MealSchedule | null) => void;
  setTodayMenu: (m: MealMenu | null) => void;
}

export const useMealStore = create<MealState>((set) => ({
  schedule: null,
  todayMenu: null,
  setSchedule: (schedule) => set({ schedule }),
  setTodayMenu: (todayMenu) => set({ todayMenu }),
}));
