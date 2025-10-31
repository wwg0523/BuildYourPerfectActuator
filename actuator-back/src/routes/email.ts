import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { pool } from '../db.js';

const router = Router();

interface EmailResult {
    success: boolean;
    message: string;
    emailId?: string;
}

// Gmail SMTP 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.APP_EMAIL || 'whwlsgh0523@gmail.com',
        pass: process.env.APP_PASS || 'invb xoqc sqtx qeyw',
    },
});

// POST /api/send-email: 이메일 발송
router.post('/send-email', async (req, res) => {
    const { userId, recipientEmail, subject, htmlContent, textContent } = req.body;

    if (!recipientEmail || !subject || !htmlContent) {
        return res.status(400).json({ error: 'Missing required email fields' });
    }

    const emailId = uuidv4();

    try {
        // 이메일 발송 로그 저장 (일단 성공으로 표시)
        await pool.query(
            `INSERT INTO email_logs (id, user_id, email_type, recipient_email, success, error_message)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                emailId,
                userId || null,
                'result',
                recipientEmail,
                true,
                null
            ]
        );

        // Gmail SMTP로 이메일 발송
        try {
            console.log(`📧 Sending email to: ${recipientEmail}`);
            console.log(`Subject: ${subject}`);

            const info = await transporter.sendMail({
                from: `"Actuator Challenge" <${process.env.APP_EMAIL || 'whwlsgh0523@gmail.com'}>`,
                to: recipientEmail,
                subject: subject,
                html: htmlContent,
                text: textContent || subject,
            });

            console.log('✅ Email sent successfully!');
            console.log('Message ID:', info.messageId);
            console.log('Response:', info.response);

            res.status(200).json({
                success: true,
                message: 'Email sent successfully',
                emailId,
                messageId: info.messageId,
            });
        } catch (mailError: any) {
            console.error('❌ Gmail SMTP Error:', mailError);
            
            // 발송 실패 로그 업데이트
            await pool.query(
                `UPDATE email_logs SET success = $1, error_message = $2 WHERE id = $3`,
                [false, `Gmail Error: ${mailError.message}`, emailId]
            );
            
            return res.status(500).json({
                success: false,
                error: 'Failed to send email via Gmail',
                details: mailError.message,
            });
        }
    } catch (err: any) {
        console.error('❌ Database Error:', err);
        
        try {
            await pool.query(
                `UPDATE email_logs SET success = $1, error_message = $2 WHERE id = $3`,
                [false, err.message, emailId]
            );
        } catch (logErr) {
            console.error('Error logging email failure:', logErr);
        }

        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/email-logs/:userId: 특정 사용자의 이메일 발송 로그 조회
router.get('/email-logs/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, email_type, recipient_email, sent_at, success, error_message
             FROM email_logs
             WHERE user_id = $1
             ORDER BY sent_at DESC
             LIMIT 20`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching email logs:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
