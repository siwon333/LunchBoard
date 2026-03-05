'use client';

interface Props {
  pdfUrl: string;
  month: string;
  onClose: () => void;
}

export default function PdfModal({ pdfUrl, month, onClose }: Props) {
  // 구글 드라이브 /preview URL은 그대로, 나머지는 Google Docs Viewer로 감쌈
  const viewerUrl = pdfUrl.includes('drive.google.com')
    ? pdfUrl
    : `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
        <span className="font-semibold text-sm">📄 {month} 급식 식단표</span>
        <button
          onClick={onClose}
          className="text-sky-400 text-sm font-medium hover:text-sky-300"
        >
          닫기 ✕
        </button>
      </div>
      <iframe
        src={viewerUrl}
        className="flex-1 w-full border-0"
        title="급식 식단표"
      />
    </div>
  );
}
