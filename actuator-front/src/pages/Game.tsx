import React, { useState, useEffect } from 'react';
import { GameSession, GameQuestion, UserAnswer, GameEngine } from '../lib/utils';
import '../styles/main.scss';

interface GameProps {
    gameSession: GameSession;
    setGameSession: React.Dispatch<React.SetStateAction<GameSession>>;
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

        setGameSession(prev => ({
            ...prev,
            answers: [...prev.answers, answer],
            currentQuestionIndex: prev.currentQuestionIndex + 1,
        }));

        setSelectedComponents([]);
        if (gameSession.currentQuestionIndex + 1 >= gameSession.questions.length) {
            setGameSession(prev => ({
                ...prev,
                endTime: new Date(),
                totalScore: prev.answers.filter(a => a.isCorrect).length,
            }));
            handleSubmit();
        }
    };

    if (!currentQuestion) {
        return <div>Loading question...</div>;
    }

    return (
        <div className="game-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div className="question-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>Question {gameSession.currentQuestionIndex + 1}/5</h2>
                <span>⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="question-content">
                <h3>🤖 {currentQuestion.robotPart.description}</h3>
                <img
                    src={currentQuestion.robotPart.image}
                    alt={currentQuestion.robotPart.name}
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', margin: '10px 0' }}
                />
                <p>Select the correct components:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {currentQuestion.availableComponents.map(component => (
                        <label key={component.id} style={{ display: 'flex', alignItems: 'center' }}>
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
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    background: selectedComponents.length === 0 ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: selectedComponents.length === 0 ? 'not-allowed' : 'pointer',
                }}
            >
                SUBMIT ANSWER
            </button>
        </div>
    );
};

export default Game;