import Link from 'next/link'
import Nav from '@/components/Nav'
import { PARTS, SCHEDULE_DATA, getDayNumber, TRAVEL_START, TRAVEL_END } from '@/lib/travel-data'
import { supabase } from '@/lib/supabase'

async function getRecentDiaries() {
  const { data } = await supabase
    .from('diaries')
    .select('id, day_number, location, title, mood, travel_date')
    .eq('is_public', true)
    .order('day_number', { ascending: false })
    .limit(3)
  return data || []
}

export default async function HomePage() {
  const today = new Date()
  const dayNum = getDayNumber(today)
  const isTraveling = dayNum >= 1 && dayNum <= 69
  const todayData = isTraveling ? SCHEDULE_DATA[dayNum] : null
  const recentDiaries = await getRecentDiaries()

  const totalDays = 69
  const doneDays = isTraveling ? Math.max(0, dayNum - 1) : (today > TRAVEL_END ? 69 : 0)
  const progressPct = Math.min(100, Math.round((doneDays / totalDays) * 100))

  return (
    <div className="min-h-screen bg-cream">
      <Nav />

      {/* 히어로 */}
      <section className="pt-14 md:pt-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C4622D 0, #C4622D 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}
        />
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-stone text-sm tracking-widest uppercase mb-3 font-medium">2026 · 69일간의 여정</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-navy mb-4 leading-tight">
            Janghwan's<br />
            <span className="text-terracotta italic">Europe</span> Journey
          </h1>
          <p className="text-stone text-base md:text-lg mb-2">2026년 5월 6일 — 7월 13일</p>
          <p className="text-stone text-sm mb-8">이탈리아 🇮🇹 + 프랑스 🇫🇷 · 8개 지역 · 자동차 여행</p>

          {/* 여행 진행률 */}
          <div className="max-w-md mx-auto bg-white rounded-2xl p-5 shadow-sm border border-stone border-opacity-20 mb-8">
            {isTraveling ? (
              <>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-terracotta">🚗 지금 여행 중!</span>
                  <span className="text-stone">Day {dayNum} / 69</span>
                </div>
                <div className="w-full bg-stone bg-opacity-20 rounded-full h-2 mb-3">
                  <div className="bg-terracotta h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                {todayData && (
                  <p className="text-sm text-navy font-medium">📍 오늘: {todayData.location}</p>
                )}
              </>
            ) : today < TRAVEL_START ? (
              <>
                <p className="text-sm font-medium text-navy mb-1">✈️ 출발 준비 중</p>
                <p className="text-sm text-stone">
                  출발까지 {Math.ceil((TRAVEL_START.getTime() - today.getTime()) / 86400000)}일 남았습니다
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-navy mb-1">🎉 여행 완료!</p>
                <p className="text-sm text-stone">69일간의 멋진 여행을 마쳤습니다</p>
              </>
            )}
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/schedule" className="btn-primary">전체 일정 보기</Link>
            <Link href="/diary" className="btn-secondary">여행 일기</Link>
          </div>
        </div>
      </section>

      {/* 8개 파트 */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="font-display text-2xl font-bold text-navy mb-6 text-center">여행 루트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PARTS.map(p => (
            <Link
              key={p.part}
              href={`/schedule?part=${p.part}`}
              className="flex items-center gap-4 bg-white rounded-xl p-4 border border-stone border-opacity-20 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: p.color }}>
                {p.part}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-navy text-sm">{p.name}</p>
                <p className="text-xs text-stone mt-0.5">Day {p.days[0]}–{p.days[1]} · {p.places}</p>
              </div>
              <span className="text-stone text-lg group-hover:text-terracotta transition-colors">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 최근 일기 */}
      {recentDiaries.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-navy">최근 여행 일기</h2>
            <Link href="/diary" className="text-sm text-terracotta hover:underline">전체 보기 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDiaries.map(d => (
              <Link key={d.id} href={`/diary/${d.id}`}
                className="card hover:shadow-md transition-all group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{d.mood}</span>
                  <span className="text-xs text-stone">Day {d.day_number}</span>
                </div>
                <p className="text-xs text-stone mb-1">{d.location}</p>
                <p className="font-medium text-navy text-sm line-clamp-2 group-hover:text-terracotta transition-colors">{d.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 푸터 */}
      <footer className="border-t border-stone border-opacity-20 text-center py-8 text-xs text-stone">
        © 2026 Janghwan's Europe Journey · Made with ❤️
      </footer>

      {/* 모바일 하단 여백 */}
      <div className="h-16 md:hidden" />
    </div>
  )
}
