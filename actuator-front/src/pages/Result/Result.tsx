import React, { useEffect, useState } from 'react';
import { GameSession, LeaderboardEntry } from '../../lib/utils';
import '../../styles/main.scss';
import './Result.scss';

interface ResultProps {
    gameSession: GameSession;
    leaderboardEntry?: LeaderboardEntry;
    handlePlayAgain: () => void;
    setScreen: (screen: 'home' | 'info' | 'game' | 'result' | 'leaderboard') => void;
    handleDeleteUserData?: () => Promise<void>;
    userInfo?: { id: string; name: string; company: string; email: string; phone: string };
}

const Result: React.FC<ResultProps> = ({ gameSession, leaderboardEntry, handlePlayAgain, setScreen, handleDeleteUserData, userInfo }) => {
    const [emailSending, setEmailSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    
    const correctAnswers = gameSession.answers.filter(a => a.isCorrect).length;
    const totalTime = gameSession.endTime
        ? Math.floor((gameSession.endTime.getTime() - gameSession.startTime.getTime()) / 1000)
        : 0;
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;

    const getRankEmoji = (rank?: number) => {
        if (!rank) return '🎮';
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        if (rank <= 10) return '🏅';
        return '🎯';
    };

    // Result 화면 진입 후 이메일 발송
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (userInfo && leaderboardEntry && !emailSent) {
            sendResultEmail();
        }
    }, [leaderboardEntry]);

    // 이메일 발송 완료 메시지 3초 후 사라지기
    useEffect(() => {
        if (emailSent) {
            const timer = setTimeout(() => {
                setEmailSent(false);
            }, 3000); // 3초 후 사라짐
            
            return () => clearTimeout(timer);
        }
    }, [emailSent]);

    const sendResultEmail = async () => {
        if (!userInfo || !leaderboardEntry) return;

        setEmailSending(true);
        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://actuator-back:4004';
            const emailTemplate = generateResultEmailTemplate(userInfo, gameSession, leaderboardEntry);
            
            const response = await fetch(`${backendUrl}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userInfo.id,
                    recipientEmail: userInfo.email,
                    subject: emailTemplate.subject,
                    htmlContent: emailTemplate.htmlContent,
                    textContent: emailTemplate.textContent,
                }),
            });

            if (response.ok) {
                console.log('✅ Email sent successfully from Result page');
                setEmailSent(true);
            } else {
                console.warn('Failed to send email:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending email:', error);
        } finally {
            setEmailSending(false);
        }
    };

    const generateResultEmailTemplate = (userInfo: any, gameSession: GameSession, leaderboardEntry: LeaderboardEntry) => {
        const completionSeconds = Math.round(leaderboardEntry.completionTime / 1000);
        const mins = Math.floor(completionSeconds / 60);
        const secs = completionSeconds % 60;
        const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

        const subject = `Your Actuator Challenge Results - Score: ${leaderboardEntry.score}/5`;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 2em; }
        .content { background: #f9f9f9; padding: 30px; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }
        .result-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .score-display { font-size: 2.5em; font-weight: bold; color: #4CAF50; text-align: center; margin: 20px 0; }
        .rank-badge { background: #FFD700; color: #333; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 10px 0; }
        .stats-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .stats-label { font-weight: bold; color: #666; }
        .stats-value { color: #333; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 Actuator Challenge Results</h1>
            <p>Thank you for participating!</p>
        </div>
        <div class="content">
            <div class="result-card">
                <h2>Hello ${userInfo.name},</h2>
                <p>Congratulations on completing our Actuator Component Challenge! Here are your results:</p>
                <div class="score-display">${leaderboardEntry.score}/5</div>
                <p style="text-align: center; color: #666;">Correct Answers</p>
                <div style="text-align: center;">
                    <span class="rank-badge">🏅 Rank #${leaderboardEntry.rank} Today</span>
                </div>
                
                <h3>📊 Performance Summary</h3>
                <div class="stats-row">
                    <span class="stats-label">Total Score:</span>
                    <span class="stats-value">${leaderboardEntry.finalScore} points</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Completion Time:</span>
                    <span class="stats-value">${timeStr}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Daily Rank:</span>
                    <span class="stats-value">#${leaderboardEntry.rank}</span>
                </div>
            </div>
        </div>
        <div class="footer">
            <p><strong>Actuator Challenge</strong></p>
            <p style="font-size: 12px; margin-top: 20px;">You received this email because you participated in our interactive game.</p>
        </div>
    </div>
</body>
</html>
        `;

        const textContent = `
Actuator Challenge Results

Hello ${userInfo.name},

YOUR RESULTS:
- Score: ${leaderboardEntry.score}/5 correct answers
- Daily Rank: #${leaderboardEntry.rank}
- Completion Time: ${timeStr}
- Final Score: ${leaderboardEntry.finalScore} points
        `;

        return { subject, htmlContent, textContent };
    };

    return (
        <div className="page-result">
            {/* Header with HOME, Title, and STATS */}
            <div className="result-header-top">
                <button className="header-button home-button" onClick={() => setScreen('home')} title="Home">
                    🏠 HOME
                </button>
                <div className="header-title">
                    <h2>Game Complete</h2>
                </div>
                <button className="header-button stats-button" onClick={() => window.location.href = '/analytics'} title="Stats">
                    📊 STATS
                </button>
            </div>

            <div className="result-container">
                <div className="result-header">
                    {/* Title moved to header-top, so this is now empty or can be removed */}
                </div>

                <div className="score-display-large">
                    <div className="score-main">
                        {correctAnswers}
                        <span className="score-total">/5</span>
                    </div>
                    <p className="score-label">Correct Answers</p>
                </div>

                {/* 이메일 발송 상태 표시 */}
                {emailSending && (
                    <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
                        📧 Sending your results email...
                    </div>
                )}
                {emailSent && (
                    <div style={{ textAlign: 'center', padding: '10px', color: '#4CAF50', fontWeight: 'bold' }}>
                        ✅ Email sent successfully!
                    </div>
                )}

                <div className="result-stats">
                    <div className="stat-card">
                        <div className="stat-icon">⏱️</div>
                        <div className="stat-content">
                            <div className="stat-value">{minutes}:{seconds.toString().padStart(2, '0')}</div>
                            <div className="stat-name">Completion Time</div>
                        </div>
                    </div>

                    {leaderboardEntry && (
                        <>
                            <div className="stat-card">
                                <div className="stat-icon">🎯</div>
                                <div className="stat-content">
                                    <div className="stat-value">{leaderboardEntry.finalScore}</div>
                                    <div className="stat-name">Final Score</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {leaderboardEntry && (
                    <div className="rank-badge-large">
                        <div className="badge-emoji">{getRankEmoji(leaderboardEntry.rank)}</div>
                        <div className="badge-text">
                            Rank #{leaderboardEntry.rank} Today<br/>
                            <span className="badge-subtext">{correctAnswers}/5 • {minutes}:{seconds.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                )}

                <div className="actions">
                    <button onClick={handlePlayAgain} className="btn play">🔄 PLAY AGAIN</button>
                    <button onClick={() => setScreen('leaderboard')} className="btn leaderboard">🏆 LEADERBOARD</button>
                    <button onClick={() => setScreen('home')} className="btn home">🏠 HOME</button>
                </div>
            </div>
        </div>
    );
};

export default Result;