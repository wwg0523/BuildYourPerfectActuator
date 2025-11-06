import React, { useEffect, useState } from 'react';
import { GameSession, LeaderboardEntry, getRankInfo } from '../../lib/utils';
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

    // Retrieve grade information based on score
    const gradeInfo = leaderboardEntry ? getRankInfo(leaderboardEntry.finalScore) : null;

    // Send result email after entering Result screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (userInfo && leaderboardEntry && !emailSent) {
            sendResultEmail();
        }
    }, [leaderboardEntry]);

    // Hide email completion message after 3 seconds
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
        
        // Retrieve grade information
        const gradeInfo = getRankInfo(leaderboardEntry.finalScore);

        const subject = `Your Actuator Challenge Results - Score: ${leaderboardEntry.finalScore}/100`;

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
        .grade-badge { background: #f093fb; color: white; padding: 12px 16px; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px 0; font-size: 1.2em; }
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
                <div class="score-display">${leaderboardEntry.finalScore}/100</div>
                <p style="text-align: center; color: #666;">Correct Answers</p>
                <div style="text-align: center;">
                    <span class="rank-badge">🏅 Rank #${leaderboardEntry.rank} Today</span>
                </div>
                <div style="text-align: center;">
                    <span class="grade-badge">${gradeInfo.badge} Grade: ${gradeInfo.rank}</span>
                </div>
                
                <h3>📊 Performance Summary</h3>
                <div class="stats-row">
                    <span class="stats-label">Total Score:</span>
                    <span class="stats-value">${leaderboardEntry.finalScore} points</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Correct Answers:</span>
                    <span class="stats-value">${leaderboardEntry.score}/5</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Grade:</span>
                    <span class="stats-value">${gradeInfo.rank} - ${gradeInfo.title}</span>
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
- Score: ${leaderboardEntry.finalScore}/100 points
- Correct Answers: ${leaderboardEntry.score}/5
- Daily Rank: #${leaderboardEntry.rank}
- Completion Time: ${timeStr}
- Final Score: ${leaderboardEntry.finalScore} points
- Grade: ${gradeInfo.rank} - ${gradeInfo.title}
- Grade Description: ${gradeInfo.description}
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
                {/* Main Content - New Improved Layout */}
                <div className="result-content-main">
                    {/* Score Section */}
                    <div className="score-section">
                        <div className="score-main-display">
                            <div className="score-value">
                                {leaderboardEntry?.finalScore || 0}
                                <span className="score-max">/100</span>
                            </div>
                            <p className="score-label">Your Score</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-number">{correctAnswers}/5</div>
                                <div className="stat-text">Correct Answers</div>
                            </div>
                        </div>
                    </div>

                    {/* Rank Section */}
                    {leaderboardEntry && (
                        <div className="rank-section">
                            <div className="rank-badge">
                                <div className="rank-emoji">{getRankEmoji(leaderboardEntry.rank)}</div>
                                <div className="rank-info">
                                    <div className="rank-position">Today's Rank: #{leaderboardEntry.rank}</div>
                                    <div className="rank-total">out of participants</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grade Section */}
                    {gradeInfo && (
                        <div className="grade-section">
                            <div className="grade-badge">
                                <div className="grade-emoji">{gradeInfo.badge}</div>
                                <div className="grade-info">
                                    <div className="grade-rank">Grade: {gradeInfo.rank}</div>
                                    <div className="grade-title">{gradeInfo.title}</div>
                                    <div className="grade-description">{gradeInfo.description}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email Status */}
                    {emailSending && (
                        <div className="email-status sending">
                            📧 Sending your results email...
                        </div>
                    )}
                    {emailSent && (
                        <div className="email-status sent">
                            ✅ Email sent successfully!
                        </div>
                    )}
                </div>

                {/* Footer with Action Buttons */}
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