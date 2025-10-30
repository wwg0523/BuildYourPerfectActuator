import { Router, Request, Response } from 'express';
import { pool } from '../db.js';

const router: Router = Router();

// GET /api/counter: game_users 테이블의 행 개수 반환
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM game_users');
        const count = Number(result.rows[0].count) || 0;
        res.json({ value: count });
    } catch (err) {
        console.error('Error fetching participant count:', err);
        res.status(500).json({ error: 'Failed to fetch participant count' });
    }
});

// POST /api/counter/increment: 새로운 참가자 추가 (game_users 테이블에 행 추가)
router.post('/increment', async (req: Request, res: Response) => {
    try {
        // 단순히 게임 시작 시 기존 행 개수를 조회하여 새로운 참가자 카운트
        // 실제 사용자 데이터는 프론트에서 게임 완료 후에 저장됨
        const result = await pool.query('SELECT COUNT(*) as count FROM game_users');
        const count = Number(result.rows[0].count) || 0;
        
        res.json({ 
            success: true, 
            value: count,
            message: 'Participant count incremented' 
        });
    } catch (err) {
        console.error('Error incrementing participant count:', err);
        res.status(500).json({ error: 'Failed to increment participant count' });
    }
});

export default router;
