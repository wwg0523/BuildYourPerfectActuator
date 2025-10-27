import React from 'react';
import { motion } from 'framer-motion';

interface ResultProps {
    compatibleApps: string[];
    handlePlayAgain: () => void;
    showHintModal: boolean;
    hintMessage: string;
    setShowHintModal: (show: boolean) => void;
    setScreen: (screen: 'home' | 'info' | 'game' | 'result' | 'leaderboard') => void;
    generateHint: () => void;
}

const Result: React.FC<ResultProps> = ({
    compatibleApps,
    handlePlayAgain,
    showHintModal,
    hintMessage,
    setShowHintModal,
    setScreen,
    generateHint,
}) => {
    return (
        <>
            {compatibleApps.length > 0 ? (
                <>
                    <h2>Result</h2>
                    <p>Compatible Applications:</p>
                    {compatibleApps.map(app => (
                        <p key={app}>🏆 {app}</p>
                    ))}
                    <button className="button outline" onClick={handlePlayAgain}>PLAY AGAIN</button>
                    <button className="button" onClick={() => window.open('http://lebot.co.kr', '_blank')}>
                        VISIT OUR SITE
                    </button>
                </>
            ) : (
                <>
                    <p>Oops!</p>
                    <p>❌ No compatible applications found.</p>
                    <p>Your combination doesn't match any standard robot applications</p>
                    <button className="button outline" onClick={handlePlayAgain}>TRY AGAIN</button>
                    <button className="button outline" onClick={generateHint}>GET A HINT</button>
                </>
            )}
            <button className="button" onClick={() => setScreen('leaderboard')}>VIEW RECORD</button>
            <button className="button outline" onClick={() => setScreen('home')}>🏠 BACK TO HOME</button>

            {showHintModal && (
                <div className="modal-overlay terms-modal-overlay" onClick={() => setShowHintModal(false)}>
                    <div className="modal terms-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Hint</h3>
                        <motion.p className="info-box">💡 {hintMessage}</motion.p>
                        <div className="modal-buttons">
                            <button className="button" onClick={() => setShowHintModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Result;