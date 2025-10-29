# 리더보드 및 이메일 기능 구현 완료

## 📋 요약
현재 프로젝트에 다음 두 가지 주요 기능을 추가했습니다:

### 1. 🏆 점수 및 시간 기반 리더보드
### 2. 📧 참여자 이메일 송부 기능

---

## 1️⃣ 리더보드 기능 상세

### 📊 점수 계산 방식
```
- 기본 점수: 정답 개수 (0~5개)
- 시간 보너스: 평균 응답시간에 따른 추가 점수
  * 최대 60초 이내일 때 문제당 10점 보너스
  * 공식: max(0, (60000 - 평균응답시간) / 6000) × 정답수
- 최종 점수 = (정답수 × 100) + 시간보너스
```

### 🥇 순위 기준 (중요도순)
1. **정답 수가 높은 순** (가장 중요)
2. **정답 수가 같으면 완료 시간이 빠른 순**
3. **시간도 같으면 먼저 플레이한 순** (playedAt 기준)

### 📱 UI 변화

#### Result 화면 (게임 완료 후)
```
┌─────────────────────────────┐
│  🎮 Game Complete!          │
├─────────────────────────────┤
│         5/5                 │
│    Correct Answers          │
├─────────────────────────────┤
│  ⏱️ Time    🎯 Score        │
│  2:34      485pts           │
│  ⏅ Bonus   🏅 Rank          │
│  85pts     #15               │
├─────────────────────────────┤
│ 🥇 Rank #15 Today           │
│    5/5 • 2:34               │
├─────────────────────────────┤
│  [PLAY AGAIN] [LEADERBOARD] │
│  [HOME]                     │
└─────────────────────────────┘
```

#### Leaderboard 화면 (랭킹 조회)
```
┌─────────────────────────────┐
│  🏆 Today's Rankings        │
│  정답수 → 완료시간 → 플레이순 │
├─────────────────────────────┤
│ 🥇 1. John D. (ABC Corp)   │
│    ⭐ 5/5 • ⏱️ 2:34 • 💯 500  │
│ 🥈 2. Sarah K. (XYZ Ltd)   │
│    ⭐ 5/5 • ⏱️ 2:45 • 💯 495  │
│ 🥉 3. Mike L. (Tech Co)    │
│    ⭐ 4/5 • ⏱️ 2:12 • 💯 450  │
├─────────────────────────────┤
│  [PLAY AGAIN] [HOME]        │
└─────────────────────────────┘
```

---

## 2️⃣ 이메일 송부 기능 상세

### 📧 이메일 콘텐츠
게임 완료 후 자동으로 사용자 이메일로 다음 정보 포함:
- ✅ 최종 점수 및 랭킹
- ✅ 정답수 및 완료 시간
- ✅ 시간 보너스 점수
- ✅ 아름다운 HTML 템플릿

### 🔧 이메일 서비스 (SendGrid 연동)
- **환경변수 설정**: `SENDGRID_API_KEY` (선택사항)
- **발송 실패 시**: 이메일이 없어도 게임 결과 화면으로 진행 (비차단)
- **로그 저장**: 모든 이메일 발송 시도 기록 (성공/실패/에러메시지)

---

## 🛠️ 백엔드 구현 사항

### 1. 데이터베이스 스키마 추가 (`schema.sql`)
```sql
-- leaderboard_entries 테이블
- id (UUID, PK)
- user_id (UUID, FK)
- player_name, company
- score, completion_time, time_bonus, final_score
- played_at (타임스탬프)
- 인덱스: played_at DESC

-- email_logs 테이블
- id (UUID, PK)
- user_id, email_type, recipient_email
- sent_at, success, error_message
- 인덱스: user_id, sent_at DESC

-- api_counter_logs 테이블
- 향후 외부 API 연동 로그 저장용
```

### 2. 새로운 라우트 (`routes/email.ts`)
```
POST /api/send-email
  요청: { userId, recipientEmail, subject, htmlContent, textContent }
  응답: { success: true, emailId }

GET /api/email-logs/:userId
  사용자의 이메일 발송 로그 조회 (최근 20개)
```

### 3. 업데이트된 라우트 (`routes/game.ts`)
```
GET /api/game/leaderboard
  순위 기준: 정답수(DESC) → 완료시간(ASC) → playedAt(ASC)
  ROW_NUMBER()로 순위 계산

POST /api/game/leaderboard
  프론트에서 계산한 리더보드 항목 저장
```

---

## 💻 프론트엔드 구현 사항

