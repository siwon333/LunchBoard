import MealBoard from '@/components/MealBoard';

// isAdmin 여부는 서버에서 env로 확인
// 실제 배포 시 Firebase Auth나 세션 기반으로 교체 권장
const ADMIN_KEY = process.env.ADMIN_KEY ?? '';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string }>;
}) {
  const params = await searchParams;
  const isAdmin = ADMIN_KEY !== '' && params.admin === ADMIN_KEY;
  return <MealBoard isAdmin={isAdmin} />;
}
