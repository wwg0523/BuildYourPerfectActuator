import express from 'express';
import cors from 'cors';
import gameRouter from './routes/game.js';
import userRouter from './routes/user.js';
import deleteUserDataRoutes from './routes/delete-user-data.js';
import analyticsRouter from './routes/analytics.js';
import emailRouter from './routes/email.js';
import counterRouter from './routes/counter.js';

import dotenv from 'dotenv';

// .env 파일 로드 (Container Manager에서 생성된 .env 사용)
dotenv.config();
console.log(`✅ Environment loaded: NODE_ENV=${process.env.NODE_ENV}, DB_HOST=${process.env.DB_HOST}`);

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/minigame/api/game', gameRouter);
app.use('/minigame/api/user', userRouter);
app.use('/minigame/api/delete-user-data', deleteUserDataRoutes);
app.use('/minigame/api/analytics', analyticsRouter);
app.use('/minigame/api/counter', counterRouter);
app.use('/minigame/api', emailRouter);

// 환경변수 검증
if (process.env.NODE_ENV === 'production') {
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'APP_EMAIL', 'APP_PASS'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables in production:');
        missingVars.forEach(v => console.error(`   - ${v}`));
        process.exit(1);
    }
}

// Global error handler - ensure all responses are JSON
app.use((err: any, req: any, res: any, next: any) => {
    console.error('❌ Global error handler:', err);
    res.status(err.status || 500).json({ 
        error: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler
app.use((req: any, res: any) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4004;
app.listen(PORT, () => {
    const environment = process.env.NODE_ENV === 'production' ? '🚀 Production' : '🔧 Development';
    // Docker 내부: 백엔드는 actuator-back 컨테이너명으로 접근
    // 배포 시: 프론트엔드는 EXTERNAL_SERVER_HOST(NAS 도메인)로 외부 접근
    const internalHost = process.env.SERVER_HOST || 'actuator-back';
    console.log(`${environment} server running on http://${internalHost}:${PORT}`);
});