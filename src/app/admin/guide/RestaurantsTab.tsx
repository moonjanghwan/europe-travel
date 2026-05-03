'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Restaurant = {
  id: string
  name: string
  category: string
  cuisine: string
  description: string
  price_range: string
  opening_hours: string
  must_order: string
  reservation: boolean
  sort_order: number
}

const EMPTY: Omit<Restaurant, 'id' | 'sort_order'> = {
  name: '', category: '', cuisine: '', description: '',
  price_range: '', opening_hours: '', must_order: '', reservation: false,
}

export default function RestaurantsTab({ dayId, dayNumber }: { dayId: string; dayNumber: number }) {
  const [items, setItems] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Omit<Restaurant, 'id' | 'sort_order'>>(EMPTY)
  const [showAdd, setShowAdd] = useState(false)
  const [newData, setNewData] = useState<Omit<Restaurant, 'id' | 'sort_order'>>(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('guide_restaurants').select('*').eq('day_id', dayId).order('sort_order')
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [dayId])

  const handleAdd = async () => {
    if (!newData.name.trim()) return
    setSaving(true)
    await supabase.from('guide_restaurants').insert({ ...newData, day_id: dayId, day_number: dayNumber, sort_order: items.length })
    setNewData(EMPTY); setShowAdd(false); setSaving(false); load()
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    await supabase.from('guide_restaurants').update(editData).eq('id', id)
    setEditId(null); setSaving(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('guide_restaurants').delete().eq('id', id)
    load()
  }

  const startEdit = (r: Restaurant) => {
    setEditId(r.id)
    setEditData({ name: r.name, category: r.category, cuisine: r.cuisine, description: r.description, price_range: r.price_range, opening_hours: r.opening_hours, must_order: r.must_order, reservation: r.reservation })
  }

  if (loading) return <div className="text-stone text-sm py-8 text-center">로딩 중…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-navy">식당 ({items.length})</h2>
        <button className="btn-primary text-xs px-3 py-1.5" onClick={() => setShowAdd(v => !v)}>+ 추가</button>
      </div>

      {showAdd && (
        <div className="card mb-4 bg-amber-50 border-amber-200">
          <p className="text-xs font-semibold text-amber-700 mb-3">새 식당 추가</p>
          <RestFields data={newData} onChange={setNewData} />
          <div className="flex gap-2 mt-3">
            <button className="btn-primary text-xs px-3 py-1.5" onClick={handleAdd} disabled={saving}>저장</button>
            <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setShowAdd(false)}>취소</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map(r => (
          <div key={r.id} className="card">
            {editId === r.id ? (
              <>
                <RestFields data={editData} onChange={setEditData} />
                <div className="flex gap-2 mt-3">
                  <button className="btn-primary text-xs px-3 py-1.5" onClick={() => handleSave(r.id)} disabled={saving}>저장</button>
                  <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setEditId(null)}>취소</button>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <span className="font-semibold text-navy">{r.name}</span>
                    {r.cuisine && <span className="ml-2 text-xs text-terracotta">{r.cuisine}</span>}
                    {r.reservation && <span className="ml-2 text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">예약필요</span>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => startEdit(r)} className="text-xs text-stone hover:text-navy border border-stone border-opacity-30 rounded px-2 py-1">수정</button>
                    <button onClick={() => handleDelete(r.id)} className="text-xs text-red-400 hover:text-red-600 border border-red-200 rounded px-2 py-1">삭제</button>
                  </div>
                </div>
                {r.description && <p className="text-xs text-stone mt-1 line-clamp-2">{r.description}</p>}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-stone">
                  {r.opening_hours && <span>🕒 {r.opening_hours}</span>}
                  {r.price_range && <span>💶 {r.price_range}</span>}
                </div>
                {r.must_order && (
                  <div className="mt-2 text-xs bg-terracotta bg-opacity-5 border border-terracotta border-opacity-20 rounded px-2 py-1.5 text-navy">
                    🌟 {r.must_order}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-stone text-sm text-center py-8">식당이 없습니다.</p>}
      </div>
    </div>
  )
}

function RestFields({ data, onChange }: { data: Omit<Restaurant, 'id' | 'sort_order'>; onChange: (d: Omit<Restaurant, 'id' | 'sort_order'>) => void }) {
  const set = (k: string, v: string | boolean) => onChange({ ...data, [k]: v })
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2"><F label="이름 (name) *" value={data.name} onChange={v => set('name', v)} /></div>
      <F label="카테고리" value={data.category} onChange={v => set('category', v)} placeholder="1순위/2순위" />
      <F label="요리 종류" value={data.cuisine} onChange={v => set('cuisine', v)} placeholder="이탈리아·해산물…" />
      <F label="가격대" value={data.price_range} onChange={v => set('price_range', v)} placeholder="EUR40~60" />
      <F label="영업시간" value={data.opening_hours} onChange={v => set('opening_hours', v)} />
      <div className="col-span-2"><F label="추천 메뉴" value={data.must_order} onChange={v => set('must_order', v)} /></div>
      <div className="col-span-2"><F label="설명" value={data.description} onChange={v => set('description', v)} textarea /></div>
      <div className="col-span-2 flex items-center gap-2">
        <input type="checkbox" id="resv" checked={data.reservation} onChange={e => set('reservation', e.target.checked)} className="w-4 h-4 accent-terracotta" />
        <label htmlFor="resv" className="text-sm text-navy">예약 필요</label>
      </div>
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
