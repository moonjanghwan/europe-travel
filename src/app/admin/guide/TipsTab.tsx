'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Tip = {
  id: string
  type: string
  title: string
  content: string
  sort_order: number
}

const TIP_TYPES = [
  { value: 'tip',       label: '💡 팁',      bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800'  },
  { value: 'warning',   label: '⚠️ 경고',    bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800'    },
  { value: 'ztl',       label: '🚧 ZTL',     bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-800' },
  { value: 'checklist', label: '✅ 체크리스트', bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-800'   },
]

const EMPTY: Omit<Tip, 'id' | 'sort_order'> = { type: 'tip', title: '', content: '' }

function typeStyle(type: string) {
  return TIP_TYPES.find(t => t.value === type) ?? TIP_TYPES[0]
}

export default function TipsTab({ dayId, dayNumber }: { dayId: string; dayNumber: number }) {
  const [items, setItems] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Omit<Tip, 'id' | 'sort_order'>>(EMPTY)
  const [showAdd, setShowAdd] = useState(false)
  const [newData, setNewData] = useState<Omit<Tip, 'id' | 'sort_order'>>(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('guide_tips').select('*').eq('day_id', dayId).order('sort_order')
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [dayId])

  const handleAdd = async () => {
    if (!newData.content.trim()) return
    setSaving(true)
    await supabase.from('guide_tips').insert({ ...newData, day_id: dayId, day_number: dayNumber, sort_order: items.length })
    setNewData(EMPTY); setShowAdd(false); setSaving(false); load()
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    await supabase.from('guide_tips').update(editData).eq('id', id)
    setEditId(null); setSaving(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('guide_tips').delete().eq('id', id)
    load()
  }

  const startEdit = (t: Tip) => {
    setEditId(t.id)
    setEditData({ type: t.type, title: t.title, content: t.content })
  }

  if (loading) return <div className="text-stone text-sm py-8 text-center">로딩 중…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-navy">팁·경고·체크리스트 ({items.length})</h2>
        <button className="btn-primary text-xs px-3 py-1.5" onClick={() => setShowAdd(v => !v)}>+ 추가</button>
      </div>

      {/* type 범례 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TIP_TYPES.map(t => (
          <span key={t.value} className={`text-xs px-2.5 py-1 rounded-full border ${t.bg} ${t.border} ${t.text}`}>{t.label}</span>
        ))}
      </div>

      {showAdd && (
        <div className="card mb-4 bg-amber-50 border-amber-200">
          <p className="text-xs font-semibold text-amber-700 mb-3">새 항목 추가</p>
          <TipFields data={newData} onChange={setNewData} />
          <div className="flex gap-2 mt-3">
            <button className="btn-primary text-xs px-3 py-1.5" onClick={handleAdd} disabled={saving}>저장</button>
            <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setShowAdd(false)}>취소</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map(t => {
          const st = typeStyle(t.type)
          return (
            <div key={t.id} className={`rounded-xl border p-4 ${st.bg} ${st.border}`}>
              {editId === t.id ? (
                <>
                  <TipFields data={editData} onChange={setEditData} />
                  <div className="flex gap-2 mt-3">
                    <button className="btn-primary text-xs px-3 py-1.5" onClick={() => handleSave(t.id)} disabled={saving}>저장</button>
                    <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setEditId(null)}>취소</button>
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold ${st.text}`}>{TIP_TYPES.find(x => x.value === t.type)?.label}</span>
                        {t.title && <span className={`text-xs font-medium ${st.text}`}>{t.title}</span>}
                      </div>
                      <p className={`text-sm leading-relaxed ${st.text}`}>{t.content}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => startEdit(t)} className="text-xs text-stone hover:text-navy border border-stone border-opacity-30 bg-white rounded px-2 py-1">수정</button>
                      <button onClick={() => handleDelete(t.id)} className="text-xs text-red-400 hover:text-red-600 border border-red-200 bg-white rounded px-2 py-1">삭제</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {items.length === 0 && <p className="text-stone text-sm text-center py-8">팁·경고가 없습니다.</p>}
      </div>
    </div>
  )
}

function TipFields({ data, onChange }: { data: Omit<Tip, 'id' | 'sort_order'>; onChange: (d: Omit<Tip, 'id' | 'sort_order'>) => void }) {
  const set = (k: string, v: string) => onChange({ ...data, [k]: v })
  const cls = "w-full border border-stone border-opacity-30 rounded-lg px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-terracotta"
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs text-stone mb-1">유형 (type)</label>
        <select className={cls} value={data.type} onChange={e => set('type', e.target.value)}>
          {TIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-stone mb-1">제목 (title)</label>
        <input className={cls} value={data.title} onChange={e => set('title', e.target.value)} placeholder="선택 입력" />
      </div>
      <div>
        <label className="block text-xs text-stone mb-1">내용 (content) *</label>
        <textarea className={cls} rows={3} value={data.content} onChange={e => set('content', e.target.value)} placeholder="내용을 입력하세요" />
      </div>
    </div>
  )
}
