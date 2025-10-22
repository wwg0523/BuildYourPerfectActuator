import React, { useState, useEffect } from 'react';
import './styles/main.scss';
import compatibilityMatrixJson from './data/compatibilityMatrix.json';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://actuator-back:4000';

interface GameComponent {
    id: string;
    name: string;
    type: 'motor' | 'gearbox' | 'encoder' | 'drive' | 'bearing';
    icon: string;
    description: string;
}

interface UserInfo {
    id?: string;
    name: string;
    company: string;
    email: string;
    phone: string;
}

interface GameResult {
    userId: string;
    selectedComponents: string[];
    compatibleApplications: string[];
    successRate: number;
    completionTime: number;
}

interface LeaderboardEntry {
    name: string;
    company: string;
    avg_success_rate: number;
    attempts: number;
}

// ------------------- COMPONENTS -------------------
const COMPONENTS: GameComponent[] = [
    // MOTOR
    { id: 'servo_motor', name: 'Servo Motor', type: 'motor', icon: '🔧', description: 'Servo motor for precise control' },
    { id: 'stepper_motor', name: 'Stepper Motor', type: 'motor', icon: '🔧', description: 'Stepper motor for incremental motion' },
    { id: 'ac_motor', name: 'AC Motor', type: 'motor', icon: '🔧', description: 'AC motor for industrial automation' },

    // GEARBOX
    { id: 'harmonic_gearbox', name: 'Harmonic Gearbox', type: 'gearbox', icon: '⚙️', description: 'High-precision gearbox' },
    { id: 'planetary_gearbox', name: 'Planetary Gearbox', type: 'gearbox', icon: '⚙️', description: 'High torque planetary gearbox' },
    { id: 'spur_gearbox', name: 'Spur Gearbox', type: 'gearbox', icon: '⚙️', description: 'Simple spur gearbox' },

    // ENCODER
    { id: 'absolute_encoder', name: 'Absolute Encoder', type: 'encoder', icon: '📊', description: 'Measures absolute position' },
    { id: 'optical_encoder', name: 'Optical Encoder', type: 'encoder', icon: '📊', description: 'High-precision optical encoder' },
    { id: 'incremental_encoder', name: 'Incremental Encoder', type: 'encoder', icon: '📊', description: 'Measures incremental rotation' },

    // DRIVE
    { id: 'servo_drive', name: 'Servo Drive', type: 'drive', icon: '🔌', description: 'Controls servo motor' },
    { id: 'stepper_drive', name: 'Stepper Drive', type: 'drive', icon: '🔌', description: 'Controls stepper motor' },
    { id: 'ac_drive', name: 'AC Drive', type: 'drive', icon: '🔌', description: 'Controls AC motor' },

    // BEARING
    { id: 'ball_bearing', name: 'Ball Bearing', type: 'bearing', icon: '⚡', description: 'Reduces friction' },
    { id: 'roller_bearing', name: 'Roller Bearing', type: 'bearing', icon: '⚡', description: 'Supports radial load' },
    { id: 'thrust_bearing', name: 'Thrust Bearing', type: 'bearing', icon: '⚡', description: 'Supports axial load' },
];

// ------------------- COMPATIBILITY -------------------
const compatibilityMatrix: Record<string, string[]> = compatibilityMatrixJson;

// ------------------- HELPER -------------------
function checkCompatibility(selectedComponents: GameComponent[]): string[] {
    const selectedIds = selectedComponents.map(c => c.id);
    return Object.keys(compatibilityMatrix).filter(app => {
        const requiredIds = compatibilityMatrix[app];
        return requiredIds.every(id => selectedIds.includes(id)); // 모든 필수 구성 요소가 포함되어야 함
    });
}

