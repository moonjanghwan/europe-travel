'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Accommodation = {
  id: string
  name: string
  type: string
  address: string
  check_in: string
  check_out: string
  cost: string
  parking: boolean
  ztl_warning: boolean
  memo: string
}

const EMPTY: Omit<Accommodation, 'id'> = {
  name: '', type: '', address: '', check_in: '', check_out: '',
  cost: '', parking: false, ztl_warning: false, memo: '',
}

export default function AccommodationsTab({ dayId, dayNumber }: { dayId: string; dayNumber: number }) {
  const [items, setItems] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Omit<Accommodation, 'id'>>(EMPTY)
  const [showAdd, setShowAdd] = useState(false)
  const [newData, setNewData] = useState<Omit<Accommodation, 'id'>>(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('guide_accommodations').select('*').eq('day_id', dayId)
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [dayId])

  const handleAdd = async () => {
    if (!newData.name.trim()) return
    setSaving(true)
    await supabase.from('guide_accommodations').insert({ ...newData, day_id: dayId, day_number: dayNumber })
    setNewData(EMPTY); setShowAdd(false); setSaving(false); load()
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    await supabase.from('guide_accommodations').update(editData).eq('id', id)
    setEditId(null); setSaving(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('guide_accommodations').delete().eq('id', id)
    load()
  }

  const startEdit = (a: Accommodation) => {
    setEditId(a.id)
    setEditData({ name: a.name, type: a.type, address: a.address, check_in: a.check_in, check_out: a.check_out, cost: a.cost, parking: a.parking, ztl_warning: a.ztl_warning, memo: a.memo })
  }

  if (loading) return <div className="text-stone text-sm py-8 text-center">로딩 중…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-navy">숙소 ({items.length})</h2>
        <button className="btn-primary text-xs px-3 py-1.5" onClick={() => setShowAdd(v => !v)}>+ 추가</button>
      </div>

      {showAdd && (
        <div className="card mb-4 bg-amber-50 border-amber-200">
          <p className="text-xs font-semibold text-amber-700 mb-3">새 숙소 추가</p>
          <AccFields data={newData} onChange={setNewData} />
          <div className="flex gap-2 mt-3">
            <button className="btn-primary text-xs px-3 py-1.5" onClick={handleAdd} disabled={saving}>저장</button>
            <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setShowAdd(false)}>취소</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map(a => (
          <div key={a.id} className="card">
            {editId === a.id ? (
              <>
                <AccFields data={editData} onChange={setEditData} />
                <div className="flex gap-2 mt-3">
                  <button className="btn-primary text-xs px-3 py-1.5" onClick={() => handleSave(a.id)} disabled={saving}>저장</button>
                  <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setEditId(null)}>취소</button>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-semibold text-navy">{a.name}</span>
                    {a.type && <span className="ml-2 text-xs text-stone">{a.type}</span>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    {a.parking && <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">🅿️ 주차</span>}
                    {a.ztl_warning && <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">⚠️ ZTL</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-stone mb-2">
                  {a.check_in && <span>체크인: {a.check_in}</span>}
                  {a.check_out && <span>체크아웃: {a.check_out}</span>}
                  {a.cost && <span>요금: {a.cost}</span>}
                  {a.address && <span className="col-span-2">📍 {a.address}</span>}
                </div>
                {a.memo && <p className="text-xs text-stone italic">{a.memo}</p>}
                <div className="flex gap-1.5 mt-3">
                  <button onClick={() => startEdit(a)} className="text-xs text-stone hover:text-navy border border-stone border-opacity-30 rounded px-2 py-1">수정</button>
                  <button onClick={() => handleDelete(a.id)} className="text-xs text-red-400 hover:text-red-600 border border-red-200 rounded px-2 py-1">삭제</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-stone text-sm text-center py-8">숙소 정보가 없습니다.</p>}
      </div>
    </div>
  )
}

function AccFields({ data, onChange }: { data: Omit<Accommodation, 'id'>; onChange: (d: Omit<Accommodation, 'id'>) => void }) {
  const set = (k: string, v: string | boolean) => onChange({ ...data, [k]: v })
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2"><F label="숙소명 (name) *" value={data.name} onChange={v => set('name', v)} /></div>
      <F label="유형 (type)" value={data.type} onChange={v => set('type', v)} placeholder="Airbnb·호텔·B&B" />
      <F label="요금 (cost)" value={data.cost} onChange={v => set('cost', v)} placeholder="EUR100" />
      <F label="체크인" value={data.check_in} onChange={v => set('check_in', v)} placeholder="15:00" />
      <F label="체크아웃" value={data.check_out} onChange={v => set('check_out', v)} placeholder="11:00" />
      <div className="col-span-2"><F label="주소" value={data.address} onChange={v => set('address', v)} /></div>
      <div className="col-span-2"><F label="메모" value={data.memo} onChange={v => set('memo', v)} textarea /></div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="pk" checked={data.parking} onChange={e => set('parking', e.target.checked)} className="w-4 h-4 accent-terracotta" />
        <label htmlFor="pk" className="text-sm text-navy">주차 가능</label>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="ztl" checked={data.ztl_warning} onChange={e => set('ztl_warning', e.target.checked)} className="w-4 h-4 accent-red-500" />
        <label htmlFor="ztl" className="text-sm text-navy">ZTL 주의</label>
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
