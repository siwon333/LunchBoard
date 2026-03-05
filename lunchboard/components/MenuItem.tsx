'use client';

interface Props {
  name: string;
  starred: boolean;
  onToggle: () => void;
  readonly?: boolean;
  starCount?: number;
}

export default function MenuItem({ name, starred, onToggle, readonly = false, starCount }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={readonly}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl mb-1 text-left transition-all
        ${starred ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-transparent'}
        ${readonly ? 'cursor-default' : 'hover:border-amber-300 active:scale-[0.98]'}
      `}
    >
      <span style={{ color: starred ? '#f59e0b' : '#d1d5db', fontSize: 20, flexShrink: 0 }}>★</span>
      <span
        className={`flex-1 text-sm ${starred ? 'text-amber-900 font-semibold' : 'text-gray-700'}`}
      >
        {name}
      </span>
      {starred && <span className="text-xs text-amber-500 font-medium">맛있어요!</span>}
      {starCount !== undefined && starCount > 0 && (
        <span className="text-xs text-amber-400 font-medium">×{starCount}</span>
      )}
    </button>
  );
}
