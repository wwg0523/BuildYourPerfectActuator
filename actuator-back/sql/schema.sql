-- Schema for BuildYourPerfectActuator

CREATE TABLE IF NOT EXISTS game_users (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(200),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES game_users(id) ON DELETE CASCADE,
  selected_components JSONB NOT NULL,
  compatible_applications JSONB NOT NULL,
  success_rate NUMERIC(3,2) NOT NULL,
  completion_time BIGINT NOT NULL,
  score INT,
  final_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스: 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_results_final_score ON game_results(final_score DESC);

-- daily_leaderboard: 게임 결과 기반 리더보드 VIEW (오늘 날짜 기준, UTC 자정 기준)
-- 각 게임 결과별로 마스크된 사용자명, 회사명, 점수, 완료시간, 최종점수, 플레이 시간, 순위를 반환
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
  gr.created_at AS played_at,
  ROW_NUMBER() OVER (ORDER BY gr.final_score DESC, gr.completion_time ASC, gr.created_at ASC) AS rank
FROM game_results gr
JOIN game_users gu ON gr.user_id = gu.id
WHERE DATE(gr.created_at AT TIME ZONE 'UTC') = CURRENT_DATE AT TIME ZONE 'UTC'
ORDER BY gr.final_score DESC, gr.completion_time ASC, gr.created_at ASC;

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

-- game_analytics: Analytics 대시보드용 VIEW
-- 총 참여자, 완료율, 평균 완료시간, 상위 회사, 인기 조합, 경험별 성공률 조회
CREATE OR REPLACE VIEW game_analytics AS
SELECT 
    COUNT(DISTINCT gr.user_id) as total_participants,
    ROUND(COUNT(CASE WHEN gr.success_rate > 0.75 THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as completion_rate,
    ROUND(AVG(gr.completion_time)::numeric / 1000, 2) as average_completion_time,
    array_agg(DISTINCT gu.company) as top_company_participants,
    array_agg(DISTINCT gr.compatible_applications) as popular_component_combinations,
    jsonb_build_object('total', COUNT(*)::text) as success_rate_by_experience
FROM game_results gr
JOIN game_users gu ON gr.user_id = gu.id;
