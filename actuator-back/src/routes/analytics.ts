import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db.js';

const router: Router = Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const validPassword = process.env.ANALYTICS_PASSWORD;
    if (authHeader !== validPassword) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM game_analytics LIMIT 1');
        if (result.rowCount === 0) {
            return res.status(200).json({
                totalParticipants: 0,
                completionRate: 0,
                averageCompletionTime: 0,
                topCompanyParticipants: [],
                popularComponentCombinations: [],
                successRateByExperience: {}
            });
        }

        const data = result.rows[0];
        res.json({
            totalParticipants: Number(data.total_participants) || 0,
            completionRate: Number(data.completion_rate) || 0,
            averageCompletionTime: Number(data.average_completion_time) || 0,
            topCompanyParticipants: Array.isArray(data.top_company_participants) ? data.top_company_participants : [],
            popularComponentCombinations: Array.isArray(data.popular_component_combinations) ? data.popular_component_combinations : [],
            successRateByExperience: data.success_rate_by_experience && typeof data.success_rate_by_experience === 'object' ? data.success_rate_by_experience : {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;