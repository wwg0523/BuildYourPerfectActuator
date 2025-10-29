import React, { useState, useEffect, useRef } from 'react';
import '../styles/main.scss';
import CryptoJS from 'crypto-js';
import Home from '../pages/Home/Home';
import Info from '../pages/Info/Info';
import Game from '../pages/Game/Game';
import Result from '../pages/Result/Result';
import Leaderboard from '../pages/Leaderboard/Leaderboard';
import { UserInfo, LeaderboardEntry, IdleDetector, GameSession, GameEngine, LeaderboardManager } from '../lib/utils';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://actuator-back:4004';
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-secret-key-32bytes-long!!!';

export default function BuildYourPerfectActuator() {
    const [screen, setScreen] = useState<'home' | 'info' | 'game' | 'result' | 'leaderboard'>('home');
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
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [userId, setUserId] = useState<string>('');

    const [idleDetector, setIdleDetector] = useState<IdleDetector>({
        timeoutDuration: 15000,
        warningDuration: 10000, // 테스트용 10초
        currentTimeout: null,
        warningTimeout: null,
    });
    const [countdown, setCountdown] = useState<number>(5);
    const countdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const finalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const gameEngine = new GameEngine();
    const leaderboardManager = new LeaderboardManager();

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

    const handleStartGame = () => {
        setUserInfo({ name: '', company: '', email: '', phone: '' });
        setErrors({});
        setTermsAccepted(false);
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

            setGameSession(gameEngine.generateGameSession());
            setScreen('game');
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
        try {
            // localStorage에서 암호화된 정보 가져오기
            const encryptedUserInfo = localStorage.getItem('encryptedUserInfo');
            if (!encryptedUserInfo) {
                throw new Error('User information not found');
            }

            const parsedData = JSON.parse(encryptedUserInfo);

            // UUID 생성 (아직 생성되지 않았으면)
            let currentUserId = userId;
            if (!currentUserId) {
                currentUserId = CryptoJS.lib.WordArray.random(16).toString();
                setUserId(currentUserId);
            }

            // useState의 복호화된 데이터 사용
            const userForLeaderboard: UserInfo = {
                id: currentUserId,
                name: userInfo.name,
                company: userInfo.company,
                email: userInfo.email,
                phone: userInfo.phone,
            };

            const entry = await leaderboardManager.submitScore(gameSession, userForLeaderboard);
            setLeaderboardEntry(entry);
            setScreen('result');
        } catch (error) {
            console.error('Error submitting game result:', error);
            alert('Failed to save game result. Please try again.');
            setScreen('result');
        }

            // if (apps.length > 0) {
            //     let emailForSending = '';
            //     try {
            //         const fetchEmail = await fetch(`${backendUrl}/api/user/${savedUser.id}`);
            //         if (!fetchEmail.ok) throw new Error('Failed to fetch email');
            //         const { email } = await fetchEmail.json();
            //         emailForSending = email;
            //     } catch (error) {
            //         console.warn('Failed to fetch email from server, using decrypted email:', error);
            //         emailForSending = decryptedData.email!;
            //     }

            //     const appsHtml = apps.map((app) => `<p>🏆 ${app}</p>`).join('');
            //     const emailHtml = `
            //         <div style="text-align: center; font-family: Arial, sans-serif;">
            //             <h2>Result</h2>
            //             <br>
            //             <p>Compatible Applications:</p>
            //             <br>
            //             ${appsHtml}
            //             <br>
            //             <p style="font-size:0.8em; color:#888;">© LeBot</p>
            //         </div>
            //     `;

            //     const emailResponse = await fetch(`${backendUrl}/api/send-email`, {
            //         method: 'POST',
            //         headers: { 'Content-Type': 'application/json' },
            //         body: JSON.stringify({
            //             to: emailForSending,
            //             subject: 'Your Actuator Game Result',
            //             body: emailHtml,
            //         }),
            //     });
            //     if (!emailResponse.ok) {
            //         console.warn('Email sending failed, but proceeding to result screen');
            //     } else {
            //         console.log('Email sent successfully to:', emailForSending);
            //         localStorage.removeItem('encryptedUserInfo');
            //     }
            // } else {
            //     console.log('No compatible apps found, skipping email sending.');
            // }
    };

    const handlePlayAgain = () => {
        setGameSession(gameEngine.generateGameSession());
        setLeaderboardEntry(null);
        setScreen('game');
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/game/leaderboard`, { method: 'GET' });
            if (!response.ok) throw new Error('Failed to fetch leaderboard data');
            const data = await response.json();

            // backend may return rows with different field names; normalize to frontend LeaderboardEntry
            const normalized: LeaderboardEntry[] = (data || []).map((row: any, idx: number) => ({
                rank: row.rank ?? idx + 1,
                playerName: row.player_name ?? row.playerName ?? row.name ?? 'Anonymous',
                company: row.company ?? 'Unknown',
                score: typeof row.score === 'number' ? row.score : Number(row.avg_success_rate ?? row.score ?? 0),
                completionTime: Number(row.completion_time ?? row.completionTime ?? 0),
                timeBonus: Number(row.time_bonus ?? row.timeBonus ?? 0),
                finalScore: Number(row.final_score ?? row.finalScore ?? 0),
                playedAt: row.played_at ? new Date(row.played_at) : new Date(),
            }));

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

    const resetIdleTimer = () => {
        clearAllTimers();
        hideWarningMessage();

        warningTimeoutRef.current = setTimeout(() => {
            createWarningMessage('Returning to home screen in 5 seconds...');
        }, idleDetector.warningDuration);

        currentTimeoutRef.current = setTimeout(() => {
            handleBack();
        }, idleDetector.timeoutDuration);

        setIdleDetector(prev => ({ ...prev, warningTimeout: warningTimeoutRef.current, currentTimeout: currentTimeoutRef.current }));
    };

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
        const events = ['touchstart', 'click', 'keypress'] as const;
        if (screen === 'home' || screen === 'game' || screen === 'leaderboard') {
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
    }, [screen]);

    const renderHeader = () => {
        if (screen === 'home') return null;
        return (
            <div className="home-header">
                <button className="home-header-button" onClick={handleBack}>
                    🏠 HOME
                </button>
            </div>
        );
    };

    return (
        <div className="app-container">
            <div className="card">
                {renderHeader()}
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
                {screen === 'game' && gameSession && (
                    <Game
                        gameSession={gameSession}
                        setGameSession={setGameSession}
                        handleSubmit={handleSubmit}
                    />
                )}
                {screen === 'result' && gameSession && (
                    <Result
                        gameSession={gameSession}
                        leaderboardEntry={leaderboardEntry ?? undefined}
                        handlePlayAgain={handlePlayAgain}
                        setScreen={setScreen}
                    />
                )}
                {screen === 'leaderboard' && (
                    <Leaderboard
                        leaderboardData={leaderboardData}
                        fetchLeaderboard={fetchLeaderboard}
                        setScreen={setScreen}
                    />
                )}
            </div>
        </div>
    );
}