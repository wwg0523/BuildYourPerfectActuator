import React from 'react';
import { motion } from 'framer-motion';
import './GameStart.scss';

interface GameStartProps {
    onStartGame: () => void;
    onBack: () => void;
}

const GameStart: React.FC<GameStartProps> = ({ onStartGame, onBack }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="page-gamestart">
            <motion.div
                className="gamestart-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Title with Icon */}
                <motion.div className="gamestart-title" variants={itemVariants}>
                    <span className="title-icon">🔍</span>
                    <h1>Find the Actuators Quiz</h1>
                </motion.div>

                {/* Subtitle */}
                <motion.div className="gamestart-subtitle" variants={itemVariants}>
                    <p>Discover hidden actuators in everyday items!</p>
                </motion.div>

                {/* Main Content Card */}
                <motion.div className="gamestart-card" variants={itemVariants}>
                    {/* Icon */}
                    <div className="card-icon">✨</div>

                    {/* Description */}
                    <h2>Learn the World of Actuators</h2>
                    <p className="card-description">
                        In this interactive quiz, you'll discover how actuators are used in everyday products 
                        and understand their real-world applications.
                    </p>

                    {/* Key Points */}
                    <div className="key-points">
                        <div className="key-point">
                            <span className="point-icon">❓</span>
                            <span className="point-text">5 engaging questions</span>
                        </div>
                        <div className="key-point">
                            <span className="point-icon">🎯</span>
                            <span className="point-text">Test your knowledge</span>
                        </div>
                        <div className="key-point">
                            <span className="point-icon">🏆</span>
                            <span className="point-text">Compete on the leaderboard</span>
                        </div>
                    </div>

                    {/* Estimated Time */}
                    <div className="estimated-time">
                        <span className="time-icon">⏱️</span>
                        <span className="time-text">Expected time: 3-5 minutes</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="gamestart-actions">
                        <button className="button button-primary" onClick={onStartGame}>
                            Start Game →
                        </button>
                        <button className="button button-secondary" onClick={onBack}>
                            ← Back
                        </button>
                    </div>
                </motion.div>

                {/* Bottom Note */}
                <motion.div className="gamestart-note" variants={itemVariants}>
                    <p>💡 Take your time to think about each question - there's no time pressure!</p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default GameStart;
