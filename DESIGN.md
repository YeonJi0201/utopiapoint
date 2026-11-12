---
name: Hogwarts House Cup
description: A candlelit Great Hall scoreboard in aged brass and house colors.
colors:
  hall-ink: "#171717"
  hall-stone: "#201d1b"
  hall-panel: "#1a1d1e"
  antique-brass: "#b99970"
  brass-light: "#d3b58c"
  parchment: "#e7dccb"
  muted-parchment: "#b7a990"
  gryffindor-cloth: "#290c12"
  slytherin-cloth: "#1d2320"
  ravenclaw-cloth: "#242933"
  hufflepuff-cloth: "#523c24"
  positive-change: "#7f9a70"
  negative-change: "#a46151"
typography:
  display:
    fontFamily: "Cinzel, Noto Serif KR, Georgia, serif"
    fontSize: "clamp(2.5rem, 4vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0em"
  title:
    fontFamily: "Cinzel, Noto Serif KR, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.01em"
  body:
    fontFamily: "Noto Serif KR, Georgia, serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Cinzel, Noto Serif KR, Georgia, serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  square: "0px"
  hairline: "2px"
  small: "4px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.brass-light}"
    rounded: "{rounded.square}"
    padding: "8px 20px"
  nav-item-active:
    backgroundColor: "transparent"
    textColor: "{colors.brass-light}"
    rounded: "{rounded.square}"
    padding: "8px 12px"
  ranking-panel:
    backgroundColor: "{colors.hall-panel}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.hairline}"
    padding: "20px 24px"
  house-banner:
    backgroundColor: "{colors.gryffindor-cloth}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.square}"
    padding: "24px 16px"
  stats-strip:
    backgroundColor: "{colors.hall-ink}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.square}"
    padding: "16px 24px"
---

# Design System: Hogwarts House Cup

## Overview

**Creative North Star: "촛불 아래 대연회장"**

이 시스템은 사용자가 제공한 [대연회장 레퍼런스](./ae5b33d0-ac1b-4284-aafd-9185275ab268.png)를 시각적 기준으로 삼는다. 그을린 석재와 촛불의 온기, 낡은 황동의 절제된 장식이 분위기를 만든다. 화면은 어둡고 깊이 있지만 정보는 선명해야 한다. 장식은 점수와 순위를 읽는 일을 돕는 범위에서만 사용한다.

넓은 화면에서는 가는 상단 내비게이션, 좌측의 제목과 우측의 현재 순위, 중앙의 네 기숙사 배너, 하단의 가로 통계 띠가 한 무대처럼 이어진다. 다음 화면에도 이 세계의 색, 타이포그래피, 선의 무게, 여백 리듬을 적용하되, 원본 현황 화면의 영웅 영역과 배너 배열을 모든 페이지에 억지로 복제하지 않는다. 각 화면의 실제 작업에 맞게 구성하고 시각 언어만 계승한다.

아래 치수와 색상은 1672×941 레퍼런스에서 정한 시작점이다. 색상은 질감이 있는 이미지의 대표색이며 사진 픽셀과 완전히 일치하는 보증값은 아니다. 더 작은 화면에서는 비율을 기계적으로 축소하지 말고 정보 순서와 읽기성을 우선한다.

**Key Characteristics:**
- 차콜과 짙은 브라운의 배경 위에 앤틱 브라스 선과 따뜻한 종이색 텍스트
- 네 기숙사 색은 서로 구별되지만 배경보다 튀지 않도록 낮은 명도와 채도를 유지
- 영문 세리프 디스플레이와 읽기 쉬운 한국어 세리프 본문
- 장식용 프레임은 가늘게, 핵심 점수와 상태는 명확하게
- 밀도 있는 대시보드에서도 큰 여백과 수평 정렬로 시선의 흐름을 유지

## Colors

