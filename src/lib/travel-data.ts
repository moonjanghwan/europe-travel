export const TRAVEL_START = new Date('2026-05-06')
export const TRAVEL_END   = new Date('2026-07-13')

export const PARTS = [
  { part: 1, name: '이탈리아 북부',          color: '#7F77DD', days: [1,7],   places: '밀라노 · 베르가모 · 라팔로 · 친퀘테레' },
  { part: 2, name: '토스카나',               color: '#1D9E75', days: [8,12],  places: '시에나 · 발도르차 · 산지미냐노 · 몬탈치노' },
  { part: 3, name: '캄파니아 · 남부',        color: '#EF9F27', days: [13,17], places: '나폴리 · 폼페이 · 아말피 · 카프리' },
  { part: 4, name: '칼라브리아 · 시칠리아 서부', color: '#D85A30', days: [18,27], places: '트로페아 · 팔레르모 · 아그리젠토' },
  { part: 5, name: '시칠리아 동부',          color: '#D4537E', days: [28,38], places: '시라쿠사 · 노토 · 타오르미나 · 에트나' },
  { part: 6, name: '풀리아',                 color: '#639922', days: [39,47], places: '알베로벨로 · 레체 · 라벤나' },
  { part: 7, name: '돌로미티 · 북이탈리아',  color: '#378ADD', days: [48,63], places: '코르티나 · 오르티세이 · 코모 · 아오스타' },
  { part: 8, name: '프랑스 알프스 · 부르고뉴', color: '#534AB7', days: [64,69], places: '클루스 · 앙시 · 디종' },
]

