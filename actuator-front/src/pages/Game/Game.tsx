import React, { useState, useEffect } from 'react';
import { GameSession, UserAnswer, GameQuestion, calculateScore } from '../../lib/utils';
import '../../styles/main.scss';
import './Game.scss';
import Explanation from '../Explanation/Explanation';

interface GameProps {
    gameSession: GameSession;
    setGameSession: React.Dispatch<React.SetStateAction<GameSession | null>>;
    handleSubmit: (finalSession: GameSession) => void;
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
    const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);
    const [explanationState, setExplanationState] = useState<ExplanationState>({
        isOpen: false,
        question: null,
        selectedAnswer: null,
        isCorrect: false,
    });

    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];

    useEffect(() => {
        // Only run timer when explanation is not open
        if (explanationState.isOpen) {
            return;
        }

        // Calculate elapsed time from game start (누적 게임 시간)
        const timer = setInterval(() => {
            const now = new Date();
            const elapsed = Math.floor((now.getTime() - gameSession.startTime.getTime()) / 1000);
            setElapsedTime(elapsed);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameSession.startTime, explanationState.isOpen]);

    useEffect(() => {
        // Reset selected answer when question changes
        setSelectedAnswer(null);
    }, [gameSession.currentQuestionIndex]);

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
        
        const answer: UserAnswer = {
            questionId: currentQuestion.id,
            selectedComponents: [explanationState.selectedAnswer || ''],
            isCorrect,
            timestamp: new Date(),
            difficulty: currentQuestion.difficulty,
        };

        // 현재 인덱스가 마지막 질문인지 먼저 확인
        const isLastQuestion = gameSession.currentQuestionIndex + 1 >= gameSession.questions.length;
        
        if (isLastQuestion) {
            // 마지막 질문일 때: 답변 추가 + endTime 설정을 한 번에
            const now = new Date();
            const actualElapsedMs = now.getTime() - gameSession.startTime.getTime();
            const updatedAnswers = [...gameSession.answers, answer];
            const totalCorrect = updatedAnswers.filter(a => a.isCorrect).length;
            
            const finalSession: GameSession = {
                ...gameSession,
                answers: updatedAnswers,
                currentQuestionIndex: gameSession.currentQuestionIndex + 1,
                endTime: now,
                totalScore: totalCorrect,
                completionTime: actualElapsedMs,
            };
            
            // 상태 업데이트
            setGameSession(finalSession);
            
            setExplanationState({
                isOpen: false,
                question: null,
                selectedAnswer: null,
                isCorrect: false,
            });
            
            // 최종 session을 전달하여 handleSubmit 호출
            setTimeout(() => {
                handleSubmit(finalSession);
            }, 0);
        } else {
            // 마지막이 아닐 때: 일반적인 다음 질문 진행
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
        }
    };

    if (!currentQuestion) {
        return <div>Loading question...</div>;
    }

    // If explanation page is open, show the Explanation page instead
    if (explanationState.isOpen && explanationState.question) {
        const handleExplanationNext = () => {
            handleExplanationClose();
        };

        // 점수 계산
        const displayScore = calculateScore(explanationState.isCorrect, explanationState.question.difficulty);

        // 마지막 질문 여부 확인
        const isLastQuestion = gameSession.currentQuestionIndex + 1 >= gameSession.questions.length;
        const buttonText = isLastQuestion ? 'View Results →' : 'Next Question →';

        return (
            <Explanation
                question={explanationState.question}
                selectedAnswer={explanationState.selectedAnswer || ''}
                isCorrect={explanationState.isCorrect}
                score={displayScore}
                onNext={handleExplanationNext}
                buttonText={buttonText}
            />
        );
    }

    return (
        <div className="page-game">
            <div className="game-card">
                {/* Header Section with HOME, Question, Timer */}
                <div className="game-header">
                    <div className="game-header-left">
                        <button className="game-header-button game-home-button" onClick={() => setShowBackConfirmModal(true)} title="Home">
                            🏠 HOME
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
        </div>
    );
};

export default Game;