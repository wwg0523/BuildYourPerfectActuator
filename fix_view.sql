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
  gr.time_bonus,
  gr.final_score,
  gr.created_at AS played_at,
  ROW_NUMBER() OVER (ORDER BY gr.final_score DESC, gr.completion_time ASC, gr.created_at ASC) AS rank
FROM game_results gr
JOIN game_users gu ON gr.user_id = gu.id
ORDER BY gr.final_score DESC, gr.completion_time ASC, gr.created_at ASC;
