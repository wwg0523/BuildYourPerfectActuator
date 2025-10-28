import React from 'react';
import { GameSession, LeaderboardEntry } from '../../lib/utils';
import '../../styles/main.scss';
import './Result.scss';

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
        <div className="page-result">
            <div className="result-container">
                <h1>Game Over!</h1>
                <p>Your Score: {correctAnswers}/5 correct</p>
                <p>Time Taken: {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</p>
                {leaderboardEntry && (
                    <>
                        <p>Your Rank: #{leaderboardEntry.rank}</p>
                        <p>Final Score: {leaderboardEntry.finalScore} (Base: {leaderboardEntry.score * 100}, Bonus: {leaderboardEntry.timeBonus})</p>
                    </>
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