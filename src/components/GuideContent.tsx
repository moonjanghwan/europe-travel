'use client'

import React from 'react'

/* ─── 타입 ─────────────────────────────────────── */
type Block =
  | { type: 'schedule'; items: ScheduleItem[] }
  | { type: 'attractions'; items: AttractionItem[] }
  | { type: 'restaurants'; items: RestaurantItem[] }
  | { type: 'tip'; text: string }
  | { type: 'accommodation'; items: AccomItem[] }
  | { type: 'ztl'; text: string }
  | { type: 'section_header'; title: string }
  | { type: 'text'; lines: string[] }

interface ScheduleItem {
  time?: string
  place?: string
  activity?: string
  cost?: string
  raw: string
}

interface AttractionItem {
  name: string
  details: string[]
}

interface RestaurantItem {
  name: string
  details: string[]
}

interface AccomItem {
  name: string
  details: string[]
}

/* ─── 헬퍼: 시간 패턴 감지 ──────────────────────── */
const TIME_RE = /^(\d{1,2}[:.]\d{2}|\d{1,2}시(?:\s*\d{1,2}분)?)/

/* ─── 헬퍼: 3글자 이하 단독 단락 필터 ─────────────── */
const isShortWord = (l: string) => l.trim().length <= 3

/* ─── 파서 ────────────────────────────────────── */
export function parseGuideContent(raw: string): Block[] {
  const lines = raw.split('\n')
  const blocks: Block[] = []

  // 섹션 경계 정규식
  const SECTION_RE = /\[\s*(시간대별\s*일정|관광지\s*상세\s*정보|식당\s*추천|TIP|숙소|ZTL\s*경고|.*?)\s*\]/i

  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    /* 빈 줄 스킵 */
    if (!line) { i++; continue }

    const sectionMatch = line.match(SECTION_RE)
    if (!sectionMatch) {
      // 일반 텍스트 — 다음 섹션 헤더 전까지 모읍니다
      const textLines: string[] = isShortWord(line) ? [] : [line]
      i++
      while (i < lines.length && !lines[i].trim().match(SECTION_RE)) {
        const tl = lines[i].trim()
        if (tl && !isShortWord(tl)) textLines.push(tl)
        i++
      }
      if (textLines.length) blocks.push({ type: 'text', lines: textLines })
      continue
    }

    const sectionName = sectionMatch[1].replace(/\s+/g, '')
    i++ // 헤더 줄 소비

    /* 섹션 본문 수집 (다음 섹션 헤더 전까지) */
    const body: string[] = []
    while (i < lines.length && !lines[i].trim().match(SECTION_RE)) {
      body.push(lines[i])
      i++
    }

    /* ── 시간대별 일정 ── */
    if (sectionName.includes('시간대별')) {
      blocks.push({ type: 'schedule', items: parseSchedule(body) })
      continue
    }

    /* ── 관광지 상세 정보 ── */
    if (sectionName.includes('관광지')) {
      blocks.push({ type: 'attractions', items: parseCards(body) })
      continue
    }

    /* ── 식당 추천 ── */
    if (sectionName.includes('식당')) {
      blocks.push({ type: 'restaurants', items: parseCards(body) })
      continue
    }

    /* ── TIP ── */
    if (sectionName.toUpperCase().includes('TIP')) {
      blocks.push({ type: 'tip', text: body.filter(l => l.trim()).join('\n') })
      continue
    }

    /* ── 숙소 ── */
    if (sectionName.includes('숙소')) {
      blocks.push({ type: 'accommodation', items: parseCards(body) })
      continue
    }

    /* ── ZTL 경고 ── */
    if (sectionName.toUpperCase().includes('ZTL')) {
      blocks.push({ type: 'ztl', text: body.filter(l => l.trim()).join('\n') })
      continue
    }

    /* ── 그 외 섹션 헤더 ── */
    blocks.push({ type: 'section_header', title: sectionMatch[1] })
    if (body.filter(l => l.trim()).length) {
      blocks.push({ type: 'text', lines: body.filter(l => l.trim()) })
    }
  }

  return blocks
}

