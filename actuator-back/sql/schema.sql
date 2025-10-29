-- Schema for BuildYourPerfectActuator

CREATE TABLE IF NOT EXISTS game_users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES game_users(id) ON DELETE CASCADE,
  selected_components JSONB NOT NULL,
  compatible_applications JSONB NOT NULL,
  success_rate NUMERIC(3,2) NOT NULL,
  completion_time BIGINT NOT NULL,
  score INT,
  time_bonus INT,
  final_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- daily_leaderboard: 오늘(서버 시간 기준) 데이터만 집계하는 일반 VIEW
CREATE OR REPLACE VIEW daily_leaderboard AS
SELECT
  gu.id AS user_id,
  gu.name AS player_name,
  gu.company,
  AVG(gr.success_rate) AS avg_success_rate,
  COUNT(*) AS attempts,
  MAX(gr.created_at) AS last_played,
  SUM(COALESCE(gr.final_score, 0)) AS total_final_score
FROM game_results gr
JOIN game_users gu ON gr.user_id = gu.id
WHERE gr.created_at >= date_trunc('day', now())
GROUP BY gu.id, gu.name, gu.company;

-- 인덱스: 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_results_final_score ON game_results(final_score DESC);

-- leaderboard_entries: 프론트엔드에서 제출하는 리더보드 항목을 저장하기 위한 테이블
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES game_users(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  company TEXT,
  score INT,
  completion_time BIGINT,
  time_bonus INT,
  final_score INT,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_played_at ON leaderboard_entries(played_at DESC);

-- 이메일 발송 로그
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES game_users(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- 외부 API 카운터 연동 로그
CREATE TABLE IF NOT EXISTS api_counter_logs (
  id UUID PRIMARY KEY,
  api_endpoint VARCHAR(255),
  action VARCHAR(50),
  success BOOLEAN,
  response_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_counter_logs_created_at ON api_counter_logs(created_at DESC);
