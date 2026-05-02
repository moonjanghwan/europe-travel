'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SCHEDULE_DATA, getDayNumber, getPartForDay } from '@/lib/travel-data'
import Link from 'next/link'

const MOODS = ['😊','😄','🥰','😎','🤩','😴','😮','🥵','🌧️','🎉']
const WEATHERS = ['☀️','⛅','🌥️','🌧️','🌩️','❄️','🌈']

export default function AdminPage() {
  const [authed, setAuthed]   = useState(false)
  const [pw, setPw]           = useState('')
  const [pwError, setPwError] = useState(false)

  // 일기 폼
  const today = new Date()
  const dayNum = getDayNumber(today)
  const todayData = SCHEDULE_DATA[Math.max(1, Math.min(69, dayNum))]

  const [day,      setDay]      = useState(Math.max(1, Math.min(69, dayNum)))
  const [title,    setTitle]    = useState('')
  const [content,  setContent]  = useState('')
  const [mood,     setMood]     = useState('😊')
  const [weather,  setWeather]  = useState('☀️')
  const [isPublic, setIsPublic] = useState(true)
  const [photos,   setPhotos]   = useState<File[]>([])
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  // 블로그 대본
  const [script,       setScript]       = useState('')
  const [genLoading,   setGenLoading]   = useState(false)
  const [activeTab,    setActiveTab]    = useState<'diary'|'script'|'diaries'>('diary')
  const [diaryList,    setDiaryList]    = useState<any[]>([])

  // 로그인
  function login() {
    if (pw === process.env.NEXT_PUBLIC_ADMIN_PW || pw === 'admin1234') {
      setAuthed(true)
      setPwError(false)
      loadDiaries()
    } else {
      setPwError(true)
    }
  }

  async function loadDiaries() {
    const { data } = await supabase
      .from('diaries')
      .select('id, day_number, location, title, mood, travel_date')
      .order('day_number', { ascending: false })
      .limit(20)
    setDiaryList(data || [])
  }

  // 일기 저장
  async function saveDiary() {
    if (!title || !content) return alert('제목과 내용을 입력해주세요')
    setSaving(true)
    const dayData = SCHEDULE_DATA[day]

    const { data: diary, error } = await supabase.from('diaries').insert({
      day_number:  day,
      travel_date: dayData?.date || new Date().toISOString().split('T')[0],
      location:    dayData?.location || '이동',
      title, content, mood, weather, is_public: isPublic,
    }).select().single()

    if (error) { alert('저장 실패: ' + error.message); setSaving(false); return }

    // 사진 업로드
    for (const file of photos) {
      const ext  = file.name.split('.').pop()
      const path = `day${day}/${Date.now()}.${ext}`
      const { data: upload } = await supabase.storage
        .from('travel-photos')
        .upload(path, file, { upsert: true })

      if (upload) {
        const { data: urlData } = supabase.storage
          .from('travel-photos')
          .getPublicUrl(path)
        await supabase.from('photos').insert({
          diary_id: diary.id, day_number: day, url: urlData.publicUrl, caption: ''
        })
      }
    }

    setSaving(false); setSaved(true)
    setTitle(''); setContent(''); setPhotos([])
    setTimeout(() => setSaved(false), 3000)
    loadDiaries()
  }

  // 블로그 대본 생성
  async function generateScript() {
    if (!content) return alert('일기 내용을 먼저 작성해주세요')
    setGenLoading(true)
    const dayData = SCHEDULE_DATA[day]
    const part    = getPartForDay(day)

    try {
      const res = await fetch('/api/blog-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: day,
          location:  dayData?.location || '',
          highlights: dayData?.highlights || [],
          partName:  part?.name || '',
          title, content, mood, weather,
        }),
      })
      const data = await res.json()
      setScript(data.script || '')
      setActiveTab('script')
    } catch (e) {
      alert('대본 생성 실패. Anthropic API Key를 확인해주세요.')
    }
    setGenLoading(false)
  }

  async function saveScript(diaryId?: string) {
    if (!script) return
    await supabase.from('blog_scripts').insert({
      day_number: day, content: script, diary_id: diaryId || null
    })
    alert('대본이 저장되었습니다!')
  }

  if (!authed) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="card w-full max-w-sm text-center">
        <p className="text-3xl mb-4">🔐</p>
        <h1 className="font-display text-2xl font-bold text-navy mb-6">관리자 로그인</h1>
        <input
          type="password" placeholder="비밀번호 입력"
          value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          className={`w-full border rounded-lg px-4 py-3 mb-3 text-sm outline-none focus:border-terracotta ${
            pwError ? 'border-red-400' : 'border-stone border-opacity-30'
          }`}
        />
        {pwError && <p className="text-red-500 text-xs mb-3">비밀번호가 틀렸습니다</p>}
        <button onClick={login} className="btn-primary w-full">로그인</button>
        <p className="text-xs text-stone mt-4">Vercel 환경변수 ADMIN_PASSWORD 값을 입력하세요</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream">
      {/* 상단 바 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-navy text-white h-12 flex items-center px-4 justify-between">
        <span className="font-medium text-sm">🛠️ 관리자</span>
        <Link href="/" className="text-xs text-white opacity-70 hover:opacity-100">← 홈으로</Link>
      </div>

      <div className="pt-12 max-w-2xl mx-auto px-4 py-6 pb-20">

        {/* 탭 */}
        <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 border border-stone border-opacity-20">
          {(['diary','script','diaries'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-terracotta text-white' : 'text-stone hover:text-navy'
              }`}>
              {tab === 'diary' ? '📝 일기 작성' : tab === 'script' ? '✍️ 블로그 대본' : '📋 작성된 일기'}
            </button>
          ))}
        </div>

        {/* 일기 작성 탭 */}
        {activeTab === 'diary' && (
          <div className="space-y-4">
            {/* Day 선택 */}
            <div className="card">
              <label className="text-xs font-medium text-stone mb-2 block">Day 선택</label>
              <div className="flex items-center gap-3">
                <input type="number" min={1} max={69} value={day}
                  onChange={e => setDay(Number(e.target.value))}
                  className="w-20 border border-stone border-opacity-30 rounded-lg px-3 py-2 text-sm outline-none focus:border-terracotta"
                />
                <div>
                  <p className="text-sm font-medium text-navy">{SCHEDULE_DATA[day]?.location}</p>
                  <p className="text-xs text-stone">{SCHEDULE_DATA[day]?.date}</p>
                </div>
              </div>
            </div>

            {/* 기분/날씨 */}
            <div className="card">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone mb-2 block">기분</label>
                  <div className="flex flex-wrap gap-1.5">
                    {MOODS.map(m => (
                      <button key={m} onClick={() => setMood(m)}
                        className={`text-xl rounded-lg p-1 transition-all ${mood === m ? 'bg-terracotta bg-opacity-20 scale-110' : 'hover:bg-stone hover:bg-opacity-10'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone mb-2 block">날씨</label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEATHERS.map(w => (
                      <button key={w} onClick={() => setWeather(w)}
                        className={`text-xl rounded-lg p-1 transition-all ${weather === w ? 'bg-terracotta bg-opacity-20 scale-110' : 'hover:bg-stone hover:bg-opacity-10'}`}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 제목 */}
            <div className="card">
              <label className="text-xs font-medium text-stone mb-2 block">제목</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="오늘 하루를 한 문장으로..."
                className="w-full border border-stone border-opacity-30 rounded-lg px-4 py-3 text-sm outline-none focus:border-terracotta"
              />
            </div>

            {/* 내용 */}
            <div className="card">
              <label className="text-xs font-medium text-stone mb-2 block">일기 내용</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                rows={8} placeholder="오늘 하루 어땠나요? 자유롭게 써주세요..."
                className="w-full border border-stone border-opacity-30 rounded-lg px-4 py-3 text-sm outline-none focus:border-terracotta resize-none"
              />
            </div>

            {/* 사진 업로드 */}
            <div className="card">
              <label className="text-xs font-medium text-stone mb-2 block">사진 업로드</label>
              <input type="file" multiple accept="image/*"
                onChange={e => setPhotos(Array.from(e.target.files || []))}
                className="w-full text-sm text-stone"
              />
              {photos.length > 0 && (
                <p className="text-xs text-terracotta mt-2">{photos.length}장 선택됨</p>
              )}
            </div>

            {/* 공개 설정 */}
            <div className="card flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy">외부 공개</p>
                <p className="text-xs text-stone">방문자에게 이 일기를 공개합니다</p>
              </div>
              <button onClick={() => setIsPublic(!isPublic)}
                className={`w-12 h-6 rounded-full transition-all ${isPublic ? 'bg-terracotta' : 'bg-stone bg-opacity-30'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-all mx-0.5 ${isPublic ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button onClick={saveDiary} disabled={saving}
                className="btn-primary flex-1 disabled:opacity-50">
                {saving ? '저장 중...' : saved ? '✓ 저장완료!' : '일기 저장'}
              </button>
              <button onClick={generateScript} disabled={genLoading}
                className="btn-secondary flex-1 disabled:opacity-50">
                {genLoading ? 'AI 생성 중...' : '블로그 대본 생성'}
              </button>
            </div>
          </div>
        )}

        {/* 블로그 대본 탭 */}
        {activeTab === 'script' && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-medium text-navy">Day {day} 블로그 대본</h2>
                <button onClick={() => navigator.clipboard.writeText(script).then(() => alert('복사됨!'))}
                  className="text-xs btn-secondary px-3 py-1.5">
                  📋 복사
                </button>
              </div>
              {script ? (
                <textarea value={script} onChange={e => setScript(e.target.value)}
                  rows={20}
                  className="w-full border border-stone border-opacity-30 rounded-lg px-4 py-3 text-sm outline-none focus:border-terracotta resize-none font-mono text-xs"
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-stone text-sm">일기 작성 탭에서 "블로그 대본 생성" 버튼을 눌러주세요</p>
                </div>
              )}
            </div>
            {script && (
              <button onClick={() => saveScript()} className="btn-primary w-full">
                대본 저장
              </button>
            )}
          </div>
        )}

        {/* 작성된 일기 목록 탭 */}
        {activeTab === 'diaries' && (
          <div className="space-y-3">
            <button onClick={loadDiaries} className="btn-secondary w-full mb-2">새로고침</button>
            {diaryList.length === 0 ? (
              <div className="text-center py-12 text-stone text-sm">작성된 일기가 없습니다</div>
            ) : diaryList.map(d => (
              <div key={d.id} className="card flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-medium text-terracotta">Day {d.day_number}</span>
                  <span className="text-xs text-stone ml-2">{d.mood} {d.location}</span>
                  <p className="text-sm font-medium text-navy mt-0.5">{d.title}</p>
                </div>
                <Link href={`/diary/${d.id}`}
                  className="text-xs text-stone hover:text-navy flex-shrink-0">보기 →</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
