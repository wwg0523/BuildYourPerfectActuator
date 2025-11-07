import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db.js';

const router: Router = Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const validPassword = process.env.ANALYTICS_PASSWORD || 'admin123';
    
    // Authorization 헤더에서 실제 값 추출
    // 형식: "Bearer password" 또는 그냥 "password"
    const headerValue = authHeader?.split(' ').pop() || authHeader || '';
    
    console.log(`🔐 Analytics auth attempt: headerValue="${headerValue}", valid="${validPassword}"`);
    
    if (headerValue !== validPassword) {
        console.error(`❌ Analytics auth failed: "${headerValue}" !== "${validPassword}"`);
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    console.log(`✅ Analytics auth success`);
    next();
};

router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        console.log('📊 Fetching analytics data...');
        
        // 점수 시스템: 5개 문제 × 20포인트 = 최대 100포인트
        // 포인트 기반 메트릭: user_answers 테이블의 points_earned 합산
        
        // 1. 기본 KPI 데이터 (포인트 기반: 최대 100포인트)
        const basicKpiResult = await pool.query(`
            SELECT 
                COUNT(DISTINCT gr.user_id) as total_started,
                COUNT(DISTINCT CASE WHEN gr.score > 0 THEN gr.user_id END) as total_completed,
                ROUND(CAST(COUNT(DISTINCT CASE WHEN gr.score > 0 THEN gr.user_id END) AS numeric) / 
                      NULLIF(COUNT(DISTINCT gr.user_id), 0) * 100, 2) as completion_rate,
                ROUND(AVG(CAST(gr.completion_time AS numeric)) / 1000, 2) as average_completion_time_sec,
                ROUND(AVG(COALESCE(gr.score, 0))::numeric, 2) as average_score
            FROM game_results gr
        `);
        console.log(`✅ Basic KPI: ${JSON.stringify(basicKpiResult.rows[0])}`);

        // 2. 문제별 정답률 및 포인트 분석
        const questionPerformanceResult = await pool.query(`
            SELECT 
                ua.question_id,
                qq.application_name,
                qq.difficulty,
                qq.points as max_points,
                COUNT(*) as total_attempts,
                SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct_attempts,
                ROUND(100.0 * SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) / 
                      NULLIF(COUNT(*), 0), 2) as success_rate,
                ROUND(AVG(COALESCE(ua.points_earned, 0))::numeric, 2) as avg_points_earned
            FROM user_answers ua
            JOIN quiz_questions_cache qq ON ua.question_id = qq.id
            GROUP BY ua.question_id, qq.application_name, qq.difficulty, qq.points
            ORDER BY success_rate ASC
        `);
        console.log(`✅ Question Performance: ${questionPerformanceResult.rows.length} rows`);

        // 3. 난이도별 정답률 및 포인트
        const difficultyResult = await pool.query(`
            SELECT 
                qq.difficulty,
                COUNT(DISTINCT qq.id) as question_count,
                COUNT(*) as total_attempts,
                SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct_attempts,
                ROUND(100.0 * SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) / 
                      NULLIF(COUNT(*), 0), 2) as success_rate,
                ROUND(AVG(COALESCE(ua.points_earned, 0))::numeric, 2) as avg_points_earned
            FROM user_answers ua
            JOIN quiz_questions_cache qq ON ua.question_id = qq.id
            GROUP BY qq.difficulty
            ORDER BY qq.difficulty
        `);
        console.log(`✅ Difficulty Analysis: ${difficultyResult.rows.length} rows`);

        // 4. 리드 품질 분석 (포인트 기반)
        const leadQualityResult = await pool.query(`
            SELECT 
                gu.company,
                COUNT(DISTINCT gu.id) as participant_count,
                ROUND(AVG(gr.score)::numeric, 2) as avg_score,
                ROUND(AVG(gr.completion_time)::numeric / 1000, 2) as avg_completion_time_sec,
                COUNT(DISTINCT CASE WHEN gr.score > 0 THEN gu.id END) as completed_count,
                ROUND(CAST(COUNT(DISTINCT CASE WHEN gr.score > 0 THEN gu.id END) AS numeric) / 
                      NULLIF(COUNT(DISTINCT gu.id), 0) * 100, 2) as completion_rate
            FROM game_users gu
            LEFT JOIN game_results gr ON gu.id = gr.user_id
            WHERE gu.company IS NOT NULL AND gu.company != ''
            GROUP BY gu.company
            ORDER BY participant_count DESC
        `);
        console.log(`✅ Lead Quality: ${leadQualityResult.rows.length} companies`);

        // 5. 일일 참여 현황 (포인트 기반)
        const dailyTrendResult = await pool.query(`
            SELECT 
                DATE(gr.created_at AT TIME ZONE 'UTC') as date,
                COUNT(DISTINCT gr.user_id) as participants,
                COUNT(DISTINCT CASE WHEN gr.score > 0 THEN gr.user_id END) as completions,
                ROUND(AVG(gr.score)::numeric, 2) as avg_score
            FROM game_results gr
            GROUP BY DATE(gr.created_at AT TIME ZONE 'UTC')
            ORDER BY date DESC
            LIMIT 30
        `);
        console.log(`✅ Daily Trend: ${dailyTrendResult.rows.length} days`);

        const basicKpi = basicKpiResult.rows[0] || {
            total_started: 0,
            total_completed: 0,
            completion_rate: 0,
            average_completion_time_sec: 0,
            average_score: 0
        };

        res.json({
            // KPI 요약 (포인트 기반)
            summary: {
                totalParticipants: Number(basicKpi.total_started) || 0,
                totalCompleted: Number(basicKpi.total_completed) || 0,
                completionRate: Number(basicKpi.completion_rate) || 0,
                averageCompletionTime: Number(basicKpi.average_completion_time_sec) || 0,
                averageScore: Number(basicKpi.average_score) || 0
            },
            // 문제별 정답률 및 포인트
            questionPerformance: questionPerformanceResult.rows.map((row: any) => ({
                questionId: row.question_id,
                applicationName: row.application_name,
                difficulty: row.difficulty,
                maxPoints: Number(row.max_points),
                totalAttempts: Number(row.total_attempts),
                correctAttempts: Number(row.correct_attempts),
                successRate: Number(row.success_rate),
                avgPointsEarned: Number(row.avg_points_earned)
            })),
            // 난이도별 정답률 및 포인트
            difficultyAnalysis: difficultyResult.rows.map((row: any) => ({
                difficulty: row.difficulty,
                questionCount: Number(row.question_count),
                totalAttempts: Number(row.total_attempts),
                correctAttempts: Number(row.correct_attempts),
                successRate: Number(row.success_rate),
                avgPointsEarned: Number(row.avg_points_earned)
            })),
            // 리드 품질 분석 (포인트 기반)
            leadQuality: leadQualityResult.rows.map((row: any) => ({
                company: row.company,
                participantCount: Number(row.participant_count),
                avgScore: Number(row.avg_score),
                avgCompletionTime: Number(row.avg_completion_time_sec),
                completedCount: Number(row.completed_count),
                completionRate: Number(row.completion_rate)
            })),
            // 일일 트렌드 (포인트 기반)
            dailyTrend: dailyTrendResult.rows.map((row: any) => ({
                date: row.date,
                participants: Number(row.participants),
                completions: Number(row.completions),
                avgScore: Number(row.avg_score)
            }))
        });
        
        console.log('✅ Analytics data sent successfully');
    } catch (err: any) {
        console.error('❌ Analytics error:', err);
        res.status(500).json({ 
            error: 'Database error', 
            details: err.message 
        });
    }
});

export default router;