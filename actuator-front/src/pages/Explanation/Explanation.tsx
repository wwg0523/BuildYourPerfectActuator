import React, { useState, useEffect } from 'react';
import { GameSession, UserAnswer, GameQuestion, calculateScore } from '../../lib/utils';
import './Explanation.scss';

interface ExplanationProps {
    gameSession: GameSession;
    setGameSession: React.Dispatch<React.SetStateAction<GameSession | null>>;
    setScreen: (screen: 'home' | 'info' | 'game' | 'explanation' | 'result' | 'leaderboard') => void;
    handleSubmit: (finalSession: GameSession) => void;
}

const Explanation: React.FC<ExplanationProps> = ({
    gameSession,
    setGameSession,
    setScreen,
    handleSubmit,
}) => {
    // 접기/펼치기 상태 관리
    const [expandedSections, setExpandedSections] = useState<{
        improvements: boolean;
        examples: boolean;
    }>({
        improvements: false,
        examples: false,
    });

    const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);

    useEffect(() => {
        if (gameSession.lastAnsweredQuestion) {
            console.log('📋 Explanation Debug:', {
                currentQuestionIndex: gameSession.currentQuestionIndex,
                totalQuestions: gameSession.questions.length,
                answersCount: gameSession.answers.length,
                lastAnsweredQuestion: gameSession.lastAnsweredQuestion.id,
                selectedAnswer: gameSession.lastSelectedAnswer,
                isCorrect: gameSession.lastIsCorrect,
            });
        }
    }, [gameSession.currentQuestionIndex, gameSession.lastAnsweredQuestion?.id]);

    if (
        !gameSession.lastAnsweredQuestion ||
        gameSession.lastSelectedAnswer === undefined ||
        gameSession.lastIsCorrect === undefined
    ) {
        return <div>Loading...</div>;
    }

    const question = gameSession.lastAnsweredQuestion;
    const selectedAnswer = gameSession.lastSelectedAnswer;
    const isCorrect = gameSession.lastIsCorrect;
    const displayScore = calculateScore(isCorrect, question.difficulty);
    
    // 마지막 질문인지 확인: 현재 인덱스 + 1 이 전체 질문 수와 같거나 크면 마지막
    const isLastQuestion = gameSession.currentQuestionIndex + 1 >= gameSession.questions.length;
    const buttonText = isLastQuestion ? 'View Results →' : 'Next Question →';

    // 섹션 토글 함수
    const toggleSection = (section: 'improvements' | 'examples') => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // 선택지 인덱스를 실제 선택지 텍스트로 변환하는 함수
    const getAnswerText = (answerIndex: string): string => {
        // answerIndex는 'A', 'B', 'C', 'D' 또는 'O', 'X'
        if (question.type === 'true-false') {
            return answerIndex; // O 또는 X 그대로 반환
        }
        
        // multiple-choice 타입
        const answerCharCode = answerIndex.charCodeAt(0);
        const index = answerCharCode - 'A'.charCodeAt(0);
        return question.options[index] || answerIndex;
    };

    const handleExplanationNext = () => {
        const answer: UserAnswer = {
            questionId: question.id,
            selectedComponents: [selectedAnswer],
            isCorrect,
            timestamp: new Date(),
            difficulty: question.difficulty,
        };

        if (isLastQuestion) {
            // All questions answered, time to submit
            const now = new Date();
            const actualElapsedMs = now.getTime() - gameSession.startTime.getTime();
            const updatedAnswers = [...gameSession.answers, answer];
            const totalCorrect = updatedAnswers.filter(a => a.isCorrect).length;

            const finalSession: GameSession = {
                ...gameSession,
                answers: updatedAnswers,
                endTime: now,
                totalScore: totalCorrect,
                completionTime: actualElapsedMs,
                lastAnsweredQuestion: undefined,
                lastSelectedAnswer: undefined,
                lastIsCorrect: undefined,
            };

            setGameSession(finalSession);
            setTimeout(() => {
                handleSubmit(finalSession);
            }, 0);
        } else {
            // Move to next question
            setGameSession(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    answers: [...prev.answers, answer],
                    currentQuestionIndex: prev.currentQuestionIndex + 1,
                    lastAnsweredQuestion: undefined,
                    lastSelectedAnswer: undefined,
                    lastIsCorrect: undefined,
                };
            });

            setScreen('game');
        }
    };

    return (
        <div className="page-explanation">
            {/* Header Section */}
                <div className={`explanation-header ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="header-icon">
                        {isCorrect ? '✅' : '❌'}
                    </div>
                    <div className="header-content">
                        <h1>{isCorrect ? 'Correct!' : 'Incorrect!'}</h1>
                        {isCorrect && <span className="score-badge">+{displayScore} points</span>}
                    </div>
                </div>

                {/* Scrollable Content Section */}
                <div className="explanation-content">
                    {/* Question Display */}
                    <div className="original-question">
                        <h3>📌 Question</h3>
                        <p className="question-text">{question.question}</p>
                        <div className="answer-display">
                            <div className="answer-item">
                                <span className="label">Your Answer:</span>
                                <span className={`answer ${isCorrect ? 'correct-answer' : 'incorrect-answer'}`}>
                                    {getAnswerText(selectedAnswer)}
                                </span>
                            </div>
                            {!isCorrect && (
                                <div className="answer-item">
                                    <span className="label">Correct Answer:</span>
                                    <span className="answer correct-answer">
                                        {getAnswerText(question.correctAnswer)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Explanation Section */}
                    <div className="explanation-section">
                        <h3>💡 Explanation</h3>
                        <p>{question.explanation.correct}</p>
                    </div>

                    {/* Improvements Section */}
                    {question.explanation.improvements && (
                        <div className="improvements-section">
                            <h3>🔧 Specification Improvements:</h3>
                            {/* Mobile: Preview + Expandable */}
                            {!expandedSections.improvements ? (
                                <div 
                                    className="improvements-preview"
                                    onClick={() => toggleSection('improvements')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            toggleSection('improvements');
                                        }
                                    }}
                                >
                                    <div className="preview-item">
                                        <span className="preview-text">{question.explanation.improvements[0]}</span>
                                    </div>
                                    <span className={`toggle-arrow ${expandedSections.improvements ? 'expanded' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                            ) : (
                                <div className="improvements-expanded">
                                    <ul className="improvements-list">
                                        {question.explanation.improvements.map((improvement, idx) => (
                                            <li key={idx}>{improvement}</li>
                                        ))}
                                    </ul>
                                    <div 
                                        className="collapse-button"
                                        onClick={() => toggleSection('improvements')}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                toggleSection('improvements');
                                            }
                                        }}
                                    >
                                        <span className={`toggle-arrow ${expandedSections.improvements ? 'expanded' : ''}`}>
                                            ▼
                                        </span>
                                    </div>
                                </div>
                            )}
                            {/* Desktop: Always show full list */}
                            <ul className="improvements-list improvements-desktop">
                                {question.explanation.improvements.map((improvement, idx) => (
                                    <li key={idx}>{improvement}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Real-World Examples Section */}
                    {question.explanation.realWorldExamples && (
                        <div className="examples-section">
                            <h3>🏭 Real-World Examples:</h3>
                            {/* Mobile: Preview + Expandable */}
                            {!expandedSections.examples ? (
                                <div 
                                    className="examples-preview"
                                    onClick={() => toggleSection('examples')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            toggleSection('examples');
                                        }
                                    }}
                                >
                                    <div className="preview-item">
                                        <span className="preview-text">{question.explanation.realWorldExamples[0]}</span>
                                    </div>
                                    <span className={`toggle-arrow ${expandedSections.examples ? 'expanded' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                            ) : (
                                <div className="examples-expanded">
                                    <ul className="examples-list">
                                        {question.explanation.realWorldExamples.map((example, idx) => (
                                            <li key={idx}>{example}</li>
                                        ))}
                                    </ul>
                                    <div 
                                        className="collapse-button"
                                        onClick={() => toggleSection('examples')}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                toggleSection('examples');
                                            }
                                        }}
                                    >
                                        <span className={`toggle-arrow ${expandedSections.examples ? 'expanded' : ''}`}>
                                            ▼
                                        </span>
                                    </div>
                                </div>
                            )}
                            {/* Desktop: Always show full list */}
                            <ul className="examples-list examples-desktop">
                                {question.explanation.realWorldExamples.map((example, idx) => (
                                    <li key={idx}>{example}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="explanation-footer">
                    <button onClick={handleExplanationNext} className="next-button">
                        {buttonText}
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
                                <button onClick={() => window.location.href = '/'} className="button delete">LEAVE</button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default Explanation;
