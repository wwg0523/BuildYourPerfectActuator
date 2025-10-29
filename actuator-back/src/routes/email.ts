import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db.js';

const router = Router();

interface EmailResult {
    success: boolean;
    message: string;
    emailId?: string;
}

// POST /api/send-email: 이메일 발송
router.post('/send-email', async (req, res) => {
    const { userId, recipientEmail, subject, htmlContent, textContent } = req.body;

    if (!recipientEmail || !subject || !htmlContent) {
        return res.status(400).json({ error: 'Missing required email fields' });
    }

    const emailId = uuidv4();

    try {
        // 이메일 발송 로그 저장
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

        // 실제 이메일 발송 로직 (SendGrid 또는 다른 이메일 서비스 사용)
        // 이 부분은 환경 변수 SENDGRID_API_KEY가 있을 때만 실행됨
        if (process.env.SENDGRID_API_KEY) {
            try {
                const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        personalizations: [
                            {
                                to: [{ email: recipientEmail }],
                            },
                        ],
                        from: {
                            email: process.env.EMAIL_FROM || 'noreply@actuator-challenge.com',
                            name: 'Actuator Challenge',
                        },
                        subject: subject,
                        content: [
                            { type: 'text/html', value: htmlContent },
                            { type: 'text/plain', value: textContent || subject },
                        ],
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('SendGrid error:', response.status, errorText);
                    
                    await pool.query(
                        `UPDATE email_logs SET success = $1, error_message = $2 WHERE id = $3`,
                        [false, `SendGrid error: ${response.status}`, emailId]
                    );
                    
                    return res.status(400).json({ error: 'Failed to send email' });
                }
            } catch (sendgridError: any) {
                console.error('SendGrid service error:', sendgridError);
                
                await pool.query(
                    `UPDATE email_logs SET success = $1, error_message = $2 WHERE id = $3`,
                    [false, sendgridError.message, emailId]
                );
                
                return res.status(500).json({ error: 'Email service error' });
            }
        } else {
            console.log('SendGrid API key not configured. Email would be sent to:', recipientEmail);
        }

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            emailId,
        });
    } catch (err: any) {
        console.error('Error sending email:', err);
        
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
