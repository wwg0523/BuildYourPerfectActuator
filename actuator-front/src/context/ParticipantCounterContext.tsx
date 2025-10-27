import { createContext, useContext, ReactNode } from 'react';
import { ParticipantCounter } from '../lib/utils';

const ParticipantCounterContext = createContext<ParticipantCounter | null>(null);

export const ParticipantCounterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const counter = new ParticipantCounter();
    return <ParticipantCounterContext.Provider value={counter}>{children}</ParticipantCounterContext.Provider>;
};

export const useParticipantCounter = () => {
    const counter = useContext(ParticipantCounterContext);
    if (!counter) throw new Error('ParticipantCounter not provided');
    return counter;
};