# 🚀 한 번에 모든 변경사항 커밋하기

## ⚡ 빠른 실행

### PowerShell에서 복사 후 실행:

```powershell
# 1. 모든 파일 스테이징
git add .

# 2. 커밋 메시지 작성
git commit -m "feat: 리더보드 및 이메일 기능 통합 구현

## Features
- 점수 및 시간 기반 리더보드 시스템
- 게임 결과 자동 이메일 발송
- 순위 기준: 정답수 DESC, 완료시간 ASC, 플레이순 ASC

## Backend Changes
- 새로운 라우트: src/routes/email.ts
- 리더보드 API 개선: GET/POST /api/game/leaderboard
- DB 테이블 추가: leaderboard_entries, email_logs, api_counter_logs
- /start 엔드포인트 제거

## Frontend Changes
- LeaderboardManager 전면 수정
- Result 화면 UI 개선
- Leaderboard 화면 개선
- UUID 상태 관리 개선

## Database Changes
- leaderboard_entries: 정렬 인덱스 추가
- email_logs: 이메일 발송 로그
- api_counter_logs: API 호출 로그 (향후)

## Documentation
- PostgreSQL 설치 가이드 추가
- 테이블 생성 SQL 자동화 스크립트 추가"

# 3. 푸시
git push origin main

# 4. 확인
git log --oneline -10
```

---

## 📋 단계별 커밋 (더 세분화됨)

### Step 1: 데이터베이스 스키마

```powershell
git add actuator-back/sql/schema.sql
git commit -m "refactor: PostgreSQL 스키마 테이블 추가

- leaderboard_entries: 게임 점수 저장
- email_logs: 이메일 발송 로그
- api_counter_logs: API 호출 로그 (향후)"
```

---

### Step 2: 백엔드 이메일 라우트

```powershell
git add src/routes/email.ts
git commit -m "feat: 백엔드 이메일 발송 엔드포인트 추가

- POST /api/send-email: 이메일 발송
- GET /api/email-logs/:userId: 이메일 로그 조회
- SendGrid API 통합"
```

---

### Step 3: 게임 라우트 리더보드 API

```powershell
git add src/routes/game.ts
git commit -m "refactor: 게임 라우트 리더보드 API 개선

- 정렬 기준: score DESC, completion_time ASC, played_at ASC
- ROW_NUMBER()로 순위 계산
- /start 엔드포인트 제거"
```

---

### Step 4: 인덱스 파일

```powershell
git add src/index.ts
git commit -m "refactor: 이메일 라우트 마운트"
```

---

### Step 5: LeaderboardManager 수정

```powershell
git add src/lib/utils.ts
git commit -m "refactor: LeaderboardManager 점수 시스템 개선

- 점수 계산: 정답수 × 100 + 시간보너스
- 시간보너스: (60s - 평균응답시간) / 6s × 정답수
- 이메일 템플릿 생성
- 순위 계산 로직 개선"
```

---

### Step 6: Result 화면

```powershell
git add src/pages/Result/Result.tsx src/pages/Result/Result.scss
git commit -m "feat: Result 화면 UI 개선

- 대형 점수 표시
- 통계 카드: 시간, 점수, 보너스, 순위
- 반응형 디자인"
```

---

### Step 7: Leaderboard 화면

```powershell
git add src/pages/Leaderboard/Leaderboard.tsx src/pages/Leaderboard/Leaderboard.scss
git commit -m "feat: Leaderboard 화면 전체 개선

- 상위 10명 표시
- 메달 아이콘 (🥇 🥈 🥉)
- 플레이어 통계 표시
- 반응형 레이아웃"
```

---

### Step 8: BuildYourPerfectActuator 수정

```powershell
git add src/components/BuildYourPerfectActuator.tsx
git commit -m "refactor: UUID 상태 관리 및 흐름 개선

- UUID state 추가 (Play Again 시에도 유지)
- handleContinue: 백엔드 호출 제거
- handleSubmit: UUID 생성으로 변경
- handleBack: userId 초기화"
```

---

### Step 9: 문서 추가

```powershell
git add LEADERBOARD_EMAIL_IMPLEMENTATION.md
git add IMPLEMENTATION_SUMMARY.md
git add QUICK_START_POSTGRESQL.md
git add POSTGRESQL_SETUP_SUMMARY.md
git add POSTGRESQL_TABLE_CREATION_GUIDE.md
git add SQL_CREATE_TABLES.sql
git add CREATE_TABLES.sql
git add create_tables.sh
git add create_tables.bat
git add GIT_COMMIT_MESSAGES.md
git commit -m "docs: 리더보드 및 이메일 기능 문서 추가

- 상세 구현 설명서
- PostgreSQL 설치 가이드
- 테이블 생성 자동화 스크립트
- Git 커밋 메시지 가이드"
```

---

### 푸시

```powershell
git push origin main
```

---

## ✅ 커밋 확인

```powershell
# 최근 커밋 보기
git log --oneline -15

# 상세 정보
git log --graph --oneline --all
```

---

## 💡 팁

### 아직 커밋 안 했을 때

```powershell
# 변경사항 확인
git status

# 변경 내용 보기
git diff

# 특정 파일만 스테이징
git add src/lib/utils.ts
```

### 실수했을 때

```powershell
# 마지막 커밋 수정
git commit --amend

# 마지막 커밋 취소 (변경사항 유지)
git reset --soft HEAD~1

# 마지막 커밋 완전 취소
git reset --hard HEAD~1
```

### 푸시 전 확인

```powershell
# 로컬 vs 리모트 비교
git log --oneline --all --graph
```
