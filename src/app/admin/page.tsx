'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SCHEDULE_DATA, getDayNumber, getPartForDay } from '@/lib/travel-data'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const MOODS    = ['😊','😄','🥰','😎','🤩','😴','😮','🥵','🌧️','🎉']
const WEATHERS = ['☀️','⛅','🌥️','🌧️','🌩️','❄️','🌈']

// ─── 관리 메뉴 카드 ───────────────────────────────────────────────
const MENU_CARDS = [
  { icon: '📖', title: '가이드 수정',    desc: '일정·관광지·식당·숙소·팁',   href: '/admin/guide',   color: 'border-terracotta' },
  { icon: '📝', title: '일기 작성',     desc: '오늘의 여행일기 작성',        href: null, tab: 'diary',    color: 'border-navy' },
  { icon: '✍️', title: '블로그 대본',   desc: 'AI 블로그 대본 생성',         href: null, tab: 'script',   color: 'border-olive' },
  { icon: '📋', title: '일기 목록',     desc: '작성된 여행일기 보기',         href: null, tab: 'diaries',  color: 'border-stone' },
  { icon: '🗺️', title: '전체 일정',    desc: '69일 여행 일정표',            href: '/schedule',      color: 'border-stone' },
  { icon: '📸', title: '갤러리',        desc: '여행 사진 모아보기',           href: '/gallery',       color: 'border-stone' },
  { icon: '📖', title: '가이드북',      desc: 'Day별 가이드 보기',           href: '/guide/1',       color: 'border-stone' },
  { icon: '🏠', title: '홈 보기',       desc: '방문자 화면 미리보기',          href: '/',              color: 'border-stone' },
  { icon: '🔒', title: '로그아웃',      desc: '관리자 세션 종료',             href: null, tab: 'logout', color: 'border-red-300' },
]

