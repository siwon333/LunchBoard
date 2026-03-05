'use client';
import { useState } from 'react';

interface Props {
  initialItems: string[];
  onSave: (items: string[]) => Promise<void>;
  onClose: () => void;
}

export default function MenuEditModal({ initialItems, onSave, onClose }: Props) {
  const [text, setText] = useState(initialItems.join('\n'));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const items = text.split('\n').map((s) => s.trim()).filter(Boolean);
    if (items.length === 0) { alert('메뉴를 입력해주세요'); return; }
    setSaving(true);
    try { await onSave(items); onClose(); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">오늘 메뉴 입력</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <p className="text-xs text-gray-500 mb-2">한 줄에 메뉴 하나씩 입력하세요</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'밥\n된장찌개\n김치\n불고기'}
          rows={8}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 resize-none mb-4 focus:outline-none focus:border-sky-400"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
}
