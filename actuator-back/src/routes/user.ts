import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT email FROM game_users WHERE id = $1', [id]);
        if (result.rows[0]) {
            res.json({ email: result.rows[0].email });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;