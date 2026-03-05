import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  title: '급식 식단표',
  description: '오늘 급식 확인하고 평가하기',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} antialiased bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
