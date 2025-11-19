import { Router, Request, Response } from 'express';
import { pool } from '../db.js';

const router: Router = Router();

// 메모리에 참가자 수 저장 (서버 시작 시 초기화)
let participantCount = 0;

// 서버 시작 시 데이터베이스에서 초기값 로드
(async () => {
    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM game_users');
        participantCount = Number(result.rows[0].count) || 0;
        console.log(`Initialized participant count: ${participantCount}`);
    } catch (err) {
        console.error('Error initializing participant count:', err);
        participantCount = 0;
    }
})();

// GET /minigame/api/counter: 현재 참가자 수 반환
router.get('/', async (req: Request, res: Response) => {
    try {
        res.json({ value: participantCount });
    } catch (err) {
        console.error('Error fetching participant count:', err);
        res.status(500).json({ error: 'Failed to fetch participant count' });
    }
});

// POST /minigame/api/counter/increment: 참가자 수를 1 증가
router.post('/increment', async (req: Request, res: Response) => {
    try {
        participantCount += 1;
        
        res.json({ 
            success: true, 
            value: participantCount,
            message: `Participant count incremented to ${participantCount}` 
        });
    } catch (err) {
        console.error('Error incrementing participant count:', err);
        res.status(500).json({ error: 'Failed to increment participant count' });
    }
});

export default router;
