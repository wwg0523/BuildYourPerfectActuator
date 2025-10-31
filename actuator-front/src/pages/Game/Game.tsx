import React, { useState, useEffect } from 'react';
import { GameSession, GameQuestion, UserAnswer, GameEngine } from '../../lib/utils';
import '../../styles/main.scss';
import './Game.scss';

interface GameProps {
    gameSession: GameSession;
    setGameSession: React.Dispatch<React.SetStateAction<GameSession | null>>;
    handleSubmit: () => void;
    setScreen: (screen: 'home' | 'info' | 'game' | 'result' | 'leaderboard') => void;
}

interface FeedbackModal {
    isOpen: boolean;
    isCorrect: boolean;
    selectedAnswer: string;
    correctAnswer: string;
}

const Game: React.FC<GameProps> = ({ gameSession, setGameSession, handleSubmit, setScreen }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [feedbackModal, setFeedbackModal] = useState<FeedbackModal>({
        isOpen: false,
        isCorrect: false,
        selectedAnswer: '',
        correctAnswer: '',
    });

    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];
    const gameEngine = new GameEngine();

    useEffect(() => {
        // 게임 시작 시간부터 경과 시간 계산
        const timer = setInterval(() => {
            const now = new Date();
            const elapsed = Math.floor((now.getTime() - gameSession.startTime.getTime()) / 1000);
            setElapsedTime(elapsed);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameSession.startTime]);

    const handleAnswerSubmit = () => {
        if (!currentQuestion || selectedAnswer === null) return;

        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        const correctAnswer = currentQuestion.correctAnswer;

        // 피드백 모달 표시
        setFeedbackModal({
            isOpen: true,
            isCorrect,
            selectedAnswer,
            correctAnswer,
        });
    };

    const handleModalClose = () => {
        if (!currentQuestion) return;

        const isCorrect = feedbackModal.isCorrect;
        const answer: UserAnswer = {
            questionId: currentQuestion.id,
            selectedComponents: [feedbackModal.selectedAnswer],
            isCorrect,
            answerTime: elapsedTime * 1000,
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

        setSelectedAnswer(null);
        setFeedbackModal({ isOpen: false, isCorrect: false, selectedAnswer: '', correctAnswer: '' });

        if (gameSession.currentQuestionIndex + 1 >= gameSession.questions.length) {
            setGameSession(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    endTime: new Date(),
                    totalScore: prev.answers.filter(a => a.isCorrect).length,
                    completionTime: elapsedTime * 1000, // 타이머 값을 ms로 저장
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
                        {currentQuestion.questionImage && (
                            <img 
                                src={currentQuestion.questionImage}
                                alt={currentQuestion.applicationName}
                                className="question-image"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        )}
                        <p className="required-components">
                            {currentQuestion.questionType === 'find_required'
                                ? 'Select the ONE that IS needed for this application'
                                : <>Select the ONE that is <span style={{ color: '#dc3545', fontWeight: 'bold' }}>NOT</span> needed for this application</>}
                        </p>
                        <div className="options-grid">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    className={`option-button ${selectedAnswer === option ? 'selected' : ''}`}
                                    onClick={() => setSelectedAnswer(option)}
                                >
                                    <span className="option-name">{option}</span>
                                </button>
                            ))}
                        </div>
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

            {/* 피드백 모달 */}
            {feedbackModal.isOpen && (
                <div className="modal-overlay">
                    <div className={`feedback-modal ${feedbackModal.isCorrect ? 'correct' : 'incorrect'}`}>
                        <div className="modal-icon">
                            {feedbackModal.isCorrect ? '✅' : '❌'}
                        </div>
                        <h2>{feedbackModal.isCorrect ? 'Correct!' : 'Incorrect!'}</h2>
                        <p className="modal-selected">
                            Your answer: <strong>{feedbackModal.selectedAnswer}</strong>
                        </p>
                        {!feedbackModal.isCorrect && (
                            <p className="modal-correct">
                                Correct answer: <strong>{feedbackModal.correctAnswer}</strong>
                            </p>
                        )}
                        <button onClick={handleModalClose} className="modal-button">
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