/* ─── 시간대별 일정 파싱 ──────────────────────── */
function parseSchedule(lines: string[]): ScheduleItem[] {
  const items: ScheduleItem[] = []
  let current: ScheduleItem | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const timeMatch = line.match(TIME_RE)

    // 시간으로 시작하면 새 아이템
    if (timeMatch) {
      if (current) items.push(current)
      const rest = line.slice(timeMatch[0].length).replace(/^[\s\-–:]+/, '')

      // "장소 | 활동" or "활동 (비용)" 파턴 시도
      const costMatch = rest.match(/\(([^)]*(?:€|₩|원|유로|무료)[^)]*)\)/)
      const cost = costMatch ? costMatch[1] : undefined
      const withoutCost = costMatch ? rest.replace(costMatch[0], '').trim() : rest

      const parts = withoutCost.split(/\s*[|｜]\s*/)
      current = {
        time: timeMatch[0].trim(),
        place: parts.length > 1 ? parts[0].trim() : undefined,
        activity: parts.length > 1 ? parts.slice(1).join(' ').trim() : withoutCost.trim(),
        cost,
        raw: line,
      }
    } else if (current) {
      // 이전 아이템 보충 정보
      const costMatch = line.match(/\(([^)]*(?:€|₩|원|유로|무료)[^)]*)\)/)
      if (costMatch && !current.cost) {
        current.cost = costMatch[1]
      } else {
        current.activity = (current.activity ? current.activity + ' ' : '') + line
      }
    } else {
      // 시간 없는 첫 줄
      items.push({ raw: line })
    }
  }

  if (current) items.push(current)
  return items
}

/* ─── 카드형 공통 파싱 (관광지 / 식당 / 숙소) ─── */
function parseCards(lines: string[]): Array<{ name: string; details: string[] }> {
  const items: Array<{ name: string; details: string[] }> = []
  let current: { name: string; details: string[] } | null = null

  const isHeader = (l: string) =>
    /^[①②③④⑤⑥⑦⑧⑨⑩➊➋➌➍➎]/.test(l) ||
    /^\d+\.\s+\S/.test(l) ||
    /^[★☆◆◇▶▷●○]\s*\S/.test(l) ||
    /^【.+】/.test(l) ||
    /^[A-Za-z가-힣\s]{2,30}$/.test(l.trim()) // 짧은 이름 줄

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (isHeader(line) || (!current && line.length < 40)) {
      if (current) items.push(current)
      // 번호 접두사 제거
      const name = line.replace(/^[①②③④⑤⑥⑦⑧⑨⑩➊➋➌➍➎\d]+[.。)\s]*/, '')
        .replace(/^[★☆◆◇▶▷●○]\s*/, '')
        .replace(/^【|】$/g, '')
        .trim()
      current = { name, details: [] }
    } else if (current) {
      current.details.push(line)
    } else {
      current = { name: line, details: [] }
    }
  }

  if (current) items.push(current)
  return items.filter(c => c.name)
}

/* ─── 렌더 컴포넌트 ────────────────────────────── */
export default function GuideContent({ content }: { content: string }) {
  const blocks = parseGuideContent(content)

  return (
    <div className="guide-content space-y-6">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'schedule':
            return <ScheduleSection key={idx} items={block.items} />
          case 'attractions':
            return <AttractionSection key={idx} items={block.items} />
          case 'restaurants':
            return <RestaurantSection key={idx} items={block.items} />
          case 'tip':
            return <TipBox key={idx} text={block.text} />
          case 'accommodation':
            return <AccomSection key={idx} items={block.items} />
          case 'ztl':
            return <ZtlBox key={idx} text={block.text} />
          case 'section_header':
            return (
              <h2 key={idx} className="text-lg font-bold text-navy border-b border-stone border-opacity-20 pb-2 pt-2">
                {block.title}
              </h2>
            )
          case 'text': {
            const visibleLines = block.lines.filter(l => !isShortWord(l))
            if (!visibleLines.length) return null
            return (
              <div key={idx} className="text-sm text-navy leading-relaxed space-y-1">
                {visibleLines.map((l, j) => (
                  <p key={j}>{l}</p>
                ))}
              </div>
            )
          }
        }
      })}
    </div>
  )
}

