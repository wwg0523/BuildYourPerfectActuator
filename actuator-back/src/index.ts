import express from 'express';
import cors from 'cors';
//import helmet from 'helmet';
import sanitizeHtml from 'sanitize-html';
import gameRouter from './routes/game.js';
import userRouter from './routes/user.js';
import deleteUserDataRoutes from './routes/delete-user-data.js';
import analyticsRouter from './routes/analytics.js';

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

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

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASS
    }
});

app.post('/api/send-email', async (req, res) => {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Basic validation for 'to' (very small check)
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(String(to))) {
        return res.status(400).json({ error: 'Invalid recipient email address' });
    }

    // Sanitize the subject and body to reduce XSS risk. Allow only a safe subset of tags/attributes.
    const cleanSubject = String(subject).slice(0, 200);
    const cleanBody = sanitizeHtml(String(body), {
        allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br' ],
        allowedAttributes: {
            a: [ 'href', 'rel', 'target' ]
        },
        allowedSchemes: [ 'http', 'https', 'mailto' ]
    });

    try {
        await transporter.sendMail({
            from: process.env.APP_EMAIL,
            to,
            subject: cleanSubject,
            html: cleanBody
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4004;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});