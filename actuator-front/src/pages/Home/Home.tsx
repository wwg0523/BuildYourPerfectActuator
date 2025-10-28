import React from 'react';
import { useParticipantCounter } from '../../context/ParticipantCounterContext';
import { motion, Variants } from 'framer-motion';
import myPngImage from '../../components/le-bot-logo-light.png';
import './Home.scss';

const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.3,
            duration: 0.6,
            ease: 'easeOut',
        },
    }),
};

interface HomeProps {
    onStartGame: () => void;
}

const Home: React.FC<HomeProps> = ({ onStartGame }) => {
    const participantCounter = useParticipantCounter();

    const handleStartGameClick = async () => {
        try {
            await participantCounter.incrementParticipant();
            const newCount = await participantCounter.getTotalParticipants();
            console.log('Participant count incremented:', newCount);
            onStartGame();
        } catch (error) {
            console.error('Failed to increment participant count:', error);
            alert('Failed to update participant count.');
            onStartGame();
        }
    };
    return (
        <div className="page-home">
            <motion.h1
                className="home-title"
                custom={0}
                initial="hidden"
                animate="visible"
                variants={textVariants}
            >
                Welcome!
            </motion.h1>

            <div className="home-subtitle">
                {"Build Your Perfect Actuator".split('').map((char, i) => (
                    <motion.span
                        key={`${char}-${i}`}
                        className="char"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                            duration: 1.1,
                            repeat: 1,
                            ease: 'easeInOut',
                            delay: i * 0.06
                        }}
                    >
                        {char}
                    </motion.span>
                ))}
            </div>

            <motion.button
                className="button"
                onClick={handleStartGameClick}
                whileHover={{
                    scale: 1.05,
                    transition: { type: 'spring', stiffness: 400, damping: 12, delay: 0 }
                }}
                whileTap={{
                    scale: 0.95,
                    transition: { type: 'spring', stiffness: 600, damping: 10, delay: 0 }
                }}
            >
                START GAME
            </motion.button>

            <motion.p
                className="home-powered"
                custom={0}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                variants={textVariants}
            >
                Powered by
                <img 
                    src={myPngImage} 
                    alt="lebot-logo" 
                    className="home-logo"
                />
            </motion.p>
        </div>
    );
};

export default Home;