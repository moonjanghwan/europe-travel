import Nav from '@/components/Nav'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

async function getDiaries() {
  const { data } = await supabase
    .from('diaries')
    .select('id, day_number, location, title, mood, weather, travel_date, created_at')
    .eq('is_public', true)
    .order('day_number', { ascending: false })
  return data || []
}

export const revalidate = 60

export default async function DiaryPage() {
  const diaries = await getDiaries()

  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <div className="pt-14 md:pt-20 max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy mb-1">여행 일기</h1>
            <p className="text-stone text-sm">총 {diaries.length}편의 이야기</p>
          </div>
        </div>

        {diaries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">✈️</p>
            <p className="text-stone">아직 작성된 일기가 없습니다.</p>
            <p className="text-stone text-sm mt-1">여행이 시작되면 매일 업데이트됩니다!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diaries.map(d => (
              <Link key={d.id} href={`/diary/${d.id}`}
                className="card hover:shadow-md transition-all group block">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{d.mood}</span>
                    <div>
                      <span className="text-xs font-medium text-terracotta">Day {d.day_number}</span>
                      <span className="text-xs text-stone ml-2">{d.weather}</span>
                    </div>
                  </div>
                  <span className="text-xs text-stone">{new Date(d.travel_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                </div>
                <p className="text-xs text-stone mb-1">📍 {d.location}</p>
                <h3 className="font-medium text-navy group-hover:text-terracotta transition-colors line-clamp-2">
                  {d.title}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
