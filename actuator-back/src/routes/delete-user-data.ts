import { Router, Request, Response } from 'express';
import { pool } from '../db.js';

const router: Router = Router();

router.delete('/', async (req: Request, res: Response) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        // 트랜잭션 시작
        await pool.query('BEGIN');

        // game_results에서 userId에 해당하는 데이터 삭제
        await pool.query('DELETE FROM game_results WHERE user_id = $1', [userId]);

        // game_users에서 userId에 해당하는 데이터 삭제
        await pool.query('DELETE FROM game_users WHERE id = $1', [userId]);

        // 트랜잭션 커밋
        await pool.query('COMMIT');

        res.status(200).json({ message: 'User data deleted successfully' });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user data' });
    }
});

export default router;