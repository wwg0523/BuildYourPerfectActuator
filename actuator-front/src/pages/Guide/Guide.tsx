import React from 'react';
import './Guide.scss';

interface GuideProps {
    onStartGame: () => void;
    onBack: () => void;
}

const Guide: React.FC<GuideProps> = ({ onStartGame, onBack }) => {
    return (
        <div className="page-guide">
            <div className="guide-dummy">
                <h1> Guide Page</h1>
                <p>This page is currently a placeholder.</p>
                <button onClick={onStartGame}>Start Game</button>
                <button onClick={onBack}>Back</button>
            </div>
        </div>
    );
};

export default Guide;
