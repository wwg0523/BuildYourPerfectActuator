import React from 'react';
import { motion, Variants } from 'framer-motion';
import './Guide.scss';

interface GuideProps {
    onStartGame: () => void;
    onBack: () => void;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

const Guide: React.FC<GuideProps> = ({ onStartGame, onBack }) => {
    return (
        <div className="page-guide">
            <motion.div
                className="guide-container"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header */}
                <motion.div className="guide-header" variants={itemVariants}>
                    <h1>🎮 How to Play</h1>
                    <p className="guide-subtitle">Learn about the game and get started!</p>
                </motion.div>

                {/* Introduction Section */}
                <motion.div className="guide-section" variants={itemVariants}>
                    <h2>📋 Game Overview</h2>
                    <p>
                        Welcome to <strong>"Build Your Perfect Actuator"</strong>! In this game, you'll test your knowledge
                        about actuator components and their compatibility with different applications.
                    </p>
                    <p>
                        Answer all 5 questions correctly to earn a high score and compete on the leaderboard for amazing prizes!
                    </p>
                </motion.div>

                {/* Game Flow Section */}
                <motion.div className="guide-section" variants={itemVariants}>
                    <h2>🎯 Game Flow</h2>
                    <div className="flow-steps">
                        <div className="flow-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Enter Your Information</h3>
                                <p>Provide your name, company, email, and phone number</p>
                            </div>
                        </div>
                        <div className="flow-arrow">→</div>
                        <div className="flow-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Answer Questions</h3>
                                <p>Complete all 5 questions and try to get the highest score</p>
                            </div>
                        </div>
                        <div className="flow-arrow">→</div>
                        <div className="flow-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>View Results</h3>
                                <p>Check your score and see how you rank on the leaderboard</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Question Types Section */}
                <motion.div className="guide-section" variants={itemVariants}>
                    <h2>❓ Question Types</h2>
                    
                    <div className="question-types">
                        {/* Multiple Choice */}
                        <div className="question-type-card">
                            <div className="type-header">
                                <div className="type-icon">🔹</div>
                                <h3>Multiple Choice (Questions 1-3)</h3>
                            </div>
                            <div className="type-content">
                                <p>
                                    <strong>Total Questions:</strong> 3 questions with 4 options each
                                </p>
                                <div className="type-examples">
                                    <div className="example-group">
                                        <h4>📌 Question Type A (Questions 1, 3)</h4>
                                        <p className="question-text">
                                            "Which of the following is <span className="highlight-required">REQUIRED</span> for this application?"
                                        </p>
                                        <p className="instruction">
                                            ✓ Select the component that <strong>IS needed</strong>
                                        </p>
                                    </div>
                                    <div className="example-group">
                                        <h4>📌 Question Type B (Question 2)</h4>
                                        <p className="question-text">
                                            "Which of the following is <span className="highlight-not-required">NOT required</span> for this application?"
                                        </p>
                                        <p className="instruction">
                                            ✓ Select the component that is <strong>NOT needed</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* OX Quiz */}
                        <div className="question-type-card">
                            <div className="type-header">
                                <div className="type-icon">⭕</div>
                                <h3>True/False Quiz (Questions 4-5)</h3>
                            </div>
                            <div className="type-content">
                                <p>
                                    <strong>Total Questions:</strong> 2 questions with 2 options each (O / X)
                                </p>
                                <div className="type-examples">
                                    <div className="example-group">
                                        <h4>📌 Simple True/False Statement</h4>
                                        <p className="question-text">
                                            "Is [Component] required for [Application]?"
                                        </p>
                                        <p className="instruction">
                                            ✓ Answer <strong>O (True)</strong> or <strong>X (False)</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Scoring Section */}
                <motion.div className="guide-section" variants={itemVariants}>
                    <h2>🏆 Scoring & Leaderboard</h2>
                    <div className="scoring-info">
                        <div className="scoring-item">
                            <div className="scoring-label">Total Questions</div>
                            <div className="scoring-value">5</div>
                        </div>
                        <div className="scoring-item">
                            <div className="scoring-label">Points per Question</div>
                            <div className="scoring-value">1</div>
                        </div>
                        <div className="scoring-item">
                            <div className="scoring-label">Perfect Score</div>
                            <div className="scoring-value">5</div>
                        </div>
                    </div>
                    <p className="scoring-description">
                        Your final score will be displayed at the end of the game. The faster you complete the game, 
                        the higher your ranking! Your score and completion time determine your position on the leaderboard.
                    </p>
                </motion.div>

                {/* Tips Section */}
                <motion.div className="guide-section" variants={itemVariants}>
                    <h2>💡 Tips for Success</h2>
                    <ul className="tips-list">
                        <li>📖 Read each question carefully before answering</li>
                        <li>🖼️ Pay attention to the application images to understand the context</li>
                        <li>⚡ Take your time - there's no penalty for thinking</li>
                        <li>🎯 Focus on the component compatibility with each application</li>
                        <li>✅ Double-check your answer before submitting</li>
                    </ul>
                </motion.div>

                {/* Action Buttons */}
                <motion.div className="guide-actions" variants={itemVariants}>
                    <button className="button button-secondary" onClick={onBack}>
                        ← BACK
                    </button>
                    <button className="button button-primary" onClick={onStartGame}>
                        START GAME →
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Guide;
