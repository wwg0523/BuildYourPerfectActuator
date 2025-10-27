import React from 'react';
import { motion, Variants } from 'framer-motion';
import myPngImage from '../components/le-bot-logo-light.png';

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
    return (
        <>
            <motion.h1
                custom={0}
                initial="hidden"
                animate="visible"
                variants={textVariants}
                style={{ margin: '20px', fontSize: '2.5rem', fontWeight: 'bold' }}
            >
                Welcome!
            </motion.h1>

            <div style={{ margin: '1rem 0', fontSize: '1.25rem', color: '#4b5563', display: 'flex', justifyContent: 'center' }}>
                {"Build Your Perfect Actuator".split('').map((char, i) => (
                    <motion.span
                        key={`${char}-${i}`}
                        style={{ display: 'inline-block', whiteSpace: 'pre' }}
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
                onClick={onStartGame}
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
                custom={0}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                variants={textVariants}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0
                }}
            >
                Powered by
                <img 
                    src={myPngImage} 
                    alt="lebot-logo" 
                    style={{ width: '100px', height: 'auto', marginLeft: '10px' }}
                />
            </motion.p>
        </>
    );
};

export default Home;