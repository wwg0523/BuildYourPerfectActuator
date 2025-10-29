# 🎯 Git Commit Messages - Build Your Perfect Actuator

## 📝 작업 순서대로 정렬

### 1️⃣ 점수 및 시간 기반 리더보드 시스템

```bash
git add .
git commit -m "feat: 점수 및 시간 기반 리더보드 시스템 구현

- 점수 계산: 정답수 × 100 + 시간보너스
- 순위 기준: 정답수(DESC) → 완료시간(ASC) → 플레이순(ASC)
- 리더보드 DB 테이블 추가 (leaderboard_entries)
- 리더보드 UI 개선: 상위 10명 표시, 메달 아이콘, 통계
- Result 화면 개선: 점수, 순위, 통계 카드 표시"
```

---

### 2️⃣ 이메일 자동 발송 기능

```bash
git add .
git commit -m "feat: 게임 결과 이메일 자동 발송 기능

- 게임 완료 후 자동 이메일 발송
- SendGrid API 연동 (선택사항)
- 아름다운 HTML/TEXT 이메일 템플릿
- 이메일 로그 DB 테이블 (email_logs)
- 발송 실패 시 비블로킹 처리"
```

---

### 3️⃣ 백엔드 이메일 라우트 추가

```bash
git add src/routes/email.ts
git commit -m "feat: 백엔드 이메일 발송 엔드포인트 추가

- POST /api/send-email: 이메일 발송
- GET /api/email-logs/:userId: 이메일 로그 조회
- SendGrid API 통합
- 발송 결과 DB 저장"
```

---

### 4️⃣ 게임 라우트 리더보드 API 수정

```bash
git add src/routes/game.ts
git commit -m "refactor: 게임 라우트 리더보드 API 개선

- GET /api/game/leaderboard: 정렬 기준 업데이트
  * 정답수(DESC) → 완료시간(ASC) → playedAt(ASC)
  * ROW_NUMBER()로 순위 계산
- POST /api/game/leaderboard: 리더보드 항목 저장
  * 프론트에서 계산한 점수 저장
  * 사용자 ID 및 타임스탐프 기록
- /start 엔드포인트 제거 (불필요)"
```

---

### 5️⃣ 프론트엔드 LeaderboardManager 전면 수정

```bash
git add src/lib/utils.ts
git commit -m "refactor: LeaderboardManager 점수 시스템 개선

- submitScore(): 점수 저장 + 순위 계산 + 이메일 발송
- calculateScore(): 정답수 계산 (0~5)
- calculateTimeBonus(): 시간 보너스 계산
  * 평균 응답시간 60초 기준
  * 문제당 최대 10점 보너스
- generateResultEmailTemplate(): HTML/TEXT 이메일 생성
- calculateRank(): 현재 점수 기반 순위 계산
- 이름 마스킹 (John Smith → J***h)"
```

---

### 6️⃣ Result 화면 개선

```bash
git add src/pages/Result/Result.tsx src/pages/Result/Result.scss
git commit -m "feat: Result 화면 UI 개선

- 대형 점수 표시 (4em)
- 통계 카드 4개: 시간, 최종점수, 시간보너스, 순위
- 순위 배지 강조 (그래디언트 배경)
- 버튼: PLAY AGAIN / LEADERBOARD / HOME
- 반응형 디자인 (모바일 최적화)"
```

---

### 7️⃣ Leaderboard 화면 개선

```bash
git add src/pages/Leaderboard/Leaderboard.tsx src/pages/Leaderboard/Leaderboard.scss
git commit -m "feat: Leaderboard 화면 전체 개선

- 상위 10명 순위 표시
- 순위별 메달 (🥇 🥈 🥉)
- 각 참가자 통계: 정답수, 완료시간, 최종점수
- 플레이어 정보: 이름, 회사
- 정렬 안내 텍스트
- 반응형 레이아웃"
```

---

### 8️⃣ 백엔드 Index 파일 이메일 라우트 마운트

```bash
git add src/index.ts
git commit -m "refactor: 이메일 라우트 마운트

- email.ts 라우트 import 추가
- /api 경로에 이메일 라우트 마운트"
```

---

### 9️⃣ 프론트엔드 UUID 관리 개선

```bash
git add src/components/BuildYourPerfectActuator.tsx
git commit -m "refactor: UUID 상태 관리 개선

- userId를 game 진행 중 유지하는 state로 변경
- Play Again 시에도 UUID 유지
- Submit 시 UUID 생성으로 변경
- handleBack()에서 userId 초기화"
```

---

### 🔟 Continuation 로직 제거

```bash
git add src/components/BuildYourPerfectActuator.tsx src/routes/game.ts
git commit -m "refactor: 불필요한 /start 엔드포인트 제거

- 프론트엔드: handleContinue()에서 백엔드 호출 제거
  * 정규식 검증과 약관 확인만 수행
  * UUID 생성을 Submit 시점으로 이동
- 백엔드: POST /api/game/start 엔드포인트 삭제
  * 프론트에서 UUID 생성하므로 불필요
  * 네트워크 왕복 시간 단축"
```

---

