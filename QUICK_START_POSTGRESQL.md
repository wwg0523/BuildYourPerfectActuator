# 📝 Synology NAS PostgreSQL 테이블 생성 - 빠른 실행 가이드

## 💻 Windows PowerShell에서 한 번에 실행

아래 명령어를 **Windows PowerShell** (관리자 권한)에서 복사 후 실행하세요:

### 옵션 1️⃣: 한 줄 명령어 (전체 테이블 + 인덱스)

```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "
CREATE TABLE IF NOT EXISTS leaderboard_entries (id UUID PRIMARY KEY, user_id UUID, player_name TEXT NOT NULL, company TEXT, score INT NOT NULL, completion_time BIGINT NOT NULL, time_bonus INT DEFAULT 0, final_score INT NOT NULL, played_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS email_logs (id UUID PRIMARY KEY, user_id UUID, email_type VARCHAR(50) NOT NULL, recipient_email TEXT NOT NULL, sent_at TIMESTAMPTZ DEFAULT NOW(), success BOOLEAN NOT NULL, error_message TEXT);
CREATE TABLE IF NOT EXISTS api_counter_logs (id UUID PRIMARY KEY, api_endpoint VARCHAR(255), action VARCHAR(50), success BOOLEAN, response_data JSONB, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score_time ON leaderboard_entries(score DESC, completion_time ASC, played_at ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_played_at ON leaderboard_entries(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_counter_logs_created_at ON api_counter_logs(created_at DESC);
"
```

---

### 옵션 2️⃣: 단계별 실행 (확인하면서 진행)

#### Step 1: leaderboard_entries 테이블 생성

```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "
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
"
```

실행 후 확인:
```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "\dt leaderboard_entries"
```

---

#### Step 2: email_logs 테이블 생성

```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    email_type VARCHAR(50) NOT NULL,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    error_message TEXT
);
"
```

확인:
```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "\dt email_logs"
```

---

#### Step 3: api_counter_logs 테이블 생성

```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "
CREATE TABLE IF NOT EXISTS api_counter_logs (
    id UUID PRIMARY KEY,
    api_endpoint VARCHAR(255),
    action VARCHAR(50),
    success BOOLEAN,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"
```

확인:
```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "\dt api_counter_logs"
```

---

#### Step 4: 인덱스 생성

```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score_time ON leaderboard_entries(score DESC, completion_time ASC, played_at ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_played_at ON leaderboard_entries(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_counter_logs_created_at ON api_counter_logs(created_at DESC);
"
```

---

### ✅ 모든 테이블 생성 확인

```powershell
docker exec postgres psql -U postgres -d sacrp_production -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('leaderboard_entries', 'email_logs', 'api_counter_logs')
ORDER BY table_name;
"
```

예상 출력:
```
       table_name       
------------------------
 api_counter_logs
 email_logs
 leaderboard_entries
(3 rows)
```

---

### 🔍 상세 테이블 구조 확인

```powershell
# leaderboard_entries 테이블 구조
docker exec postgres psql -U postgres -d sacrp_production -c "\d leaderboard_entries"

# 모든 인덱스 확인
docker exec postgres psql -U postgres -d sacrp_production -c "\di idx_*"
```

---

## 🚀 자동 실행 스크립트

### Windows 배치 파일 실행

```powershell
# create_tables.bat 파일 실행
cd c:\build-your-perfect-actuator
.\create_tables.bat
```

---

## 📋 테이블별 필드 설명

### leaderboard_entries
| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본 키 |
| user_id | UUID | 사용자 ID (nullable) |
| player_name | TEXT | 플레이어 이름 (마스킹됨) |
| company | TEXT | 회사명 (nullable) |
| score | INT | 정답 개수 (0~5) |
| completion_time | BIGINT | 완료 시간 (밀리초) |
| time_bonus | INT | 시간 보너스 점수 |
| final_score | INT | 최종 점수 |
| played_at | TIMESTAMPTZ | 게임 완료 시간 |

### email_logs
| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본 키 |
| user_id | UUID | 사용자 ID (nullable) |
| email_type | VARCHAR(50) | 이메일 타입 |
| recipient_email | TEXT | 수신자 이메일 |
| sent_at | TIMESTAMPTZ | 발송 시간 |
| success | BOOLEAN | 발송 성공 여부 |
| error_message | TEXT | 에러 메시지 (nullable) |

### api_counter_logs
| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본 키 |
| api_endpoint | VARCHAR(255) | API 엔드포인트 |
| action | VARCHAR(50) | 동작 타입 |
| success | BOOLEAN | 성공 여부 |
| response_data | JSONB | 응답 데이터 |
| created_at | TIMESTAMPTZ | 생성 시간 |

---

## ❓ 문제 해결

### Q: "docker exec" 명령어를 찾을 수 없음
**A**: Docker Desktop이 실행 중인지 확인하세요

### Q: "database does not exist" 에러
**A**: 데이터베이스 이름 확인:
```powershell
docker exec postgres psql -U postgres -l
```

### Q: "permission denied" 에러
**A**: PowerShell을 관리자 권한으로 실행하세요

### Q: 테이블이 이미 존재
**A**: `CREATE TABLE IF NOT EXISTS` 를 사용하므로 안전함. 
      기존 데이터는 유지되고 스킵됨

---

## 🎯 다음 단계

1. ✅ 테이블 생성 완료
2. 🎮 게임 플레이 후 결과 저장 테스트
3. 📊 리더보드 조회 테스트
4. 📧 이메일 발송 테스트

---

## 📞 참고 정보

- **데이터베이스**: `sacrp_production`
- **호스트**: Synology NAS (Docker)
- **사용자**: `postgres`
- **포트**: 5432
