import React, { useState, useEffect } from 'react';
import { GameSession, UserAnswer, GameQuestion } from '../../lib/utils';
import '../../styles/main.scss';
import './Game.scss';

interface GameProps {
    gameSession: GameSession;
    setGameSession: React.Dispatch<React.SetStateAction<GameSession | null>>;
    handleSubmit: () => void;
    setScreen: (screen: 'home' | 'info' | 'game' | 'result' | 'leaderboard') => void;
}

interface ExplanationModal {
    isOpen: boolean;
    question: GameQuestion | null;
    selectedAnswer: string | null;
    isCorrect: boolean;
}

const Game: React.FC<GameProps> = ({ gameSession, setGameSession, handleSubmit, setScreen }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [questionTime, setQuestionTime] = useState<number>(0);
    const [explanationModal, setExplanationModal] = useState<ExplanationModal>({
        isOpen: false,
        question: null,
        selectedAnswer: null,
        isCorrect: false,
    });

    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];

    useEffect(() => {
        // Calculate elapsed time from game start
        const timer = setInterval(() => {
            const now = new Date();
            const elapsed = Math.floor((now.getTime() - gameSession.startTime.getTime()) / 1000);
            setElapsedTime(elapsed);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameSession.startTime]);

    useEffect(() => {
        // Reset question timer when question changes
        setQuestionTime(0);
        setSelectedAnswer(null);
    }, [gameSession.currentQuestionIndex]);

    useEffect(() => {
        // Track time spent on current question
        const timer = setInterval(() => {
            setQuestionTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleAnswerSubmit = () => {
        if (!currentQuestion || selectedAnswer === null) return;

        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        // Show explanation modal
        setExplanationModal({
            isOpen: true,
            question: currentQuestion,
            selectedAnswer,
            isCorrect,
        });
    };

    const handleExplanationClose = () => {
        if (!currentQuestion) return;

        const isCorrect = explanationModal.isCorrect;
        const answer: UserAnswer = {
            questionId: currentQuestion.id,
            selectedComponents: [explanationModal.selectedAnswer || ''],
            isCorrect,
            answerTime: questionTime * 1000,
            timestamp: new Date(),
        };

        setGameSession(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                answers: [...prev.answers, answer],
                currentQuestionIndex: prev.currentQuestionIndex + 1,
            };
        });

        setExplanationModal({
            isOpen: false,
            question: null,
            selectedAnswer: null,
            isCorrect: false,
        });

        if (gameSession.currentQuestionIndex + 1 >= gameSession.questions.length) {
            setGameSession(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    endTime: new Date(),
                    totalScore: [...prev.answers.slice(0, gameSession.currentQuestionIndex + 1), answer].filter(a => a.isCorrect).length,
                    completionTime: elapsedTime * 1000,
                };
            });
            handleSubmit();
        }
    };

    if (!currentQuestion) {
        return <div>Loading question...</div>;
    }

    return (
        <div className="page-game">
            <div className="game-card">
                {/* Header Section with HOME, Question, Timer */}
                <div className="game-header">
                    <div className="header-left">
                        <button className="header-button home-button" onClick={() => setScreen('home')} title="Home">
                            🏠 HOME
                        </button>
                    </div>
                    <div className="question-header-inline">
                        <h2>Question {gameSession.currentQuestionIndex + 1}/5</h2>
                    </div>
                    <div className="header-right">
                        <div className="timer-inline">
                            <span>⏱️ {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="game-content">
                    <div className="question-content">
                        <h3>{currentQuestion.question}</h3>
                        
                        {currentQuestion.type === 'multiple-choice' ? (
                            <>
                                <p className="required-components">
                                    Select the correct answer
                                </p>
                                <div className="options-grid">
                                    {currentQuestion.options.map((option, index) => (
                                        <button
                                            key={index}
                                            className={`option-button ${selectedAnswer === option.charAt(0) ? 'selected' : ''}`}
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
                                <div className="ox-options">
                                    <button
                                        className={`ox-button ox-true ${selectedAnswer === 'O' ? 'selected' : ''}`}
                                        onClick={() => setSelectedAnswer('O')}
                                    >
                                        <span className="ox-label">O</span>
                                        <span className="ox-text">True</span>
                                    </button>
                                    <button
                                        className={`ox-button ox-false ${selectedAnswer === 'X' ? 'selected' : ''}`}
                                        onClick={() => setSelectedAnswer('X')}
                                    >
                                        <span className="ox-label">X</span>
                                        <span className="ox-text">False</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Section with Submit Button */}
                <div className="game-footer">
                    <button
                        onClick={handleAnswerSubmit}
                        disabled={selectedAnswer === null}
                        className={"submit-button-inline " + (selectedAnswer !== null ? 'enabled' : '')}
                    >
                        SUBMIT ANSWER
                    </button>
                </div>
            </div>

            {/* Explanation Modal */}
            {explanationModal.isOpen && explanationModal.question && (
                <div className="modal-overlay">
                    <div className={`feedback-modal ${explanationModal.isCorrect ? 'correct' : 'incorrect'}`}>
                        <div className="modal-icon">
                            {explanationModal.isCorrect ? '✅' : '❌'}
                        </div>
                        <h2>{explanationModal.isCorrect ? 'Correct!' : 'Incorrect!'}</h2>
                        
                        <div className="explanation-section">
                            <h3>💡 Explanation</h3>
                            <p>{explanationModal.question.explanation.correct}</p>
                            
                            {explanationModal.question.explanation.improvements && (
                                <div className="improvements-section">
                                    <h4>🔧 Specification Improvements:</h4>
                                    <ul>
                                        {explanationModal.question.explanation.improvements.map((improvement, idx) => (
                                            <li key={idx}>{improvement}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {explanationModal.question.explanation.realWorldExamples && (
                                <div className="examples-section">
                                    <h4>🏭 Real-World Examples:</h4>
                                    <ul>
                                        {explanationModal.question.explanation.realWorldExamples.map((example, idx) => (
                                            <li key={idx}>{example}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <button onClick={handleExplanationClose} className="modal-button">
                            {gameSession.currentQuestionIndex + 1 >= gameSession.questions.length
                                ? 'View Results'
                                : 'Next Question'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Game;