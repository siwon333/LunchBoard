'use client';

interface Props {
  name: string;
  starred: boolean;         // 다른 사람들이 리뷰에서 좋아요한 아이템
  onToggle: () => void;     // 리뷰 모달에서 좋아요 토글
  readonly?: boolean;       // 메인 화면 = true
  starCount?: number;       // 리뷰 좋아요 수
  highlighted?: boolean;    // 내 개인 즐겨찾기 (형광펜)
  onHighlight?: () => void; // 개인 즐겨찾기 토글
  fans?: string[];          // 이 메뉴를 좋아하는 사람 닉네임 목록
}

export default function MenuItem({
  name,
  starred,
  onToggle,
  readonly = false,
  starCount,
  highlighted,
  onHighlight,
  fans,
}: Props) {
  // 리뷰 모달 모드: 클릭하면 리뷰 즐겨찾기 토글
  const isReviewMode = !readonly && onHighlight === undefined;

  return (
    <div
      onClick={isReviewMode ? onToggle : undefined}
      className={[
        'w-full flex items-center gap-2 px-3 py-2 rounded-xl mb-1 transition-all',
        highlighted
          ? 'bg-yellow-100 border border-yellow-400'
          : starred
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-gray-50 border border-transparent',
        isReviewMode ? 'cursor-pointer hover:border-amber-300 active:scale-[0.98]' : '',
      ].join(' ')}
    >
      {/* 형광펜 버튼 (메인 화면) vs 리뷰 별표 (평가 모달) */}
      {onHighlight !== undefined ? (
        <button
          type="button"
          onClick={onHighlight}
          className={[
            'flex-shrink-0 text-base leading-none transition-colors',
            highlighted ? 'text-red-400' : 'text-gray-300 hover:text-red-300',
          ].join(' ')}
          title={highlighted ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          {highlighted ? '♥' : '♡'}
        </button>
      ) : (
        <span style={{ color: starred ? '#f59e0b' : '#d1d5db', fontSize: 20, flexShrink: 0 }}>★</span>
      )}

      <span
        className={[
          'flex-1 text-sm',
          highlighted
            ? 'font-semibold text-yellow-900'
            : starred
              ? 'font-semibold text-amber-900'
              : 'text-gray-700',
        ].join(' ')}
      >
        {name}
      </span>

      {/* 팬 닉네임 표시 or 별표 개수 */}
      {fans && fans.length > 0 ? (
        <span className="text-xs text-amber-500 font-medium shrink-0 max-w-[140px] truncate">
          {fans.length === 1
            ? `${fans[0]}님`
            : fans.length === 2
              ? `${fans[0]}, ${fans[1]}님`
              : `${fans[0]} 외 ${fans.length - 1}명`}{' '}
          좋아해요
        </span>
      ) : starCount !== undefined && starCount > 0 ? (
        <span className="text-xs text-amber-400 font-medium">×{starCount}</span>
      ) : null}

      {/* 리뷰 모달에서 선택됐을 때 */}
      {isReviewMode && starred && (
        <span className="text-xs text-amber-500 font-medium">맛있어요!</span>
      )}
    </div>
  );
}