/* ─── 시간대별 일정 섹션 ────────────────────────── */
function ScheduleSection({ items }: { items: ScheduleItem[] }) {
  return (
    <div>
      <SectionLabel emoji="🕐" label="시간대별 일정" color="terracotta" />
      <div className="space-y-3 mt-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            {/* 타임라인 dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-terracotta mt-1.5" />
              {i < items.length - 1 && (
                <div className="w-0.5 bg-stone bg-opacity-30 flex-1 mt-1 min-h-[20px]" />
              )}
            </div>
            {/* 카드 */}
            <div className="flex-1 bg-white rounded-xl border border-stone border-opacity-20 p-3.5 mb-1 shadow-sm">
              {item.time && (
                <span className="inline-block text-xs font-bold text-terracotta bg-terracotta bg-opacity-10 px-2 py-0.5 rounded-full mb-1.5">
                  {item.time}
                </span>
              )}
              {item.place && (
                <p className="text-xs text-stone font-medium mb-0.5">📍 {item.place}</p>
              )}
              {item.activity && (
                <p className="text-sm text-navy font-medium leading-snug">{item.activity}</p>
              )}
              {!item.time && !item.place && !item.activity && (
                <p className="text-sm text-navy">{item.raw}</p>
              )}
              {item.cost && (
                <span className="inline-block mt-1.5 text-xs text-olive bg-olive bg-opacity-10 px-2 py-0.5 rounded-full">
                  💰 {item.cost}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── 관광지 섹션 ──────────────────────────────── */
function AttractionSection({ items }: { items: AttractionItem[] }) {
  return (
    <div>
      <SectionLabel emoji="🏛️" label="관광지 상세 정보" color="navy" />
      <div className="grid gap-3 mt-3">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-stone border-opacity-20 p-4 shadow-sm">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-base flex-shrink-0">🗺️</span>
              <h3 className="text-sm font-bold text-navy leading-snug">{item.name}</h3>
            </div>
            {item.details.length > 0 && (
              <ul className="space-y-1">
                {item.details.map((d, j) => (
                  <li key={j} className="text-xs text-stone flex gap-1.5 items-start">
                    <span className="text-stone opacity-50 flex-shrink-0 mt-0.5">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── 식당 섹션 ─────────────────────────────────── */
function RestaurantSection({ items }: { items: RestaurantItem[] }) {
  return (
    <div>
      <SectionLabel emoji="🍽️" label="식당 추천" color="gold" />
      <div className="grid gap-3 mt-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-stone border-opacity-20 p-4 shadow-sm">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-base flex-shrink-0">🍴</span>
              <h3 className="text-sm font-bold text-navy leading-snug">{item.name}</h3>
            </div>
            {item.details.length > 0 && (
              <ul className="space-y-1">
                {item.details.map((d, j) => (
                  <li key={j} className="text-xs text-stone flex gap-1.5 items-start">
                    <span className="text-gold opacity-70 flex-shrink-0 mt-0.5">★</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── 숙소 섹션 ─────────────────────────────────── */
function AccomSection({ items }: { items: AccomItem[] }) {
  return (
    <div>
      <SectionLabel emoji="🏨" label="숙소" color="olive" />
      <div className="grid gap-3 mt-3">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-olive border-opacity-30 p-4 shadow-sm">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-base flex-shrink-0">🛏️</span>
              <h3 className="text-sm font-bold text-navy leading-snug">{item.name}</h3>
            </div>
            {item.details.length > 0 && (
              <ul className="space-y-1">
                {item.details.map((d, j) => (
                  <li key={j} className="text-xs text-stone flex gap-1.5 items-start">
                    <span className="text-olive opacity-60 flex-shrink-0 mt-0.5">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── TIP 박스 ──────────────────────────────────── */
function TipBox({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
      <p className="text-xs font-bold text-yellow-700 mb-2">💡 TIP</p>
      <div className="text-sm text-yellow-900 leading-relaxed whitespace-pre-line">
        {text}
      </div>
    </div>
  )
}

/* ─── ZTL 경고 박스 ─────────────────────────────── */
function ZtlBox({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-red-300 bg-red-50 p-4">
      <p className="text-xs font-bold text-red-600 mb-2">🚫 ZTL 경고</p>
      <div className="text-sm text-red-800 leading-relaxed whitespace-pre-line">
        {text}
      </div>
    </div>
  )
}

/* ─── 섹션 레이블 헬퍼 ──────────────────────────── */
type LabelColor = 'terracotta' | 'navy' | 'gold' | 'olive'
const colorMap: Record<LabelColor, string> = {
  terracotta: 'text-terracotta border-terracotta',
  navy: 'text-navy border-navy',
  gold: 'text-gold border-gold',
  olive: 'text-olive border-olive',
}

function SectionLabel({ emoji, label, color }: { emoji: string; label: string; color: LabelColor }) {
  return (
    <div className={`flex items-center gap-2 pb-2 border-b border-opacity-20 ${colorMap[color]}`}>
      <span className="text-base">{emoji}</span>
      <h2 className="text-sm font-bold tracking-wide uppercase">{label}</h2>
    </div>
  )
}