// ─── 메인 컴포넌트 ────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()

  // sessionStorage 기반 인증
  const [authed,   setAuthed]   = useState(false)
  const [pw,       setPw]       = useState('')
  const [pwError,  setPwError]  = useState(false)
  const [checked,  setChecked]  = useState(false)   // hydration 완료 전 깜빡임 방지

  useEffect(() => {
    if (sessionStorage.getItem('admin_authed') === '1') {
      setAuthed(true)
      loadDiaries()
    }
    setChecked(true)
  }, [])

  function login() {
    if (pw === process.env.NEXT_PUBLIC_ADMIN_PW || pw === 'admin1234') {
      sessionStorage.setItem('admin_authed', '1')
      setAuthed(true)
      setPwError(false)
      loadDiaries()
    } else {
      setPwError(true)
    }
  }

  function logout() {
    sessionStorage.removeItem('admin_authed')
    setAuthed(false)
    setActiveTab('dashboard')
  }

  // ─── 탭 상태 ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'dashboard'|'diary'|'script'|'diaries'>('dashboard')

  function handleMenuClick(card: typeof MENU_CARDS[0]) {
    if (card.href) { router.push(card.href); return }
    if (card.tab === 'logout') { logout(); return }
    if (card.tab) setActiveTab(card.tab as any)
  }

  // ─── 일기 폼 ──────────────────────────────────────────────────
  const today    = new Date()
  const dayNum   = getDayNumber(today)
  const [day,      setDay]      = useState(Math.max(1, Math.min(69, dayNum)))
  const [title,    setTitle]    = useState('')
  const [content,  setContent]  = useState('')
  const [mood,     setMood]     = useState('😊')
  const [weather,  setWeather]  = useState('☀️')
  const [isPublic, setIsPublic] = useState(true)
  const [photos,   setPhotos]   = useState<File[]>([])
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [script,      setScript]      = useState('')
  const [genLoading,  setGenLoading]  = useState(false)
  const [diaryList,   setDiaryList]   = useState<any[]>([])

  async function loadDiaries() {
    const { data } = await supabase
      .from('diaries')
      .select('id, day_number, location, title, mood, travel_date')
      .order('day_number', { ascending: false })
      .limit(20)
    setDiaryList(data || [])
  }

  async function saveDiary() {
    if (!title || !content) return alert('제목과 내용을 입력해주세요')
    setSaving(true)
    const dayData = SCHEDULE_DATA[day]
    const { data: diary, error } = await supabase.from('diaries').insert({
      day_number: day, travel_date: dayData?.date || new Date().toISOString().split('T')[0],
      location: dayData?.location || '이동', title, content, mood, weather, is_public: isPublic,
    }).select().single()
    if (error) { alert('저장 실패: ' + error.message); setSaving(false); return }
    for (const file of photos) {
      const ext  = file.name.split('.').pop()
      const path = `day${day}/${Date.now()}.${ext}`
      const { data: upload } = await supabase.storage.from('travel-photos').upload(path, file, { upsert: true })
      if (upload) {
        const { data: urlData } = supabase.storage.from('travel-photos').getPublicUrl(path)
        await supabase.from('photos').insert({ diary_id: diary.id, day_number: day, url: urlData.publicUrl, caption: '' })
      }
    }
    setSaving(false); setSaved(true)
    setTitle(''); setContent(''); setPhotos([])
    setTimeout(() => setSaved(false), 3000)
    loadDiaries()
  }

  async function generateScript() {
    if (!content) return alert('일기 내용을 먼저 작성해주세요')
    setGenLoading(true)
    const dayData = SCHEDULE_DATA[day]
    const part    = getPartForDay(day)
    try {
      const res  = await fetch('/api/blog-script', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber: day, location: dayData?.location || '', highlights: dayData?.highlights || [], partName: part?.name || '', title, content, mood, weather }),
      })
      const data = await res.json()
      setScript(data.script || '')
      setActiveTab('script')
    } catch { alert('대본 생성 실패. Anthropic API Key를 확인해주세요.') }
    setGenLoading(false)
  }

  async function saveScript() {
    if (!script) return
    await supabase.from('blog_scripts').insert({ day_number: day, content: script })
    alert('대본이 저장되었습니다!')
  }

  // ─── hydration 완료 전 렌더 방지 ────────────────────────────────
  if (!checked) return null

  // ─── 로그인 화면 ─────────────────────────────────────────────────
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
        <Link href="/" className="block text-xs text-stone mt-4 hover:text-navy">← 홈으로</Link>
      </div>
    </div>
  )

  // ─── 관리자 대시보드 ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream">
      {/* 상단 바 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-navy text-white h-12 flex items-center px-4 justify-between">
        <span className="font-medium text-sm">🛠️ 관리자 대시보드</span>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs text-white opacity-70 hover:opacity-100">← 홈</Link>
          <button onClick={logout} className="text-xs text-white opacity-70 hover:opacity-100 border border-white border-opacity-30 rounded px-2 py-1">
            🔒 로그아웃
          </button>
        </div>
      </div>

      <div className="pt-12 max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">

        {/* 대시보드 탭 */}
        <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 border border-stone border-opacity-20 overflow-x-auto">
          {(['dashboard','diary','script','diaries'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab ? 'bg-terracotta text-white' : 'text-stone hover:text-navy'
              }`}>
              {tab === 'dashboard' ? '🏠 대시보드' : tab === 'diary' ? '📝 일기 작성' : tab === 'script' ? '✍️ 블로그 대본' : '📋 일기 목록'}
            </button>
          ))}
        </div>

        {/* ── 대시보드 카드 그리드 ── */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MENU_CARDS.map((card, i) => (
              <button
                key={i}
                onClick={() => handleMenuClick(card)}
                className={`card text-left hover:shadow-md transition-all hover:-translate-y-0.5 border-l-4 ${card.color} group`}
              >
                <span className="text-2xl block mb-2">{card.icon}</span>
                <p className="font-semibold text-navy text-sm group-hover:text-terracotta transition-colors">{card.title}</p>
                <p className="text-xs text-stone mt-0.5">{card.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* ── 일기 작성 탭 ── */}
        {activeTab === 'diary' && (
          <div className="space-y-4">
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

            <div className="card">
              <label className="text-xs font-medium text-stone mb-2 block">제목</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="오늘 하루를 한 문장으로..."
                className="w-full border border-stone border-opacity-30 rounded-lg px-4 py-3 text-sm outline-none focus:border-terracotta"
              />
            </div>

            <div className="card">
              <label className="text-xs font-medium text-stone mb-2 block">일기 내용</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                rows={8} placeholder="오늘 하루 어땠나요?"
                className="w-full border border-stone border-opacity-30 rounded-lg px-4 py-3 text-sm outline-none focus:border-terracotta resize-none"
              />
            </div>

            <div className="card">
              <label className="text-xs font-medium text-stone mb-2 block">사진 업로드</label>
              <input type="file" multiple accept="image/*"
                onChange={e => setPhotos(Array.from(e.target.files || []))}
                className="w-full text-sm text-stone"
              />
              {photos.length > 0 && <p className="text-xs text-terracotta mt-2">{photos.length}장 선택됨</p>}
            </div>

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

            <div className="flex gap-3">
              <button onClick={saveDiary} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? '저장 중...' : saved ? '✓ 저장완료!' : '일기 저장'}
              </button>
              <button onClick={generateScript} disabled={genLoading} className="btn-secondary flex-1 disabled:opacity-50">
                {genLoading ? 'AI 생성 중...' : '블로그 대본 생성'}
              </button>
            </div>
          </div>
        )}

        {/* ── 블로그 대본 탭 ── */}
        {activeTab === 'script' && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-medium text-navy">Day {day} 블로그 대본</h2>
                <button onClick={() => navigator.clipboard.writeText(script).then(() => alert('복사됨!'))}
                  className="text-xs btn-secondary px-3 py-1.5">📋 복사</button>
              </div>
              {script ? (
                <textarea value={script} onChange={e => setScript(e.target.value)} rows={20}
                  className="w-full border border-stone border-opacity-30 rounded-lg px-4 py-3 text-sm outline-none focus:border-terracotta resize-none font-mono text-xs"
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-stone text-sm">일기 작성 탭에서 "블로그 대본 생성" 버튼을 눌러주세요</p>
                </div>
              )}
            </div>
            {script && <button onClick={saveScript} className="btn-primary w-full">대본 저장</button>}
          </div>
        )}

        {/* ── 일기 목록 탭 ── */}
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
                <Link href={`/diary/${d.id}`} className="text-xs text-stone hover:text-navy flex-shrink-0">보기 →</Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
