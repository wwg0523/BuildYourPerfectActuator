import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import fs from 'fs';
import { pool } from '../db.js';

const router = Router();

// SMTP 설정 (POP3/SMTP)
// 환경변수가 없으면 이메일 발송 비활성화
const emailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.APP_EMAIL && process.env.APP_PASS);

if (!emailEnabled) {
    console.warn('⚠️ Email service disabled: Missing SMTP configuration');
    console.warn('   - SMTP_HOST');
    console.warn('   - SMTP_PORT');
    console.warn('   - APP_EMAIL');
    console.warn('   - APP_PASS');
}

// SSL/TLS 설정
const enableSSL = process.env.ENABLE_SSL !== 'false';
const caCertPath = process.env.CA_CERT_PATH;

// CA 인증서 로드
let caCert: Buffer | undefined;
if (enableSSL && caCertPath) {
    try {
        caCert = fs.readFileSync(caCertPath);
        console.log(`✅ CA certificate loaded from: ${caCertPath}`);
    } catch (err) {
        console.warn(`⚠️ CA certificate not found at ${caCertPath}. Using default CA bundle.`);
    }
}

const transporter = emailEnabled ? nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!, 10),
    secure: enableSSL && parseInt(process.env.SMTP_PORT!, 10) === 465, // port 465 = SSL, 587/25 = STARTTLS
    auth: {
        user: process.env.APP_EMAIL!,
        pass: process.env.APP_PASS!,
    },
    connectionTimeout: 5000,
    socketTimeout: 5000,
    tls: {
        // 자체 서명 인증서 허용 (특히 Synology NAS)
        rejectUnauthorized: process.env.NODE_ENV === 'production' && !caCertPath,
        ...(caCert && { ca: [caCert] }),
    },
}) : null;

// POST /api/send-email: 이메일 발송
router.post('/send-email', async (req, res) => {
    const { userId, recipientEmail, subject, htmlContent, textContent } = req.body;

    if (!recipientEmail || !subject || !htmlContent) {
        return res.status(400).json({ error: 'Missing required email fields' });
    }

    const emailId = uuidv4();

    // 이메일 서비스가 비활성화되면 즉시 성공 반환
    if (!emailEnabled) {
        console.warn(`⚠️ Email service disabled. Skipping email to ${recipientEmail}`);
        return res.status(200).json({
            success: false,
            message: 'Email service is not configured',
            emailId,
        });
    }

    if (!transporter) {
        return res.status(503).json({
            error: 'Email service temporarily unavailable',
        });
    }

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
                false,
                'Pending'
            ]
        );

        console.log(`📧 Sending email to: ${recipientEmail}`);
        console.log(`Subject: ${subject}`);

        const info = await transporter.sendMail({
            from: `"Actuator Challenge" <${process.env.APP_EMAIL}>`,
            to: recipientEmail,
            subject: subject,
            html: htmlContent,
            text: textContent || subject,
        });

        // 발송 성공 로그 업데이트
        await pool.query(
            `UPDATE email_logs SET success = $1, error_message = $2 WHERE id = $3`,
            [true, null, emailId]
        );

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            emailId,
            messageId: info.messageId,
        });
    } catch (mailError: any) {
        console.error('❌ SMTP Error:', mailError);
        
        // 발송 실패 로그 업데이트
        try {
            await pool.query(
                `UPDATE email_logs SET success = $1, error_message = $2 WHERE id = $3`,
                [false, `SMTP Error: ${mailError.message}`, emailId]
            );
        } catch (logErr) {
            console.error('Error updating email log:', logErr);
        }
        
        // 이메일 실패는 경고지만 게임 결과 저장은 성공한 것으로 간주
        return res.status(200).json({
            success: false,
            message: 'Game result saved, but email could not be sent',
            emailId,
            error: mailError.message,
        });
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
