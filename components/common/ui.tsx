import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ActivityIndicator,
  ViewStyle, TextStyle,
} from 'react-native';

// ─── Button ────────────────────────────────────────────────────
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, className }: ButtonProps) {
  const base = 'flex-row items-center justify-center rounded-xl px-4 py-3';
  const variants: Record<string, string> = {
    primary:   'bg-sky-500',
    secondary: 'bg-gray-100',
    danger:    'bg-red-500',
    ghost:     'bg-transparent border border-gray-200',
  };
  const textVariants: Record<string, string> = {
    primary:   'text-white font-semibold text-sm',
    secondary: 'text-gray-700 font-semibold text-sm',
    danger:    'text-white font-semibold text-sm',
    ghost:     'text-gray-600 font-semibold text-sm',
  };

  return (
    <TouchableOpacity
      className={`${base} ${variants[variant]} ${disabled || loading ? 'opacity-50' : ''} ${className ?? ''}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && <ActivityIndicator size="small" color={variant === 'primary' || variant === 'danger' ? '#fff' : '#374151'} className="mr-2" />}
      <Text className={textVariants[variant]}>{title}</Text>
    </TouchableOpacity>
  );
}

// ─── Input ─────────────────────────────────────────────────────
interface InputProps {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  error?: string;
  className?: string;
}

export function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, error, className }: InputProps) {
  return (
    <View className={`mb-3 ${className ?? ''}`}>
      {label && <Text className="text-xs font-medium text-gray-500 mb-1">{label}</Text>}
      <TextInput
        className={`bg-white border rounded-xl px-4 py-3 text-gray-900 text-sm ${error ? 'border-red-400' : 'border-gray-200'}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
      />
      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
}

// ─── Card ──────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className ?? ''}`}>
      {children}
    </View>
  );
}

// ─── EmptyState ────────────────────────────────────────────────
export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <View className="items-center justify-center py-10">
      <Text className="text-3xl mb-2">{icon}</Text>
      <Text className="text-sm text-gray-400">{message}</Text>
    </View>
  );
}

// ─── SectionHeader ─────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-sm font-semibold text-gray-700">{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text className="text-xs text-sky-500 font-medium">{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Badge ─────────────────────────────────────────────────────
export function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={{ backgroundColor: bg }} className="rounded-full px-2 py-0.5">
      <Text style={{ color }} className="text-xs font-medium">{label}</Text>
    </View>
  );
}

// ─── Divider ───────────────────────────────────────────────────
export function Divider() {
  return <View className="h-px bg-gray-100 mx-4" />;
}

// ─── LoadingScreen ─────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#0ea5e9" />
    </View>
  );
}
