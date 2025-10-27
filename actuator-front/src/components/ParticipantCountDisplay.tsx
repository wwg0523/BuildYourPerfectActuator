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
      <div className="count-header">
        <span className="count-label">Total Participants Today</span>
        <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? '🟢' : '🔴'}
        </span>
      </div>
      <div className="count-display">
        <span className="count-number">{totalCount.toLocaleString()}</span>
        <span className="count-suffix">players</span>
      </div>
    </div>
  );
};

export default ParticipantCountDisplay;