import React, { useRef, useEffect } from 'react';
import './Animation.scss';

interface AnimationProps {
    onAnimationEnd: () => void;
}

const Animation: React.FC<AnimationProps> = ({ onAnimationEnd }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // 클릭이나 터치로만 이동하도록 변경 (자동 이동 제거)
        // 반복 재생하므로 ended 이벤트는 더 이상 필요 없음
        
        return () => {
            // cleanup
        };
    }, [onAnimationEnd]);

    const handleClickOrTouch = () => {
        // 클릭이나 터치 시 Info 화면으로 이동
        onAnimationEnd();
    };

    return (
        <div className="page-animation" onClick={handleClickOrTouch}>
            <video
                ref={videoRef}
                className="animation-video"
                autoPlay
                loop={true}
                muted
                playsInline
            >
                <source src="/videos/test.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            
            {/* 클릭/터치 안내 텍스트 */}
            <div className="animation-overlay">
                <span className="click-hint">Click or Tap to Continue →</span>
            </div>
        </div>
    );
};

export default Animation;
