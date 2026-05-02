import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'

async function getPhotos() {
  const { data } = await supabase
    .from('photos')
    .select('id, url, caption, day_number, diary_id')
    .order('day_number', { ascending: false })
    .limit(100)
  return data || []
}

export const revalidate = 60

export default async function GalleryPage() {
  const photos = await getPhotos()

  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <div className="pt-14 md:pt-20 max-w-5xl mx-auto px-4 py-8 pb-20 md:pb-8">
        <h1 className="font-display text-3xl font-bold text-navy mb-2">갤러리</h1>
        <p className="text-stone text-sm mb-8">총 {photos.length}장의 사진</p>

        {photos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📷</p>
            <p className="text-stone">아직 사진이 없습니다.</p>
            <p className="text-stone text-sm mt-1">여행이 시작되면 매일 사진이 추가됩니다!</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {photos.map(p => (
              <div key={p.id} className="break-inside-avoid rounded-xl overflow-hidden bg-stone bg-opacity-10 group">
                <img src={p.url} alt={p.caption} className="w-full object-cover" />
                {p.caption && (
                  <div className="p-2 bg-white">
                    <p className="text-xs text-stone">Day {p.day_number}</p>
                    <p className="text-xs text-navy">{p.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
