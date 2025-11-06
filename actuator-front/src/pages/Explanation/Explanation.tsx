import React from 'react';
import { GameQuestion } from '../../lib/utils';
import './Explanation.scss';

interface ExplanationProps {
    question: GameQuestion;
    selectedAnswer: string;
    isCorrect: boolean;
    score: number;
    onNext: () => void;
}

const Explanation: React.FC<ExplanationProps> = ({
    question,
    selectedAnswer,
    isCorrect,
    score,
    onNext,
}) => {
    return (
        <div className="page-explanation">
            <div className="explanation-card">
                {/* Header Section */}
                <div className={`explanation-header ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="header-icon">
                        {isCorrect ? '✅' : '❌'}
                    </div>
                    <div className="header-content">
                        <h1>{isCorrect ? 'Correct!' : 'Incorrect!'}</h1>
                        {isCorrect && <span className="score-badge">+{score} points</span>}
                    </div>
                </div>

                {/* Scrollable Content Section */}
                <div className="explanation-content">
                    {/* Question Display */}
                    <div className="original-question">
                        <h3>📌 Question</h3>
                        <p className="question-text"><span className="question-number">Q{question.id}) </span>{question.question}</p>
                        <div className="answer-display">
                            <span className="label">Your Answer:</span>
                            <span className={`answer ${isCorrect ? 'correct-answer' : 'incorrect-answer'}`}>
                                {selectedAnswer}
                            </span>
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
                            <h4>🔧 Specification Improvements:</h4>
                            <ul className="improvements-list">
                                {question.explanation.improvements.map((improvement, idx) => (
                                    <li key={idx}>{improvement}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Real-World Examples Section */}
                    {question.explanation.realWorldExamples && (
                        <div className="examples-section">
                            <h4>🏭 Real-World Examples:</h4>
                            <ul className="examples-list">
                                {question.explanation.realWorldExamples.map((example, idx) => (
                                    <li key={idx}>{example}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="explanation-footer">
                    <button onClick={onNext} className="next-button">
                        Next Question
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Explanation;
