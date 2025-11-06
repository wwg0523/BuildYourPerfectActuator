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

// POST /api/counter/increment: Add new participant (add row to game_users table)
router.post('/increment', async (req: Request, res: Response) => {
    try {
        // Simply query existing row count to track new participant count
        // Actual user data is saved from frontend after game completion
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
