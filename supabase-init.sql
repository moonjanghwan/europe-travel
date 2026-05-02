-- =============================================
-- Janghwan 유럽 여행 홈페이지 DB 초기화 SQL
-- Supabase SQL Editor에 전체 붙여넣기 후 Run
-- =============================================

-- 1. 여행 일기 테이블
CREATE TABLE IF NOT EXISTS diaries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number integer NOT NULL,
  travel_date date NOT NULL,
  location text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  mood text DEFAULT '😊',
  weather text DEFAULT '☀️',
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. 사진 테이블
CREATE TABLE IF NOT EXISTS photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  diary_id uuid REFERENCES diaries(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  url text NOT NULL,
  caption text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- 3. 당일 스케줄 테이블
CREATE TABLE IF NOT EXISTS schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number integer NOT NULL,
  travel_date date NOT NULL,
  time_slot text,
  title text NOT NULL,
  description text DEFAULT '',
  is_done boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. 블로그 대본 테이블
CREATE TABLE IF NOT EXISTS blog_scripts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  diary_id uuid REFERENCES diaries(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. RLS(공개 읽기) 정책 설정
ALTER TABLE diaries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules    ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_scripts ENABLE ROW LEVEL SECURITY;

-- 누구나 공개 일기 읽기 가능
CREATE POLICY "public read diaries"      ON diaries      FOR SELECT USING (is_public = true);
CREATE POLICY "public read photos"       ON photos       FOR SELECT USING (true);
CREATE POLICY "public read schedules"    ON schedules    FOR SELECT USING (true);
CREATE POLICY "public read blog_scripts" ON blog_scripts FOR SELECT USING (true);

-- 모든 쓰기는 anon key로 허용 (관리자 비밀번호로 앱에서 제어)
CREATE POLICY "anon insert diaries"      ON diaries      FOR INSERT WITH CHECK (true);
CREATE POLICY "anon update diaries"      ON diaries      FOR UPDATE USING (true);
CREATE POLICY "anon delete diaries"      ON diaries      FOR DELETE USING (true);
CREATE POLICY "anon insert photos"       ON photos       FOR INSERT WITH CHECK (true);
CREATE POLICY "anon delete photos"       ON photos       FOR DELETE USING (true);
CREATE POLICY "anon insert schedules"    ON schedules    FOR INSERT WITH CHECK (true);
CREATE POLICY "anon update schedules"    ON schedules    FOR UPDATE USING (true);
CREATE POLICY "anon delete schedules"    ON schedules    FOR DELETE USING (true);
CREATE POLICY "anon insert blog_scripts" ON blog_scripts FOR INSERT WITH CHECK (true);

-- 6. Storage 버킷 생성 (사진 저장용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('travel-photos', 'travel-photos', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "public read photos storage"
ON storage.objects FOR SELECT USING (bucket_id = 'travel-photos');

CREATE POLICY "anon upload photos storage"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'travel-photos');

CREATE POLICY "anon delete photos storage"
ON storage.objects FOR DELETE USING (bucket_id = 'travel-photos');

-- 완료 확인
SELECT 'DB 초기화 완료! 테이블 4개 생성됨' as status;
