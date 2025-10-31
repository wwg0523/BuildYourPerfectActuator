# 📧 Gmail SMTP 이메일 설정 가이드

## ✅ 현재 설정

이메일 발송이 **Gmail SMTP**를 통해 작동하도록 수정되었습니다.

### 📝 설정 정보
```
발신자: whwlsgh0523@gmail.com
App Password: invb xoqc sqtx qeyw
```

---

## 🔧 환경 변수 설정

### `.env` 파일 (개발 및 NAS 배포용)
```env
APP_EMAIL=whwlsgh0523@gmail.com
APP_PASS=invb xoqc sqtx qeyw
```

### `docker-compose.yaml` (개발용)
```yaml
environment:
  APP_EMAIL: whwlsgh0523@gmail.com
  APP_PASS: invb xoqc sqtx qeyw
```

### `docker-compose.prod.yaml` (NAS 배포용)
```yaml
environment:
  APP_EMAIL: ${APP_EMAIL:-whwlsgh0523@gmail.com}
  APP_PASS: ${APP_PASS:-invb xoqc sqtx qeyw}
```

---

## 📧 이메일 발송 흐름

### 1️⃣ 사용자가 게임 완료
```
Game Screen
    ↓
handleSubmit() 실행
    ↓
leaderboardManager.submitScore()
```

### 2️⃣ 이메일 발송 요청
```
sendResultEmail()
    ↓
POST /api/send-email
{
    userId: "user-uuid",
    recipientEmail: "player@example.com",
    subject: "Your Actuator Challenge Results - Score: 4/5",
    htmlContent: "...HTML 템플릿...",
    textContent: "...텍스트 버전..."
}
```

### 3️⃣ Gmail SMTP를 통한 발송
```
nodemailer.transporter.sendMail({
    from: "Actuator Challenge <whwlsgh0523@gmail.com>",
    to: "player@example.com",
    subject: "Your Actuator Challenge Results - Score: 4/5",
    html: htmlContent,
    text: textContent
})
```

### 4️⃣ 발송 결과 저장
- ✅ 성공: `email_logs` 테이블에 `success = true` 저장
- ❌ 실패: `email_logs` 테이블에 `success = false`, 에러 메시지 저장

---

## 🧪 이메일 발송 테스트

### 콘솔에서 로그 확인
```bash
docker-compose logs -f backend
```

**성공 메시지**:
```
📧 Sending email to: player@example.com
Subject: Your Actuator Challenge Results - Score: 4/5
✅ Email sent successfully!
Message ID: <xxxxx@example.com>
```

**실패 메시지**:
```
❌ Gmail SMTP Error: Error: Invalid login: [GMAIL] Invalid user or password
```

---

## ⚠️ Gmail 설정 확인사항

### 1. 2단계 인증 활성화 확인
Gmail에서 App Password를 사용하려면 **2단계 인증이 필수**입니다.

**확인 방법**:
1. Google 계정 접속: https://myaccount.google.com
2. 보안 탭 → 2단계 인증 확인
3. ✅ 활성화되어 있어야 함

### 2. App Password 생성 확인
```
https://myaccount.google.com/apppasswords
```

- ✅ App Password 생성됨: `invb xoqc sqtx qeyw`
- ✅ 앱: 메일
- ✅ 기기: Windows 컴퓨터 (또는 Linux)

### 3. 이메일 주소 확인
```
발신 이메일: whwlsgh0523@gmail.com
```

---

## 🔍 문제 해결

### 문제 1: "Invalid login" 오류
```
Error: Invalid login: [GMAIL] Invalid user or password
```

**해결 방법**:
1. Gmail App Password 다시 확인 (공백 제거)
2. `.env` 파일의 APP_PASS 정확성 확인
3. 2단계 인증 활성화 확인

### 문제 2: "Too many login attempts"
Gmail이 일시적으로 로그인 차단

**해결 방법**:
1. 1시간 대기 후 다시 시도
2. App Password 재생성 (https://myaccount.google.com/apppasswords)

### 문제 3: 이메일이 스팸 폴더로 감
Gmail의 스팸 필터 때문일 수 있음

**해결 방법**:
1. 받은 편지함에서 스팸 폴더 확인
2. "스팸 아님" 표시
3. 발신자를 연락처에 추가

---

## 📊 이메일 로그 확인

### 데이터베이스에서 조회
```sql
SELECT * FROM email_logs ORDER BY sent_at DESC;
```

**결과 예시**:
```
id                  | user_id | email_type | recipient_email      | success | error_message | sent_at
--------------------|---------|------------|----------------------|---------|---------------|-------------------
a1b2c3d4-e5f6...    | uuid123 | result     | player@example.com   | true    | NULL          | 2025-10-31 14:30:00
```

### API를 통한 조회
```bash
curl http://localhost:4004/api/email-logs/user-uuid-here
```

---

## 🎯 이메일 템플릿

### 발송되는 이메일 예시

**제목**: Your Actuator Challenge Results - Score: 4/5

**본문** (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); 
                  color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .score { font-size: 2em; font-weight: bold; color: #667eea; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎮 Actuator Challenge - Results</h1>
    </div>
    <div class="content">
        <h2>Congratulations!</h2>
        <p>Your Score: <span class="score">4 out of 5</span></p>
        <p>Completion Time: 1:32</p>
        <p>Your Rank: #3 today</p>
        <p><a href="http://actuator-ip:5005/leaderboard">View Leaderboard</a></p>
    </div>
</body>
</html>
```

---

## ✨ 이메일 발송 시점

게임 완료 후 다음 단계에서 이메일 발송:

1. ✅ 마지막 문제 답변 후 "제출" 클릭
2. ✅ 피드백 모달 표시
3. ✅ 모달 닫기
4. ✅ Result 화면 표시 준비
5. ✅ **이메일 백그라운드 발송** (비동기)
6. ✅ Result 화면 표시
7. ✅ 사용자는 즉시 결과 확인 가능
8. ✅ 이메일은 1-5초 후 수신

---

## 📋 체크리스트

- [x] Gmail SMTP 설정 완료
- [x] nodemailer 라이브러리 설치 완료
- [x] `email.ts` 라우트 수정 완료
- [x] `.env.example` 업데이트 완료
- [x] `docker-compose.yaml` 업데이트 완료
- [x] `docker-compose.prod.yaml` 업데이트 완료
- [ ] 게임에서 실제 이메일 발송 테스트 필요
- [ ] 받은 편지함에서 이메일 확인 필요

---

## 🚀 배포 후 테스트

### Step 1: 컨테이너 재빌드
```bash
docker-compose down
docker-compose up --build -d
```

### Step 2: 게임 플레이
1. 브라우저에서 `http://localhost:5005` 접속
2. START GAME 클릭
3. 게임 완료
4. 결과 화면 표시 확인

### Step 3: 이메일 확인
1. Gmail 받은 편지함 확인
2. 발신자: `Actuator Challenge <whwlsgh0523@gmail.com>`
3. 제목: `Your Actuator Challenge Results - Score: X/5`

### Step 4: 로그 확인
```bash
docker-compose logs backend | grep -A 5 "📧 Sending email"
```

---

**마지막 업데이트**: 2025년 10월 31일
**이메일 서비스**: Gmail SMTP (nodemailer)
**상태**: ✅ 준비 완료
