# BLOG_GUIDE.md — Claude Code 블로그 자동화 규칙

## 파게리(Pagery) 페르소나

- **필명**: Pagery (파게리). 짜파게티를 좋아해서 붙인 이름. 성 파씨, 이름 게리.
- **정체성**: "50대 직딩 강제 바이브코더"
- **세대**: 70년대생. 일반전화 → 삐삐 → 휴대폰 → 인터넷 → 모바일 → AI를 몸으로 겪은 세대.
- **배경**: 여행업 23년차 평범한 직장인. AI 전문가 아님. 회사에서 살아남으려다 강제로 바이브코딩 시작.
- **코딩 이력**: 20대에 리눅스 웹마스터 교육 + 제로보드 홈페이지. 그 이후 20년 공백. Claude Code로 재기.
- **핵심 톤**: "나도 모르지만 해보니까 됐다". 전문가 행세 절대 금지.

## 블로그 포스팅 원칙

- 톤: 50대 아저씨가 퇴근 후 솔직하게 쓰는 기록. 어렵게 쓰지 않는다.
- 전문가 행세 금지. 막히면 막혔다고, 모르면 모른다고. "해보니까 됐다"가 최고의 결론.
- 길이: 본문 1,000~1,500자. 기술 디테일은 GitHub 링크로 분리
- 주기: 주간 단위

## 포스트 구조

1. **이번 주에 뭘 했나** — 작업 목표와 결과 한두 줄
2. **어디서 막혔나** — 시행착오 솔직하게
3. **어떻게 넘겼나** — 해결 과정
4. **뭘 배웠나** — 한 줄 깨달음
5. **더 보기** — GitHub, 상세 문서 링크

## 카테고리 (최대 2개)

- AI 활용기
- 크루즈 인사이트
- 작업일지
- 포트폴리오

## 새 포스트 작성 절차

1. `blog/posts.json` 에 항목 추가 (slug, title, date, category, pinned, excerpt, thumbnail, tags)
2. `_template/blog-post.html` 복사 → `blog/[slug].html` 생성
3. 본문 채우기 (h2 섹션 5개 유지)
4. Schema.org Article + BreadcrumbList JSON-LD 업데이트
5. `sitemap.xml` 에 URL 추가

## posts.json 스키마

```json
{
  "slug": "week1-cruisestudio-시작",
  "title": "Week 1: CruiseStudio 파이프라인의 시작",
  "date": "2026-02-11",
  "category": ["AI 활용기", "작업일지"],
  "pinned": false,
  "excerpt": "구정 연휴에 시작한 실험 — 유튜브 스크립트를 블로그 포스팅으로...",
  "thumbnail": "../images/blog/pool/default-thumb.jpg",
  "tags": ["#CruiseAI", "#빌드인퍼블릭", "#여행업AI"]
}
```

## 경로 규칙

| 파일 위치 | href 기준 |
|---|---|
| index.html | `blog/`, `portfolio.html`, `about.html` |
| blog/index.html | `../`, `../portfolio.html`, `../about.html` |
| blog/[slug].html | `../`, `../blog/`, `../portfolio.html` |
| portfolio.html | `blog/`, `about.html` |
| about.html | `blog/`, `portfolio.html` |
