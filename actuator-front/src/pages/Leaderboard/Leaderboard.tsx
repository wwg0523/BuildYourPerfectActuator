import React, { useEffect } from 'react';
import { LeaderboardEntry } from '../../lib/utils';
import '../../styles/main.scss';
import './Leaderboard.scss';

interface LeaderboardProps {
    leaderboardData: LeaderboardEntry[];
    fetchLeaderboard: () => Promise<void>;
    handlePlayAgain: () => void;
    setScreen: (screen: 'home' | 'info' | 'game' | 'result' | 'leaderboard') => void;
    handleDeleteUserData?: () => Promise<void>;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboardData, fetchLeaderboard, handlePlayAgain, setScreen, handleDeleteUserData }) => {
    useEffect(() => {
        fetchLeaderboard();
    }, []);  // 리더보드 페이지에 처음 진입할 때 호출

    const formatTime = (ms: number | null | undefined): string => {
        // null/undefined 체크
        if (ms === null || ms === undefined) {
            return '--:--';
        }
        
        // 숫자로 변환
        const msNum = Number(ms);
        
        // NaN 체크
        if (isNaN(msNum) || msNum < 0) {
            console.warn('Invalid completion time:', ms);
            return '--:--';
        }
        
        const totalSeconds = Math.floor(msNum / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getRankBadge = (rank: number): string => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="page-leaderboard">
            {/* Header with Logo, Title, and STATS */}
            <div className="leaderboard-header-top">
                <button className="leaderboard-header-button leaderboard-home-button" onClick={() => setScreen('home')} title="Home">
                    <img 
                        src="/images/logo/lebot-logo.png" 
                        alt="lebot-logo" 
                        className="home-logo"
                    />
                </button>
                <div className="leaderboard-header-title">
                    <h2>Today's Rankings</h2>
                </div>
                <button className="leaderboard-header-button leaderboard-stats-button" onClick={() => window.location.href = '/analytics'} title="Stats">
                    📊 STATS
                </button>
            </div>

            <div className="leaderboard-container">
                <div className="leaderboard-header">
                    {/* Title moved to header-top */}
                    <p className="subtitle">Ranked by Correct Answers → Completion Time → Play Order</p>
                </div>

                {leaderboardData.length === 0 ? (
                    <div className="empty-state">
                        <p>No participants yet. Be the first to play!</p>
                    </div>
                ) : (
                    <div className="leaderboard-list">
                        {leaderboardData.map((entry, index) => (
                            <div key={`${entry.rank}-${entry.playedAt instanceof Date ? entry.playedAt.getTime() : new Date(entry.playedAt).getTime()}`} className="leaderboard-item">
                                <div className="rank-and-badge">
                                    <div className="rank-badge">{getRankBadge(entry.rank)}</div>
                                </div>
                                
                                <div className="player-info">
                                    <div className="player-name">{entry.playerName}</div>
                                    <div className="player-company">{entry.company}</div>
                                </div>
                                
                                <div className="player-stats">
                                    <div className="stat">
                                        <span className="stat-label">Score</span>
                                        <span className="stat-value">{entry.score}/5</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Time</span>
                                        <span className="stat-value">{formatTime(entry.completionTime)}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Final</span>
                                        <span className="stat-value">{entry.finalScore}pts</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="leaderboard-actions">
                    <button onClick={handlePlayAgain} className="leaderboard-btn leaderboard-btn-play">🔄 PLAY AGAIN</button>
                    <button onClick={() => setScreen('home')} className="leaderboard-btn leaderboard-btn-home">🏠 HOME</button>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;