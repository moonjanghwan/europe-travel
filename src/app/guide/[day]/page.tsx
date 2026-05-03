import Nav from '@/components/Nav'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getPartForDay, TRAVEL_START } from '@/lib/travel-data'
import { notFound } from 'next/navigation'

// ─── 데이터 fetch ───────────────────────────────────────────────

async function getGuideDay(day: number) {
  const { data } = await supabase
    .from('guide_days')
    .select('*')
    .eq('day_number', day)
    .single()
  return data
}

async function getSchedules(dayId: string) {
  const { data } = await supabase
    .from('guide_schedules')
    .select('*')
    .eq('day_id', dayId)
    .order('sort_order', { ascending: true })
  return data ?? []
}

async function getSpots(dayId: string) {
  const { data } = await supabase
    .from('guide_spots')
    .select('*')
    .eq('day_id', dayId)
    .order('sort_order', { ascending: true })
  return data ?? []
}

async function getRestaurants(dayId: string) {
  const { data } = await supabase
    .from('guide_restaurants')
    .select('*')
    .eq('day_id', dayId)
    .order('sort_order', { ascending: true })
  return data ?? []
}

async function getAccommodations(dayId: string) {
  const { data } = await supabase
    .from('guide_accommodations')
    .select('*')
    .eq('day_id', dayId)
  return data ?? []
}

async function getTips(dayId: string) {
  const { data } = await supabase
    .from('guide_tips')
    .select('*')
    .eq('day_id', dayId)
    .order('sort_order', { ascending: true })
  return data ?? []
}

async function getDiaryForDay(day: number) {
  const { data } = await supabase
    .from('diaries')
    .select('id, title, mood, content')
    .eq('day_number', day)
    .eq('is_public', true)
    .single()
  return data
}

// ─── generateStaticParams / revalidate ──────────────────────────

export async function generateStaticParams() {
  return Array.from({ length: 69 }, (_, i) => ({ day: String(i + 1) }))
}

export const revalidate = 60

// ─── 페이지 컴포넌트 ─────────────────────────────────────────────

