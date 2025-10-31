-- ⚡ Synology NAS PostgreSQL (sacrp_production) 에 실행할 최종 SQL

-- 0️⃣ VIEW 생성 (daily_leaderboard, game_analytics)

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

-- 1️⃣ email_logs 테이블 생성
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    email_type VARCHAR(50) NOT NULL,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    error_message TEXT
);

-- 2️⃣ 이메일 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id 
    ON email_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at 
    ON email_logs(sent_at DESC);


-- 3️⃣ api_counter_logs 테이블 생성 (향후 사용)
CREATE TABLE IF NOT EXISTS api_counter_logs (
    id UUID PRIMARY KEY,
    api_endpoint VARCHAR(255),
    action VARCHAR(50),
    success BOOLEAN,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4️⃣ API 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_api_counter_logs_created_at 
    ON api_counter_logs(created_at DESC);

-- 🧪 생성 확인 (선택사항)
-- \dt email_logs api_counter_logs