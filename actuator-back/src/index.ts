import express from 'express';
import cors from 'cors';
//import helmet from 'helmet';
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

// // Security: set HTTP headers
// app.use(helmet());

// // CORS: restrict origins via env in production, allow localhost in dev
// const corsOptions = process.env.NODE_ENV === 'production' ? {
//     origin: process.env.FRONTEND_URL || undefined,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// } : {};
// app.use(cors(corsOptions));

app.use(cors({ origin: '*' }));
app.use(express.json());

// // Enforce HTTPS in production (works behind proxies/load balancers that set X-Forwarded-Proto)
// if (process.env.NODE_ENV === 'production') {
//     app.enable('trust proxy');
//     app.use((req, res, next) => {
//         const proto = (req.headers['x-forwarded-proto'] as string) || (req.protocol || '');
//         if (proto && proto.indexOf('https') === -1 && !req.secure) {
//             const host = req.headers.host;
//             if (host) {
//                 return res.redirect(301, `https://${host}${req.originalUrl}`);
//             }
//         }
//         next();
//     });
// }

app.use('/api/game', gameRouter);
app.use('/api/user', userRouter);
app.use('/api/delete-user-data', deleteUserDataRoutes);
app.use('/api/analytics', analyticsRouter);
app.use('/api/counter', counterRouter);
app.use('/api', emailRouter);

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
    console.log(`Server running on http://localhost:${PORT}`);
});