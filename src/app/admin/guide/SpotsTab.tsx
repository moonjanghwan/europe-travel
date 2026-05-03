'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Spot = {
  id: string
  name: string
  category: string
  description: string
  opening_hours: string
  entrance_fee: string
  address: string
  website: string
  tips: string
  sort_order: number
}

const EMPTY: Omit<Spot, 'id' | 'sort_order'> = {
  name: '', category: '', description: '', opening_hours: '',
  entrance_fee: '', address: '', website: '', tips: '',
}

export default function SpotsTab({ dayId, dayNumber }: { dayId: string; dayNumber: number }) {
  const [items, setItems] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Omit<Spot, 'id' | 'sort_order'>>(EMPTY)
  const [showAdd, setShowAdd] = useState(false)
  const [newData, setNewData] = useState<Omit<Spot, 'id' | 'sort_order'>>(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('guide_spots').select('*').eq('day_id', dayId).order('sort_order')
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [dayId])

  const handleAdd = async () => {
    if (!newData.name.trim()) return
    setSaving(true)
    await supabase.from('guide_spots').insert({ ...newData, day_id: dayId, day_number: dayNumber, sort_order: items.length })
    setNewData(EMPTY); setShowAdd(false); setSaving(false); load()
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    await supabase.from('guide_spots').update(editData).eq('id', id)
    setEditId(null); setSaving(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('guide_spots').delete().eq('id', id)
    load()
  }

  const startEdit = (s: Spot) => {
    setEditId(s.id)
    setEditData({ name: s.name, category: s.category, description: s.description, opening_hours: s.opening_hours, entrance_fee: s.entrance_fee, address: s.address, website: s.website, tips: s.tips })
  }

  if (loading) return <div className="text-stone text-sm py-8 text-center">로딩 중…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-navy">관광지 ({items.length})</h2>
        <button className="btn-primary text-xs px-3 py-1.5" onClick={() => setShowAdd(v => !v)}>+ 추가</button>
      </div>

      {showAdd && (
        <div className="card mb-4 bg-amber-50 border-amber-200">
          <p className="text-xs font-semibold text-amber-700 mb-3">새 관광지 추가</p>
          <SpotFields data={newData} onChange={setNewData} />
          <div className="flex gap-2 mt-3">
            <button className="btn-primary text-xs px-3 py-1.5" onClick={handleAdd} disabled={saving}>저장</button>
            <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setShowAdd(false)}>취소</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map(s => (
          <div key={s.id} className="card">
            {editId === s.id ? (
              <>
                <SpotFields data={editData} onChange={setEditData} />
                <div className="flex gap-2 mt-3">
                  <button className="btn-primary text-xs px-3 py-1.5" onClick={() => handleSave(s.id)} disabled={saving}>저장</button>
                  <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setEditId(null)}>취소</button>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <span className="font-semibold text-navy">{s.name}</span>
                    {s.category && <span className="ml-2 text-xs bg-terracotta bg-opacity-10 text-terracotta px-2 py-0.5 rounded-full">{s.category}</span>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => startEdit(s)} className="text-xs text-stone hover:text-navy border border-stone border-opacity-30 rounded px-2 py-1">수정</button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 hover:text-red-600 border border-red-200 rounded px-2 py-1">삭제</button>
                  </div>
                </div>
                {s.description && <p className="text-xs text-stone mt-1 line-clamp-2">{s.description}</p>}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-stone">
                  {s.opening_hours && <span>🕒 {s.opening_hours}</span>}
                  {s.entrance_fee && <span>💶 {s.entrance_fee}</span>}
                  {s.address && <span>📍 {s.address}</span>}
                </div>
                {s.tips && <div className="mt-2 text-xs bg-amber-50 border border-amber-100 rounded px-2 py-1.5 text-amber-800">💡 {s.tips}</div>}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-stone text-sm text-center py-8">관광지가 없습니다.</p>}
      </div>
    </div>
  )
}

function SpotFields({ data, onChange }: { data: Omit<Spot, 'id' | 'sort_order'>; onChange: (d: Omit<Spot, 'id' | 'sort_order'>) => void }) {
  const set = (k: string, v: string) => onChange({ ...data, [k]: v })
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2"><F label="이름 (name) *" value={data.name} onChange={v => set('name', v)} /></div>
      <F label="카테고리" value={data.category} onChange={v => set('category', v)} placeholder="성당·전망·박물관…" />
      <F label="입장료" value={data.entrance_fee} onChange={v => set('entrance_fee', v)} placeholder="무료 / EUR5" />
      <F label="운영시간" value={data.opening_hours} onChange={v => set('opening_hours', v)} />
      <F label="주소" value={data.address} onChange={v => set('address', v)} />
      <F label="웹사이트" value={data.website} onChange={v => set('website', v)} />
      <div className="col-span-2"><F label="설명" value={data.description} onChange={v => set('description', v)} textarea /></div>
      <div className="col-span-2"><F label="팁" value={data.tips} onChange={v => set('tips', v)} textarea /></div>
    </div>
  )
}

function F({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean }) {
  const cls = "w-full border border-stone border-opacity-30 rounded-lg px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-terracotta"
  return (
    <div>
      <label className="block text-xs text-stone mb-1">{label}</label>
      {textarea ? <textarea className={cls} rows={2} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /> : <input className={cls} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />}
    </div>
  )
}
