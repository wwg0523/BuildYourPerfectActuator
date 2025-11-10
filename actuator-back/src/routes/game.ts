import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db.js';

const router = Router();

// POST /api/game/submit: 게임 결과 저장 및 개별 답변 기록
router.post('/submit', async (req, res) => {
    const { userId, completionTime, answers, score } = req.body;

    console.log(`\n📊 ===== GAME SUBMISSION START =====`);
    console.log(`📊 Received body:`, req.body);
    console.log(`📊 Received data:`, {
        userId,
        completionTime,
        score,
        answersCount: answers?.length,
    });

    // 입력 검증
    if (!userId || completionTime == null) {
        console.error(`❌ Validation failed: Missing required fields`);
        console.error(`   userId: ${userId}, completionTime: ${completionTime}`);
        return res.status(400).json({ 
            error: 'Missing required fields: userId, completionTime',
            received: { userId, completionTime }
        });
    }

    // UUID 생성
    const id = uuidv4();

    // 파생 필드 계산 (백엔드에서 기본값으로 계산)
    // completionTime이 초 단위로 들어올 수 있으므로 ms 단위로 정규화
    let completionMs = Number(completionTime ?? 0);
    if (isNaN(completionMs)) completionMs = 0;
    if (completionMs > 0 && completionMs < 1000) {
        // 초 단위로 보내진 경우
        completionMs = completionMs * 1000;
    }

    // 포인트 기반 점수 계산: answers 배열에서 각 정답의 points_earned 합산
    // 최대 점수: 5개 문제 × 20포인트 = 100포인트
    let totalPoints = 0;
    if (Array.isArray(answers) && answers.length > 0) {
        totalPoints = answers.reduce((sum: number, ans: any) => sum + (Number(ans.pointsEarned) || 0), 0);
    }
    const finalScore = totalPoints > 0 ? totalPoints : Number(score ?? 0);

    console.log(`📊 Calculated values:`, {
        gameResultId: id,
        completionMs,
        totalPointsFromAnswers: totalPoints,
        finalScore,
    });

    try {
        // user_id가 game_users에 존재하는지 확인
        const userCheck = await pool.query('SELECT * FROM game_users WHERE id = $1', [userId]);
        if (userCheck.rowCount === 0) {
            console.error(`❌ User not found: ${userId}`);
            return res.status(400).json({ error: 'Invalid user_id: User does not exist' });
        }
        console.log(`✅ User verified:`, userCheck.rows[0]);

        // game_results 테이블에 게임 결과 저장
        await pool.query(
            `INSERT INTO game_results (
                id, user_id, completion_time, score, final_score
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
                id,
                userId,
                completionMs,
                score,
                finalScore,
            ]
        );
        console.log(`✅ Game result saved to DB:`, {
            id,
            user_id: userId,
            score,
            final_score: finalScore,
            completion_time: completionMs,
        });

        // 개별 답변을 user_answers 테이블에 저장
        if (Array.isArray(answers) && answers.length > 0) {
            console.log(`📝 Saving ${answers.length} user answers...`);
            for (const answer of answers) {
                const answerId = uuidv4();
                await pool.query(
                    `INSERT INTO user_answers (
                        id, user_id, game_result_id, question_id, selected_answer, is_correct,
                        points_earned
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        answerId,
                        userId,
                        id,
                        answer.questionId,
                        JSON.stringify(answer.selectedComponents || []),
                        answer.isCorrect || false,
                        Number(answer.pointsEarned) || 0,
                    ]
                );
                console.log(`  ✅ Answer saved: Q${answer.questionId}, correct=${answer.isCorrect}, points=${answer.pointsEarned}`);
            }
            console.log(`✅ All ${answers.length} user answers saved`);
        }

        console.log(`📊 ===== GAME SUBMISSION SUCCESS =====\n`);
        res.status(201).json({ message: 'Game result saved successfully', id, score, finalScore });
    } catch (err: any) {
        console.error(`❌ ===== GAME SUBMISSION ERROR =====`, err);
        if (err.code === '22P02') {
            return res.status(400).json({ error: 'Invalid JSON format for selected_components or compatible_applications' });
        }
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Foreign key violation: Invalid user_id' });
        }
        if (err.code === '23502') {
            return res.status(400).json({ error: 'NOT NULL constraint violation' });
        }
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// GET /api/game/submit: 결과 조회 (리더보드용 - 포인트 기반)
router.get('/submit', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                gr.id,
                gr.user_id,
                gu.name,
                gu.company,
                COALESCE(SUM(ua.points_earned), 0) as score,
                gr.completion_time,
                gr.created_at
            FROM game_results gr
            JOIN game_users gu ON gr.user_id = gu.id
            LEFT JOIN user_answers ua ON gr.id = ua.game_result_id
            GROUP BY gr.id, gr.user_id, gu.name, gu.company, gr.completion_time, gr.created_at
            ORDER BY score DESC, gr.completion_time ASC
            LIMIT 10`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


// GET /api/game/leaderboard: daily_leaderboard VIEW를 기반으로 리더보드 조회 (오늘의 순위)
router.get('/leaderboard', async (req, res) => {
    try {
        // 먼저 VIEW에서 데이터 조회
        const query = `
            SELECT 
                id,
                user_id,
                player_name,
                company,
                score,
                completion_time,
                final_score,
                played_at,
                rank
            FROM daily_leaderboard
            ORDER BY rank ASC
            LIMIT 10
        `;
        const result = await pool.query(query);
        console.log(`✅ Leaderboard query returned ${result.rows.length} rows`);
        
        // 각 행의 completion_time 타입 확인
        if (result.rows.length > 0) {
            console.log('📊 Raw DB rows (first row):', result.rows[0]);
            console.log('   completion_time type:', typeof result.rows[0].completion_time, 'value:', result.rows[0].completion_time);
        }

        // 데이터가 없으면 더 넓은 범위의 쿼리 시도
        if (result.rows.length === 0) {
            console.warn('⚠️ No leaderboard data for today. Trying fallback query...');
            const fallbackQuery = `
                SELECT 
                    gr.id,
                    gr.user_id,
                    CASE 
                        WHEN LENGTH(gu.name) > 2 THEN SUBSTRING(gu.name FROM 1 FOR 1) || '***' || SUBSTRING(gu.name FROM LENGTH(gu.name) FOR 1)
                        ELSE gu.name
                    END AS player_name,
                    gu.company,
                    COALESCE(SUM(ua.points_earned), 0) as score,
                    gr.completion_time,
                    COALESCE(SUM(ua.points_earned), 0) as final_score,
                    gr.created_at AS played_at,
                    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(ua.points_earned), 0) DESC, gr.completion_time ASC, gr.created_at ASC) AS rank
                FROM game_results gr
                JOIN game_users gu ON gr.user_id = gu.id
                LEFT JOIN user_answers ua ON gr.id = ua.game_result_id
                WHERE DATE(gr.created_at AT TIME ZONE 'UTC') = CURRENT_DATE AT TIME ZONE 'UTC'
                GROUP BY gr.id, gr.user_id, gu.name, gu.company, gr.completion_time, gr.created_at
                ORDER BY score DESC, gr.completion_time ASC, gr.created_at ASC
                LIMIT 10
            `;
            const fallbackResult = await pool.query(fallbackQuery);
            console.log(`✅ Fallback query returned ${fallbackResult.rows.length} rows`);
            
            const parsed = fallbackResult.rows.map((row) => ({
                rank: Number(row.rank),
                playerName: row.player_name,
                company: row.company,
                score: Number(row.score ?? 0),
                completionTime: Number(row.completion_time ?? 0),
                finalScore: Number(row.final_score ?? 0),
                playedAt: row.played_at ? new Date(row.played_at) : new Date(),
            }));
            console.log('✅ Parsed fallback response (first row):', parsed[0]);
            return res.status(200).json(parsed);
        }

        const parsed = result.rows.map((row) => ({
            rank: Number(row.rank),
            playerName: row.player_name,
            company: row.company,
            score: Number(row.score ?? 0),
            completionTime: Number(row.completion_time ?? 0),
            finalScore: Number(row.final_score ?? 0),
            playedAt: row.played_at ? new Date(row.played_at) : new Date(),
        }));
        console.log('✅ Parsed VIEW response (first row):', parsed[0]);
        res.status(200).json(parsed);
    } catch (err) {
        console.error('❌ Leaderboard error:', err);
        res.status(500).json({ error: 'Database error', details: (err as any).message });
    }
});

export default router;