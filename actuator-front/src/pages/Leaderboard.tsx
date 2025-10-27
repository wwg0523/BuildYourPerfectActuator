import React, { useEffect } from 'react';
import { LeaderboardEntry } from '../lib/utils';
import '../styles/main.scss';

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
        <div className="leaderboard-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>🏆 Today's Rankings</h1>
            {leaderboardData.length === 0 ? (
                <p>Loading...</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {leaderboardData.map((entry, index) => (
                        <li
                            key={index}
                            style={{
                                padding: '10px',
                                borderBottom: '1px solid #ccc',
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
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
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={() => setScreen('game')}
                    style={{ padding: '10px 20px', marginRight: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    🔄 PLAY AGAIN
                </button>
                <button
                    onClick={() => setScreen('home')}
                    style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    🏠 HOME
                </button>
            </div>
        </div>
    );
};

export default Leaderboard;