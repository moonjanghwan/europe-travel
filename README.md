# 🇮🇹 Janghwan의 유럽 69일 여행 홈페이지

## 📁 파일 구조
```
europe-travel/
├── src/
│   ├── app/
│   │   ├── page.tsx          ← 메인 홈
│   │   ├── schedule/         ← 전체 일정
│   │   ├── diary/            ← 여행 일기
│   │   ├── gallery/          ← 사진 갤러리
│   │   ├── admin/            ← 관리자 (일기 작성)
│   │   └── api/blog-script/  ← 블로그 대본 생성 API
│   ├── components/Nav.tsx    ← 네비게이션
│   └── lib/
│       ├── supabase.ts       ← DB 연결
│       └── travel-data.ts    ← 69일 일정 데이터
├── supabase-init.sql         ← DB 초기화 SQL ⭐
├── .env.local.template       ← 환경변수 템플릿 ⭐
└── package.json
```

## 🚀 배포 순서

### 1단계: Supabase DB 초기화
1. supabase.com 접속 → europe-travel-2026 프로젝트
2. 왼쪽 메뉴 → SQL Editor
3. `supabase-init.sql` 내용 전체 복사 → 붙여넣기 → Run

### 2단계: GitHub에 올리기
1. github.com → New Repository → 이름: `europe-travel`
2. 모든 파일 업로드 (drag & drop)
3. Commit changes

### 3단계: Vercel 배포
1. vercel.com → New Project → GitHub 저장소 선택
2. Environment Variables 입력:
   - `NEXT_PUBLIC_SUPABASE_URL` = https://thjtydyunspjiivxgtlz.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sb_publishable_...
   - `ANTHROPIC_API_KEY` = sk-ant-...
   - `NEXT_PUBLIC_ADMIN_PW` = 원하는비밀번호
3. Deploy 클릭!

## 📱 매일 사용법 (10분)
1. 홈페이지 접속 → /admin
2. 비밀번호 입력 → 로그인
3. 일기 작성 + 사진 업로드
4. "블로그 대본 생성" 클릭
5. 대본 복사 → 네이버 블로그 붙여넣기
