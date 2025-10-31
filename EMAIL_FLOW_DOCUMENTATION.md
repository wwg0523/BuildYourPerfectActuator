# 📧 이메일 발송 흐름 (Email Flow Documentation)

## 🔄 전체 흐름도

```
게임 완료 (handleSubmit)
    ↓
BuildYourPerfectActuator.tsx - handleSubmit()
    ↓
leaderboardManager.submitScore() [lib/utils.ts]
    ├─ 1️⃣ 점수 계산 (calculateScore)
    ├─ 2️⃣ 순위 계산 (calculateRank) - 리더보드 API 호출
    └─ 3️⃣ 이메일 발송 (sendResultEmail) ← 백그라운드 작업, 실패해도 무시
         ↓
         fetch('http://actuator-back:4004/api/send-email')
             ↓
             BackendAPI - routes/email.ts (POST /send-email)
             ├─ email_logs 테이블에 기록 저장
             ├─ SendGrid API 호출 (SENDGRID_API_KEY 있을 때)
             └─ 응답 반환
         ↓
Result 화면 표시 (성공/실패 상관없이)
```

---

## 📝 상세 단계별 설명

### 📍 Step 1: 게임 완료 - `BuildYourPerfectActuator.tsx` (라인 167-220)

**트리거**: 마지막 문제 답변 후 제출 버튼 클릭

```typescript
const handleSubmit = async () => {
    if (!gameSession) return;

    // 1. 사용자 정보 복호화
    const encryptedUserInfo = localStorage.getItem('encryptedUserInfo');
    const userForGame = { id, name, company, email, phone };

    // 2. 완료 시간 계산
    completionTime = gameSession.completionTime || 0; // 타이머에서 계산된 ms 값
    if (completionTime <= 0) completionTime = 1000; // 최소 1초

    // 3. 정답 수 계산
    correctAnswers = gameSession.answers.filter(a => a.isCorrect).length;

    try {
        // 4. 사용자 저장 (game_users 테이블)
        await fetch(`${backendUrl}/api/user`, {
            method: 'POST',
            body: JSON.stringify(userForGame),
        });

        // 5. 게임 결과 저장 (analytics)
        await fetch(`${backendUrl}/api/game/submit`, {
            method: 'POST',
            body: JSON.stringify({
                userId, completionTime, score: correctAnswers, ...
            }),
        });

        // 6️⃣ 핵심: 리더보드 제출 → 순위 계산 + 이메일 발송
        const entry = await leaderboardManager.submitScore(gameSession, userForGame);
        setLeaderboardEntry(entry);

        // 7. 결과 화면으로 이동
        setScreen('result');
    } catch (error) {
        console.error('Error in game completion:', error);
        // 에러 발생해도 결과 화면으로 진행
    }
};
```

**저장되는 데이터**:
- ✅ `game_users` 테이블: userId, name, company, email, phone
- ✅ `analytics` 테이블: userId, completionTime, score, etc.
- ✅ `leaderboard_entries` 테이블: (submitScore에서 처리)

---

### 📍 Step 2: 리더보드 제출 + 이메일 - `LeaderboardManager.submitScore()` (라인 293-330)

**위치**: `src/lib/utils.ts` - LeaderboardManager 클래스

```typescript
async submitScore(gameSession: GameSession, userInfo: UserInfo): Promise<LeaderboardEntry> {
    // 1️⃣ 점수 계산
    const baseScore = this.calculateScore(gameSession);  // 정답 수 (0~5)
    const finalScore = baseScore * 100;  // 최종 점수 (0~500)
    const completionTime = gameSession.completionTime || 0;

    // 2️⃣ LeaderboardEntry 객체 생성
    const entry: LeaderboardEntry = {
        rank: 0,
        playerName: this.maskPlayerName(userInfo.name),  // 이름 마스킹 (J***n)
        company: userInfo.company,
        score: baseScore,
        completionTime: completionTime,
        finalScore: finalScore,
        playedAt: new Date(),
    };

    try {
        // 3️⃣ 순위 계산
        entry.rank = await this.calculateRank(entry);

        // 4️⃣ 이메일 발송 (백그라운드, 실패해도 무시)
        this.sendResultEmail(userInfo, gameSession, entry).catch(err => {
            console.warn('Email sending failed (non-critical):', err);
        });
    } catch (error) {
        console.error('Error submitting score:', error);
    }
    
    return entry;
}
```

**주요 특징**:
- ✅ 이메일 발송은 **비동기 백그라운드 작업** (non-blocking)
- ✅ 이메일 실패해도 게임 결과 화면 정상 표시
- ✅ 이름 마스킹으로 개인정보 보호 (John Smith → J***h)

---

