'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SCHEDULE_DATA } from '@/lib/travel-data'
import Link from 'next/link'

export default function AdminGuidePage() {
  const [authed, setAuthed]     = useState(false)
  const [pw, setPw]             = useState('')
  const [pwError, setPwError]   = useState(false)

  const [selectedDay, setSelectedDay] = useState(1)
  const [guide, setGuide]             = useState<any>(null)
  const [loading, setLoading]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)

  // 편집 필드
  const [location,   setLocation]   = useState('')
  const [subtitle,   setSubtitle]   = useState('')
  const [content,    setContent]    = useState('')
  const [highlights, setHighlights] = useState('')

  function login() {
    if (pw === process.env.NEXT_PUBLIC_ADMIN_PW || pw === 'admin1234') {
      setAuthed(true); loadGuide(1)
    } else setPwError(true)
  }

  async function loadGuide(day: number) {
    setLoading(true)
    setSelectedDay(day)
    const { data } = await supabase
      .from('guide_contents')
      .select('*')
      .eq('day_number', day)
      .single()
    if (data) {
      setGuide(data)
      setLocation(data.location || '')
      setSubtitle(data.subtitle || '')
      setContent(data.content || '')
      setHighlights((data.highlights || []).join('\n'))
    } else {
      const sched = SCHEDULE_DATA[day]
      setGuide(null)
      setLocation(sched?.location || '')
      setSubtitle('')
      setContent('')
      setHighlights((sched?.highlights || []).join('\n'))
    }
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    const sched = SCHEDULE_DATA[selectedDay]
    const highlightsArr = highlights.split('\n').map(h => h.trim()).filter(Boolean)

    const payload = {
      day_number:  selectedDay,
      travel_date: sched?.date || '',
      location,
      subtitle,
      content,
      highlights:  highlightsArr,
      updated_at:  new Date().toISOString(),
    }

    if (guide) {
      await supabase.from('guide_contents').update(payload).eq('day_number', selectedDay)
    } else {
      await supabase.from('guide_contents').insert(payload)
    }

    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    loadGuide(selectedDay)
  }

  if (!authed) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="card w-full max-w-sm text-center">
        <p className="text-3xl mb-4">🔐</p>
        <h1 className="font-display text-2xl font-bold text-navy mb-6">관리자 로그인</h1>
        <input type="password" placeholder="비밀번호 입력" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
          className={`w-full border rounded-lg px-4 py-3 mb-3 text-sm outline-none focus:border-terracotta ${pwError ? 'border-red-400' : 'border-stone border-opacity-30'}`}
        />
        {pwError && <p className="text-red-500 text-xs mb-3">비밀번호가 틀렸습니다</p>}
        <button onClick={login} className="btn-primary w-full">로그인</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream">
      <div className="fixed top-0 left-0 right-0 z-50 bg-navy text-white h-12 flex items-center px-4 justify-between">
        <span className="font-medium text-sm">📖 가이드 내용 관리</span>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xs text-white opacity-70 hover:opacity-100">← 관리자 홈</Link>
          <Link href="/" className="text-xs text-white opacity-70 hover:opacity-100">홈</Link>
        </div>
      </div>

      <div className="pt-12 flex h-screen">

        {/* 왼쪽: Day 목록 */}
        <div className="w-36 md:w-48 flex-shrink-0 bg-white border-r border-stone border-opacity-20 overflow-y-auto pt-2 pb-20">
          {Array.from({ length: 69 }, (_, i) => i + 1).map(day => {
            const sched = SCHEDULE_DATA[day]
            return (
              <button key={day} onClick={() => loadGuide(day)}
                className={`w-full text-left px-3 py-2.5 border-b border-stone border-opacity-10 transition-colors ${
                  selectedDay === day ? 'bg-terracotta text-white' : 'hover:bg-stone hover:bg-opacity-10'
                }`}>
                <p className={`text-xs font-bold ${selectedDay === day ? 'text-white' : 'text-terracotta'}`}>Day {day}</p>
                <p className={`text-xs mt-0.5 truncate ${selectedDay === day ? 'text-white text-opacity-80' : 'text-stone'}`}>
                  {sched?.location || '이동'}
                </p>
              </button>
            )
          })}
        </div>

        {/* 오른쪽: 편집 영역 */}
        <div className="flex-1 overflow-y-auto p-4 pb-20">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-stone text-sm">불러오는 중...</p>
            </div>
          ) : (
            <div className="max-w-2xl space-y-4">

              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-navy">
                  Day {selectedDay} — {SCHEDULE_DATA[selectedDay]?.date}
                </h2>
                <div className="flex items-center gap-2">
                  <Link href={`/guide/${selectedDay}`} target="_blank"
                    className="text-xs text-stone hover:text-navy border border-stone border-opacity-30 px-3 py-1.5 rounded-lg">
                    미리보기 ↗
                  </Link>
                  <button onClick={save} disabled={saving}
                    className="btn-primary text-sm disabled:opacity-50">
                    {saving ? '저장 중...' : saved ? '✓ 저장완료!' : '저장'}
                  </button>
                </div>
              </div>

              {/* 장소명 */}
              <div className="card">
                <label className="text-xs font-medium text-stone mb-1 block">장소명</label>
                <input value={location} onChange={e => setLocation(e.target.value)}
                  className="w-full border border-stone border-opacity-30 rounded-lg px-3 py-2 text-sm outline-none focus:border-terracotta"
                />
              </div>

              {/* 부제목 */}
              <div className="card">
                <label className="text-xs font-medium text-stone mb-1 block">부제목 (한 줄 설명)</label>
                <input value={subtitle} onChange={e => setSubtitle(e.target.value)}
                  placeholder="예: 밀라노의 심장부 — 두오모 옥상부터 나빌리오까지"
                  className="w-full border border-stone border-opacity-30 rounded-lg px-3 py-2 text-sm outline-none focus:border-terracotta"
                />
              </div>

              {/* 하이라이트 */}
              <div className="card">
                <label className="text-xs font-medium text-stone mb-1 block">
                  하이라이트 태그 <span className="text-stone font-normal">(한 줄에 하나씩)</span>
                </label>
                <textarea value={highlights} onChange={e => setHighlights(e.target.value)}
                  rows={4} placeholder={"두오모 성당\n갈레리아\n리스카 인수"}
                  className="w-full border border-stone border-opacity-30 rounded-lg px-3 py-2 text-sm outline-none focus:border-terracotta resize-none"
                />
              </div>

              {/* 본문 */}
              <div className="card">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-stone">가이드북 본문 내용</label>
                  <span className="text-xs text-stone">{content.length.toLocaleString()}자</span>
                </div>
                <textarea value={content} onChange={e => setContent(e.target.value)}
                  rows={20}
                  placeholder="시간대별 일정, 관광지 정보, 팁 등을 자유롭게 입력..."
                  className="w-full border border-stone border-opacity-30 rounded-lg px-3 py-2 text-sm outline-none focus:border-terracotta resize-none font-mono"
                />
              </div>

              <button onClick={save} disabled={saving} className="btn-primary w-full">
                {saving ? '저장 중...' : saved ? '✓ 저장완료!' : 'Day ' + selectedDay + ' 저장하기'}
              </button>

            </div>
          )}
        </div>

      </div>
    </div>
  )
}
