import Nav from '@/components/Nav'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getPartForDay, TRAVEL_START } from '@/lib/travel-data'
import { notFound } from 'next/navigation'
import GuideContent from '@/components/GuideContent'

async function getGuideContent(day: number) {
  const { data } = await supabase
    .from('guide_contents')
    .select('*')
    .eq('day_number', day)
    .single()
  return data
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

export async function generateStaticParams() {
  return Array.from({ length: 69 }, (_, i) => ({ day: String(i + 1) }))
}

export const revalidate = 60

export default async function GuideDayPage({ params }: { params: { day: string } }) {
  const dayNum = parseInt(params.day)
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 69) notFound()

  const [guide, diary] = await Promise.all([
    getGuideContent(dayNum),
    getDiaryForDay(dayNum),
  ])

  const part = getPartForDay(dayNum)
  const travelDate = new Date(TRAVEL_START)
  travelDate.setDate(travelDate.getDate() + dayNum - 1)

  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <div className="pt-14 md:pt-20 max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">

        <Link href="/schedule" className="text-sm text-stone hover:text-navy flex items-center gap-1 mb-6">
          ← 전체 일정
        </Link>

        <div className="mb-6">
          {part && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: part.color }}>{part.part}</div>
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

        <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 border border-stone border-opacity-20">
          <span className="flex-1 py-2 rounded-lg text-sm font-medium text-center bg-terracotta text-white">📖 가이드북</span>
          {diary ? (
            <Link href={`/diary/${diary.id}`} className="flex-1 py-2 rounded-lg text-sm font-medium text-center text-stone hover:text-navy transition-colors">📝 여행일기</Link>
          ) : (
            <span className="flex-1 py-2 rounded-lg text-sm font-medium text-center text-stone opacity-40">📝 일기 미작성</span>
          )}
        </div>

        <div className="card">
          {guide?.content ? (
            <GuideContent content={guide.content} />
          ) : (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-stone text-sm">이 날의 가이드 내용이 없습니다.</p>
              <Link href="/admin/guide" className="text-terracotta text-sm hover:underline mt-2 inline-block">관리자에서 추가 →</Link>
            </div>
          )}
        </div>

        {diary && (
          <Link href={`/diary/${diary.id}`} className="block mt-6 card hover:shadow-md transition-all border-olive">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{diary.mood}</span>
              <p className="text-xs font-medium" style={{color:'#6B7C45'}}>실제 여행 일기</p>
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