// ------------------- MAIN COMPONENT -------------------
export default function BuildYourPerfectActuator() {
    const [screen, setScreen] = useState<'welcome' | 'info' | 'game' | 'result' | 'leaderboard'>('welcome');
    const [userInfo, setUserInfo] = useState<UserInfo>({
        name: '',
        company: '',
        email: '',
        phone: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [selectedComponents, setSelectedComponents] = useState<GameComponent[]>([]);
    const [selectedType, setSelectedType] = useState<'motor' | 'gearbox' | 'encoder' | 'drive' | 'bearing' | null>(null);
    const [compatibleApps, setCompatibleApps] = useState<string[]>([]);
    const [gameStartTime, setGameStartTime] = useState<number | null>(null);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);

    // 정규식
    const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    // 입력 유효성 검사
    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!userInfo.name.trim()) newErrors.name = 'Name is required';
        else if (koreanRegex.test(userInfo.name)) newErrors.name = 'Name cannot contain Korean characters';

        if (!userInfo.company.trim()) newErrors.company = 'Company is required';
        else if (koreanRegex.test(userInfo.company)) newErrors.company = 'Company cannot contain Korean characters';

        if (!userInfo.email.trim()) newErrors.email = 'Email is required';
        else if (!emailRegex.test(userInfo.email)) newErrors.email = 'Invalid email format';

        if (!userInfo.phone.trim()) newErrors.phone = 'Phone is required';
        else if (!phoneRegex.test(userInfo.phone)) newErrors.phone = 'Invalid phone number';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 입력 핸들러
    const handleInputChange = (field: keyof UserInfo, value: string) => {
        setUserInfo(prev => ({ ...prev, [field]: value }));
    };

    // 화면 전환 핸들러
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
            const userToSave = {
                ...userInfo,
                timestamp: new Date(), // 서버 저장 직전에 timestamp 추가
            };

            const response = await fetch(`${backendUrl}/api/game/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userToSave),
            });
            if (!response.ok) throw new Error(`Failed to save user info: ${response.statusText}`);

            const savedUser = await response.json();
            if (!savedUser.id) throw new Error('Server did not return a valid user ID');

            setUserInfo(prev => ({ ...prev, id: savedUser.id }));
            setSelectedComponents([]);
            setCompatibleApps([]);
            setSelectedType(null);
            setGameStartTime(Date.now());
            setScreen('game');
        } catch (error) {
            console.error('Error saving user info:', error);
            alert('Failed to save your information. Please check your network and try again.');
        }
    };

    const handleBack = () => {
        setUserInfo({ name: '', company: '', email: '', phone: '' });
        setErrors({});
        setTermsAccepted(false);
        setScreen('welcome');
    };

    // 게임 로직
    const handleTypeSelect = (type: 'motor' | 'gearbox' | 'encoder' | 'drive' | 'bearing') => {
        setSelectedType(type);
    };

    const handleComponentSelect = (component: GameComponent) => {
        const existing = selectedComponents.find(c => c.type === component.type);
        if (existing && existing.id === component.id) {
            setSelectedComponents(selectedComponents.filter(c => c.id !== component.id));
        } else {
            const filtered = selectedComponents.filter(c => c.type !== component.type);
            setSelectedComponents([...filtered, component]);
        }
    };

    const removeComponent = (id: string) => {
        setSelectedComponents(selectedComponents.filter(c => c.id !== id));
    };

    const handleSubmit = async () => {
        if (selectedComponents.length < 3) {
            alert('You must select at least 3 components.');
            return;
        }

        if (!userInfo.id) {
            alert('User ID is not set. Please try again.');
            return;
        }

        const apps = checkCompatibility(selectedComponents);
        setCompatibleApps(apps);

        const completionTime = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
        const componentScore = (selectedComponents.length / 5) * 0.5; // 최대 0.5
        const appScore = Math.min(apps.length * 0.25, 0.5); // 최대 0.5
        const successRate = Number((componentScore + appScore).toFixed(2)); // 0.00 ~ 1.00

        const gameResultPayload: GameResult = {
            userId: userInfo.id,
            selectedComponents: selectedComponents.map(c => c.id),
            compatibleApplications: apps,
            successRate,
            completionTime,
        };

        try {
            const response = await fetch(`${backendUrl}/api/game/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gameResultPayload),
            });
            if (!response.ok) throw new Error('Failed to save game result');

            setScreen('result');
            if (apps.length > 0) {
                setTimeout(() => {
                    setShowEmailModal(true);
                }, 2000);
            }
        } catch (error) {
            console.error('Error saving game result:', error);
            alert('Failed to save game result. Please try again.');
        }
    };

    const handlePlayAgain = () => {
        setSelectedComponents([]);
        setSelectedType(null);
        setCompatibleApps([]);
        setGameStartTime(Date.now());
        setScreen('game');
    };

    const sendEmail = async () => {
        if (!userInfo.email) {
            alert('No email address available.');
            return;
        }

        const appsHtml = compatibleApps.map(app => `<p>🏆 ${app}</p>`).join('');

        const emailHtml = `
            <div style="text-align: center; font-family: Arial, sans-serif;">
                <h2>Result</h2>
                <br>
                <p>Compatible Applications:</p>
                <br>
                ${appsHtml}
                <br>
                <p style="font-size:0.8em; color:#888;">© LeBot</p>
            </div>
        `;

        try {
            const response = await fetch(`${backendUrl}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: userInfo.email,
                    subject: 'Your Actuator Game Result',
                    body: emailHtml
                })
            });
            if (!response.ok) throw new Error('Failed to send email');

            alert('Email has been sent successfully!');
            setShowEmailModal(false);
        } catch (error) {
            console.error(error);
            alert('Failed to send email.');
        }
    };

    // 리더보드 데이터 가져오기
    useEffect(() => {
        if (screen === 'leaderboard') {
            const fetchLeaderboard = async () => {
                try {
                    const response = await fetch(`${backendUrl}/api/game/leaderboard`, { method: 'GET' });
                    if (!response.ok) throw new Error('Failed to fetch leaderboard data');

                    const data = await response.json();
                    setLeaderboardData(data);
                } catch (error) {
                    console.error('Error fetching leaderboard:', error);
                    alert('Failed to load leaderboard. Please try again.');
                }
            };

            fetchLeaderboard();
        }
    }, [screen]);

    // 성공률을 별점으로 변환
    const renderStars = (successRate: number) => '⭐'.repeat(Math.round(successRate * 5));

    // 타입 배열 (타입 안정성 강화)
    const types = ['motor', 'gearbox', 'encoder', 'drive', 'bearing'] as const;

    return (
        <div className="app-container">
            <div className="card">
                {screen === 'welcome' && (
                    <>
                        <h1>Welcome!</h1>
                        <p>Build Your Perfect Actuator</p>
                        <button className="button" onClick={handleStartGame}>
                            START GAME
                        </button>
                        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                            Powered by LeBot
                        </p>
                    </>
                )}

                {screen === 'info' && (
                    <>
                        <h2>Enter Your Information</h2>
                        <input type="text" placeholder="Name" value={userInfo.name} onChange={e => handleInputChange('name', e.target.value)} />
                        <p className="error">{errors.name || '\u00A0'}</p>

                        <input type="text" placeholder="Company" value={userInfo.company} onChange={e => handleInputChange('company', e.target.value)} />
                        <p className="error">{errors.company || '\u00A0'}</p>

                        <input type="email" placeholder="Email" value={userInfo.email} onChange={e => handleInputChange('email', e.target.value)} />
                        <p className="error">{errors.email || '\u00A0'}</p>

                        <input type="tel" placeholder="Phone (+CountryCodeNumber)" value={userInfo.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                        <p className="error">{errors.phone || '\u00A0'}</p>

                        <div className="terms-container">
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={e => setTermsAccepted(e.target.checked)}
                                id="terms"
                            />
                            <label htmlFor="terms">I agree to the Terms and Conditions</label>
                        </div>

                        <div>
                            <button className="button outline" onClick={handleBack}>BACK</button>
                            <button className="button" onClick={handleContinue}>CONTINUE</button>
                        </div>
                    </>
                )}

                {screen === 'game' && (
                    <>
                        <h2>Select Components</h2>
                        <div className="game-container">
                            <div className="types-panel">
                                {types.map(type => (
                                    <button
                                        key={type}
                                        className={`type-btn ${selectedType === type ? 'active' : ''}`}
                                        onClick={() => handleTypeSelect(type)}
                                    >
                                        {type.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <div className="components-panel">
                                {selectedType &&
                                    COMPONENTS.filter(c => c.type === selectedType).map(c => (
                                        <div
                                            key={c.id}
                                            className={`component-item ${selectedComponents.some(sel => sel.id === c.id) ? 'selected' : ''}`}
                                            onClick={() => handleComponentSelect(c)}
                                        >
                                            {c.icon} {c.name}
                                        </div>
                                    ))}
                            </div>
                            <div className="assembly-zone">
                                <h3>Selected Components</h3>
                                {selectedComponents.map(c => (
                                    <div key={c.id} className="selected-item" onClick={() => removeComponent(c.id)}>
                                        {c.icon} {c.name} ❌
                                    </div>
                                ))}
                                <p>Selected: {selectedComponents.length}/5</p>
                                <button className="button" onClick={handleSubmit}>SUBMIT</button>
                            </div>
                        </div>
                    </>
                )}

                {screen === 'result' && (
                    <>
                        {compatibleApps.length > 0 ? (
                            <>
                                <h2>Result</h2>
                                <p>Compatible Applications:</p>
                                {compatibleApps.map(app => (<p key={app}>🏆 {app}</p>))}
                                <button className="button outline" onClick={handlePlayAgain}>PLAY AGAIN</button>

                                {showEmailModal && (
                                    <div className="modal">
                                        <div className="modal-content">
                                            <p>Do you want to send the current result to your email?</p>
                                            <button className="button outline" onClick={() => setShowEmailModal(false)}>Cancel</button>
                                            <button className="button" onClick={sendEmail}>Send</button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <p>Oops!</p>
                                <p>❌ No compatible applications found.</p>
                                <p>Your combination doesn't match any standard robot applications</p>
                                <button className="button outline" onClick={handlePlayAgain}>TRY AGAIN</button>
                            </>
                        )}
                        <button className="button" onClick={() => setScreen('leaderboard')}> VIEW RECORD </button>
                    </>
                )}

                {screen === 'leaderboard' && (
                    <>
                        <h2>Challenge Records</h2>
                        <p>🏆 TOP PERFORMERS TODAY</p>
                        {leaderboardData.length > 0 ? (
                            leaderboardData.map((entry, index) => (
                                <p key={index}>
                                    {index + 1}. {entry.name} - {entry.company} - {Math.round(entry.avg_success_rate * 5)}/5 {renderStars(entry.avg_success_rate)} ({entry.attempts} attempts)
                                </p>
                            ))
                        ) : (
                            <p>Loading...</p>
                        )}
                        <div>
                            <button className="button outline" onClick={() => setScreen('welcome')}>NEW GAME</button>
                            <button className="button" onClick={() => setScreen('result')}>BACK</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}