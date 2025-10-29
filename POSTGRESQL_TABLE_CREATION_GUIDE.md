# Synology NAS PostgreSQL 에 테이블 생성하는 방법

## 방법 1️⃣: Docker를 통해 직접 실행 (권장)

```bash
# Synology NAS의 Docker에서 postgresql 컨테이너 실행 중이라면:

docker exec postgres psql -U postgres -d sacrp_production << EOF
-- leaderboard_entries 테이블
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY,
    user_id UUID,
    player_name TEXT NOT NULL,
    company TEXT,
    score INT NOT NULL,
    completion_time BIGINT NOT NULL,
    time_bonus INT DEFAULT 0,
    final_score INT NOT NULL,
    played_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score_time ON leaderboard_entries(score DESC, completion_time ASC, played_at ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_played_at ON leaderboard_entries(played_at DESC);

-- email_logs 테이블
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    email_type VARCHAR(50) NOT NULL,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    error_message TEXT
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- api_counter_logs 테이블
CREATE TABLE IF NOT EXISTS api_counter_logs (
    id UUID PRIMARY KEY,
    api_endpoint VARCHAR(255),
    action VARCHAR(50),
    success BOOLEAN,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_api_counter_logs_created_at ON api_counter_logs(created_at DESC);

-- 확인
\dt leaderboard_entries
\dt email_logs
\dt api_counter_logs
EOF
```

---

## 방법 2️⃣: SQL 파일을 통해 실행

```bash
# SQL_CREATE_TABLES.sql 파일을 PostgreSQL에 실행

docker exec postgres psql -U postgres -d sacrp_production -f /path/to/SQL_CREATE_TABLES.sql
```

---

## 방법 3️⃣: pgAdmin (웹 UI)를 통해 실행

1. Synology NAS의 pgAdmin 접속
2. Query Tool 열기
3. 아래 SQL 복사 후 실행:

```sql
-- leaderboard_entries 테이블
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY,
    user_id UUID,
    player_name TEXT NOT NULL,
    company TEXT,
    score INT NOT NULL,
    completion_time BIGINT NOT NULL,
    time_bonus INT DEFAULT 0,
    final_score INT NOT NULL,
    played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score_time 
    ON leaderboard_entries(score DESC, completion_time ASC, played_at ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_played_at 
    ON leaderboard_entries(played_at DESC);

-- email_logs 테이블
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    email_type VARCHAR(50) NOT NULL,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- api_counter_logs 테이블
CREATE TABLE IF NOT EXISTS api_counter_logs (
    id UUID PRIMARY KEY,
    api_endpoint VARCHAR(255),
    action VARCHAR(50),
    success BOOLEAN,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_counter_logs_created_at 
    ON api_counter_logs(created_at DESC);
```

---

## 🧪 테이블 생성 확인

생성 후 다음 명령어로 테이블 확인:

```bash
# leaderboard_entries 테이블 확인
docker exec postgres psql -U postgres -d sacrp_production -c "\dt leaderboard_entries"

# 모든 새 테이블 확인
docker exec postgres psql -U postgres -d sacrp_production -c "\dt leaderboard_entries email_logs api_counter_logs"

# 테이블 구조 확인
docker exec postgres psql -U postgres -d sacrp_production -c "\d leaderboard_entries"
```

---

## 📊 테이블 구조 설명

### leaderboard_entries
```
id                 : UUID (기본키)
user_id           : UUID (사용자 ID, nullable)
player_name       : TEXT (필수, 이름 마스킹됨)
company           : TEXT (회사명, nullable)
score             : INT (0~5 정답수)
completion_time   : BIGINT (밀리초)
time_bonus        : INT (시간 보너스 점수, 기본값 0)
final_score       : INT (최종 점수 = score*100 + time_bonus)
played_at         : TIMESTAMPTZ (게임 완료 시간, 기본값 NOW())
```

### email_logs
```
id                : UUID (기본키)
user_id          : UUID (사용자 ID, nullable)
email_type       : VARCHAR(50) (이메일 타입, 예: 'result')
recipient_email  : TEXT (수신자 이메일)
sent_at          : TIMESTAMPTZ (발송 시간)
success          : BOOLEAN (발송 성공 여부)
error_message    : TEXT (실패 시 에러 메시지)
```

### api_counter_logs
```
id               : UUID (기본키)
api_endpoint     : VARCHAR(255) (API 엔드포인트)
action           : VARCHAR(50) (동작 타입, 예: 'increment')
success          : BOOLEAN (성공 여부)
response_data    : JSONB (응답 데이터)
created_at       : TIMESTAMPTZ (생성 시간)
```

---

## ⚡ 빠른 실행 (한 줄 명령어)

Windows PowerShell에서:

```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "CREATE TABLE IF NOT EXISTS leaderboard_entries (id UUID PRIMARY KEY, user_id UUID, player_name TEXT NOT NULL, company TEXT, score INT NOT NULL, completion_time BIGINT NOT NULL, time_bonus INT DEFAULT 0, final_score INT NOT NULL, played_at TIMESTAMPTZ DEFAULT NOW()); CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score_time ON leaderboard_entries(score DESC, completion_time ASC, played_at ASC); CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_played_at ON leaderboard_entries(played_at DESC);"
```

---

## ✅ 검증

테이블 생성 후 다음으로 검증:

```bash
# 1. 테이블 목록 확인
docker exec postgres psql -U postgres -d sacrp_production -c "\dt leaderboard_entries"

# 2. 컬럼 확인
docker exec postgres psql -U postgres -d sacrp_production -c "\d leaderboard_entries"

# 3. 인덱스 확인
docker exec postgres psql -U postgres -d sacrp_production -c "\di idx_leaderboard_entries*"
```
