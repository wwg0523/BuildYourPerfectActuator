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
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [direction, setDirection] = useState(0);
    const dragRef = useRef<HTMLDivElement>(null);
    const [isVerticalScroll, setIsVerticalScroll] = useState(false);

    const slides: Slide[] = [
        {
            id: 1,
            headline: '✨ The Secret Behind All Movement',
            icon: '🔧',
            content: (
                <div className="slide-content slide-with-image">
                    <div className="slide-image-container">
                        <img src="/images/carousel/slide1.png" alt="Actuator Demo" className="slide-image" />
                    </div>
                    <p className="slide-description">
                        An actuator is a device that converts energy into motion, 
                        hidden in everyday items around you!
                    </p>
                </div>
            ),
        },
        {
            id: 2,
            headline: '🚀 The Core Component of Future Tech!',
            icon: '🤖',
            content: (
                <div className="slide-content slide-with-image">
                    <div className="slide-image-container">
                        <img src="/images/carousel/slide2.png" alt="Future Technology" className="slide-image" />
                    </div>
                    <p className="slide-description">
                        From robots to smart homes, actuators are the hidden engines 
                        powering the future of technology!
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
            x: direction > 0 ? -1000 : 1000,
            opacity: 0,
        }),
    };

    const handlePrevious = () => {
        if (currentSlide > 0) {
            setDirection(-1); // 이전으로 갈 때 -1
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setDirection(1); // 다음으로 갈 때 1
            setCurrentSlide(currentSlide + 1);
        }
    };

    // 마우스 드래그 핸들러
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setDragStart({ x: e.clientX, y: e.clientY });
        setIsVerticalScroll(false);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        const dragEnd = { x: e.clientX, y: e.clientY };
        const diffX = dragStart.x - dragEnd.x;
        const diffY = Math.abs(dragStart.y - dragEnd.y);

        // 수직 드래그가 더 크면 스크롤로 간주 (가로 슬라이드 방지)
        if (diffY > 30) {
            setIsVerticalScroll(true);
            return;
        }

        // 가로 드래그만 처리 (최소 50px)
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                handleNext();
            } else {
                handlePrevious();
            }
        }
    };

    // 터치 드래그 핸들러
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        setIsVerticalScroll(false);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        const dragEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        const diffX = dragStart.x - dragEnd.x;
        const diffY = Math.abs(dragStart.y - dragEnd.y);

        // 수직 드래그가 더 크면 스크롤로 간주
        if (diffY > 30) {
            setIsVerticalScroll(true);
            return;
        }

        // 가로 드래그만 처리 (최소 50px)
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
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
                    draggable={false}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onDragStart={(e) => e.preventDefault()}
                >
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentSlide}
                            custom={direction}
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
            </div>
        </div>
    );
};

export default GameStart;
