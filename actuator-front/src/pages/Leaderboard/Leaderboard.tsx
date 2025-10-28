import React, { useEffect } from 'react';
import { LeaderboardEntry } from '../../lib/utils';
import '../../styles/main.scss';
import './Leaderboard.scss';

interface LeaderboardProps {
    leaderboardData: LeaderboardEntry[];
    fetchLeaderboard: () => Promise<void>;
    setScreen: (screen: 'home' | 'info' | 'game' | 'result' | 'leaderboard') => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboardData, fetchLeaderboard, setScreen }) => {
    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    return (
        <div className="page-leaderboard">
            <div className="leaderboard-container">
                <h1>🏆 Today's Rankings</h1>
                {leaderboardData.length === 0 ? (
                    <p>Loading...</p>
                ) : (
                    <ul>
                        {leaderboardData.map((entry, index) => (
                            <li key={index} className="leaderboard-item">
                                <span>
                                    {index === 0 && '🥇'}
                                    {index === 1 && '🥈'}
                                    {index === 2 && '🥉'} {entry.rank}. {entry.playerName} ({entry.company})
                                </span>
                                <span>
                                    ⭐ {entry.score}/5 correct • ⏱️ {Math.floor(entry.completionTime / 1000 / 60)}:
                                    {((entry.completionTime / 1000) % 60).toString().padStart(2, '0')}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="actions">
                    <button onClick={() => setScreen('game')} className="btn play">🔄 PLAY AGAIN</button>
                    <button onClick={() => setScreen('home')} className="btn home">🏠 HOME</button>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;