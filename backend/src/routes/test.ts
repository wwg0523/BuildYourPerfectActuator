// src/routes/test.ts
import { Router } from 'express';
import { pool } from '../db';
const router = Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ server: 'ok', time: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});

export default router;