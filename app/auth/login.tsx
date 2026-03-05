import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { signIn } from '../../hooks/useAuth';
import { Input, Button } from '../../components/common/ui';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요.'); return; }
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // onAuthStateChanged → _layout 이 라우팅 처리
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 px-6 justify-center">
        {/* 로고 */}
        <View className="items-center mb-10">
          <Text className="text-4xl mb-2">🏠</Text>
          <Text className="text-2xl font-bold text-gray-900">RoomRhythm</Text>
          <Text className="text-sm text-gray-400 mt-1">룸메이트 생활 캘린더</Text>
        </View>

        {/* 폼 */}
        <Input
          label="이메일"
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="비밀번호"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        {error ? <Text className="text-red-500 text-sm mb-3 text-center">{error}</Text> : null}

        <Button title="로그인" onPress={handleLogin} loading={loading} className="mt-2" />

        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-sm text-gray-400">계정이 없으신가요?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text className="text-sm text-sky-500 font-semibold">회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
