import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GameStart.scss';

interface GameStartProps {
    onStartGame: () => void;
    onBack: () => void;
}

interface Slide {
    id: number;
    headline: string;
    icon: string;
    content: React.ReactNode;
}

const GameStart: React.FC<GameStartProps> = ({ onStartGame, onBack: _onBack }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [dragStart, setDragStart] = useState(0);
    const dragRef = useRef<HTMLDivElement>(null);

    const slides: Slide[] = [
        {
            id: 1,
            headline: '✨ The Secret Behind All Movement',
            icon: '🔧',
            content: (
                <div className="slide-content">
                    <div className="content-section">
                        <h3>Technical Definition</h3>
                        <p>
                            An actuator is a device that takes electrical energy, hydraulic, or pneumatic power 
                            and converts it into physical motion (linear or rotary).
                        </p>
                    </div>
                    <div className="content-section">
                        <h3>Everyday Definition</h3>
                        <p>
                            From opening a door to brewing coffee and making your phone vibrate, 
                            an actuator is hidden in all these actions. Discover the small engine 
                            that makes our lives convenient!
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 2,
            headline: '🚀 The Core Component of Future Tech!',
            icon: '🤖',
            content: (
                <div className="slide-content">
                    <p className="main-text">
                        Actuators are not just parts; they are essential for technologies ranging from 
                        robotics and smart home appliances to wearable devices. They enable precise control 
                        and new user experiences.
                    </p>
                    <div className="tech-highlights">
                        <div className="highlight">🦾 Robotics</div>
                        <div className="highlight">🏠 Smart Home</div>
                        <div className="highlight">📱 Wearables</div>
                        <div className="highlight">🚗 Autonomous Vehicles</div>
                    </div>
                    <p className="call-to-action">
                        Expand your knowledge and discover this hidden technology!
                    </p>
                </div>
            ),
        },
        {
            id: 3,
            headline: '💡 Design Your Own Actuator, Easily!',
            icon: '⚙️',
            content: (
                <div className="slide-content">
                    <p className="main-text">
                        Forget complex physics and endless equations. Our web solution allows you to 
                        design and simulate the exact actuator you need, based on just your idea.
                    </p>
                    <div className="key-emphasis">
                        <span>✓ Create your ideal actuator 'lightly' and efficiently</span>
                        <span>✓ Intuitive tools with visual feedback</span>
                        <span>✓ No complex calculations required</span>
                    </div>
                </div>
            ),
        },
        {
            id: 4,
            headline: '🏆 5 Minutes to Win a Prize!',
            icon: '🎁',
            content: (
                <div className="slide-content">
                    <p className="main-text">
                        Take the quiz and prove you're an actuator expert. Participants are entered 
                        into a draw, and high scorers on the Leaderboard will receive a special 
                        prize at the CES booth!
                    </p>
                    <div className="incentive-box">
                        <p className="incentive-title">Why Participate?</p>
                        <ul className="incentive-list">
                            <li>🎯 Test your knowledge</li>
                            <li>🏅 Climb the leaderboard</li>
                            <li>🎉 Win exciting prizes</li>
                            <li>🌟 Show your expertise</li>
                        </ul>
                    </div>
                    <p className="call-to-action">
                        Test your knowledge now and grab your chance to win!
                    </p>
                </div>
            ),
        },
    ];

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    };

    const handlePrevious = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    // 드래그 이벤트 핸들러
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        setDragStart(e.clientX);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        const dragEnd = e.clientX;
        const diff = dragStart - dragEnd;

        if (Math.abs(diff) > 50) { // 최소 50px 드래그
            if (diff > 0) {
                // 왼쪽으로 드래그 → 다음 슬라이드
                handleNext();
            } else {
                // 오른쪽으로 드래그 → 이전 슬라이드
                handlePrevious();
            }
        }
    };

    // 터치 이벤트 핸들러
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setDragStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        const dragEnd = e.changedTouches[0].clientX;
        const diff = dragStart - dragEnd;

        if (Math.abs(diff) > 50) { // 최소 50px 드래그
            if (diff > 0) {
                handleNext();
            } else {
                handlePrevious();
            }
        }
    };

    const isStartEnabled = currentSlide === slides.length - 1;

    return (
        <div className="page-gamestart">
            <div className="gamestart-container">
                {/* Header */}
                <div className="gamestart-header">
                    <h1>Find the Actuators Quiz</h1>
                    <p>Discover hidden actuators in everyday items!</p>
                </div>

                {/* Carousel */}
                <div 
                    className="carousel-wrapper"
                    ref={dragRef}
                    draggable
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <AnimatePresence initial={false} custom={currentSlide} mode="wait">
                        <motion.div
                            key={currentSlide}
                            custom={currentSlide}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: 'spring', stiffness: 300, damping: 30 },
                                opacity: { duration: 0.5 },
                            }}
                            className="carousel-slide"
                        >
                            <div className="slide-icon">{slides[currentSlide].icon}</div>
                            <h2 className="slide-headline">{slides[currentSlide].headline}</h2>
                            <div className="slide-body">{slides[currentSlide].content}</div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Slide Indicators */}
                <div className="slide-indicators">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`indicator ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className="carousel-navigation">
                    <button
                        className={`button button-primary ${!isStartEnabled ? 'disabled' : ''}`}
                        onClick={onStartGame}
                        disabled={!isStartEnabled}
                    >
                        Start Game →
                    </button>
                </div>

                {/* Progress Info */}
                <div className="progress-info">
                    <span>{currentSlide + 1} of {slides.length}</span>
                </div>
            </div>
        </div>
    );
};

export default GameStart;
