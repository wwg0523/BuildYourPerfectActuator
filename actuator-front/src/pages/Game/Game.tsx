import React, { useState, useEffect } from 'react';
import { GameSession, GameQuestion, UserAnswer, GameEngine } from '../../lib/utils';
import '../../styles/main.scss';
import './Game.scss';

interface GameProps {
    gameSession: GameSession;
    // Accept nullable session setter from parent
    setGameSession: React.Dispatch<React.SetStateAction<GameSession | null>>;
    handleSubmit: () => void;
}

const Game: React.FC<GameProps> = ({ gameSession, setGameSession, handleSubmit }) => {
    const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(60); // 기본값 60초
    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];
    const gameEngine = new GameEngine();

    useEffect(() => {
        if (!currentQuestion) return; // currentQuestion이 없으면 타이머 설정 안 함

        setTimeLeft(currentQuestion.timeLimit);
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    handleAnswerSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameSession.currentQuestionIndex, currentQuestion]);

    const handleComponentToggle = (componentId: string) => {
        setSelectedComponents(prev =>
            prev.includes(componentId)
                ? prev.filter(id => id !== componentId)
                : [...prev, componentId]
        );
    };

    const handleAnswerSubmit = () => {
        if (!currentQuestion) return; // 안전하게 currentQuestion 확인

        const isCorrect = gameEngine.checkAnswer(currentQuestion.id, selectedComponents);
        const answer: UserAnswer = {
            questionId: currentQuestion.id,
            selectedComponents,
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

        setSelectedComponents([]);
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
            <div className="game-container">
                <div className="question-header">
                    <h2>Question {gameSession.currentQuestionIndex + 1}/5</h2>
                    <span>⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="question-content">
                    <h3>🤖 {currentQuestion.robotPart.description}</h3>
                    <img
                        src={currentQuestion.robotPart.image}
                        alt={currentQuestion.robotPart.name}
                        className="question-image"
                    />
                    <p>Select the correct components:</p>
                    <div className="components-grid">
                        {currentQuestion.availableComponents.map(component => (
                            <label key={component.id} className="component-label">
                                <input
                                    type="checkbox"
                                    checked={selectedComponents.includes(component.id)}
                                    onChange={() => handleComponentToggle(component.id)}
                                />
                                <span style={{ marginLeft: '8px' }}>{component.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleAnswerSubmit}
                    disabled={selectedComponents.length === 0}
                    className={"submit-button " + (selectedComponents.length === 0 ? '' : 'enabled')}
                >
                    SUBMIT ANSWER
                </button>
            </div>
        </div>
    );
};

export default Game;