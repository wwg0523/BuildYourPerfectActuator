-- Synology NAS PostgreSQL 에 실행할 SQL
-- 데이터베이스: sacrp_production

-- leaderboard_entries 테이블 생성
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

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score_time ON leaderboard_entries(score DESC, completion_time ASC, played_at ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_played_at ON leaderboard_entries(played_at DESC);

-- email_logs 테이블 생성
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    email_type VARCHAR(50) NOT NULL,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    error_message TEXT
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- api_counter_logs 테이블 생성 (향후 사용)
CREATE TABLE IF NOT EXISTS api_counter_logs (
    id UUID PRIMARY KEY,
    api_endpoint VARCHAR(255),
    action VARCHAR(50),
    success BOOLEAN,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_api_counter_logs_created_at ON api_counter_logs(created_at DESC);

-- 테이블 생성 확인
\dt leaderboard_entries
\dt email_logs
\dt api_counter_logs
