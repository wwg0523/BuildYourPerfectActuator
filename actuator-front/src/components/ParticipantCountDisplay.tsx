// src/components/ParticipantCountDisplay.tsx
import React, { useState, useEffect } from 'react';
import { useParticipantCounter } from '../context/ParticipantCounterContext';
import '../styles/main.scss';

const ParticipantCountDisplay: React.FC = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const participantCounter = useParticipantCounter();

  useEffect(() => {
    const updateCallback = (count: number) => {
      setTotalCount(count);
      setIsOnline(true);
    };

    participantCounter.getTotalParticipants()
      .then(updateCallback)
      .catch(() => {
        setIsOnline(false);
        console.error('Initial participant count fetch failed');
      });

    participantCounter.startRealTimeUpdates(updateCallback);

    return () => participantCounter.stopRealTimeUpdates();
  }, [participantCounter]);

  return (
    <div className="participant-count-badge">
      {/* 오른쪽 위 상태 아이콘 */}
      <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? '🟢' : '🔴'}
      </span>

      {/* 가운데 정렬되는 내용 */}
      <div className="count-content">
        <span className="count-label">Total Participants</span>
        <div className="count-display">
          <span className="count-number">
            {totalCount.toLocaleString()}
          </span>
          <span className="count-suffix">players</span>
        </div>
      </div>

      {/* Powered by Logo */}
      <div className="powered-by">
        Powered by
        <img 
            src="/images/logo/lebot-logo.png" 
            alt="lebot-logo" 
            className="home-logo"
        />
      </div>
    </div>
  );
};

export default ParticipantCountDisplay;
