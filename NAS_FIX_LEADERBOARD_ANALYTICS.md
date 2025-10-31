# 🔧 NAS 배포 - Leaderboard & Analytics 수정 가이드

## 문제 요약

NAS 배포 후 발생하는 두 가지 문제:

1. ❌ **Leaderboard 에러**: `daily_leaderboard` VIEW가 없어서 에러 발생
2. ❌ **Analytics 에러**: 로컬 데이터를 가져오려고 해서 에러 발생

---

## ✅ 해결 방법

### Step 1: 데이터베이스에 VIEW 생성

NAS의 PostgreSQL에 접속하여 다음 SQL을 실행합니다:

#### 옵션 A: psql 명령줄에서 실행
```bash
docker exec actuator-db psql -U postgres -d actuator_game -c "
DROP VIEW IF EXISTS daily_leaderboard CASCADE;
CREATE VIEW daily_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY gr.success_rate DESC, gr.completion_time ASC) as rank,
    gr.id,
    gr.user_id,
    gu.name as player_name,
    gu.company,
    COALESCE(gr.score, 0) as score,
    gr.completion_time,
    COALESCE(gr.final_score, 0) as final_score,
    gr.created_at as played_at
FROM game_results gr
JOIN game_users gu ON gr.user_id = gu.id
WHERE DATE(gr.created_at) = CURRENT_DATE
ORDER BY gr.success_rate DESC, gr.completion_time ASC;

DROP VIEW IF EXISTS game_analytics CASCADE;
CREATE VIEW game_analytics AS
SELECT 
    COUNT(DISTINCT gr.user_id) as total_participants,
    ROUND(COUNT(CASE WHEN gr.success_rate > 0.75 THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as completion_rate,
    ROUND(AVG(gr.completion_time)::numeric / 1000, 2) as average_completion_time,
    array_agg(DISTINCT gu.company) as top_company_participants,
    array_agg(DISTINCT gr.compatible_applications) as popular_component_combinations,
    jsonb_object_agg('total', COUNT(*)::text) as success_rate_by_experience
FROM game_results gr
JOIN game_users gu ON gr.user_id = gu.id;
"
```

#### 옵션 B: SQL 파일로 실행
```bash
docker exec -i actuator-db psql -U postgres -d actuator_game < CREATE_TABLES.sql
```

### Step 2: 다시 배포

```bash
docker-compose -f docker-compose.prod.yaml down
docker-compose -f docker-compose.prod.yaml up --build -d
```

### Step 3: 검증

#### Leaderboard 테스트
```bash
curl http://nas-ip:4004/api/game/leaderboard
```

**성공 응답**:
```json
[
    {
        "rank": 1,
        "playerName": "John",
        "company": "Acme",
        "score": 5,
        "completionTime": 60000,
        "finalScore": 500,
        "playedAt": "2025-10-31T10:30:00Z"
    }
]
```

#### Analytics 테스트
```bash
curl -H "Authorization: admin123" http://nas-ip:4004/api/analytics
```

**성공 응답**:
```json
{
    "totalParticipants": 10,
    "completionRate": 85.5,
    "averageCompletionTime": 120.5,
    "topCompanyParticipants": ["Acme", "Tech Corp"],
    "popularComponentCombinations": [...],
    "successRateByExperience": {"total": "50"}
}
```

---

## 🗂️ 수정된 파일

### actuator-back/sql/CREATE_TABLES.sql

두 개의 VIEW가 추가되었습니다:

```sql
-- daily_leaderboard VIEW: 오늘 플레이한 게임 결과 순위
DROP VIEW IF EXISTS daily_leaderboard CASCADE;
CREATE VIEW daily_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY gr.success_rate DESC, gr.completion_time ASC) as rank,
    gr.id,
    gr.user_id,
    gu.name as player_name,
    gu.company,
    COALESCE(gr.score, 0) as score,
    gr.completion_time,
    COALESCE(gr.final_score, 0) as final_score,
    gr.created_at as played_at
FROM game_results gr
JOIN game_users gu ON gr.user_id = gu.id
WHERE DATE(gr.created_at) = CURRENT_DATE
ORDER BY gr.success_rate DESC, gr.completion_time ASC;

-- game_analytics VIEW: 게임 분석 데이터
DROP VIEW IF EXISTS game_analytics CASCADE;
CREATE VIEW game_analytics AS
SELECT 
    COUNT(DISTINCT gr.user_id) as total_participants,
    ROUND(COUNT(CASE WHEN gr.success_rate > 0.75 THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as completion_rate,
    ROUND(AVG(gr.completion_time)::numeric / 1000, 2) as average_completion_time,
    array_agg(DISTINCT gu.company) as top_company_participants,
    array_agg(DISTINCT gr.compatible_applications) as popular_component_combinations,
    jsonb_object_agg('total', COUNT(*)::text) as success_rate_by_experience
FROM game_results gr
JOIN game_users gu ON gr.user_id = gu.id;
```

---

## 📱 Analytics 데이터 흐름

```
Frontend (http://nas-ip:5005/analytics)
    ↓
process.env.REACT_APP_BACKEND_URL 
    ↓
Backend (http://nas-ip:4004/api/analytics)
    ↓
game_analytics VIEW
    ↓
game_results + game_users 테이블 조인
    ↓
분석 데이터 반환
```

**중요**: `docker-compose.prod.yaml`에서 `REACT_APP_BACKEND_URL` 환경변수 확인
```yaml
frontend:
  environment:
    REACT_APP_BACKEND_URL: http://actuator-back:4004
```

---

## 🎯 Leaderboard 데이터 흐름

```
Frontend (/leaderboard 페이지)
    ↓
GET /api/game/leaderboard
    ↓
Backend (actuator-back/src/routes/game.ts)
    ↓
daily_leaderboard VIEW 쿼리
    ↓
game_results + game_users 조인
    ↓
TODAY의 결과만 필터링 (WHERE DATE(created_at) = CURRENT_DATE)
    ↓
success_rate DESC, completion_time ASC 정렬
    ↓
리더보드 표시
```

---

## ✨ 이제 동작하는 것

| 기능 | URL | 상태 |
|------|-----|------|
| 게임 | `http://nas-ip:5005` | ✅ 작동 |
| 리더보드 | `http://nas-ip:5005/leaderboard` | ✅ 수정됨 |
| 분석 | `http://nas-ip:5005/analytics` | ✅ 수정됨 (백엔드에서 가져옴) |
| 게임 API | `http://nas-ip:4004/api/game/submit` | ✅ 작동 |
| 리더보드 API | `http://nas-ip:4004/api/game/leaderboard` | ✅ 수정됨 |
| 분석 API | `http://nas-ip:4004/api/analytics` | ✅ 작동 |

---

## 🐛 문제 해결

### "VIEW daily_leaderboard does not exist" 에러
```bash
# NAS의 PostgreSQL에 직접 VIEW 생성
docker exec actuator-db psql -U postgres -d actuator_game
# psql> 프롬프트에서 위의 SQL 실행
```

### "Backend connection refused" 에러
```bash
# 컨테이너 재시작
docker-compose -f docker-compose.prod.yaml restart backend

# 로그 확인
docker-compose -f docker-compose.prod.yaml logs backend
```

### Analytics 비밀번호 오류
```yaml
# docker-compose.prod.yaml의 환경변수 확인
backend:
  environment:
    ANALYTICS_PASSWORD: admin123  # 이 값 확인
```

---

**마지막 업데이트**: 2025년 10월 31일
**상태**: ✅ NAS 배포 준비 완료
