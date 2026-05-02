import Nav from '@/components/Nav'
import Link from 'next/link'
import { PARTS, SCHEDULE_DATA, getDayNumber, getPartForDay } from '@/lib/travel-data'

export default function SchedulePage() {
  const today = new Date()
  const currentDay = getDayNumber(today)

  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <div className="pt-14 md:pt-20 max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
        <h1 className="font-display text-3xl font-bold text-navy mb-2">전체 일정</h1>
        <p className="text-stone text-sm mb-8">Day 1 ~ Day 69 · 2026.05.06 – 07.13</p>

        {PARTS.map(part => (
          <div key={part.part} className="mb-10">
            {/* 파트 헤더 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: part.color }}>
                {part.part}
              </div>
              <div>
                <h2 className="font-display font-bold text-navy text-lg">{part.name}</h2>
                <p className="text-xs text-stone">Day {part.days[0]}–{part.days[1]} · {part.places}</p>
              </div>
            </div>

            {/* 해당 파트 Day 카드들 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ml-11">
              {Array.from({ length: part.days[1] - part.days[0] + 1 }, (_, i) => part.days[0] + i).map(day => {
                const data = SCHEDULE_DATA[day]
                const isToday = day === currentDay
                const isPast  = day < currentDay
                return (
                  <Link
                    key={day}
                    href={`/diary?day=${day}`}
                    className={`rounded-xl p-3.5 border transition-all hover:shadow-md ${
                      isToday
                        ? 'bg-terracotta text-white border-terracotta shadow-md'
                        : isPast
                        ? 'bg-white border-stone border-opacity-30 opacity-75'
                        : 'bg-white border-stone border-opacity-20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-stone'}`}>
                        Day {day}
                      </span>
                      {isToday && <span className="text-xs bg-white text-terracotta px-2 py-0.5 rounded-full font-medium">TODAY</span>}
                      {isPast && !isToday && <span className="text-xs">✓</span>}
                    </div>
                    <p className={`text-sm font-medium ${isToday ? 'text-white' : 'text-navy'}`}>
                      {data?.location || '이동'}
                    </p>
                    {data?.highlights?.[0] && (
                      <p className={`text-xs mt-1 ${isToday ? 'text-white text-opacity-80' : 'text-stone'}`}>
                        {data.highlights[0]}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
