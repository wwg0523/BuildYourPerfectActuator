-- ============================================
-- Build Your Perfect Actuator - 테이블 재설정
-- ============================================

-- 1. 기존 VIEW 삭제
DROP VIEW IF EXISTS daily_leaderboard CASCADE;

-- 2. 기존 테이블 삭제
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS api_counter_logs CASCADE;
DROP TABLE IF EXISTS game_results CASCADE;
DROP TABLE IF EXISTS game_users CASCADE;

-- ============================================
-- 테이블 재생성
-- ============================================

-- 3. game_users 테이블
CREATE TABLE game_users (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(200),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. game_results 테이블
CREATE TABLE game_results (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES game_users(id) ON DELETE CASCADE,
    selected_components JSONB NOT NULL,
    compatible_applications JSONB NOT NULL,
    success_rate NUMERIC(3,2) NOT NULL,
    completion_time BIGINT NOT NULL,
    score INT NOT NULL,
    final_score INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 인덱스 생성
CREATE INDEX idx_game_results_user_id ON game_results(user_id);
CREATE INDEX idx_game_results_created_at ON game_results(created_at DESC);
CREATE INDEX idx_game_results_final_score ON game_results(final_score DESC);

-- 6. email_logs 테이블
CREATE TABLE email_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    email_type VARCHAR(50) NOT NULL,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    error_message TEXT
);

CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- 7. api_counter_logs 테이블
CREATE TABLE api_counter_logs (
    id UUID PRIMARY KEY,
    api_endpoint VARCHAR(255),
    action VARCHAR(50),
    success BOOLEAN,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_counter_logs_created_at ON api_counter_logs(created_at DESC);

-- ============================================
-- daily_leaderboard VIEW 생성
-- ============================================

CREATE OR REPLACE VIEW daily_leaderboard AS
SELECT
    gr.id,
    gr.user_id,
    CASE 
        WHEN LENGTH(gu.name) > 2 THEN SUBSTRING(gu.name FROM 1 FOR 1) || '***' || SUBSTRING(gu.name FROM LENGTH(gu.name) FOR 1)
        ELSE gu.name
    END AS player_name,
    gu.company,
    gr.score,
    gr.completion_time,
    gr.final_score,
    gr.created_at AT TIME ZONE 'UTC' AS played_at,
    ROW_NUMBER() OVER (ORDER BY gr.final_score DESC, gr.completion_time ASC, gr.created_at ASC) AS rank
FROM game_results gr
JOIN game_users gu ON gr.user_id = gu.id
WHERE DATE(gr.created_at AT TIME ZONE 'UTC') = CURRENT_DATE AT TIME ZONE 'UTC'
ORDER BY gr.final_score DESC, gr.completion_time ASC, gr.created_at ASC;

-- ============================================
-- 테스트 데이터 삽입 (선택사항)
-- ============================================

-- 테스트용 사용자
INSERT INTO game_users (id, name, company, email, phone) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Alice Johnson', 'TechCorp', 'alice@example.com', '010-1234-5678'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Bob Smith', 'InnovateLabs', 'bob@example.com', '010-2345-6789'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Carol Davis', 'FutureTech', 'carol@example.com', '010-3456-7890'),
    ('550e8400-e29b-41d4-a716-446655440003', 'David Wilson', 'NextGen', 'david@example.com', '010-4567-8901'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Eve Martinez', 'SynergyHub', 'eve@example.com', '010-5678-9012');

-- 테스트용 게임 결과 (오늘 날짜)
INSERT INTO game_results (id, user_id, selected_components, compatible_applications, success_rate, completion_time, score, final_score) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '["Motor", "Pump"]', '["HVAC", "Water"]', 1.00, 45000, 5, 500),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '["Valve", "Sensor"]', '["Hydraulic"]', 0.80, 62000, 4, 400),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '["Pump"]', '["Water"]', 0.60, 78000, 3, 300),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '["Motor", "Valve"]', '["HVAC", "Hydraulic"]', 0.40, 95000, 2, 200),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '["Sensor"]', '["Monitoring"]', 0.20, 120000, 1, 100);

-- 확인
SELECT '✅ 테이블 재설정 완료!' as status;
SELECT COUNT(*) as user_count FROM game_users;
SELECT COUNT(*) as result_count FROM game_results;
SELECT * FROM daily_leaderboard ORDER BY rank;
