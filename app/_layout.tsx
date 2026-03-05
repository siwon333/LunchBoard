import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthListener } from '../hooks/useAuth';
import { useAuthStore, useRoomStore } from '../store';
import { useRoomSubscriptions } from '../hooks/useRoom';
import { LoadingScreen } from '../components/common/ui';
import '../global.css';

function RootLayout() {
  useAuthListener();

  const { user, loading } = useAuthStore();
  const { currentRoom } = useRoomStore();
  const router = useRouter();
  const segments = useSegments();

  // 실시간 구독
  useRoomSubscriptions(currentRoom?.id ?? null);

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === 'auth';
    const inMain = segments[0] === 'main';

    if (!user && !inAuth) {
      router.replace('/auth/login');
    } else if (user && !currentRoom && !inAuth) {
      router.replace('/auth/onboarding');
    } else if (user && currentRoom && inAuth) {
      router.replace('/main/home');
    }
  }, [user, currentRoom, loading, segments, router]);

  if (loading) return <LoadingScreen />;

  return <Slot />;
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <RootLayout />
    </SafeAreaProvider>
  );
}