팔레트는 이미지에서 읽은 대표색을 기준으로 한다. 어두운 면은 화면의 대부분을 차지하고, 황동은 경계와 활성 상태에 제한해 사용한다. 기숙사 색은 각 기숙사의 배너와 식별 표식에만 연결한다.

### Primary
- **앤틱 브라스** (`#b99970`): 얇은 프레임, 구분선, 아이콘, 선택된 내비게이션에 사용한다.
- **밝은 브라스** (`#d3b58c`): 제목, 활성 상태, 중요한 수치처럼 어두운 배경에서 바로 읽혀야 하는 요소에 사용한다.

### Secondary
- **그리핀도르 버건디 천** (`#290c12`): 그리핀도르 배너와 작은 식별 요소에 사용한다.
- **슬리데린 숲빛 천** (`#1d2320`): 슬리데린 배너와 작은 식별 요소에 사용한다.
- **래번클로 잉크빛 천** (`#242933`): 래번클로 배너와 작은 식별 요소에 사용한다.
- **후플푸프 황토빛 천** (`#523c24`): 후플푸프 배너와 작은 식별 요소에 사용한다.
- **증가 세이지** (`#7f9a70`): 점수 증가를 표시한다. 장식용 강조색으로 확대하지 않는다.
- **감점 테라코타** (`#a46151`): 점수 감소를 표시한다. 기숙사 식별색과 혼용하지 않는다.

### Neutral
- **홀 잉크** (`#171717`): 가장 어두운 페이지 바탕과 하단부에 사용한다.
- **홀 스톤** (`#201d1b`): 잉크색과 가까운 배경층 및 어두운 석재 면에 사용한다.
- **스모크 패널** (`#1a1d1e`): 순위 상자와 떠 있는 정보 영역의 어두운 반투명 면에 사용한다.
- **파치먼트** (`#e7dccb`): 본문, 점수, 기본 텍스트에 사용한다.
- **뮤트 파치먼트** (`#b7a990`): 보조 설명과 비활성 텍스트에 사용한다. 작은 크기에서 대비가 부족해지면 더 밝게 조정한다.

**The Brass-Rarity Rule.** 브라스는 전체 화면의 소량만 차지한다. 얇은 선과 실제로 선택된 상태에 쓰고, 큰 금색 면이나 상시 발광 효과로 확장하지 않는다.

## Typography

**Display Font:** Cinzel (with Noto Serif KR, Georgia, serif fallbacks)  
**Body Font:** Noto Serif KR (with Georgia, serif fallbacks)  
**Label Font:** Cinzel (with Noto Serif KR, Georgia, serif fallbacks)

**Character:** 영문 제목은 고전적인 세리프와 넓은 자간으로 의식적인 무게를 준다. 한국어는 장식보다 획의 선명도와 문장 읽기를 우선하며, 영문과 같은 화면 안에서 크기와 대비를 맞춘다.

### Hierarchy
- **Display** (400, `clamp(2.5rem, 4vw, 3.75rem)`, line-height 1): 화면을 대표하는 짧은 영문 제목에 사용한다. 이미지의 `House Status`가 기준이다.
- **Headline** (400, 약 `1.5rem`, line-height 1.2): 하위 섹션과 주요 패널 제목에 사용한다.
- **Title** (400, 약 `1rem`–`1.25rem`, line-height 1.3): 배너의 기숙사명, 순위 패널 제목, 통계 수치에 사용한다.
- **Body** (400, `0.8125rem`–`0.875rem`, line-height 1.6): 한국어 안내와 설명에 사용한다. 긴 설명은 한 줄에 약 65–75자보다 넓어지지 않게 제한한다.
- **Label** (400, `0.625rem`–`0.75rem`, letter-spacing `0.06em`–`0.1em`): 내비게이션, 영문 보조 라벨, 통계 이름에 사용한다. 짧게 유지하고 필요할 때만 영문 대문자를 쓴다.
- **Score** (400, `1.25rem`–`1.5rem`, tabular numerals 권장): 순위와 점수 비교에 사용한다. 라벨보다 크고 설명 본문보다 확실히 두드러져야 한다.

