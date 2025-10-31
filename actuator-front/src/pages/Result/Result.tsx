import React from 'react';
import { GameSession, LeaderboardEntry } from '../../lib/utils';
import '../../styles/main.scss';
import './Result.scss';

interface ResultProps {
    gameSession: GameSession;
    leaderboardEntry?: LeaderboardEntry;
    handlePlayAgain: () => void;
    setScreen: (screen: 'home' | 'info' | 'game' | 'result' | 'leaderboard') => void;
    handleDeleteUserData?: () => Promise<void>;
}

const Result: React.FC<ResultProps> = ({ gameSession, leaderboardEntry, handlePlayAgain, setScreen, handleDeleteUserData }) => {
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