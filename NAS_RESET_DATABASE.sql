-- 🔄 NAS 데이터베이스 완전 초기화 SQL
-- 이전 테이블을 모두 삭제하고 새 스키마 생성

-- ⚠️ 주의: 기존 데이터가 모두 삭제됩니다!

-- 1️⃣ 기존 VIEW 제거
DROP VIEW IF EXISTS daily_leaderboard CASCADE;
DROP VIEW IF EXISTS game_analytics CASCADE;

-- 2️⃣ 기존 테이블 제거
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS api_counter_logs CASCADE;
DROP TABLE IF EXISTS game_results CASCADE;
DROP TABLE IF EXISTS game_users CASCADE;

-- ============================================
-- ✅ 새 스키마 생성
-- ============================================

-- 3️⃣ game_users 테이블 생성
CREATE TABLE game_users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4️⃣ game_results 테이블 생성
CREATE TABLE game_results (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES game_users(id) ON DELETE CASCADE,
    selected_components JSONB,
    compatible_applications JSONB,
    success_rate NUMERIC(3, 2) NOT NULL,
    completion_time NUMERIC NOT NULL,
    score INTEGER DEFAULT 0,
    final_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5️⃣ email_logs 테이블 생성
CREATE TABLE email_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    email_type VARCHAR(50) NOT NULL,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    error_message TEXT
);

-- 6️⃣ api_counter_logs 테이블 생성
CREATE TABLE api_counter_logs (
    id UUID PRIMARY KEY,
    api_endpoint VARCHAR(255),
    action VARCHAR(50),
    success BOOLEAN,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 📊 VIEW 생성
-- ============================================

-- 7️⃣ daily_leaderboard VIEW: 오늘 플레이한 게임 결과 순위
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

-- 8️⃣ game_analytics VIEW: 게임 분석 데이터
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

-- ============================================
-- 🔍 인덱스 생성
-- ============================================

-- 9️⃣ 인덱스 생성
CREATE INDEX idx_game_results_user_id ON game_results(user_id);
CREATE INDEX idx_game_results_created_at ON game_results(created_at DESC);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_api_counter_logs_created_at ON api_counter_logs(created_at DESC);

-- ============================================
-- ✅ 확인
-- ============================================

-- 🧪 테이블 확인
\dt

-- 🧪 VIEW 확인
\dv

-- 🧪 비어있음 확인
SELECT COUNT(*) as users FROM game_users;
SELECT COUNT(*) as results FROM game_results;
SELECT COUNT(*) as emails FROM email_logs;

-- 완료! ✅