**The Two-Voice Rule.** Cinzel의 장식적 인상은 짧은 제목과 라벨에 한정한다. 긴 한국어 문장에 과도한 자간이나 작은 크기를 적용하지 않는다.

## Layout

- 레퍼런스 기준 캔버스는 1672×941이다. 넓은 화면에서 상단 내비게이션은 약 70px 높이로 얇게 유지하고, 본문은 좌우 약 10%의 여백을 둔 중앙 무대로 정렬한다.
- 첫 화면의 시선 순서는 `상단 내비게이션 → 좌측 제목·소개와 우측 순위 → 네 기숙사 배너 → 가로 통계 띠`다. 제목과 순위는 같은 상단 영역을 공유하고, 배너는 중앙 가로축을 차지한다.
- 네 기숙사 배너는 넓은 화면에서 같은 높이와 비슷한 폭으로 나란히 놓는다. 점수, 기숙사명, 순위는 각 배너 안에서 같은 기준선에 정렬한다.
- 통계는 별도 카드 네 개보다 하나의 가로 띠와 얇은 구분선으로 묶는다. 각 항목은 작은 라벨과 큰 값의 2단 위계로 구성한다.
- 기본 간격은 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px 리듬을 따른다. 제목 위쪽과 독립된 구획 사이에는 큰 간격을, 같은 항목의 라벨과 값 사이에는 작은 간격을 준다.
- 다음 화면은 같은 최대 폭, 좌우 기준선, 상단 탐색 높이를 공유한다. 목록이나 가이드 화면은 이미지의 히어로 구조를 억지로 재사용하지 않고, 실제 작업의 읽기 순서에 맞춘다.
- 900px 이하에서는 랭킹·배너의 열 수를 줄이고, 700px 이하에서는 제목·순위·통계를 세로로 재배치한다. 420px 이하에서는 본문 패딩과 간격을 추가 축소한다. 수평 스크롤을 만들지 않는다.
- 좁은 화면에서도 점수와 기숙사명이 한눈에 비교되도록 한다. 통계를 여러 열로 유지할 수 없으면 의미 단위로 줄바꿈하고, 단순히 모든 요소를 작게 만들지 않는다.

## Elevation & Depth

깊이는 강한 그림자보다 어두운 배경층의 차이, 얇은 브라스 테두리, 실제 이미지의 촛불과 석재 질감으로 만든다. 패널은 어두운 반투명 면과 1px 안팎의 가는 테두리를 기본으로 한다. 그림자는 경계를 분리할 때만 낮은 불투명도와 넓은 블러로 사용한다. 발광은 상시 장식이 아니라 실제 상태 피드백에 한정한다.

**The Quiet-Depth Rule.** 표면의 계층은 배경 명도와 가는 선으로 먼저 만든다. 강한 드롭 섀도, 금색 글로우, 블러를 겹쳐 사용하지 않는다.

## Shapes

전체 형태는 직선과 거의 사각에 가까운 모서리를 기본으로 한다. 일반 패널은 0–2px, 작은 조작 요소는 최대 4px 정도의 모서리만 사용한다. 태그나 작은 상태 표시가 아니라면 알약 모양의 둥근 형태를 쓰지 않는다.

프레임의 모서리 장식은 실제 이미지/SVG 에셋으로 제공될 때만 사용한다. 단순 CSS 테두리는 1px 황동선으로 표현한다. 기숙사 배너가 있는 화면에서는 천의 아래쪽 실루엣을 기하학적으로 단순화할 수 있지만, 다른 카드까지 모두 방패나 깃발 모양으로 만들지 않는다.

## Components

