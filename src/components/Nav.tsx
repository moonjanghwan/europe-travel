'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href: '/',         label: '홈',      icon: '🏠' },
  { href: '/schedule', label: '일정',    icon: '🗺️' },
  { href: '/diary',    label: '여행일기', icon: '📝' },
  { href: '/gallery',  label: '갤러리',  icon: '📸' },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* 데스크탑 상단 Nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-95 backdrop-blur border-b border-stone border-opacity-20 px-8 h-14 items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold text-navy">
          🇮🇹 Janghwan in Europe
        </Link>
        <div className="flex items-center gap-6">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className={`text-sm font-medium transition-colors ${
                pathname === n.href ? 'text-terracotta' : 'text-stone hover:text-navy'
              }`}
            >
              {n.label}
            </Link>
          ))}

        </div>
      </nav>

      {/* 모바일 하단 탭 바 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone border-opacity-20 flex">
        {NAV.map(n => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              pathname === n.href ? 'text-terracotta' : 'text-stone'
            }`}
          >
            <span className="text-lg">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