### 📍 Step 3: 순위 계산 - `calculateRank()` (라인 342-358)

**API 호출**: GET `http://actuator-back:4004/api/game/leaderboard`

```typescript
private async calculateRank(entry: LeaderboardEntry): Promise<number> {
    try {
        // 1. 현재 리더보드 전체 조회
        const response = await fetch(`${this.backendUrl}/api/game/leaderboard`, {
            method: 'GET',
        });
        const leaderboard: LeaderboardEntry[] = await response.json();

        // 2. 현재 플레이어보다 높은 순위의 수를 계산
        const higherRanks = leaderboard.filter(e => 
            e.finalScore > entry.finalScore || 
            (e.finalScore === entry.finalScore && e.completionTime < entry.completionTime)
        ).length;

        // 3. 순위 = 상위 순위 + 1
        return higherRanks + 1;
    } catch (error) {
        console.error('Error calculating rank:', error);
        return 0;  // 실패 시 0 반환
    }
}
```

**순위 기준** (데이터베이스 VIEW 정의):
1. 최종 점수 DESC (높을수록 좋음)
2. 완료 시간 ASC (짧을수록 좋음)
3. 플레이 순서 ASC (먼저 한 사람이 앞)

---

### 📍 Step 4: 이메일 생성 + 발송 - `sendResultEmail()` (라인 360-385)

**위치**: `src/lib/utils.ts` - LeaderboardManager 클래스

```typescript
private async sendResultEmail(userInfo: UserInfo, gameSession: GameSession, leaderboardEntry: LeaderboardEntry): Promise<void> {
    try {
        // 1. 이메일 템플릿 생성
        const emailTemplate = this.generateResultEmailTemplate(userInfo, gameSession, leaderboardEntry);

        // 2. 백엔드 API 호출 (POST /api/send-email)
        const response = await fetch(`${this.backendUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userInfo.id,
                recipientEmail: userInfo.email,
                subject: emailTemplate.subject,
                htmlContent: emailTemplate.htmlContent,
                textContent: emailTemplate.textContent,
            }),
        });

        if (!response.ok) {
            console.warn('Failed to send email:', response.statusText);
        } else {
            console.log('Email sent successfully');
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
```

**전송 데이터**:
```json
{
    "userId": "user-uuid-string",
    "recipientEmail": "player@example.com",
    "subject": "Your Actuator Challenge Results - Score: 4/5",
    "htmlContent": "...(HTML 이메일 템플릿)...",
    "textContent": "...(TEXT 이메일 템플릿)..."
}
```

---

### 📍 Step 5: 이메일 템플릿 생성 - `generateResultEmailTemplate()` (라인 387-450)

**위치**: `src/lib/utils.ts` - LeaderboardManager 클래스

생성되는 이메일 내용:
- 📌 헤더: 게임 제목 + 로고
- 📊 결과: 점수, 순위, 완료 시간
- 🎯 통계: 정답 수, 최종 점수, 시간 보너스
- 🏆 리더보드 링크
- 🔗 CTA 버튼: "View Your Rank" / "Play Again"

**HTML 이메일 샘플**:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                 color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎮 Build Your Perfect Actuator - Results</h1>
        </div>
        <div class="content">
            <h2>Congratulations!</h2>
            <p>Your Score: <strong>4 out of 5</strong></p>
            <p>Your Rank: <strong>#3 today</strong></p>
            <p>Completion Time: <strong>1:32</strong></p>
        </div>
    </div>
</body>
</html>
```

---

### 📍 Step 6: 백엔드 이메일 수신 - `POST /api/send-email` (routes/email.ts)

**위치**: `actuator-back/src/routes/email.ts` (라인 1-50)

```typescript
router.post('/send-email', async (req, res) => {
    const { userId, recipientEmail, subject, htmlContent, textContent } = req.body;

    if (!recipientEmail || !subject || !htmlContent) {
        return res.status(400).json({ error: 'Missing required email fields' });
    }

    const emailId = uuidv4();

    try {
        // 1️⃣ 이메일 로그 저장 (DB에 기록)
        await pool.query(
            `INSERT INTO email_logs (id, user_id, email_type, recipient_email, success, error_message)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [emailId, userId || null, 'result', recipientEmail, true, null]
        );

        // 2️⃣ SendGrid API로 실제 이메일 발송 (환경 변수 필요)
        if (process.env.SENDGRID_API_KEY) {
            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    personalizations: [
                        { to: [{ email: recipientEmail }], subject: subject }
                    ],
                    from: { email: 'noreply@buildyourperfectactuator.com' },
                    content: [
                        { type: 'text/html', value: htmlContent },
                        { type: 'text/plain', value: textContent }
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error('SendGrid API error');
            }
        }

        // 3️⃣ 성공 응답
        res.json({ success: true, emailId: emailId });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});
