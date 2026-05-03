'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Schedule = {
  id: string
  time_slot: string
  place_name: string
  activity: string
  cost: string
  sort_order: number
  memo: string
}

const EMPTY: Omit<Schedule, 'id' | 'sort_order'> = {
  time_slot: '', place_name: '', activity: '', cost: '', memo: '',
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
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [dayId])

  const handleAdd = async () => {
    if (!newData.place_name.trim()) return
    setSaving(true)
    await supabase.from('guide_schedules').insert({
      ...newData,
      day_id: dayId,
      day_number: dayNumber,
      sort_order: items.length,
    })
    setNewData(EMPTY)
    setShowAdd(false)
    setSaving(false)
    load()
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    await supabase.from('guide_schedules').update(editData).eq('id', id)
    setEditId(null)
    setSaving(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('guide_schedules').delete().eq('id', id)
    load()
  }

  const handleMove = async (idx: number, dir: -1 | 1) => {
    const next = idx + dir
    if (next < 0 || next >= items.length) return
    const a = items[idx], b = items[next]
    await Promise.all([
      supabase.from('guide_schedules').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('guide_schedules').update({ sort_order: a.sort_order }).eq('id', b.id),
    ])
    load()
  }

  const startEdit = (s: Schedule) => {
    setEditId(s.id)
    setEditData({ time_slot: s.time_slot, place_name: s.place_name, activity: s.activity, cost: s.cost, memo: s.memo })
  }

  if (loading) return <div className="text-stone text-sm py-8 text-center">로딩 중…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-navy">시간대별 일정 ({items.length})</h2>
        <button className="btn-primary text-xs px-3 py-1.5" onClick={() => setShowAdd(v => !v)}>+ 추가</button>
      </div>

      {/* 추가 폼 */}
      {showAdd && (
        <div className="card mb-4 bg-amber-50 border-amber-200">
          <p className="text-xs font-semibold text-amber-700 mb-3">새 일정 추가</p>
          <FormFields data={newData} onChange={setNewData} />
          <div className="flex gap-2 mt-3">
            <button className="btn-primary text-xs px-3 py-1.5" onClick={handleAdd} disabled={saving}>저장</button>
            <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setShowAdd(false)}>취소</button>
          </div>
        </div>
      )}

      {/* 목록 */}
      <div className="space-y-2">
        {items.map((s, idx) => (
          <div key={s.id} className="card p-0 overflow-hidden">
            {editId === s.id ? (
              <div className="p-4">
                <FormFields data={editData} onChange={setEditData} />
                <div className="flex gap-2 mt-3">
                  <button className="btn-primary text-xs px-3 py-1.5" onClick={() => handleSave(s.id)} disabled={saving}>저장</button>
                  <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setEditId(null)}>취소</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 px-4 py-3">
                {/* 순서 버튼 */}
                <div className="flex flex-col gap-0.5 flex-shrink-0 mt-0.5">
                  <button onClick={() => handleMove(idx, -1)} disabled={idx === 0} className="text-xs text-stone hover:text-navy disabled:opacity-20 leading-none">▲</button>
                  <button onClick={() => handleMove(idx, 1)} disabled={idx === items.length - 1} className="text-xs text-stone hover:text-navy disabled:opacity-20 leading-none">▼</button>
                </div>
                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-terracotta">{s.time_slot || '—'}</span>
                    <span className="font-medium text-navy text-sm">{s.place_name}</span>
                    {s.cost && s.cost !== '-' && <span className="text-xs bg-navy bg-opacity-10 text-navy px-2 py-0.5 rounded-full">{s.cost}</span>}
                  </div>
                  {s.activity && <p className="text-xs text-stone mt-0.5">{s.activity}</p>}
                  {s.memo && <p className="text-xs text-stone italic mt-0.5">{s.memo}</p>}
                </div>
                {/* 액션 */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => startEdit(s)} className="text-xs text-stone hover:text-navy border border-stone border-opacity-30 rounded px-2 py-1">수정</button>
                  <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 hover:text-red-600 border border-red-200 rounded px-2 py-1">삭제</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-stone text-sm text-center py-8">일정이 없습니다.</p>}
      </div>
    </div>
  )
}

function FormFields({ data, onChange }: {
  data: Omit<Schedule, 'id' | 'sort_order'>
  onChange: (d: Omit<Schedule, 'id' | 'sort_order'>) => void
}) {
  const set = (k: string, v: string) => onChange({ ...data, [k]: v })
  return (
    <div className="grid grid-cols-2 gap-2">
      <InputField label="시간 (time_slot)" value={data.time_slot} onChange={v => set('time_slot', v)} placeholder="09:00" />
      <InputField label="비용 (cost)" value={data.cost} onChange={v => set('cost', v)} placeholder="무료 / EUR10" />
      <div className="col-span-2">
        <InputField label="장소 (place_name) *" value={data.place_name} onChange={v => set('place_name', v)} placeholder="장소명" />
      </div>
      <div className="col-span-2">
        <InputField label="활동 (activity)" value={data.activity} onChange={v => set('activity', v)} placeholder="활동 설명" textarea />
      </div>
      <div className="col-span-2">
        <InputField label="메모 (memo)" value={data.memo} onChange={v => set('memo', v)} placeholder="추가 메모" />
      </div>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, textarea }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; textarea?: boolean
}) {
  const cls = "w-full border border-stone border-opacity-30 rounded-lg px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-terracotta"
  return (
    <div>
      <label className="block text-xs text-stone mb-1">{label}</label>
      {textarea
        ? <textarea className={cls} rows={2} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input className={cls} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}
