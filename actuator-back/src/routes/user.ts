import { Router } from 'express';
import { pool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/user: 새로운 사용자 생성 또는 기존 사용자 정보 업데이트
router.post('/', async (req, res) => {
    const { id, name, company, email, phone } = req.body;

    if (!id || !name) {
        return res.status(400).json({ error: 'id and name are required' });
    }

    try {
        // 먼저 사용자가 존재하는지 확인
        const existingUser = await pool.query('SELECT id FROM game_users WHERE id = $1', [id]);

        if (existingUser.rowCount === 0) {
            // 새로운 사용자 생성
            await pool.query(
                `INSERT INTO game_users (id, name, company, email, phone)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO UPDATE SET 
                   name = EXCLUDED.name,
                   company = EXCLUDED.company,
                   email = EXCLUDED.email,
                   phone = EXCLUDED.phone`,
                [id, name, company || null, email || null, phone || null]
            );
            res.status(201).json({ message: 'User created successfully', id });
        } else {
            // 기존 사용자 정보 업데이트
            await pool.query(
                `UPDATE game_users SET name = $1, company = $2, email = $3, phone = $4 WHERE id = $5`,
                [name, company || null, email || null, phone || null, id]
            );
            res.status(200).json({ message: 'User updated successfully', id });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

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