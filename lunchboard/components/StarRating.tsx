'use client';

interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}

export default function StarRating({ value, onChange, size = 28 }: Props) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          disabled={!onChange}
          style={{ fontSize: size, color: s <= value ? '#f59e0b' : '#d1d5db', lineHeight: 1 }}
          className="hover:scale-110 transition-transform disabled:cursor-default"
        >
          ★
        </button>
      ))}
    </div>
  );
}
