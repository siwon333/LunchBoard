import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { signUp } from '../../hooks/useAuth';
import { Input, Button } from '../../components/common/ui';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) { setError('모든 항목을 입력해주세요.'); return; }
    if (password !== confirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    setError('');
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
    } catch (e: any) {
      setError(e.message ?? '회원가입에 실패했습니다.');
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
        <Text className="text-2xl font-bold text-gray-900 mb-1">회원가입</Text>
        <Text className="text-sm text-gray-400 mb-8">RoomRhythm에 오신 것을 환영합니다</Text>

        <Input label="닉네임" value={name} onChangeText={setName} placeholder="룸메들에게 보일 이름" />
        <Input label="이메일" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="비밀번호" value={password} onChangeText={setPassword} placeholder="6자 이상" secureTextEntry />
        <Input label="비밀번호 확인" value={confirm} onChangeText={setConfirm} placeholder="비밀번호 재입력" secureTextEntry />

        {error ? <Text className="text-red-500 text-sm mb-3">{error}</Text> : null}

        <Button title="가입하기" onPress={handleRegister} loading={loading} />

        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-sm text-gray-400">이미 계정이 있으신가요?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-sm text-sky-500 font-semibold">로그인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
