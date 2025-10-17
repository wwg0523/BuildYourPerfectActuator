import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';

const router = Router();

router.post('/', async (req, res) => {
    const { name, company, email, phone } = req.body;

    if (!name || !company || !email || !phone) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const id = uuidv4();

    try {
        await pool.query(
            `INSERT INTO game_users (id, name, company, email, phone)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, name, company, email, phone]
        );
        res.status(201).json({ id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;