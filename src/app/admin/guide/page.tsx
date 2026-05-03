'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SchedulesTab from './SchedulesTab'
import SpotsTab from './SpotsTab'
import RestaurantsTab from './RestaurantsTab'
import AccommodationsTab from './AccommodationsTab'
import TipsTab from './TipsTab'

const TABS = [
  { id: 'schedules',      label: '🕐 일정' },
  { id: 'spots',          label: '🗺️ 관광지' },
  { id: 'restaurants',    label: '🍽️ 식당' },
  { id: 'accommodations', label: '🏨 숙소' },
  { id: 'tips',           label: '💡 팁·경고' },
]

type GuideDay = {
  id: string
  day_number: number
  travel_date: string
  location: string
  subtitle: string
}

export default function AdminGuidePage() {
  const [days, setDays] = useState<GuideDay[]>([])
  const [selectedDay, setSelectedDay] = useState<GuideDay | null>(null)
  const [activeTab, setActiveTab] = useState('schedules')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('guide_days')
      .select('id, day_number, travel_date, location, subtitle')
      .order('day_number')
      .then(({ data }) => {
        if (data) {
          setDays(data)
          setSelectedDay(data[0] ?? null)
        }
      })
  }, [])

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* 헤더 */}
      <header className="bg-navy text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button
          className="md:hidden text-white text-xl"
          onClick={() => setSidebarOpen(v => !v)}
        >☰</button>
        <span className="font-display text-lg font-bold">가이드 관리</span>
        {selectedDay && (
          <span className="ml-2 text-terracotta text-sm font-medium">
            — Day {selectedDay.day_number} {selectedDay.location}
          </span>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 (Day 목록) */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-30
            w-56 bg-white border-r border-stone border-opacity-20
            flex flex-col overflow-y-auto
            transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
          style={{ top: '48px' }}
        >
          <div className="p-3 border-b border-stone border-opacity-10">
            <p className="text-xs text-stone font-medium uppercase tracking-wide">Day 선택</p>
          </div>
          <ul className="flex-1">
            {days.map(d => (
              <li key={d.id}>
                <button
                  onClick={() => { setSelectedDay(d); setSidebarOpen(false) }}
                  className={`
                    w-full text-left px-4 py-2.5 text-sm border-b border-stone border-opacity-10
                    hover:bg-cream transition-colors
                    ${selectedDay?.id === d.id ? 'bg-terracotta bg-opacity-10 text-terracotta font-semibold' : 'text-navy'}
                  `}
                >
                  <span className="font-mono text-xs opacity-60 mr-1">D{String(d.day_number).padStart(2,'0')}</span>
                  {d.location}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* 오버레이 (모바일) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {selectedDay ? (
            <>
              {/* Day 정보 */}
              <div className="mb-4">
                <h1 className="font-display text-2xl font-bold text-navy">
                  Day {selectedDay.day_number} — {selectedDay.location}
                </h1>
                <p className="text-stone text-sm mt-0.5">{selectedDay.travel_date} {selectedDay.subtitle && `· ${selectedDay.subtitle}`}</p>
              </div>

              {/* 탭 */}
              <div className="flex gap-1 bg-white rounded-xl p-1 mb-5 border border-stone border-opacity-20 overflow-x-auto">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`
                      flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                      ${activeTab === t.id
                        ? 'bg-terracotta text-white shadow-sm'
                        : 'text-stone hover:text-navy'}
                    `}
                  >{t.label}</button>
                ))}
              </div>

              {/* 탭 콘텐츠 */}
              {activeTab === 'schedules'      && <SchedulesTab      dayId={selectedDay.id} dayNumber={selectedDay.day_number} />}
              {activeTab === 'spots'          && <SpotsTab          dayId={selectedDay.id} dayNumber={selectedDay.day_number} />}
              {activeTab === 'restaurants'    && <RestaurantsTab    dayId={selectedDay.id} dayNumber={selectedDay.day_number} />}
              {activeTab === 'accommodations' && <AccommodationsTab dayId={selectedDay.id} dayNumber={selectedDay.day_number} />}
              {activeTab === 'tips'           && <TipsTab           dayId={selectedDay.id} dayNumber={selectedDay.day_number} />}
            </>
          ) : (
            <div className="text-center py-20 text-stone">Day를 선택하세요</div>
          )}
        </main>
      </div>
    </div>
  )
}
