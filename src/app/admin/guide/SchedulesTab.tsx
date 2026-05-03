'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Schedule = {
  id: string
  time_slot: string
  place_name: string
  activity: string
  cost: string
  memo: string
  sort_order: number
}

const EMPTY: Omit<Schedule, 'id' | 'sort_order'> = {
  time_slot: '', place_name: '', activity: '', cost: '', memo: '',
}

/** "HH:MM" 문자열을 분 단위 숫자로 변환 (정렬용) */
function toMinutes(t: string): number {
  if (!t) return 9999
  const [h, m] = t.split(':').map(Number)
  return (isNaN(h) ? 9999 : h) * 60 + (isNaN(m) ? 0 : m)
}

/** 시간 순으로 정렬한 뒤 sort_order를 index로 재계산 */
function sortByTime(list: Schedule[]): Schedule[] {
  return [...list].sort((a, b) => toMinutes(a.time_slot) - toMinutes(b.time_slot))
}

/** 연속된 두 항목의 시간 차이(분)로 시각적 간격 계산 */
function gapClass(diffMin: number): string {
  if (diffMin <= 30) return 'h-3'
  if (diffMin <= 60) return 'h-6'
  if (diffMin <= 120) return 'h-10'
  return 'h-14'
}

export default function SchedulesTab({ dayId, dayNumber }: { dayId: string; dayNumber: number }) {
  const [items, setItems] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Omit<Schedule, 'id' | 'sort_order'>>(EMPTY)
  const [showAdd, setShowAdd] = useState(false)
  const [newData, setNewData] = useState<Omit<Schedule, 'id' | 'sort_order'>>(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('guide_schedules')
      .select('*')
      .eq('day_id', dayId)
      .order('sort_order')
    setItems(data ? sortByTime(data) : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [dayId])

  /** 저장 후 DB의 sort_order를 시간 순 index로 일괄 업데이트 */
  const reorderDB = async (list: Schedule[]) => {
    const sorted = sortByTime(list)
    await Promise.all(
      sorted.map((s, i) =>
        supabase.from('guide_schedules').update({ sort_order: i }).eq('id', s.id)
      )
    )
  }

  const handleAdd = async () => {
    if (!newData.place_name.trim()) return
    setSaving(true)
    const { data: inserted } = await supabase
      .from('guide_schedules')
      .insert({ ...newData, day_id: dayId, day_number: dayNumber, sort_order: 999 })
      .select()
      .single()
    if (inserted) {
      const next = sortByTime([...items, inserted])
      await reorderDB(next)
    }
    setNewData(EMPTY)
    setShowAdd(false)
    setSaving(false)
    load()
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    await supabase.from('guide_schedules').update(editData).eq('id', id)
    const next = items.map(s => s.id === id ? { ...s, ...editData } : s)
    await reorderDB(next)
    setEditId(null)
    setSaving(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('guide_schedules').delete().eq('id', id)
    const next = items.filter(s => s.id !== id)
    await reorderDB(next)
    load()
  }

  const startEdit = (s: Schedule) => {
    setEditId(s.id)
    setEditData({ time_slot: s.time_slot, place_name: s.place_name, activity: s.activity, cost: s.cost, memo: s.memo })
  }

  if (loading) return <div className="text-stone text-sm py-8 text-center">로딩 중…</div>

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-navy">시간대별 일정 ({items.length})</h2>
        <button
          className="btn-primary text-xs px-3 py-1.5"
          onClick={() => { setShowAdd(v => !v); setNewData(EMPTY) }}
        >
          {showAdd ? '취소' : '+ 추가'}
        </button>
      </div>

      {/* 추가 폼 */}
      {showAdd && (
        <div className="card mb-5 bg-amber-50 border-amber-200">
          <p className="text-xs font-semibold text-amber-700 mb-3">새 일정 추가</p>
          <ScheduleForm data={newData} onChange={setNewData} />
          <div className="flex gap-2 mt-3">
            <button className="btn-primary text-xs px-3 py-1.5" onClick={handleAdd} disabled={saving}>
              {saving ? '저장 중…' : '저장'}
            </button>
            <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setShowAdd(false)}>취소</button>
          </div>
        </div>
      )}

      {/* 타임라인 목록 */}
      {items.length === 0 ? (
        <p className="text-stone text-sm text-center py-12">일정이 없습니다. 추가 버튼을 눌러 시작하세요.</p>
      ) : (
        <div className="relative">
          {items.map((s, idx) => {
            const next = items[idx + 1]
            const diffMin = next ? toMinutes(next.time_slot) - toMinutes(s.time_slot) : 0
            const isEditing = editId === s.id

            return (
              <div key={s.id}>
                {/* 항목 행 */}
                <div className={`flex gap-0 ${isEditing ? 'items-start' : 'items-start'}`}>
                  {/* 타임라인 선 + 점 */}
                  <div className="flex flex-col items-center flex-shrink-0 w-16 mr-3">
                    <div className="w-px bg-terracotta bg-opacity-20 flex-shrink-0"
                      style={{ height: idx === 0 ? '12px' : '0' }} />
                    <div className="w-3 h-3 rounded-full bg-terracotta flex-shrink-0 mt-0 border-2 border-white shadow-sm" />
                    {next && <div className={`w-px bg-terracotta bg-opacity-20 flex-1 mt-1 ${gapClass(diffMin)}`} />}
                  </div>

                  {/* 카드 */}
                  <div className={`flex-1 mb-2 ${isEditing ? '' : 'pb-1'}`}>
                    {isEditing ? (
                      <div className="card bg-amber-50 border-amber-200 mb-3">
                        <p className="text-xs font-semibold text-amber-700 mb-3">일정 수정</p>
                        <ScheduleForm data={editData} onChange={setEditData} />
                        <div className="flex gap-2 mt-3">
                          <button className="btn-primary text-xs px-3 py-1.5" onClick={() => handleSave(s.id)} disabled={saving}>
                            {saving ? '저장 중…' : '저장'}
                          </button>
                          <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setEditId(null)}>취소</button>
                        </div>
                      </div>
                    ) : (
                      <div className="group flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          {/* 시간 뱃지 + 장소명 */}
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            {s.time_slot ? (
                              <span className="font-mono text-xs font-bold bg-terracotta text-white px-2 py-0.5 rounded-md">
                                {s.time_slot}
                              </span>
                            ) : (
                              <span className="font-mono text-xs text-stone px-2 py-0.5 rounded-md border border-stone border-opacity-30">
                                시간 미정
                              </span>
                            )}
                            <span className="font-medium text-navy text-sm leading-snug">{s.place_name}</span>
                            {s.cost && s.cost !== '-' && s.cost !== '' && (
                              <span className="text-xs bg-navy bg-opacity-10 text-navy px-2 py-0.5 rounded-full">{s.cost}</span>
                            )}
                          </div>
                          {s.activity && (
                            <p className="text-xs text-stone mt-0.5 leading-relaxed">{s.activity}</p>
                          )}
                          {s.memo && (
                            <p className="text-xs text-stone italic mt-0.5 opacity-70">{s.memo}</p>
                          )}
                        </div>
                        {/* 수정·삭제 버튼 (hover 시 표시) */}
                        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(s)}
                            className="text-xs text-stone hover:text-navy border border-stone border-opacity-30 rounded px-2 py-1 bg-white"
                          >수정</button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="text-xs text-red-400 hover:text-red-600 border border-red-200 rounded px-2 py-1 bg-white"
                          >삭제</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 시간 간격 표시 (60분 이상일 때) */}
                {next && !isEditing && diffMin >= 60 && toMinutes(s.time_slot) < 9000 && toMinutes(next.time_slot) < 9000 && (
                  <div className="flex gap-3 items-center ml-[76px] mb-1">
                    <span className="text-xs text-stone opacity-40 italic">{Math.round(diffMin / 60 * 10) / 10}시간 간격</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── 폼 컴포넌트 ──────────────────────────────────────────────────

function ScheduleForm({
  data, onChange,
}: {
  data: Omit<Schedule, 'id' | 'sort_order'>
  onChange: (d: Omit<Schedule, 'id' | 'sort_order'>) => void
}) {
  const set = (k: string, v: string) => onChange({ ...data, [k]: v })
  const inputCls = "w-full border border-stone border-opacity-30 rounded-lg px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-terracotta"

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* 시간 선택 */}
      <div>
        <label className="block text-xs text-stone mb-1">시간 (time_slot)</label>
        <input
          type="time"
          className={inputCls}
          value={data.time_slot}
          onChange={e => set('time_slot', e.target.value)}
        />
      </div>

      {/* 비용 */}
      <div>
        <label className="block text-xs text-stone mb-1">비용 (cost)</label>
        <input
          className={inputCls}
          value={data.cost}
          onChange={e => set('cost', e.target.value)}
          placeholder="무료 / EUR10"
        />
      </div>

      {/* 장소명 */}
      <div className="col-span-2">
        <label className="block text-xs text-stone mb-1">장소 (place_name) *</label>
        <input
          className={inputCls}
          value={data.place_name}
          onChange={e => set('place_name', e.target.value)}
          placeholder="장소명"
        />
      </div>

      {/* 활동 */}
      <div className="col-span-2">
        <label className="block text-xs text-stone mb-1">활동 (activity)</label>
        <textarea
          className={inputCls}
          rows={2}
          value={data.activity}
          onChange={e => set('activity', e.target.value)}
          placeholder="활동 설명"
        />
      </div>

      {/* 메모 */}
      <div className="col-span-2">
        <label className="block text-xs text-stone mb-1">메모 (memo)</label>
        <input
          className={inputCls}
          value={data.memo}
          onChange={e => set('memo', e.target.value)}
          placeholder="추가 메모 (선택)"
        />
      </div>
    </div>
  )
}
