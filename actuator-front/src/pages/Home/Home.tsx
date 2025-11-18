/* eslint-disable unicode-bom */
import React, { useRef, useEffect } from 'react';
import './Home.scss';

interface HomeProps {
    onStartGame: () => void;
}

const Home: React.FC<HomeProps> = ({ onStartGame }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleVideoEnd = () => {
            // 비디오 끝난 후 2초 후에 다시 재생
            timeoutRef.current = setTimeout(() => {
                video.currentTime = 0;
                video.play().catch(err => console.log('Auto-play failed:', err));
            }, 2000);
        };

        video.addEventListener('ended', handleVideoEnd);

        return () => {
            video.removeEventListener('ended', handleVideoEnd);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [onStartGame]);

    const handleClickOrTouch = () => {
        // 클릭이나 터치 시 Info 화면으로 이동
        onStartGame();
    };

    return (
        <div className="home-card">
            <div className="page-home" onClick={handleClickOrTouch}>
                <video
                    ref={videoRef}
                    className="home-video"
                    autoPlay
                    muted
                    playsInline
                >
                    <source src="/videos/test.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                
                {/* 클릭/터치 안내 텍스트 */}
                <div className="home-overlay">
                    <span className="click-hint">Click or Tap to Continue →</span>
                </div>
            </div>
        </div>
    );
};

export default Home;
