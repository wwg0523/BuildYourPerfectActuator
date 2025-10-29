📊 PostgreSQL 테이블 생성 - 최종 요약

## 🎯 현재 상황

❌ **문제**: POST http://pillar01.synology.me:4004/api/game/leaderboard 404 (Not Found)

✅ **원인**: Synology NAS의 PostgreSQL `sacrp_production` 데이터베이스에 `leaderboard_entries` 테이블이 없음

✅ **해결**: 아래 SQL을 실행하여 테이블 생성

---

## 🚀 빠른 실행 (권장)

### Windows PowerShell 에서 한 줄 복사-붙여넣기:

```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "CREATE TABLE IF NOT EXISTS leaderboard_entries (id UUID PRIMARY KEY, user_id UUID, player_name TEXT NOT NULL, company TEXT, score INT NOT NULL, completion_time BIGINT NOT NULL, time_bonus INT DEFAULT 0, final_score INT NOT NULL, played_at TIMESTAMPTZ DEFAULT NOW()); CREATE TABLE IF NOT EXISTS email_logs (id UUID PRIMARY KEY, user_id UUID, email_type VARCHAR(50) NOT NULL, recipient_email TEXT NOT NULL, sent_at TIMESTAMPTZ DEFAULT NOW(), success BOOLEAN NOT NULL, error_message TEXT); CREATE TABLE IF NOT EXISTS api_counter_logs (id UUID PRIMARY KEY, api_endpoint VARCHAR(255), action VARCHAR(50), success BOOLEAN, response_data JSONB, created_at TIMESTAMPTZ DEFAULT NOW()); CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score_time ON leaderboard_entries(score DESC, completion_time ASC, played_at ASC); CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_played_at ON leaderboard_entries(played_at DESC); CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id); CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC); CREATE INDEX IF NOT EXISTS idx_api_counter_logs_created_at ON api_counter_logs(created_at DESC);"
```

---

## ✅ 생성 확인

```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "\dt leaderboard_entries email_logs api_counter_logs"
```

예상 출력:
```
           List of relations
 Schema |      Name       | Type  | Owner
--------+-----------------+-------+----------
 public | api_counter_logs| table | postgres
 public | email_logs      | table | postgres
 public | leaderboard_entries| table | postgres
(3 rows)
```

---

## 📋 생성되는 테이블 3개

### 1️⃣ leaderboard_entries (리더보드)
```
id                  UUID (기본키)
user_id            UUID
player_name        TEXT (필수)
company            TEXT
score              INT (0~5)
completion_time    BIGINT (밀리초)
time_bonus         INT
final_score        INT
played_at          TIMESTAMPTZ
```

**사용 시기**: 게임 완료 → 점수 저장

---

### 2️⃣ email_logs (이메일 로그)
```
id                 UUID (기본키)
user_id            UUID
email_type         VARCHAR(50)
recipient_email    TEXT
sent_at            TIMESTAMPTZ
success            BOOLEAN
error_message      TEXT
```

**사용 시기**: 이메일 발송 시도할 때마다 기록

---

### 3️⃣ api_counter_logs (API 로그)
```
id                 UUID (기본키)
api_endpoint       VARCHAR(255)
action             VARCHAR(50)
success            BOOLEAN
response_data      JSONB
created_at         TIMESTAMPTZ
```

**사용 시기**: 향후 외부 API 연동 시

---

## 🔄 작동 흐름

```
1. 사용자 게임 완료
   ↓
2. handleSubmit() 호출
   ↓
3. UUID 생성
   ↓
4. LeaderboardManager.submitScore()
   ├─ 점수 계산
   ├─ POST /api/game/leaderboard
   │  └─ INSERT INTO leaderboard_entries ✅
   ├─ GET /api/game/leaderboard (순위 조회)
   │  └─ SELECT FROM leaderboard_entries ✅
   └─ 이메일 발송
      └─ INSERT INTO email_logs ✅
   ↓
5. Result 화면 표시
```

---

## 📝 파일 위치

생성된 SQL 파일들:
- 📄 `actuator-back/sql/CREATE_TABLES.sql` - 정리된 SQL 코드
- 📄 `SQL_CREATE_TABLES.sql` - 주석 포함 상세 버전
- 📄 `create_tables.bat` - Windows 자동 실행 배치
- 📄 `create_tables.sh` - Linux/Mac 자동 실행 스크립트
- 📄 `QUICK_START_POSTGRESQL.md` - 상세 가이드

---

## 🧪 테이블 생성 후 테스트

### 1️⃣ 테이블 구조 확인
```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "\d leaderboard_entries"
```

### 2️⃣ 샘플 데이터 삽입 테스트
```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "
INSERT INTO leaderboard_entries (id, user_id, player_name, company, score, completion_time, time_bonus, final_score) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'T***t', 'Test Corp', 5, 150000, 25, 525);
"
```

### 3️⃣ 데이터 조회
```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "SELECT * FROM leaderboard_entries;"
```

### 4️⃣ 리더보드 조회 API 테스트
```
GET http://pillar01.synology.me:4004/api/game/leaderboard
```

---

## ⚠️ 중요 사항

1. ✅ `CREATE TABLE IF NOT EXISTS` 사용 → 안전함 (중복 실행 가능)
2. ✅ 기존 데이터는 유지됨
3. ✅ 인덱스도 함께 생성되어 성능 최적화됨
4. ✅ 타임스탐프는 자동으로 현재시간으로 설정

---

## 🎯 다음 단계

1. ✅ **SQL 실행** (위의 PowerShell 명령어)
2. ✅ **테이블 생성 확인** (`\dt` 명령어)
3. ✅ **게임 완료** 및 결과 저장
4. ✅ **리더보드 API** 조회
5. ✅ **이메일** 발송 확인

---

## 📞 도움말

### Q: 명령어를 어디에 입력?
**A**: Windows PowerShell (관리자 권한)

### Q: 테이블이 없다고 나오면?
**A**: Docker가 실행 중인지 확인하고, 명령어를 다시 실행

### Q: 기존 데이터는?
**A**: 이미 있는 테이블은 그대로 유지됨

---

## 축하합니다! 🎉

SQL 실행 후 리더보드 기능이 정상 작동합니다!