export const SCHEDULE_DATA: Record<number, { date: string; location: string; highlights: string[] }> = {
  1:  { date: '2026-05-06', location: '밀라노',        highlights: ['두오모 성당', '갈레리아 비토리오 에마누엘레', '스포르체스코 성'] },
  2:  { date: '2026-05-07', location: '밀라노 → 베르가모', highlights: ['베르가모 구시가지', '산타마리아 마조레 성당', '베네치아 광장'] },
  3:  { date: '2026-05-08', location: '베르가모',      highlights: ['치타 알타 산책', '아카데미아 카라라'] },
  4:  { date: '2026-05-09', location: '라팔로',        highlights: ['라팔로 도착', '항구 산책', '해안 드라이브'] },
  5:  { date: '2026-05-10', location: '친퀘테레',      highlights: ['마나롤라', '리오마조레', '트레킹'] },
  6:  { date: '2026-05-11', location: '친퀘테레',      highlights: ['몬테로소', '베르나차', '코르닐리아'] },
  7:  { date: '2026-05-12', location: '친퀘테레 → 피렌체', highlights: ['피렌체 도착', '두오모 전경'] },
  8:  { date: '2026-05-13', location: '피렌체',        highlights: ['우피치 미술관', '베키오 다리', '시뇨리아 광장'] },
  9:  { date: '2026-05-14', location: '시에나',        highlights: ['캄포 광장', '시에나 두오모', '만자의 탑'] },
  10: { date: '2026-05-15', location: '발도르차',      highlights: ['피엔차', '몬테풀치아노', '사이프러스 길'] },
  11: { date: '2026-05-16', location: '산지미냐노',    highlights: ['탑 도시 산책', '베르나차차 와이너리', '그레베'] },
  12: { date: '2026-05-17', location: '몬탈치노',      highlights: ['브루넬로 와이너리', '몬탈치노 요새'] },
  13: { date: '2026-05-18', location: '나폴리',        highlights: ['국립고고학박물관', '스파카나폴리', '피자 맛집'] },
  14: { date: '2026-05-19', location: '폼페이',        highlights: ['폼페이 유적지', '에르콜라노'] },
  15: { date: '2026-05-20', location: '아말피 해안',   highlights: ['포시타노', '아말피', '라벨로'] },
  16: { date: '2026-05-21', location: '소렌토 · 카프리', highlights: ['카프리 섬', '블루 그로토', '아나카프리'] },
  17: { date: '2026-05-22', location: '남부 이동',     highlights: ['살레르노', '파에스툼 유적'] },
  18: { date: '2026-05-23', location: '트로페아',      highlights: ['트로페아 도착', '절벽 마을 산책', '해변'] },
  19: { date: '2026-05-24', location: '트로페아',      highlights: ['산타마리아 델릴라 섬', '스쿠버다이빙'] },
  20: { date: '2026-05-25', location: '팔레르모',      highlights: ['팔레르모 도착', '카포 시장', '팔라티나 예배당'] },
  21: { date: '2026-05-26', location: '팔레르모',      highlights: ['몬레알레 대성당', '체팔루'] },
  22: { date: '2026-05-27', location: '트라파니',      highlights: ['에리체', '염전', '마르살라'] },
  23: { date: '2026-05-28', location: '아그리젠토',    highlights: ['신전의 계곡', '콘코르디아 신전'] },
  24: { date: '2026-05-29', location: '아그리젠토',    highlights: ['스칼라 데이 투르키', '포르토 엠페도클레'] },
  25: { date: '2026-05-30', location: '피아짜 아르메리나', highlights: ['빌라 로마나 모자이크', '엔나'] },
  26: { date: '2026-05-31', location: '칼타니세타',    highlights: ['내륙 시칠리아 드라이브', '소도시 탐방'] },
  27: { date: '2026-06-01', location: '라구사',        highlights: ['라구사 이블라', '바로크 건축'] },
  28: { date: '2026-06-02', location: '노토',          highlights: ['노토 바로크 거리', '노토 대성당'] },
  29: { date: '2026-06-03', location: '시라쿠사',      highlights: ['오르티지아 섬', '시라쿠사 고고학 공원'] },
  30: { date: '2026-06-04', location: '시라쿠사',      highlights: ['아레투사 샘', '티케 지구', '카타콤'] },
  31: { date: '2026-06-05', location: '시라쿠사',      highlights: ['노에이 아풀리에', '파키노'] },
  32: { date: '2026-06-06', location: '카타니아',      highlights: ['카타니아 어시장', '벨리니 광장', '두오모'] },
  33: { date: '2026-06-07', location: '에트나',        highlights: ['에트나 화산', '분화구 트레킹'] },
  34: { date: '2026-06-08', location: '타오르미나',    highlights: ['그리스 극장', '이소라 벨라', '타오르미나 구시가'] },
  35: { date: '2026-06-09', location: '타오르미나',    highlights: ['카스텔몰라', '사보카', '포르차 다그로'] },
  36: { date: '2026-06-10', location: '메시나',        highlights: ['메시나 해협', '메시나 대성당'] },
  37: { date: '2026-06-11', location: '밀라초 · 에올리에', highlights: ['리파리 섬', '화산 유황 온천'] },
  38: { date: '2026-06-12', location: '에올리에 → 본토', highlights: ['페리 이동', '빌라 산 조반니'] },
  39: { date: '2026-06-13', location: '마테라',        highlights: ['사씨 동굴 마을', '마테라 대성당'] },
  40: { date: '2026-06-14', location: '마테라',        highlights: ['사씨 지구 심층 탐방', '동굴 교회'] },
  41: { date: '2026-06-15', location: '알베로벨로',    highlights: ['트룰리 마을', '리오네 몬티'] },
  42: { date: '2026-06-16', location: '로코로톤도',    highlights: ['로코로톤도', '마르티나 프랑카', '오스투니'] },
  43: { date: '2026-06-17', location: '레체',          highlights: ['레체 바로크', '산타 크로체 성당', '로마 원형극장'] },
  44: { date: '2026-06-18', location: '레체',          highlights: ['살렌토 반도', '오트란토', '가야노'] },
  45: { date: '2026-06-19', location: '바리',          highlights: ['바리 구시가지', '산 니콜라 성당'] },
  46: { date: '2026-06-20', location: '트라니 · 카스텔 델몬테', highlights: ['트라니 대성당', '카스텔 델몬테'] },
  47: { date: '2026-06-21', location: '라벤나',        highlights: ['산비탈레 성당 모자이크', '갈라 플라치디아'] },
  48: { date: '2026-06-22', location: '코르티나 담페초', highlights: ['코르티나 도착', '돌로미티 첫 전망'] },
  49: { date: '2026-06-23', location: '코르티나',      highlights: ['트레 치메 디 라바레도', '미수리나 호수'] },
  50: { date: '2026-06-24', location: '코르티나',      highlights: ['친퀘 토리', '팔로리아 케이블카'] },
  51: { date: '2026-06-25', location: '오르티세이',    highlights: ['세체다 케이블카', '알페 디 시우시'] },
  52: { date: '2026-06-26', location: '오르티세이',    highlights: ['발 가르데나', '돌로미티 파노라마'] },
  53: { date: '2026-06-27', location: '볼차노',        highlights: ['외치 박물관', '볼차노 구시가'] },
  54: { date: '2026-06-28', location: '트렌토',        highlights: ['트렌토 성', '가르다 호수'] },
  55: { date: '2026-06-29', location: '가르다 호수',   highlights: ['시르미오네', '리모네 술 가르다'] },
  56: { date: '2026-06-30', location: '베로나',        highlights: ['줄리엣의 집', '아레나 원형극장'] },
  57: { date: '2026-07-01', location: '베네치아',      highlights: ['산마르코 광장', '리알토 다리', '곤돌라'] },
  58: { date: '2026-07-02', location: '베네치아',      highlights: ['무라노 섬', '부라노 섬', '도르소두로'] },
  59: { date: '2026-07-03', location: '코모 호수',     highlights: ['벨라지오', '빌라 카를로타', '바렌나'] },
  60: { date: '2026-07-04', location: '코모 호수',     highlights: ['코모 시내', '트레메초', '도마소'] },
  61: { date: '2026-07-05', location: '아오스타',      highlights: ['아오스타 구시가', '로마 극장', '알프스 전망'] },
  62: { date: '2026-07-06', location: '아오스타 밸리', highlights: ['그란 파라디소 국립공원', '쿠르마예르'] },
  63: { date: '2026-07-07', location: '아오스타 → 프랑스', highlights: ['몽블랑 터널', '프랑스 입국'] },
  64: { date: '2026-07-08', location: '클루스',        highlights: ['클루스 도착', '알프스 드라이브'] },
  65: { date: '2026-07-09', location: '샤모니',        highlights: ['몽블랑 전망', '에귀 뒤 미디 케이블카'] },
  66: { date: '2026-07-10', location: '앙시',          highlights: ['앙시 호수', '구시가지 운하', '팔레 드 릴'] },
  67: { date: '2026-07-11', location: '앙시',          highlights: ['앙시 성', '호수 수영', '주변 마을'] },
  68: { date: '2026-07-12', location: '디종',          highlights: ['디종 구시가', '부르고뉴 와이너리', '본'] },
  69: { date: '2026-07-13', location: '디종 → 귀국',   highlights: ['마지막 날', '귀국 준비', '여행 마무리'] },
}

export function getDayNumber(date: Date): number {
  const diff = Math.floor((date.getTime() - TRAVEL_START.getTime()) / 86400000)
  return diff + 1
}

export function getDateFromDay(day: number): Date {
  const d = new Date(TRAVEL_START)
  d.setDate(d.getDate() + day - 1)
  return d
}

export function getPartForDay(day: number) {
  return PARTS.find(p => day >= p.days[0] && day <= p.days[1])
}
