-- Schema for ActuatorMinigame
-- Database schema for quiz-based actuator learning game
-- Supports user management, game results tracking, analytics, and leaderboard

-- Drop all views first (due to dependencies)
DROP VIEW IF EXISTS question_performance CASCADE;
DROP VIEW IF EXISTS game_analytics CASCADE;
DROP VIEW IF EXISTS daily_leaderboard CASCADE;

-- Drop all tables (CASCADE to remove dependencies)
DROP TABLE IF EXISTS user_answers CASCADE;
DROP TABLE IF EXISTS api_counter_logs CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS quiz_questions_cache CASCADE;
DROP TABLE IF EXISTS game_results CASCADE;
DROP TABLE IF EXISTS game_users CASCADE;

-- ============================================
-- Create Tables
-- ============================================

-- Users table: Store player information
CREATE TABLE game_users (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(200),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Game results table: Store overall game session results
CREATE TABLE game_results (
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

-- Quiz questions cache: Store all 15 quiz questions with metadata
-- Used for quick access without loading from frontend JSON
CREATE TABLE quiz_questions_cache (
  id VARCHAR(10) PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  question TEXT NOT NULL,
  application_name VARCHAR(255),
  options JSONB NOT NULL,
  correct_answer VARCHAR(10) NOT NULL,
  explanation JSONB,
  points INT DEFAULT 20,
  time_limit INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User answers: Track individual question responses for detailed analytics
CREATE TABLE user_answers (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES game_users(id) ON DELETE CASCADE,
  game_result_id UUID NOT NULL REFERENCES game_results(id) ON DELETE CASCADE,
  question_id VARCHAR(10) NOT NULL REFERENCES quiz_questions_cache(id),
  selected_answer VARCHAR(10),
  is_correct BOOLEAN,
  time_taken INT,
  points_earned INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email logs: Track all email sending attempts
CREATE TABLE email_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES game_users(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  error_message TEXT
);

-- API counter logs: Track external API integration for score submission
CREATE TABLE api_counter_logs (
  id UUID PRIMARY KEY,
  api_endpoint VARCHAR(255),
  action VARCHAR(50),
  success BOOLEAN,
  response_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Create Indexes for Performance
-- ============================================

-- Game results indexes
CREATE INDEX idx_game_results_created_at ON game_results(created_at DESC);
CREATE INDEX idx_game_results_final_score ON game_results(final_score DESC);
CREATE INDEX idx_game_results_user_id ON game_results(user_id);

-- Quiz questions indexes
CREATE INDEX idx_quiz_difficulty ON quiz_questions_cache(difficulty);
CREATE INDEX idx_quiz_type ON quiz_questions_cache(type);

-- User answers indexes
CREATE INDEX idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX idx_user_answers_game_result_id ON user_answers(game_result_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);

-- Email logs indexes
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- API counter logs indexes
CREATE INDEX idx_api_counter_logs_created_at ON api_counter_logs(created_at DESC);

-- ============================================
-- Create Views
-- ============================================

-- Daily leaderboard: Today's top scores ranked by final_score and completion time
CREATE VIEW daily_leaderboard AS
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

-- Game analytics: Overall game statistics
CREATE VIEW game_analytics AS
SELECT 
    COUNT(DISTINCT gr.user_id) as total_participants,
    ROUND(COUNT(CASE WHEN gr.success_rate > 0.75 THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as completion_rate,
    ROUND(AVG(gr.completion_time)::numeric / 1000, 2) as average_completion_time,
    array_agg(DISTINCT gu.company) as top_company_participants,
    array_agg(DISTINCT gr.compatible_applications) as popular_component_combinations,
    jsonb_build_object('total', COUNT(*)::text) as success_rate_by_experience
FROM game_results gr
JOIN game_users gu ON gr.user_id = gu.id;

-- Question performance: Success rates by question and difficulty
CREATE VIEW question_performance AS
SELECT 
    qq.id as question_id,
    qq.difficulty,
    qq.application_name,
    COUNT(*) as total_attempts,
    SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct_attempts,
    ROUND(100.0 * SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as success_rate,
    ROUND(AVG(ua.time_taken)::numeric, 0) as avg_time_taken
FROM user_answers ua
JOIN quiz_questions_cache qq ON ua.question_id = qq.id
GROUP BY qq.id, qq.difficulty, qq.application_name;
