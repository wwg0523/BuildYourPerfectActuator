import React, { useState, useEffect } from 'react';
import './styles/main.scss';
import { motion, Variants } from 'framer-motion';
import CryptoJS from 'crypto-js';
import myPngImage from './components/le-bot-logo-light.png';
import compatibilityMatrixJson from './data/compatibilityMatrix.json';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://actuator-back:4000';
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-secret-key-32bytes-long!!!';

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

interface CompatibilityMatrix {
    [key: string]: string[];
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
    const [showModal, setShowModal] = useState(false);
    const [showHintModal, setShowHintModal] = useState(false);
    const [hintMessage, setHintMessage] = useState('');

    // 정규식
    const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\+?[1-9]\d{8,14}$/;

    // 입력 유효성 검사
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
        else if (!phoneRegex.test(userInfo.phone)) newErrors.phone = 'Invalid phone number';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 입력 핸들러
    const handleInputChange = (field: keyof UserInfo, value: string) => {
        setUserInfo(prev => ({ ...prev, [field]: value }));
    };

    // ----- 약관 동의 모달 핸들러 -----
    const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (termsAccepted) {
            setTermsAccepted(false);
            return;
        }
        setShowModal(true);
    };

    const confirmAgree = () => {
        setTermsAccepted(true);
        setShowModal(false);
    };

    const cancelAgree = () => setShowModal(false);

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
            // 모든 필드 암호화
            const encryptedName = CryptoJS.AES.encrypt(userInfo.name, ENCRYPTION_KEY).toString();
            const encryptedCompany = CryptoJS.AES.encrypt(userInfo.company, ENCRYPTION_KEY).toString();
            const encryptedEmail = CryptoJS.AES.encrypt(userInfo.email, ENCRYPTION_KEY).toString();
            const encryptedPhone = CryptoJS.AES.encrypt(userInfo.phone, ENCRYPTION_KEY).toString();

            // userInfo에 암호화된 값 저장
            setUserInfo({
                name: encryptedName,
                company: encryptedCompany,
                email: encryptedEmail,
                phone: encryptedPhone,
            });

            // localStorage 백업 (새로고침 대비)
            localStorage.setItem(
                'encryptedUserInfo',
                JSON.stringify({
                name: encryptedName,
                company: encryptedCompany,
                email: encryptedEmail,
                phone: encryptedPhone,
                })
            );

            setSelectedComponents([]);
            setCompatibleApps([]);
            setSelectedType(null);
            setGameStartTime(Date.now());
            setScreen('game');
        } catch (error) {
            console.error('Error in continue:', error);
            alert('An error occurred during encryption. Please try again.');
        }
    };

    const handleBack = () => {
        setUserInfo({ name: '', company: '', email: '', phone: '' });
        setErrors({});
        setTermsAccepted(false);
        localStorage.removeItem('encryptedUserInfo');
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

    const handleSubmit = async () => {
        if (selectedComponents.length < 3) {
            alert('You must select at least 3 components.');
            return;
        }

        // 암호화된 데이터 복호화
        let decryptedData: Partial<UserInfo> = {};
        try {
            const storedEncrypted = localStorage.getItem('encryptedUserInfo');
            const encryptedData = storedEncrypted
                ? JSON.parse(storedEncrypted)
                : {
                    name: userInfo.name,
                    company: userInfo.company,
                    email: userInfo.email,
                    phone: userInfo.phone,
                };

            if (!encryptedData.email) {
                alert('No encrypted data found. Please start over.');
                return;
            }

            decryptedData = {
                name: CryptoJS.AES.decrypt(encryptedData.name, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8),
                company: CryptoJS.AES.decrypt(encryptedData.company, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8),
                email: CryptoJS.AES.decrypt(encryptedData.email, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8),
                phone: CryptoJS.AES.decrypt(encryptedData.phone, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8),
            };

            if (!decryptedData.name || !decryptedData.company || !decryptedData.email || !decryptedData.phone) {
                throw new Error('Failed to decrypt one or more fields');
            }
        } catch (error) {
            console.error('Decryption error:', error);
            alert('Failed to decrypt data. Please start over.');
            return;
        }

        try {
            // 1. 사용자 정보 저장
            const userToSave = {
                ...decryptedData,
                timestamp: new Date(),
            };

            const userResponse = await fetch(`${backendUrl}/api/game/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userToSave),
            });
            if (!userResponse.ok) throw new Error(`Failed to save user info: ${userResponse.statusText}`);

            const savedUser = await userResponse.json();
            if (!savedUser.id) throw new Error('Server did not return a valid user ID');

            setUserInfo((prev) => ({ ...prev, id: savedUser.id }));

            // 2. 게임 결과 계산 및 저장
            const apps = checkCompatibility(selectedComponents);
            setCompatibleApps(apps);

            const completionTime = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
            const componentScore = (selectedComponents.length / 5) * 0.5; // 최대 0.5
            const appScore = Math.min(apps.length * 0.25, 0.5); // 최대 0.5
            const successRate = Number((componentScore + appScore).toFixed(2)); // 0.00 ~ 1.00

            const gameResultPayload: GameResult = {
                userId: savedUser.id,
                selectedComponents: selectedComponents.map(c => c.id),
                compatibleApplications: apps,
                successRate,
                completionTime,
            };

            const response = await fetch(`${backendUrl}/api/game/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gameResultPayload),
            });
            if (!response.ok) throw new Error('Failed to save game result');

            // 3. 테이블에서 이메일 가져오기
            if (apps.length > 0) {
                let emailForSending = '';
                try {
                    const fetchEmail = await fetch(`${backendUrl}/api/user/${savedUser.id}`);
                    if (!fetchEmail.ok) throw new Error('Failed to fetch email');
                    const { email } = await fetchEmail.json();
                    emailForSending = email;
                } catch (error) {
                    console.warn('Failed to fetch email from server, using decrypted email:', error);
                    emailForSending = decryptedData.email!;
                }

                // 4. 이메일 전송
                const appsHtml = apps.map((app) => `<p>🏆 ${app}</p>`).join('');
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

                const emailResponse = await fetch(`${backendUrl}/api/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: emailForSending,
                        subject: 'Your Actuator Game Result',
                        body: emailHtml,
                    }),
                });
                if (!emailResponse.ok) {
                    console.warn('Email sending failed, but proceeding to result screen');
                }else {
                    console.log('Email sent successfully to:', emailForSending);
                    localStorage.removeItem('encryptedUserInfo');
                }
            } else {
                console.log('No compatible apps found, skipping email sending.');
            }

            // 5. 결과 화면으로 이동
            setScreen('result');
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

    const removeComponent = (id: string) => {
        setSelectedComponents((prev) => prev.filter((c) => c.id !== id));
    };

    const generateHint = () => {
        const apps = Object.keys(compatibilityMatrixJson);
        const randomApp = apps[Math.floor(Math.random() * apps.length)];
        const components = (compatibilityMatrixJson as CompatibilityMatrix)[randomApp];
        const formattedComponents = components
            .map((id: string) => {
                const component = COMPONENTS.find((c) => c.id === id);
                return component ? component.name : id;
            })
            .join(', ');
        const message = `You can build a [${randomApp
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())}] using ${formattedComponents}.`;
        setHintMessage(message);
        setShowHintModal(true);
    };

    // 리더보드 데이터 가져오기
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
    useEffect(() => {
        if (screen === 'leaderboard') {
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
                        <motion.h1
                            custom={0}
                            initial="hidden"
                            animate="visible"
                            variants={textVariants}
                            style={{ margin: '20px', fontSize: '2.5rem', fontWeight: 'bold' }}
                        >
                            Welcome!
                        </motion.h1>

                        <motion.p
                            variants={textVariants}
                            style={{ margin: '1rem 0', fontSize: '1.25rem', color: '#4b5563' }}
                        >
                            Build Your Perfect Actuator
                        </motion.p>

                        <motion.button
                            className="button"
                            onClick={handleStartGame}
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
                                id="terms"
                                checked={termsAccepted}
                                onClick={handleCheckboxClick}
                                readOnly
                            />
                            <label htmlFor="terms">
                                I agree to the Terms and Conditions
                            </label>
                        </div>

                        {showModal && (
                            <div className="modal-overlay terms-modal-overlay" onClick={cancelAgree}>
                                <div className="modal terms-modal" onClick={e => e.stopPropagation()}>
                                    <h3>Terms Agreement</h3>
                                    <p>Do you agree to the Terms of Service and Privacy Policy?</p>
                                    <motion.p
                                        className="info-box"
                                    >
                                        The game results will be sent to the email you provided.
                                        <br />
                                        User information will be collected during this process.
                                        <br />
                                        If you wish to delete your data,
                                        <br />
                                        you can do so from the results screen.
                                    </motion.p>
                                    <div className="modal-buttons">
                                        <button className="button outline" onClick={cancelAgree}>Cancel</button>
                                        <button className="button" onClick={confirmAgree}>Confirm</button>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                <button className="button" onClick={() => (window.open('https://lebot.co.kr', '_blank'))}
                >
                  VISIT OUR SITE
                </button>
                            </>
                        ) : (
                            <>
                                <p>Oops!</p>
                                <p>❌ No compatible applications found.</p>
                                <p>Your combination doesn't match any standard robot applications</p>
                                <button className="button outline" onClick={handlePlayAgain}>TRY AGAIN</button>
                                <button className="button outline" onClick={generateHint}>GET A HINT</button>
                            </>
                        )}
                        <button className="button" onClick={() => setScreen('leaderboard')}> VIEW RECORD </button>
                        {showHintModal && (
                            <div className="modal-overlay terms-modal-overlay" onClick={() => setShowHintModal(false)}>
                                <div className="modal terms-modal" onClick={(e) => e.stopPropagation()}>
                                    <h3>Hint</h3>
                                    <motion.p className="info-box">💡 {hintMessage}</motion.p>
                                    <div className="modal-buttons">
                                        <button className="button" onClick={() => setShowHintModal(false)}>Close</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {screen === 'leaderboard' && (
                    <>
                        <h2>Challenge Records</h2>
                        <p>🏆 TOP PERFORMERS TODAY</p>
                        {leaderboardData.length > 0 ? (
                            leaderboardData.map((entry, index) => (
                                <p key={index}>
                                    {index + 1}. {entry.name.slice(0, entry.name.length - 2) + '**'} - {entry.company} - {Math.round(entry.avg_success_rate * 5)}/5 {renderStars(entry.avg_success_rate)} ({entry.attempts} attempts)
                                </p>
                            ))
                        ) : (
                            <p>No leaderboard data available.</p>
                        )}
                        <div>
                            <button className="button outline" onClick={() => setScreen('welcome')}>NEW GAME</button>
                            <button className="button outline" onClick={fetchLeaderboard}>REFRESH</button>
                            <button className="button" onClick={() => setScreen('result')}>BACK</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}