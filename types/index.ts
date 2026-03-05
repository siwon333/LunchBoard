// ─── Meal Schedule (급식 식단표) ────────────────────────────────
export interface MealSchedule {
  id: string;
  month: string;    // 'YYYY-MM'
  pdfUrl: string;
  createdAt: number;
}

// 날짜별 급식 메뉴
export interface MealMenu {
  date: string;     // 'YYYY-MM-DD'
  items: string[];
}
