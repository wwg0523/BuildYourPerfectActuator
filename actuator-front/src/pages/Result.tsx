import React from 'react';
import { GameSession, LeaderboardEntry } from '../lib/utils';
import '../styles/main.scss';

interface ResultProps {
    gameSession: GameSession;
    leaderboardEntry?: LeaderboardEntry;
    handlePlayAgain: () => void;
    setScreen: (screen: 'home' | 'info' | 'game' | 'result' | 'leaderboard') => void;
}

const Result: React.FC<ResultProps> = ({ gameSession, leaderboardEntry, handlePlayAgain, setScreen }) => {
    const correctAnswers = gameSession.answers.filter(a => a.isCorrect).length;
    const totalTime = gameSession.endTime
        ? Math.floor((gameSession.endTime.getTime() - gameSession.startTime.getTime()) / 1000)
        : 0;

    return (
        <div className="result-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Game Over!</h1>
            <p>Your Score: {correctAnswers}/5 correct</p>
            <p>Time Taken: {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</p>
            {leaderboardEntry && (
                <>
                    <p>Your Rank: #{leaderboardEntry.rank}</p>
                    <p>Final Score: {leaderboardEntry.finalScore} (Base: {leaderboardEntry.score * 100}, Bonus: {leaderboardEntry.timeBonus})</p>
                </>
            )}
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={handlePlayAgain}
                    style={{ padding: '10px 20px', marginRight: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    🔄 PLAY AGAIN
                </button>
                <button
                    onClick={() => setScreen('leaderboard')}
                    style={{ padding: '10px 20px', marginRight: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    🏆 LEADERBOARD
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

export default Result;