import React, { useState, useEffect } from 'react';
import { GameSession, UserAnswer, GameQuestion, calculateScore } from '../../lib/utils';
import '../../styles/main.scss';
import './Game.scss';
import Explanation from '../Explanation/Explanation';

interface GameProps {
    gameSession: GameSession;
    setGameSession: React.Dispatch<React.SetStateAction<GameSession | null>>;
    handleSubmit: () => void;
    setScreen: (screen: 'home' | 'info' | 'game' | 'result' | 'leaderboard') => void;
}

interface ExplanationState {
    isOpen: boolean;
    question: GameQuestion | null;
    selectedAnswer: string | null;
    isCorrect: boolean;
}

const Game: React.FC<GameProps> = ({ gameSession, setGameSession, handleSubmit, setScreen }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [questionTime, setQuestionTime] = useState<number>(0);
    const [explanationState, setExplanationState] = useState<ExplanationState>({
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

        // Show explanation page
        setExplanationState({
            isOpen: true,
            question: currentQuestion,
            selectedAnswer,
            isCorrect,
        });
    };

    const handleExplanationClose = () => {
        if (!currentQuestion) return;

        const isCorrect = explanationState.isCorrect;
        const timeRemaining = Math.max(0, currentQuestion.timeLimit - questionTime);
        
        const answer: UserAnswer = {
            questionId: currentQuestion.id,
            selectedComponents: [explanationState.selectedAnswer || ''],
            isCorrect,
            answerTime: questionTime * 1000,
            timestamp: new Date(),
            difficulty: currentQuestion.difficulty,
            timeRemaining: timeRemaining,
        };

        setGameSession(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                answers: [...prev.answers, answer],
                currentQuestionIndex: prev.currentQuestionIndex + 1,
            };
        });

        setExplanationState({
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

    // If explanation page is open, show the Explanation page instead
    if (explanationState.isOpen && explanationState.question) {
        const handleExplanationNext = () => {
            if (gameSession.currentQuestionIndex + 1 >= gameSession.questions.length) {
                handleExplanationClose();
                handleSubmit();
            } else {
                handleExplanationClose();
            }
        };

        // 점수 계산
        const timeRemaining = Math.max(0, explanationState.question.timeLimit - questionTime);
        const scoreDetails = calculateScore(explanationState.isCorrect, timeRemaining, explanationState.question.difficulty);
        const displayScore = scoreDetails.finalScore;

        return (
            <Explanation
                question={explanationState.question}
                selectedAnswer={explanationState.selectedAnswer || ''}
                isCorrect={explanationState.isCorrect}
                score={displayScore}
                onNext={handleExplanationNext}
            />
        );
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
                    <h3>{currentQuestion.question}</h3>
                    
                    {/* Product Image */}
                    <div className="product-image-container">
                        <img 
                            src={`/assets/questions/q${gameSession.currentQuestionIndex + 1}-${currentQuestion.applicationName.toLowerCase().replace(/\s+/g, '-')}.png`}
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
        </div>
    );
};

export default Game;