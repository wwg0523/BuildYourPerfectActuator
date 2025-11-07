import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/main.scss';
import CryptoJS from 'crypto-js';
import Home from '../pages/Home/Home';
import Info from '../pages/Info/Info';
import GameStart from '../pages/GameStart/GameStart';
import Game from '../pages/Game/Game';
import Result from '../pages/Result/Result';
import Leaderboard from '../pages/Leaderboard/Leaderboard';
import { UserInfo, LeaderboardEntry, IdleDetector, GameSession, GameEngine, LeaderboardManager, deleteUserData, ParticipantCounter } from '../lib/utils';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-secret-key-32bytes-long!!!';

// UUID v4 생성 함수
const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export default function ActuatorMinigame() {
    const [screen, setScreen] = useState<'home' | 'info' | 'gamestart' | 'game' | 'result' | 'leaderboard'>('home');
    const [userInfo, setUserInfo] = useState<UserInfo>({
        name: '',
        company: '',
        email: '',
        phone: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [gameSession, setGameSession] = useState<GameSession | null>(null);
    const [leaderboardEntry, setLeaderboardEntry] = useState<LeaderboardEntry | null>(null);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [userId, setUserId] = useState<string>('');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [idleDetector, setIdleDetector] = useState<IdleDetector>({
        timeoutDuration: 35000,
        warningDuration: 30000, // 30초 후 경고 메시지 표시
        currentTimeout: null,
        warningTimeout: null,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [countdown, setCountdown] = useState<number>(5);
    const countdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const finalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMobileRef = useRef<boolean>(false);

    const gameEngine = new GameEngine();
    const leaderboardManager = new LeaderboardManager();
    const participantCounter = new ParticipantCounter();

    const clearAllTimers = () => {
        if (countdownTimeoutRef.current) {
            clearTimeout(countdownTimeoutRef.current);
            countdownTimeoutRef.current = null;
        }
        if (currentTimeoutRef.current) {
            clearTimeout(currentTimeoutRef.current);
            currentTimeoutRef.current = null;
        }
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
            warningTimeoutRef.current = null;
        }
        if (finalTimeoutRef.current) {
            clearTimeout(finalTimeoutRef.current);
            finalTimeoutRef.current = null;
        }
        setIdleDetector(prev => ({ ...prev, currentTimeout: null, warningTimeout: null }));
    };

    const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!userInfo.name.trim()) newErrors.name = 'Name is required';
        else if (userInfo.name.trim().length < 6) newErrors.name = 'Name must be at least 6 characters';
        else if (koreanRegex.test(userInfo.name)) newErrors.name = 'Name cannot contain Korean characters';

        if (!userInfo.company.trim()) newErrors.company = 'Company is required';
        else if (koreanRegex.test(userInfo.company)) newErrors.company = 'Company cannot contain Korean characters';

        if (!userInfo.email.trim()) newErrors.email = 'Email is required';
        else if (!emailRegex.test(userInfo.email)) newErrors.email = 'Invalid email format';

        if (!userInfo.phone.trim()) newErrors.phone = 'Phone is required';
        else if (!phoneRegex.test(userInfo.phone)) newErrors.phone = 'Invalid phone number (international format supported)';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof UserInfo, value: string) => {
        setUserInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (termsAccepted) {
            setTermsAccepted(false);
            setAgreeTerms(false);
            setAgreeMarketing(false);
            return;
        }
        setShowModal(true);
    };

    const handleStartGame = async () => {
        setUserInfo({ name: '', company: '', email: '', phone: '' });
        setErrors({});
        setTermsAccepted(false);
        
        // Home에서 Info로 넘어갈 때 참가자 수 증가
        try {
            await participantCounter.incrementParticipant();
        } catch (error) {
            // Silent failure
        }
        
        setScreen('info');
    };

    const handleContinue = async () => {
        if (!validate()) return;
        if (!termsAccepted) {
            alert('You must accept the Terms and Conditions to continue.');
            return;
        }
        try {
            const encryptedName = CryptoJS.AES.encrypt(userInfo.name, ENCRYPTION_KEY).toString();
            const encryptedCompany = CryptoJS.AES.encrypt(userInfo.company, ENCRYPTION_KEY).toString();
            const encryptedEmail = CryptoJS.AES.encrypt(userInfo.email, ENCRYPTION_KEY).toString();
            const encryptedPhone = CryptoJS.AES.encrypt(userInfo.phone, ENCRYPTION_KEY).toString();

            localStorage.setItem(
                'encryptedUserInfo',
                JSON.stringify({
                    name: encryptedName,
                    company: encryptedCompany,
                    email: encryptedEmail,
                    phone: encryptedPhone,
                })
            );

            // Generate userId first (proper UUID v4 format)
            let currentUserId = userId;
            if (!currentUserId) {
                currentUserId = generateUUID();
                setUserId(currentUserId);
            }

            setGameSession(gameEngine.generateGameSession(currentUserId));
            setScreen('gamestart');
        } catch (error) {
            console.error('Error in continue:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleBack = () => {
        clearAllTimers();
        hideWarningMessage();
        setUserInfo({ name: '', company: '', email: '', phone: '' });
        setErrors({});
        setTermsAccepted(false);
        setAgreeTerms(false);
        setAgreeMarketing(false);
        setUserId('');
        localStorage.removeItem('encryptedUserInfo');
        setGameSession(null);
        setLeaderboardEntry(null);
        setScreen('home');
    };

    const handleSubmit = async () => {
        if (!gameSession) return;

        let userForGame: UserInfo | null = null;
        let correctAnswers = 0;
        let completionTime = 0;

        try {
            // localStorage에서 암호화된 정보 가져오기
            const encryptedUserInfo = localStorage.getItem('encryptedUserInfo');
            if (!encryptedUserInfo) {
                throw new Error('User information not found');
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const parsedData = JSON.parse(encryptedUserInfo);

            // UUID 생성 (아직 생성되지 않았으면)
            let currentUserId = userId;
            if (!currentUserId) {
                currentUserId = generateUUID();
                setUserId(currentUserId);
            }

            // 사용자 정보
            userForGame = {
                id: currentUserId,
                name: userInfo.name,
                company: userInfo.company,
                email: userInfo.email,
                phone: userInfo.phone,
            };

            // Calculate game completion time and score
            // Use completionTime from gameSession (accurate value calculated from timer)
            completionTime = gameSession.completionTime || 0;
            
            // If completionTime is 0, calculate from startTime and endTime
            if (completionTime === 0 && gameSession.endTime) {
                completionTime = gameSession.endTime.getTime() - gameSession.startTime.getTime();
            }
            
            // 최종 검증: completionTime이 여전히 0이면 최소 1초 설정
            if (completionTime <= 0) {
                completionTime = 1000; // 최소 1초
            }
            
            correctAnswers = gameSession.answers.filter(a => a.isCorrect).length;
            
            // game_users 테이블에 사용자 저장 (필수!)
            try {
                const userResponse = await fetch(`/api/user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: currentUserId,
                        name: userForGame.name,
                        company: userForGame.company,
                        email: userForGame.email,
                        phone: userForGame.phone,
                    }),
                });
                if (!userResponse.ok) {
                    throw new Error(`Failed to save user: ${userResponse.status}`);
                }
            } catch (err) {
                console.error('Critical: User save failed:', err);
                throw err; // 사용자 저장 실패는 게임을 진행할 수 없음
            }

            // 게임 결과 저장
            try {
                const gameResultResponse = await fetch(`/api/game/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUserId,
                        selectedComponents: gameSession.questions.length > 0 ? gameSession.questions[0].options : [],
                        compatibleApplications: gameSession.questions.length > 0 ? gameSession.questions[0].category : '',
                        successRate: correctAnswers / gameSession.questions.length,
                        completionTime: completionTime,
                        score: correctAnswers,
                        totalQuestions: gameSession.questions.length,
                        answers: gameSession.answers.map((answer, idx) => ({
                            questionId: answer.questionId,
                            selectedComponents: answer.selectedComponents || [],
                            isCorrect: answer.isCorrect || false,
                            pointsEarned: answer.isCorrect ? (gameSession.questions[idx]?.points || 0) : 0,
                        }))
                    }),
                });
                if (!gameResultResponse.ok) {
                    throw new Error(`Failed to save game result: ${gameResultResponse.status}`);
                }
            } catch (err) {
                console.error('Game result save error:', err);
                throw err;
            }

            // 순위 조회 및 이메일 발송
            try {
                const entry = await leaderboardManager.submitScore(gameSession, userForGame);
                setLeaderboardEntry(entry);
            } catch (err) {
                console.warn('Leaderboard submission warning (non-critical):', err);
                // 기본값으로 설정하고 진행
                if (userForGame) {
                    setLeaderboardEntry({
                        rank: 0,
                        playerName: userForGame.name,
                        company: userForGame.company,
                        score: correctAnswers,
                        completionTime: completionTime,
                        finalScore: correctAnswers * 100,
                        playedAt: new Date(),
                    });
                }
            }
            
            setScreen('result');
        } catch (error) {
            console.error('Error in game completion:', error);
            // 게임 결과 화면으로 이동 (데이터 저장 실패해도 결과 표시)
            if (userForGame) {
                setLeaderboardEntry({
                    rank: 0,
                    playerName: userForGame.name,
                    company: userForGame.company,
                    score: correctAnswers,
                    completionTime: completionTime,
                    finalScore: correctAnswers * 100,
                    playedAt: new Date(),
                });
            }
            setScreen('result');
        }
    };

    const handlePlayAgain = () => {
        setGameSession(gameEngine.generateGameSession(userId));
        setLeaderboardEntry(null);
        setScreen('game');
    };

    const handleDeleteUserData = async () => {
        const userIdToDelete = userId || gameSession?.userId;
        if (userIdToDelete) {
            const success = await deleteUserData(userIdToDelete);
            if (success) {
                alert('Your data has been deleted successfully');
                setShowDeleteConfirmModal(false);
                handleBack();
            } else {
                alert('Failed to delete your data');
                setShowDeleteConfirmModal(false);
            }
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`/api/game/leaderboard`, { method: 'GET' });
            if (!response.ok) throw new Error('Failed to fetch leaderboard data');
            const data = await response.json();

            // backend already returns normalized data, just map it to LeaderboardEntry
            const normalized: LeaderboardEntry[] = (data || []).map((row: any, idx: number) => {
                // completionTime은 이미 백엔드에서 ms 단위로 반환됨
                let completionTimeMs = Number(row.completionTime ?? 0);
                
                return {
                    rank: row.rank ?? idx + 1,
                    playerName: row.playerName ?? 'Anonymous',
                    company: row.company ?? 'Unknown',
                    score: Number(row.score ?? 0),
                    completionTime: completionTimeMs,
                    finalScore: Number(row.finalScore ?? 0),
                    playedAt: row.playedAt ? new Date(row.playedAt) : new Date(),
                };
            });

            setLeaderboardData(normalized);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            alert('Failed to load leaderboard. Please try again.');
        }
    };

    const createWarningMessage = (initialMessage: string): void => {
        const existingModal = document.getElementById('warning-modal');
        if (existingModal) existingModal.remove();

        if (countdownTimeoutRef.current) {
            clearTimeout(countdownTimeoutRef.current);
            countdownTimeoutRef.current = null;
        }

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'warning-modal';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            text-align: center;
            font-family: Arial, sans-serif;
            max-width: 400px;
            width: 90%;
        `;

        modalContent.innerHTML = `
            <h2>⚠️ Warning</h2>
            <p id="countdown-message">${initialMessage}</p>
            <div style="margin-top: 20px;">
                <button id="stay-here" style="padding: 10px 20px; margin-right: 10px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px;">STAY HERE</button>
                <button id="go-home-now" style="padding: 10px 20px; cursor: pointer; background: #dc3545; color: white; border: none; border-radius: 4px;">GO HOME NOW</button>
            </div>
        `;

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        const stayButton = modalContent.querySelector('#stay-here');
        const handleStay = (e: Event) => {
            try { e.preventDefault(); } catch {}
            try { e.stopPropagation(); } catch {}
            if ((modalContent as any)._handled) return;
            (modalContent as any)._handled = true;

            const consumeNext = (ev: Event) => {
                try { ev.preventDefault(); } catch {}
                try { ev.stopPropagation(); } catch {}
                cleanup();
            };
            const cleanup = () => {
                document.removeEventListener('click', consumeNext, true);
                document.removeEventListener('touchstart', consumeNext, true);
                clearTimeout((cleanup as any)._timeout as any);
            };
            document.addEventListener('click', consumeNext, true);
            document.addEventListener('touchstart', consumeNext, true);
            (cleanup as any)._timeout = setTimeout(cleanup, 500) as any;

            clearAllTimers();
            hideWarningMessage();
            resetIdleTimer();
        };
        ['click', 'touchstart', 'pointerup'].forEach(evt => stayButton?.addEventListener(evt, handleStay));

        const goHomeButton = modalContent.querySelector('#go-home-now');
        const handleGoHome = (e: Event) => {
            try { e.preventDefault(); } catch {}
            try { e.stopPropagation(); } catch {}
            if ((modalContent as any)._handled) return;
            (modalContent as any)._handled = true;

            const consumeNext = (ev: Event) => {
                try { ev.preventDefault(); } catch {}
                try { ev.stopPropagation(); } catch {}
                cleanup();
            };
            const cleanup = () => {
                document.removeEventListener('click', consumeNext, true);
                document.removeEventListener('touchstart', consumeNext, true);
                clearTimeout((cleanup as any)._timeout as any);
            };
            document.addEventListener('click', consumeNext, true);
            document.addEventListener('touchstart', consumeNext, true);
            (cleanup as any)._timeout = setTimeout(cleanup, 500) as any;

            clearAllTimers();
            hideWarningMessage();
            handleBack();
        };
        ['click', 'touchstart', 'pointerup'].forEach(evt => goHomeButton?.addEventListener(evt, handleGoHome));

        setCountdown(5);
        const startCountdown = (count: number) => {
            const messageElement = document.getElementById('countdown-message');
            if (messageElement) {
                messageElement.textContent = `Returning to home screen in ${count} second${count === 1 ? '' : 's'}...`;
            }
            if (count <= 0) {
                clearAllTimers();
                handleBack();
                return;
            }
            countdownTimeoutRef.current = setTimeout(() => {
                setCountdown(count - 1);
                startCountdown(count - 1);
            }, 1000);
        };
        startCountdown(5);
    };

    useEffect(() => {
        // 모바일 기기 감지
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        isMobileRef.current = isMobile;

        // 모바일은 더 긴 시간 제공 (45초), 데스크톱은 30초
        const baseTimeoutDuration = isMobile ? 45000 : 30000;
        const baseWarningDuration = isMobile ? 40000 : 25000; // 경고는 5초 전

        setIdleDetector(prev => ({
            ...prev,
            timeoutDuration: baseTimeoutDuration,
            warningDuration: baseWarningDuration,
        }));
    }, []);

    const resetIdleTimer = useCallback(() => {
        clearAllTimers();
        hideWarningMessage();

        const isMobile = isMobileRef.current;
        const timeoutDuration = isMobile ? 45000 : 30000;
        const warningDuration = isMobile ? 40000 : 25000;

        warningTimeoutRef.current = setTimeout(() => {
            createWarningMessage('Returning to home screen in 5 seconds...');
        }, warningDuration);

        currentTimeoutRef.current = setTimeout(() => {
            handleBack();
        }, timeoutDuration);

        setIdleDetector(prev => ({ ...prev, warningTimeout: warningTimeoutRef.current, currentTimeout: currentTimeoutRef.current }));
    }, []);

    const hideWarningMessage = (): void => {
        const modal = document.getElementById('warning-modal');
        if (modal) modal.remove();
        if (countdownTimeoutRef.current) {
            clearTimeout(countdownTimeoutRef.current);
            countdownTimeoutRef.current = null;
        }
        setCountdown(5);
    };

    useEffect(() => {
        const events = ['touchstart', 'click', 'keypress', 'mousemove'] as const;
        if (screen === 'home') {
            clearAllTimers();
            hideWarningMessage();
            return;
        }

        events.forEach(event => {
            document.addEventListener(event, resetIdleTimer);
        });

        resetIdleTimer();

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetIdleTimer);
            });
            clearAllTimers();
            hideWarningMessage();
        };
    }, [screen, resetIdleTimer]);

    // Delete confirmation modal (used by Result and Leaderboard components)
    const renderDeleteConfirmModal = () => {
        if (screen !== 'result' && screen !== 'leaderboard') return null;
        if (!showDeleteConfirmModal) return null;
        
        return (
            <div className="delete-confirm-modal-overlay" onClick={() => setShowDeleteConfirmModal(false)}>
                <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                    <h2>Confirm Delete</h2>
                    <p>Are you sure you want to delete your user data? This cannot be undone.</p>
                    <div className="modal-buttons">
                        <button onClick={() => setShowDeleteConfirmModal(false)} className="button outline">CANCEL</button>
                        <button onClick={handleDeleteUserData} className="button delete">DELETE</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="app-container">
            <div className="card">
                {screen === 'home' && <Home onStartGame={handleStartGame} />}
                {screen === 'info' && (
                    <Info
                        userInfo={userInfo}
                        errors={errors}
                        termsAccepted={termsAccepted}
                        showModal={showModal}
                        agreeTerms={agreeTerms}
                        agreeMarketing={agreeMarketing}
                        handleInputChange={handleInputChange}
                        handleCheckboxClick={handleCheckboxClick}
                        setShowModal={setShowModal}
                        setAgreeTerms={setAgreeTerms}
                        setAgreeMarketing={setAgreeMarketing}
                        setTermsAccepted={setTermsAccepted}
                        handleBack={handleBack}
                        handleContinue={handleContinue}
                    />
                )}
                {screen === 'gamestart' && (
                    <GameStart
                        onStartGame={() => setScreen('game')}
                        onBack={() => {
                            setGameSession(null);
                            setScreen('info');
                        }}
                    />
                )}
                {screen === 'game' && gameSession && (
                    <Game
                        gameSession={gameSession}
                        setGameSession={setGameSession}
                        handleSubmit={handleSubmit}
                        setScreen={setScreen}
                    />
                )}
                {screen === 'result' && gameSession && (
                    <Result
                        gameSession={gameSession}
                        leaderboardEntry={leaderboardEntry ?? undefined}
                        handlePlayAgain={handlePlayAgain}
                        setScreen={setScreen}
                        handleDeleteUserData={handleDeleteUserData}
                        userInfo={{
                            id: userId,
                            name: userInfo.name,
                            company: userInfo.company,
                            email: userInfo.email,
                            phone: userInfo.phone,
                        }}
                    />
                )}
                {screen === 'leaderboard' && (
                    <Leaderboard
                        leaderboardData={leaderboardData}
                        fetchLeaderboard={fetchLeaderboard}
                        handlePlayAgain={handlePlayAgain}
                        setScreen={setScreen}
                        handleDeleteUserData={handleDeleteUserData}
                    />
                )}
                {renderDeleteConfirmModal()}
            </div>
        </div>
    );
}