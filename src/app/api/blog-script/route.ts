import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { dayNumber, location, highlights, partName, title, content, mood, weather } = await req.json()

  const prompt = `당신은 네이버 블로그 전문 작가입니다. 아래 여행 일기를 바탕으로 네이버 블로그 포스팅용 대본을 작성해주세요.

[여행 정보]
- Day: ${dayNumber}/69일
- 지역: ${location} (${partName})
- 날짜 하이라이트: ${highlights.join(', ')}
- 기분: ${mood} / 날씨: ${weather}
- 제목: ${title}

[일기 내용]
${content}

[작성 규칙]
1. 네이버 블로그 스타일로 친근하고 생생하게 작성
2. 본문 1500자 이상
3. 소제목을 3~4개 넣어 구조적으로 작성
4. 여행 팁이나 추천 정보 포함
5. 마지막에 해시태그 10개 추가 (예: #이탈리아여행 #유럽자동차여행)
6. 사진 넣을 위치에 [사진: 설명] 형태로 표시
7. 따뜻하고 감성적인 문체 유지

지금 바로 블로그 포스팅 대본을 작성해주세요:`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const script = data.content?.[0]?.text || ''
    return NextResponse.json({ script })
  } catch (error) {
    return NextResponse.json({ error: '대본 생성 실패' }, { status: 500 })
  }
}
