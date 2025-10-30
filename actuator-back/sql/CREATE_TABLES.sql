-- ⚡ Synology NAS PostgreSQL (sacrp_production) 에 실행할 최종 SQL
-- daily_leaderboard VIEW는 game_results 테이블을 기반으로 자동 생성됨

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