### 1. LeaderboardManager 업데이트
```typescript
// submitScore() 메서드
1. 점수 계산 (calculateScore, calculateTimeBonus)
2. 리더보드에 저장 (POST /api/game/leaderboard)
3. 순위 계산 (calculateRank)
4. 이메일 발송 (비동기, 실패해도 무시)

// 이메일 템플릿
- HTML 버전 (아름다운 디자인)
- TEXT 버전 (플레인 텍스트)
```

### 2. Result 페이지 개선
- 점수 대형 표시
- 통계 카드 (시간, 최종점수, 보너스, 순위)
- 순위 배지 강조 표시
- 반응형 레이아웃

### 3. Leaderboard 페이지 개선
- 상세 순위 정보 표시
- 정렬 기준 안내
- 각 참가자의 통계 시각화
- 모바일 최적화

---

## 📝 백엔드 환경 변수

```bash
# .env (또는 docker-compose.yaml에서 설정)

# SendGrid (선택사항 - 있으면 이메일 발송, 없으면 로그만 기록)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@your-company.com

# 기존 설정
DATABASE_URL=postgresql://...
PORT=4004
```

---

## 🚀 사용 흐름

```
1. 사용자가 Info 화면에서 정보 입력 및 약관 동의

2. Game 화면에서 5문제 풀이

3. 제출 (Submit 버튼)
   └─> 프론트엔드에서 점수 계산
   └─> UUID 생성
   └─> 백엔드로 리더보드 항목 전송
   └─> 순위 계산
   └─> 이메일 발송 (비동기)

4. Result 화면
   └─> 최종 점수, 순위, 통계 표시
   └─> 이메일 발송 상태 표시

5. Leaderboard 화면
   └─> 모든 참여자 랭킹 표시
   └─> 정답수 → 완료시간 → 플레이순 정렬
```

---

## ✅ 테스트 항목

### 리더보드
- [ ] 정답수 순서대로 정렬되는지 확인
- [ ] 정답수 같을 때 시간으로 정렬되는지 확인
- [ ] 순위가 올바르게 계산되는지 확인

### 이메일
- [ ] SendGrid API 키 설정 시 이메일 발송 여부 확인
- [ ] 이메일 로그 저장 확인
- [ ] 이메일 발송 실패 시에도 게임 결과 화면 진행 확인

### 점수 계산
- [ ] 기본 점수 = 정답수 × 100 확인
- [ ] 빠른 응답 시 시간 보너스 추가 확인
- [ ] 최종 점수 = 기본점수 + 보너스 확인

---

## 📂 변경된 파일 목록

### 백엔드
- ✅ `sql/schema.sql` - DB 스키마 추가
- ✅ `src/routes/email.ts` - 새로운 이메일 라우트
- ✅ `src/routes/game.ts` - 리더보드 API 개선
- ✅ `src/index.ts` - 이메일 라우트 마운트

### 프론트엔드
- ✅ `src/lib/utils.ts` - LeaderboardManager 전면 수정
- ✅ `src/pages/Result/Result.tsx` - Result 화면 개선
- ✅ `src/pages/Result/Result.scss` - Result 스타일 추가
- ✅ `src/pages/Leaderboard/Leaderboard.tsx` - Leaderboard 화면 개선
- ✅ `src/pages/Leaderboard/Leaderboard.scss` - Leaderboard 스타일 추가

---

## 🎯 주요 특징

✨ **완전히 통합된 시스템**
- 점수 계산, 리더보드, 이메일 모두 자동 연동

🔐 **이름 마스킹**
- 리더보드에 표시되는 이름은 첫글자와 마지막글자만 노출
- 예: "John Smith" → "J***h"

⚡ **논블로킹 이메일**
- 이메일 발송 실패해도 사용자 경험에 영향 없음
- 비동기로 처리되어 응답 시간 영향 최소화

🎨 **아름다운 UI**
- 현대적인 그래디언트 디자인
- 반응형 레이아웃 (모바일 최적화)
- 명확한 정보 계층

📊 **상세한 통계**
- 최종점수, 시간보너스, 완료시간 등 모두 표시
- 순위와 함께 상세한 성과 정보 제공

---

## 🔄 선택적 향후 개선 사항

1. **일일 리더보드 필터링**
   - 현재: 모든 기록 표시
   - 개선: 오늘의 기록만 표시 가능

2. **주간/월간 리더보드**
   - 기간별 순위 조회

3. **통계 분석**
   - 평균 점수, 평균 완료시간 등

4. **재도전 기록**
   - 사용자의 이전 점수와 비교

5. **소셜 공유**
   - 결과를 SNS에 공유