### Buttons
- **Shape:** 직선에 가까운 사각 모서리, 0–2px.
- **Primary action:** 어두운 면 위에 가는 브라스 테두리와 파치먼트/밝은 브라스 텍스트를 둔다. 높이는 대략 32–40px, 좌우 패딩은 16–20px에서 시작한다.
- **Hover / Focus:** hover는 텍스트와 테두리를 조금 밝게 하는 정도로 제한한다. `:focus-visible`은 2px 안팎의 선명한 브라스 외곽선과 여백으로 키보드 위치를 드러낸다.
- **Avoid:** 상시 광택, 큰 금색 채움, 과장된 이동 애니메이션.

### Cards / Containers
- **Ranking panel:** 어두운 스모크 면, 가는 브라스 프레임, 절제된 안쪽 여백을 사용한다. 순위·기숙사·점수·증감을 같은 행의 열로 맞춘다.
- **House banner:** 기숙사별 낮은 채도의 천 색을 면으로 사용한다. 문장/기숙사명/점수/변화량을 위에서 아래로 정렬하고, 모든 배너의 내부 기준선을 통일한다.
- **Statistics strip:** 하나의 어두운 가로 면을 얇은 위아래 경계선으로 나눈다. 큰 수치와 작은 라벨을 반복하되 각 항목을 독립 카드로 감싸지 않는다.

### Inputs / Fields
- **Style:** 짙은 배경에 읽기 쉬운 텍스트, 얇은 브라스 테두리, 0–4px 모서리를 사용한다.
- **Focus:** 브라스 테두리를 밝히고 명확한 `:focus-visible` 외곽선을 제공한다. 그림자나 글로우만으로 포커스를 표현하지 않는다.
- **Error / Disabled:** 비활성 텍스트와 오류 상태는 기숙사 색과 혼동되지 않는 별도 상태색으로 표현하고, 색상 외에도 문구나 아이콘으로 상태를 전달한다.

### Navigation
- **Style:** 높이가 낮은 가로 내비게이션, 얇은 하단 브라스선, 작은 세리프 라벨을 사용한다.
- **Active:** 밝은 브라스 텍스트와 1px 하단 표시로 현재 위치를 드러낸다.
- **Mobile:** 항목이 잘리거나 겹치지 않게 줄바꿈/접기 방식으로 재배치한다. 터치 영역은 시각적 글자 크기보다 넉넉하게 유지한다.

### Ranking Rows
- 순위, 문장 또는 식별 표식, 기숙사명, 점수, 주간 증감을 일정한 열에 배치한다. 순위 숫자는 보조 요소보다 약간 크고, 증감은 의미 있는 상태색으로 표시한다.

## Do's and Don'ts

### Do:
- **Do:** 다음 화면에도 차콜·브라스·파치먼트의 비율과 기숙사별 저채도 색 구분을 이어간다.
- **Do:** 중요한 점수는 단위와 증감 방향이 함께 보이도록 표현한다.
- **Do:** 이미지의 비례를 기준으로 넓은 화면의 좌우 여백, 상단 정보 영역, 배너와 통계의 수평 정렬을 유지한다.
- **Do:** 장식적 영문 제목과 읽기 쉬운 한국어 설명의 역할을 분리한다.
- **Do:** 예시 데이터는 예시임을 유지하고, 레퍼런스 이미지의 숫자를 실제 점수 데이터로 가져오지 않는다.
- **Do:** 모든 조작 요소에 키보드 포커스와 충분한 대비를 제공한다.

### Don't:
- **Don't:** 작은 컴포넌트마다 금색 테두리와 그림자를 모두 중첩하지 않는다.
- **Don't:** 네 기숙사를 하나의 색으로 평탄화하거나, 기숙사별 색을 고채도 네온처럼 쓰지 않는다.
- **Don't:** 첨부된 전체 화면 캡처를 다른 페이지의 배경으로 늘여 UI와 텍스트까지 재사용하지 않는다.
- **Don't:** 확인되지 않은 점수, 순위 변동, 참가 인원을 레퍼런스 화면에서 복사하지 않는다.
- **Don't:** 모든 페이지에 같은 히어로·깃발·통계 구조를 복제해 각 화면의 정보 목적을 흐리지 않는다.
