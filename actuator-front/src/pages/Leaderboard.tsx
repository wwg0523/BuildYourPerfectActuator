import React from 'react';
import { LeaderboardEntry } from '../lib/utils';

interface LeaderboardProps {
    leaderboardData: LeaderboardEntry[];
    fetchLeaderboard: () => void;
    setScreen: (screen: 'home' | 'info' | 'game' | 'result' | 'leaderboard') => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboardData, fetchLeaderboard, setScreen }) => {
    const renderStars = (successRate: number) => '⭐'.repeat(Math.round(successRate * 5));

    return (
        <>
            <h2>Challenge Records</h2>
            <p>🏆 TOP PERFORMERS TODAY</p>
            {leaderboardData.length > 0 ? (
                leaderboardData.map((entry, index) => (
                    <p key={index}>
                        {index + 1}. {entry.name.slice(0, entry.name.length - 2) + '**'} - {entry.company} -{' '}
                        {Math.round(entry.avg_success_rate * 5)}/5 {renderStars(entry.avg_success_rate)} (
                        {entry.attempts} attempts)
                    </p>
                ))
            ) : (
                <p>No leaderboard data available.</p>
            )}
            <div>
                <button className="button outline" onClick={() => setScreen('home')}>NEW GAME</button>
                <button className="button outline" onClick={fetchLeaderboard}>REFRESH</button>
                <button className="button" onClick={() => setScreen('result')}>BACK</button>
            </div>
        </>
    );
};

export default Leaderboard;