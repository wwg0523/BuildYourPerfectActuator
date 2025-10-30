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
    const [timeLeft, setTimeLeft] = useState<number>(60);
    const [feedbackModal, setFeedbackModal] = useState<FeedbackModal>({
        isOpen: false,
        isCorrect: false,
        selectedAnswer: '',
        correctAnswer: '',
    });

    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];
    const gameEngine = new GameEngine();

    useEffect(() => {
        if (!currentQuestion) return;

        setTimeLeft(currentQuestion.timeLimit);
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // 타이머가 0이 되면 홈으로 돌아가기
                    setScreen('home');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameSession.currentQuestionIndex, currentQuestion, setScreen]);

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
            answerTime: (currentQuestion.timeLimit - timeLeft) * 1000,
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
            <div className="timer-fixed">
                <span>⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="game-container">
                <div className="question-header">
                    <h2>Question {gameSession.currentQuestionIndex + 1}/5</h2>
                </div>
                <div className="question-content">
                    <h3>❓ {currentQuestion.question}</h3>
                    <p className="required-components">
                        Required components: Select the ONE that is NOT needed
                    </p>
                    <div className="options-grid">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                className={`option-button ${selectedAnswer === option ? 'selected' : ''}`}
                                onClick={() => setSelectedAnswer(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleAnswerSubmit}
                    disabled={selectedAnswer === null}
                    className={"submit-button " + (selectedAnswer !== null ? 'enabled' : '')}
                >
                    SUBMIT ANSWER
                </button>
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