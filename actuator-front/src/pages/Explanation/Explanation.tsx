import React, { useState } from 'react';
import { GameQuestion } from '../../lib/utils';
import './Explanation.scss';

interface ExplanationProps {
    question: GameQuestion;
    selectedAnswer: string;
    isCorrect: boolean;
    score: number;
    onNext: () => void;
    buttonText?: string;
}

const Explanation: React.FC<ExplanationProps> = ({
    question,
    selectedAnswer,
    isCorrect,
    score,
    onNext,
    buttonText = 'Next Question →',
}) => {
    // 접기/펼치기 상태 관리
    const [expandedSections, setExpandedSections] = useState<{
        improvements: boolean;
        examples: boolean;
    }>({
        improvements: false,
        examples: false,
    });

    // 섹션 토글 함수
    const toggleSection = (section: 'improvements' | 'examples') => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };
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
                        <p className="question-text">{question.question}</p>
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
                    <button onClick={onNext} className="next-button">
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Explanation;