### 1️⃣1️⃣ 데이터베이스 스키마 업데이트

```bash
git add actuator-back/sql/schema.sql
git commit -m "refactor: PostgreSQL 스키마 테이블 추가

- leaderboard_entries: 게임 점수 저장
  * 정답수, 완료시간, 시간보너스, 최종점수
  * 인덱스: score DESC, completion_time ASC, played_at ASC
- email_logs: 이메일 발송 로그
  * 수신자, 발송 여부, 에러 메시지
  * 인덱스: user_id, sent_at DESC
- api_counter_logs: API 호출 로그 (향후 사용)
  * API 엔드포인트, 동작, 응답 데이터"
```

---

## 📦 한 번에 모두 커밋하는 방법

### 옵션 1️⃣: 개별 커밋 (권장 - 히스토리가 명확함)

```bash
# 각각 단계별로 실행
git add src/lib/utils.ts
git commit -m "refactor: LeaderboardManager 점수 시스템 개선..."

git add src/pages/Result/
git commit -m "feat: Result 화면 UI 개선..."

# ... 이런 식으로 계속
```

---

### 옵션 2️⃣: 한 번에 전체 커밋

```bash
git add .
git commit -m "feat: 리더보드 및 이메일 기능 통합 구현

## Features
- 점수 및 시간 기반 리더보드 시스템
- 게임 결과 자동 이메일 발송
- 순위 기준: 정답수(DESC) → 완료시간(ASC) → 플레이순(ASC)

## Backend Changes
- 새로운 라우트: src/routes/email.ts
- 리더보드 API 개선: GET/POST /api/game/leaderboard
- DB 테이블 추가: leaderboard_entries, email_logs, api_counter_logs
- 불필요한 /start 엔드포인트 제거

## Frontend Changes
- LeaderboardManager 전면 수정
- Result 화면 UI 개선
- Leaderboard 화면 개선
- UUID 상태 관리 개선

## Database Changes
- leaderboard_entries 테이블 추가 (정렬: score DESC, completion_time ASC)
- email_logs 테이블 추가
- api_counter_logs 테이블 추가"
```

---

## 🎯 권장 커밋 순서

```bash
# 1. 백엔드 핵심 변경
git add actuator-back/sql/schema.sql
git commit -m "refactor: PostgreSQL 스키마 테이블 추가..."

# 2. 백엔드 라우트
git add src/routes/
git commit -m "feat: 백엔드 이메일 발송 엔드포인트 추가..."

git add src/routes/game.ts
git commit -m "refactor: 게임 라우트 리더보드 API 개선..."

# 3. 프론트엔드 핵심 로직
git add src/lib/utils.ts
git commit -m "refactor: LeaderboardManager 점수 시스템 개선..."

# 4. 프론트엔드 UI
git add src/pages/Result/
git commit -m "feat: Result 화면 UI 개선..."

git add src/pages/Leaderboard/
git commit -m "feat: Leaderboard 화면 전체 개선..."

# 5. 추가 수정
git add src/components/BuildYourPerfectActuator.tsx
git commit -m "refactor: UUID 상태 관리 개선..."

git add src/index.ts
git commit -m "refactor: 이메일 라우트 마운트..."
```

---

## 📋 Commit Message 규칙 설명

### 타입 (Type)
- **feat**: 새로운 기능
- **refactor**: 기존 코드 개선/수정
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 스타일 수정
- **perf**: 성능 개선
- **test**: 테스트 추가/수정
- **chore**: 빌드, 의존성 등

### 범위 (Scope) - 선택사항
```
feat(leaderboard): ...
feat(email): ...
feat(backend): ...
```

### 메시지 (Message)
- 현재형 사용: "추가한다" (not "추가했다")
- 영어로 시작 대문자
- 마침표 없음 (제목)
- 본문은 마침표 사용

---

## ✅ 최종 확인

```bash
# 커밋 로그 확인
git log --oneline -10

# 푸시
git push origin main
```

---

## 📚 생성된 문서들도 커밋

```bash
git add LEADERBOARD_EMAIL_IMPLEMENTATION.md
git add IMPLEMENTATION_SUMMARY.md
git add QUICK_START_POSTGRESQL.md
git add POSTGRESQL_SETUP_SUMMARY.md
git add POSTGRESQL_TABLE_CREATION_GUIDE.md
git add SQL_CREATE_TABLES.sql
git add CREATE_TABLES.sql
git add create_tables.sh
git add create_tables.bat

git commit -m "docs: 리더보드 및 이메일 기능 문서 추가

- LEADERBOARD_EMAIL_IMPLEMENTATION.md: 상세 구현 설명
- QUICK_START_POSTGRESQL.md: PostgreSQL 설치 가이드
- SQL_CREATE_TABLES.sql: 테이블 생성 SQL
- 자동화 스크립트: create_tables.sh, create_tables.bat"
```

---

## 🎬 한 번에 푸시하기

```bash
# 모든 변경사항 스테이징
git add .

# 전체 커밋
git commit -m "feat: 리더보드 및 이메일 기능 통합 구현

[작성한 본문 붙여넣기]"

# 푸시
git push origin main
```