export default async function GuideDayPage({ params }: { params: { day: string } }) {
  const dayNum = parseInt(params.day)
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 69) notFound()

  const guide = await getGuideDay(dayNum)
  const diary = await getDiaryForDay(dayNum)

  const part = getPartForDay(dayNum)
  const travelDate = new Date(TRAVEL_START)
  travelDate.setDate(travelDate.getDate() + dayNum - 1)

  // guide_days 행이 없으면 빈 상태로 렌더
  const dayId: string | null = guide?.id ?? null

  const [schedules, spots, restaurants, accommodations, tips] = dayId
    ? await Promise.all([
        getSchedules(dayId),
        getSpots(dayId),
        getRestaurants(dayId),
        getAccommodations(dayId),
        getTips(dayId),
      ])
    : [[], [], [], [], []]

  // tip type 분류
  const tipItems    = tips.filter((t: any) => t.type === 'tip')
  const warnItems   = tips.filter((t: any) => t.type === 'warning' || t.type === 'ztl')
  const checkItems  = tips.filter((t: any) => t.type === 'checklist')

  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <div className="pt-14 md:pt-20 max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-10">

        {/* 뒤로 가기 */}
        <Link href="/schedule" className="text-sm text-stone hover:text-navy flex items-center gap-1 mb-6">
          ← 전체 일정
        </Link>

        {/* 헤더 */}
        <div className="mb-6">
          {part && (
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: part.color }}
              >{part.part}</div>
              <span className="text-xs text-stone">{part.name}</span>
            </div>
          )}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl font-bold text-navy">Day {dayNum}</h1>
              <p className="text-terracotta font-medium mt-1">{guide?.location || '이동'}</p>
              <p className="text-stone text-sm mt-1">
                {travelDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
              {guide?.subtitle && <p className="text-stone text-sm mt-1 italic">{guide.subtitle}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {dayNum > 1 && <Link href={`/guide/${dayNum - 1}`} className="btn-secondary text-xs px-3 py-1.5">← Day {dayNum - 1}</Link>}
              {dayNum < 69 && <Link href={`/guide/${dayNum + 1}`} className="btn-primary text-xs px-3 py-1.5">Day {dayNum + 1} →</Link>}
            </div>
          </div>
        </div>

        {/* 하이라이트 */}
        {guide?.highlights && guide.highlights.length > 0 && (
          <div className="bg-terracotta bg-opacity-10 rounded-xl p-4 mb-6 border border-terracotta border-opacity-20">
            <p className="text-xs font-medium text-terracotta mb-2">📌 오늘의 하이라이트</p>
            <div className="flex flex-wrap gap-2">
              {guide.highlights.map((h: string, i: number) => (
                <span key={i} className="text-xs bg-white text-navy px-2.5 py-1 rounded-full border border-stone border-opacity-20">{h}</span>
              ))}
            </div>
          </div>
        )}

        {/* 가이드북 / 여행일기 탭 */}
        <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 border border-stone border-opacity-20">
          <span className="flex-1 py-2 rounded-lg text-sm font-medium text-center bg-terracotta text-white">📖 가이드북</span>
          {diary ? (
            <Link href={`/diary/${diary.id}`} className="flex-1 py-2 rounded-lg text-sm font-medium text-center text-stone hover:text-navy transition-colors">📝 여행일기</Link>
          ) : (
            <span className="flex-1 py-2 rounded-lg text-sm font-medium text-center text-stone opacity-40">📝 일기 미작성</span>
          )}
        </div>

        {/* 데이터 없음 */}
        {!guide && (
          <div className="card text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-stone text-sm">이 날의 가이드 내용이 없습니다.</p>
          </div>
        )}

        {/* ── 1. 시간대별 일정 타임라인 ── */}
        {schedules.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <span className="text-xl">🕐</span> 시간대별 일정
            </h2>
            <div className="card p-0 overflow-hidden">
              {schedules.map((s: any, i: number) => (
                <div key={s.id} className="flex gap-3 px-4 py-3 border-b border-stone border-opacity-10 last:border-0 hover:bg-cream transition-colors">
                  {/* 시간 */}
                  <div className="flex-shrink-0 w-14 text-right">
                    <span className="text-xs font-mono font-semibold text-terracotta">{s.time_slot}</span>
                  </div>
                  {/* 타임라인 선 */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-terracotta mt-0.5 flex-shrink-0" />
                    {i < schedules.length - 1 && <div className="w-px flex-1 bg-terracotta bg-opacity-20 mt-1" />}
                  </div>
                  {/* 내용 */}
                  <div className="flex-1 pb-1">
                    <p className="text-sm font-medium text-navy leading-snug">{s.place_name}</p>
                    {s.activity && <p className="text-xs text-stone mt-0.5 leading-relaxed">{s.activity}</p>}
                    {s.memo && <p className="text-xs text-stone italic mt-0.5">{s.memo}</p>}
                  </div>
                  {/* 비용 */}
                  {s.cost && s.cost !== '-' && s.cost !== '' && (
                    <div className="flex-shrink-0 text-right">
                      <span className="text-xs bg-navy bg-opacity-10 text-navy px-2 py-0.5 rounded-full">{s.cost}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 2. 관광지 카드 그리드 ── */}
        {spots.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <span className="text-xl">🗺️</span> 관광지 상세
            </h2>
            <div className="grid gap-4">
              {spots.map((sp: any) => (
                <div key={sp.id} className="card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-navy">{sp.name}</h3>
                    {sp.category && (
                      <span className="flex-shrink-0 text-xs bg-terracotta bg-opacity-10 text-terracotta px-2 py-0.5 rounded-full">{sp.category}</span>
                    )}
                  </div>
                  {sp.description && <p className="text-sm text-stone leading-relaxed mb-3">{sp.description}</p>}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {sp.opening_hours && (
                      <div className="bg-cream rounded-lg px-3 py-2">
                        <p className="text-stone opacity-60 mb-0.5">🕒 운영시간</p>
                        <p className="text-navy font-medium">{sp.opening_hours}</p>
                      </div>
                    )}
                    {sp.entrance_fee && (
                      <div className="bg-cream rounded-lg px-3 py-2">
                        <p className="text-stone opacity-60 mb-0.5">💶 입장료</p>
                        <p className="text-navy font-medium">{sp.entrance_fee}</p>
                      </div>
                    )}
                    {sp.address && (
                      <div className="bg-cream rounded-lg px-3 py-2 col-span-2">
                        <p className="text-stone opacity-60 mb-0.5">📍 주소</p>
                        <p className="text-navy font-medium">{sp.address}</p>
                      </div>
                    )}
                  </div>
                  {sp.tips && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-amber-700 leading-relaxed">💡 {sp.tips}</p>
                    </div>
                  )}
                  {sp.website && (
                    <a href={sp.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-terracotta hover:underline">
                      🔗 예약/공식 사이트 →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 3. 식당 추천 카드 ── */}
        {restaurants.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <span className="text-xl">🍽️</span> 식당 추천
            </h2>
            <div className="grid gap-4">
              {restaurants.map((r: any) => (
                <div key={r.id} className="card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-navy">{r.name}</h3>
                      {r.cuisine && <p className="text-xs text-terracotta mt-0.5">{r.cuisine}</p>}
                    </div>
                    {r.reservation && (
                      <span className="flex-shrink-0 text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">예약 필요</span>
                    )}
                  </div>
                  {r.description && <p className="text-sm text-stone leading-relaxed mb-3">{r.description}</p>}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {r.opening_hours && (
                      <div className="bg-cream rounded-lg px-3 py-2">
                        <p className="text-stone opacity-60 mb-0.5">🕒 영업시간</p>
                        <p className="text-navy font-medium">{r.opening_hours}</p>
                      </div>
                    )}
                    {r.price_range && (
                      <div className="bg-cream rounded-lg px-3 py-2">
                        <p className="text-stone opacity-60 mb-0.5">💶 2인 예상</p>
                        <p className="text-navy font-medium">{r.price_range}</p>
                      </div>
                    )}
                  </div>
                  {r.must_order && (
                    <div className="mt-3 bg-terracotta bg-opacity-5 border border-terracotta border-opacity-20 rounded-lg px-3 py-2">
                      <p className="text-xs text-stone opacity-60 mb-1">🌟 추천 메뉴</p>
                      <p className="text-xs text-navy font-medium">{r.must_order}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 4. 숙소 섹션 ── */}
        {accommodations.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <span className="text-xl">🏨</span> 숙소
            </h2>
            {accommodations.map((acc: any) => (
              <div key={acc.id} className="card">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-navy">{acc.name}</h3>
                    {acc.type && <p className="text-xs text-stone mt-0.5">{acc.type}</p>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    {acc.parking && <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">🅿️ 주차 가능</span>}
                    {acc.ztl_warning && <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">⚠️ ZTL 주의</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {acc.check_in && (
                    <div className="bg-cream rounded-lg px-3 py-2">
                      <p className="text-stone opacity-60 mb-0.5">체크인</p>
                      <p className="text-navy font-medium">{acc.check_in}</p>
                    </div>
                  )}
                  {acc.check_out && (
                    <div className="bg-cream rounded-lg px-3 py-2">
                      <p className="text-stone opacity-60 mb-0.5">체크아웃</p>
                      <p className="text-navy font-medium">{acc.check_out}</p>
                    </div>
                  )}
                  {acc.address && (
                    <div className="bg-cream rounded-lg px-3 py-2 col-span-2">
                      <p className="text-stone opacity-60 mb-0.5">📍 주소</p>
                      <p className="text-navy font-medium">{acc.address}</p>
                    </div>
                  )}
                  {acc.cost && (
                    <div className="bg-cream rounded-lg px-3 py-2">
                      <p className="text-stone opacity-60 mb-0.5">💶 요금</p>
                      <p className="text-navy font-medium">{acc.cost}</p>
                    </div>
                  )}
                </div>
                {acc.memo && <p className="text-xs text-stone mt-3 leading-relaxed">{acc.memo}</p>}
              </div>
            ))}
          </section>
        )}

        {/* ── 5. 팁 / 경고 / 체크리스트 ── */}
        {(tipItems.length > 0 || warnItems.length > 0 || checkItems.length > 0) && (
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span> 여행 팁 &amp; 주의사항
            </h2>
            <div className="space-y-3">
              {/* 경고 */}
              {warnItems.map((t: any) => (
                <div key={t.id} className="rounded-xl px-4 py-3 bg-red-50 border border-red-200">
                  {t.title && <p className="text-xs font-semibold text-red-700 mb-1">⚠️ {t.title}</p>}
                  <p className="text-sm text-red-800 leading-relaxed">{t.content}</p>
                </div>
              ))}
              {/* 팁 */}
              {tipItems.map((t: any) => (
                <div key={t.id} className="rounded-xl px-4 py-3 bg-amber-50 border border-amber-200">
                  {t.title && <p className="text-xs font-semibold text-amber-700 mb-1">💡 {t.title}</p>}
                  <p className="text-sm text-amber-900 leading-relaxed">{t.content}</p>
                </div>
              ))}
              {/* 체크리스트 */}
              {checkItems.length > 0 && (
                <div className="rounded-xl px-4 py-4 bg-navy bg-opacity-5 border border-navy border-opacity-15">
                  <p className="text-xs font-semibold text-navy mb-3">✅ 출발 전 체크리스트</p>
                  <ul className="space-y-2">
                    {checkItems.map((t: any) => (
                      <li key={t.id} className="flex items-start gap-2 text-sm text-navy">
                        <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border border-navy border-opacity-30 flex items-center justify-center text-xs">□</span>
                        <span>{t.content || t.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 드라이브 정보 */}
        {guide?.drive_info && (
          <div className="mb-8 rounded-xl px-4 py-3 bg-blue-50 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-1">🚗 드라이브 정보</p>
            <p className="text-sm text-blue-900 leading-relaxed">{guide.drive_info}</p>
          </div>
        )}

        {/* 여행 일기 링크 */}
        {diary && (
          <Link href={`/diary/${diary.id}`} className="block mt-2 card hover:shadow-md transition-all border-olive">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{diary.mood}</span>
              <p className="text-xs font-medium" style={{ color: '#6B7C45' }}>실제 여행 일기</p>
            </div>
            <h3 className="font-medium text-navy mb-1">{diary.title}</h3>
            <p className="text-sm text-stone line-clamp-2">{diary.content}</p>
            <p className="text-sm text-terracotta mt-2">전체 일기 읽기 →</p>
          </Link>
        )}

      </div>
    </div>
  )
}
