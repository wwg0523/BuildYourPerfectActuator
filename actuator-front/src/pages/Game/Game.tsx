import React, { useState, useEffect } from 'react';
import { GameSession, UserAnswer, GameQuestion } from '../../lib/utils';
import '../../styles/main.scss';
import './Game.scss';

interface GameProps {
    gameSession: GameSession;
    setGameSession: React.Dispatch<React.SetStateAction<GameSession | null>>;
    setScreen: (screen: 'home' | 'info' | 'game' | 'explanation' | 'result' | 'leaderboard') => void;
    elapsedTime: number;
}

const Game: React.FC<GameProps> = ({ gameSession, setGameSession, setScreen, elapsedTime }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);

    useEffect(() => {
        // Reset selected answer when question changes
        setSelectedAnswer(null);
    }, [gameSession.currentQuestionIndex]);

    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];

    if (!currentQuestion) {
        return <div>Loading Result...</div>;
    }

    const handleAnswerSubmit = () => {
        if (!currentQuestion || selectedAnswer === null) return;

        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        console.log('🎮 Game Submit:', {
            currentQuestionIndex: gameSession.currentQuestionIndex,
            totalQuestions: gameSession.questions.length,
            questionId: currentQuestion.id,
            selectedAnswer,
            isCorrect,
        });

        // Store current answer data in session for Explanation to use
        setGameSession(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                lastAnsweredQuestion: currentQuestion,
                lastSelectedAnswer: selectedAnswer,
                lastIsCorrect: isCorrect,
            };
        });
        
        // Change screen to explanation
        setScreen('explanation');
    };

    return (
        <div className="page-game">
            {/* Header Section with Logo, Question, Timer */}
            <div className="game-header">
                <div className="game-header-left">
                    <button className="game-header-button game-home-button" onClick={() => setShowBackConfirmModal(true)} title="Home">
                        <img 
                            src="/images/logo/lebot-logo.png" 
                            alt="lebot-logo" 
                            className="home-logo"
                        />
                    </button>
                </div>
                <div className="game-question-header-inline">
                    <h2>
                        <span className="question-label-full">Question</span>
                        <span className="question-label-short">Q</span>
                        {' '}{gameSession.currentQuestionIndex + 1}/5
                    </h2>
                </div>
                <div className="game-header-right">
                    <div className="game-timer-inline">
                        <span>⏱️ {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="game-content">
                    <h3>Q{gameSession.currentQuestionIndex + 1}) {currentQuestion.question}</h3>
                    
                    {/* Product Image */}
                    <div className="product-image-container">
                        <img 
                            src={`/images/questions/${currentQuestion.id}-${currentQuestion.applicationName.toLowerCase().replace(/\s+/g, '-')}.png`}
                            alt={currentQuestion.applicationName}
                            className="product-image"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                    
                    {currentQuestion.type === 'multiple-choice' ? (
                        <>
                            <p className="required-components">
                                Select the correct answer
                            </p>
                            <div className="game-options-grid">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        className={`game-option-button ${selectedAnswer === option.charAt(0) ? 'selected' : ''}`}
                                        onClick={() => setSelectedAnswer(option.charAt(0))}
                                    >
                                        <span className="option-name">{option}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="required-components">
                                Select <span style={{ fontWeight: 'bold' }}>True (O) or False (X)</span>
                            </p>
                            <div className="game-ox-options">
                                <button
                                    className={`game-ox-button game-ox-true ${selectedAnswer === 'O' ? 'selected' : ''}`}
                                    onClick={() => setSelectedAnswer('O')}
                                >
                                    <span className="game-ox-label">O</span>
                                    <span className="game-ox-text">True</span>
                                </button>
                                <button
                                    className={`game-ox-button game-ox-false ${selectedAnswer === 'X' ? 'selected' : ''}`}
                                    onClick={() => setSelectedAnswer('X')}
                                >
                                    <span className="game-ox-label">X</span>
                                    <span className="game-ox-text">False</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Section with Submit Button */}
            <div className="game-footer">
                <button
                    onClick={handleAnswerSubmit}
                    disabled={selectedAnswer === null}
                    className={"game-submit-button-inline " + (selectedAnswer !== null ? 'enabled' : '')}
                >
                    SUBMIT ANSWER
                </button>
            </div>

            {/* Back Confirm Modal */}
            {showBackConfirmModal && (
                <div className="delete-confirm-modal-overlay" onClick={() => setShowBackConfirmModal(false)}>
                    <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Leave Game?</h2>
                        <p>Are you sure you want to leave the game? Your progress will be lost.</p>
                        <div className="modal-buttons">
                            <button onClick={() => setShowBackConfirmModal(false)} className="button outline">CANCEL</button>
                            <button onClick={() => setScreen('home')} className="button delete">LEAVE</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Game;