```

**데이터베이스 저장**: `email_logs` 테이블
```sql
INSERT INTO email_logs 
(id, user_id, email_type, recipient_email, success, error_message, sent_at)
VALUES ($1, $2, 'result', $3, true, null, NOW());
```

---

## 📊 이메일 발송 흐름 - 변수 추적

### 단계 1: 게임 완료
```
gameSession.completionTime: 95000 (95초, ms 단위)
gameSession.answers.length: 5
gameSession.answers.filter(a => a.isCorrect).length: 4 ✅
userInfo.email: "player@example.com"
```

### 단계 2: 리더보드 제출
```
baseScore = 4 (정답 수)
finalScore = 400 (4 × 100)
entry.rank = 3 (현재 순위)
```

### 단계 3: 이메일 생성
```
subject: "Your Actuator Challenge Results - Score: 4/5"
htmlContent: "...HTML 템플릿..."
textContent: "...TEXT 템플릿..."
```

### 단계 4: 백엔드 수신
```
POST /api/send-email
body: { userId, recipientEmail, subject, htmlContent, textContent }
↓
email_logs INSERT
↓
SendGrid API (SENDGRID_API_KEY 있으면 실제 발송)
```

---

## ⚠️ 중요한 특징

### 1️⃣ **비블로킹 이메일 발송**
```typescript
// sendResultEmail()는 Promise를 반환하지만,
// .catch()로 에러를 처리하고 무시함
this.sendResultEmail(...).catch(err => {
    console.warn('Email sending failed (non-critical):', err);
});
```
**의미**: 이메일 발송 실패해도 게임 결과 화면은 정상 표시

### 2️⃣ **이메일 로그 저장**
모든 이메일 시도를 `email_logs` 테이블에 기록
- ✅ 발송 성공한 이메일
- ❌ 발송 실패한 이메일
- 📊 나중에 분석 가능

### 3️⃣ **환경 변수 기반 조건부 발송**
```typescript
if (process.env.SENDGRID_API_KEY) {
    // SendGrid API로 실제 발송
} else {
    // API 키 없으면 로그만 저장 (발송하지 않음)
}
```

### 4️⃣ **개인정보 보호**
- 리더보드에 표시되는 이름은 마스킹됨 (J***n)
- 실제 이메일은 개인에게만 발송 (비공개)

---

## 🔍 문제 해결

### Q1: 이메일이 안 옴
**원인 분석**:
1. `SENDGRID_API_KEY` 환경 변수가 설정되지 않음
   - 해결: `.env` 또는 `docker-compose.yaml`에 설정
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```

2. 이메일 로그에는 저장되지만 실제 발송 실패
   - 확인: `email_logs` 테이블 조회
   ```sql
   SELECT * FROM email_logs ORDER BY sent_at DESC;
   ```

3. 백엔드 API가 응답 안 함
   - 확인: `docker logs actuator-back` 확인

### Q2: 콘솔에 에러 메시지 보임
```
Email sending failed (non-critical): Error: ...
```
**원인**: 네트워크 오류 또는 SendGrid API 오류
- 이메일은 로그에 저장됨
- 게임 결과는 정상 표시됨

### Q3: 이메일 수신자가 잘못됨
- `userInfo.email`이 올바른지 확인
- `BuildYourPerfectActuator.tsx`에서 입력값 검증

---

## 🎯 최적화 제안

### 1. 이메일 템플릿 개선
- 개인화된 인사말 추가
- 게임 분석 데이터 추가 (문제별 점수 등)
- 소셜 미디어 공유 버튼

### 2. 재전송 로직
```typescript
// 발송 실패 시 재시도
const maxRetries = 3;
for (let i = 0; i < maxRetries; i++) {
    try {
        await sendEmail();
        break;
    } catch (err) {
        if (i === maxRetries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
}
```

### 3. 이메일 통계
```sql
-- 발송 성공률
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN success = true THEN 1 END) as successful,
    ROUND(100.0 * COUNT(CASE WHEN success = true THEN 1 END) / COUNT(*), 2) as success_rate
FROM email_logs;
```

---

## 📋 체크리스트

- [ ] `SENDGRID_API_KEY` 환경 변수 설정 확인
- [ ] `email_logs` 테이블에 데이터 저장 확인
- [ ] 프론트엔드 콘솔에서 "Email sent successfully" 메시지 확인
- [ ] 실제 이메일 수신 확인
- [ ] 이메일 템플릿이 HTML과 TEXT 모두 포함하는지 확인
- [ ] 이름 마스킹이 정상 작동하는지 확인

---

**마지막 업데이트**: 2025년 10월 31일
