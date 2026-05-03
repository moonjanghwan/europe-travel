'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href: '/',         label: '홈',      icon: '🏠' },
  { href: '/schedule', label: '일정',    icon: '🗺️' },
  { href: '/diary',    label: '여행일기', icon: '📝' },
  { href: '/gallery',  label: '갤러리',  icon: '📸' },
]

export default function Nav() {
  const pathname = usePathname()
  const router   = useRouter()

  // 관리자 모달
  const [modal,   setModal]   = useState(false)
  const [pw,      setPw]      = useState('')
  const [pwError, setPwError] = useState(false)

  function openModal() { setModal(true); setPw(''); setPwError(false) }
  function closeModal() { setModal(false) }

  function handleLogin() {
    if (pw === process.env.NEXT_PUBLIC_ADMIN_PW || pw === 'admin1234') {
      sessionStorage.setItem('admin_authed', '1')
      setModal(false)
      router.push('/admin')
    } else {
      setPwError(true)
    }
  }

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
          <button
            onClick={openModal}
            className="text-xs border border-stone border-opacity-40 text-stone hover:text-navy hover:border-navy rounded-lg px-3 py-1.5 transition-colors"
          >
            🛠️ 관리자
          </button>
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
        {/* 관리자 탭 */}
        <button
          onClick={openModal}
          className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
            pathname.startsWith('/admin') ? 'text-terracotta' : 'text-stone'
          }`}
        >
          <span className="text-lg">🛠️</span>
          관리
        </button>
      </nav>

      {/* 비밀번호 모달 */}
      {modal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black bg-opacity-50"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 text-center">
            <p className="text-2xl mb-2">🔐</p>
            <h2 className="font-display text-lg font-bold text-navy mb-1">관리자 로그인</h2>
            <p className="text-xs text-stone mb-4">비밀번호를 입력하세요</p>
            <input
              type="password"
              placeholder="비밀번호"
              value={pw}
              autoFocus
              onChange={e => { setPw(e.target.value); setPwError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none mb-2 focus:border-terracotta ${
                pwError ? 'border-red-400' : 'border-stone border-opacity-30'
              }`}
            />
            {pwError && <p className="text-red-500 text-xs mb-2">비밀번호가 틀렸습니다</p>}
            <button onClick={handleLogin} className="btn-primary w-full mb-2">로그인</button>
            <button onClick={closeModal} className="text-xs text-stone hover:text-navy">취소</button>
          </div>
        </div>
      )}
    </>
  )
}
