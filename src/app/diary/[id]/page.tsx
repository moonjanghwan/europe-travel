import Nav from '@/components/Nav'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { SCHEDULE_DATA } from '@/lib/travel-data'

async function getDiary(id: string) {
  const { data } = await supabase
    .from('diaries')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single()
  return data
}

async function getPhotos(diaryId: string) {
  const { data } = await supabase
    .from('photos')
    .select('*')
    .eq('diary_id', diaryId)
    .order('created_at')
  return data || []
}

export const revalidate = 60

export default async function DiaryDetailPage({ params }: { params: { id: string } }) {
  const diary = await getDiary(params.id)
  if (!diary) notFound()

  const photos = await getPhotos(params.id)
  const scheduleData = SCHEDULE_DATA[diary.day_number]

  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <div className="pt-14 md:pt-20 max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">

        {/* 뒤로가기 */}
        <Link href="/diary" className="text-sm text-stone hover:text-navy flex items-center gap-1 mb-6">
          ← 일기 목록
        </Link>

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{diary.mood}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-terracotta">Day {diary.day_number}</span>
                <span className="text-sm text-stone">{diary.weather}</span>
              </div>
              <p className="text-xs text-stone">
                {new Date(diary.travel_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-navy mb-2">{diary.title}</h1>
          <p className="text-stone text-sm">📍 {diary.location}</p>
        </div>

        {/* 오늘 하이라이트 */}
        {scheduleData?.highlights && (
          <div className="bg-terracotta bg-opacity-10 rounded-xl p-4 mb-6 border border-terracotta border-opacity-20">
            <p className="text-xs font-medium text-terracotta mb-2">오늘의 하이라이트</p>
            <div className="flex flex-wrap gap-2">
              {scheduleData.highlights.map((h, i) => (
                <span key={i} className="text-xs bg-white text-navy px-2.5 py-1 rounded-full border border-stone border-opacity-20">
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 사진 갤러리 */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
            {photos.map(p => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-stone bg-opacity-10">
                <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* 일기 본문 */}
        <div className="card">
          <div className="prose prose-sm max-w-none text-navy leading-relaxed whitespace-pre-wrap">
            {diary.content}
          </div>
        </div>

        {/* 이전/다음 */}
        <div className="flex justify-between mt-8 text-sm">
          <Link href={`/diary?day=${diary.day_number - 1}`}
            className={`text-stone hover:text-navy ${diary.day_number <= 1 ? 'invisible' : ''}`}>
            ← Day {diary.day_number - 1}
          </Link>
          <Link href={`/diary?day=${diary.day_number + 1}`}
            className={`text-stone hover:text-navy ${diary.day_number >= 69 ? 'invisible' : ''}`}>
            Day {diary.day_number + 1} →
          </Link>
        </div>
      </div>
    </div>
  )
}
