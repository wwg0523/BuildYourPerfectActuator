import express from 'express';
import cors from 'cors';
import testRouter from './routes/test';
import gameRouter from './routes/game';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/test', testRouter);
app.use('/api/game', gameRouter);

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

    try {
        await transporter.sendMail({
            from: process.env.APP_EMAIL,
            to,
            subject,
            html: body
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});