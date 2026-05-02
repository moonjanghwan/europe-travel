import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Janghwan의 유럽 69일 여행',
  description: '2026년 5월 6일 ~ 7월 13일 · 이탈리아 + 프랑스 자동차 여행',
  openGraph: {
    title: 'Janghwan의 유럽 69일 여행',
    description: '이탈리아·프랑스 69일간의 특별한 여행 기록',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
