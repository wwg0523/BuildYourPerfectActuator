import React, { useState } from 'react';
import './styles/main.scss';

interface GameComponent {
    id: string;
    name: string;
    type: 'motor' | 'gearbox' | 'encoder' | 'drive' | 'bearing';
    icon: string;
    description: string;
}

interface UserInfo {
    name: string;
    company: string;
    email: string;
    phone: string;
    timestamp: Date;
}

interface GameResult {
    userId: string;
    selectedComponents: GameComponent[];
    compatibleApplications: string[];
    successRate: number;
    completionTime: number;
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
const compatibilityMatrix: Record<string, string[]> = {
    robot_arm_joint: ['servo_motor', 'harmonic_gearbox', 'absolute_encoder'],
    automotive_steering: ['stepper_motor', 'planetary_gearbox', 'optical_encoder'],
    industrial_automation: ['ac_motor', 'spur_gearbox', 'incremental_encoder'],
    precision_robotics: ['servo_motor', 'planetary_gearbox', 'absolute_encoder'],
    automated_conveyor: ['ac_motor', 'spur_gearbox', 'incremental_encoder'],
    medical_robot_arm: ['servo_motor', 'harmonic_gearbox', 'optical_encoder'],
    cnc_machine: ['ac_motor', 'spur_gearbox', 'incremental_encoder'],
    drone_actuator: ['stepper_motor', 'planetary_gearbox', 'absolute_encoder'],
};

// ------------------- HELPER -------------------
function checkCompatibility(selectedComponents: GameComponent[]): string[] {
    const selectedIds = selectedComponents.map(c => c.id);
    return Object.keys(compatibilityMatrix).filter(app => {
        const requiredIds = compatibilityMatrix[app];
        const countMatched = requiredIds.filter(id => selectedIds.includes(id)).length;
        return countMatched >= 3; // 최소 3개 이상 부합 시 호환
    });
}

export default function BuildYourPerfectActuator() {
    const [screen, setScreen] = useState<'welcome' | 'info' | 'game' | 'result' | 'leaderboard'>('welcome');

    // 사용자 입력 상태
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // 게임 화면 상태
    const [selectedComponents, setSelectedComponents] = useState<GameComponent[]>([]);
    const [selectedType, setSelectedType] = useState<'motor' | 'gearbox' | 'encoder' | 'drive' | 'bearing' | null>(null);
    const [compatibleApps, setCompatibleApps] = useState<string[]>([]);

    // 이메일/전화번호 정규식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) newErrors.name = 'Name is required';
        if (!company.trim()) newErrors.company = 'Company is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!emailRegex.test(email)) newErrors.email = 'Invalid email format';
        if (!phone.trim()) newErrors.phone = 'Phone is required';
        else if (!phoneRegex.test(phone)) newErrors.phone = 'Invalid phone number';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStartGame = () => {
        setName('');
        setCompany('');
        setEmail('');
        setPhone('');
        setErrors({});
        setScreen('info');
    };

    const handleContinue = async () => {
        if (validate()) {
            try {
                // DB에 사용자 정보 저장
                const response = await fetch('http://localhost:4000/api/game-users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, company, email, phone }),
                });

                if (!response.ok) {
                    throw new Error('Failed to save user info');
                }

                // 성공 시 게임 화면으로 이동
                setSelectedComponents([]);
                setCompatibleApps([]);
                setSelectedType(null);
                setScreen('game');
            } catch (error) {
                console.error(error);
                alert('Failed to save your information. Please try again.');
            }
        }
    };

    const handleBack = () => {
        setName('');
        setCompany('');
        setEmail('');
        setPhone('');
        setErrors({});
        setScreen('welcome');
    };

    const handleTypeSelect = (type: 'motor' | 'gearbox' | 'encoder' | 'drive' | 'bearing') => {
        setSelectedType(type);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, component: GameComponent) => {
        e.dataTransfer.setData('componentId', component.id);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('componentId');
        const component = COMPONENTS.find(c => c.id === id);
        if (component && !selectedComponents.find(s => s.id === id) && selectedComponents.length < 5) {
            setSelectedComponents([...selectedComponents, component]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const removeComponent = (id: string) => {
        setSelectedComponents(selectedComponents.filter(c => c.id !== id));
    };

    const handleSubmit = () => {
        if (selectedComponents.length >= 3) {
            const apps = checkCompatibility(selectedComponents);
            setCompatibleApps(apps);
            setScreen('result');
        } else {
            alert('You must select at least 3 components.');
        }
    };

    const handlePlayAgain = () => {
        setSelectedComponents([]);
        setSelectedType(null);
        setCompatibleApps([]);
        setScreen('game');
    };

    return (
        <div className="app-container">
            <div className="card">
                {screen === 'welcome' && (
                    <>
                        <h1>Welcome!</h1>
                        <p>Build Your Perfect Actuator</p>
                        <button className="button" onClick={handleStartGame}>START GAME</button>
                        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>Powered by LeBot</p>
                    </>
                )}

                {screen === 'info' && (
                    <>
                        <h2>Enter Your Information</h2>

                        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                        <p className="error">{errors.name || '\u00A0'}</p>

                        <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
                        <p className="error">{errors.company || '\u00A0'}</p>

                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <p className="error">{errors.email || '\u00A0'}</p>

                        <input type="tel" placeholder="Phone (+CountryCodeNumber)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <p className="error">{errors.phone || '\u00A0'}</p>

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
                            {/* 좌측: 타입 선택 */}
                            <div className="types-panel">
                                {['motor', 'gearbox', 'encoder', 'drive', 'bearing'].map(type => (
                                    <button
                                        key={type}
                                        className={`type-btn ${selectedType === type ? 'active' : ''}`}
                                        onClick={() => handleTypeSelect(type as any)}
                                    >
                                        {type.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {/* 중간: 하위 부품 */}
                            <div className="components-panel">
                                {selectedType && COMPONENTS.filter(c => c.type === selectedType).map(c => (
                                    <div key={c.id} className="component-item" draggable onDragStart={(e) => handleDragStart(e, c)}>
                                        {c.icon} {c.name}
                                    </div>
                                ))}
                            </div>

                            {/* 우측: Assembly */}
                            <div className="assembly-zone" onDragOver={handleDragOver} onDrop={handleDrop}>
                                <h3>Drop Zone</h3>
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
                                {compatibleApps.map(app => (
                                    <p key={app}>🏆 {app}</p>
                                ))}
                                <button className="button outline" onClick={handlePlayAgain}>PLAY AGAIN</button>
                            </>
                        ) : (
                            <>
                                <p>Oops!</p>
                                <p>❌ No compatible applications found.</p>
                                <p>Your combination doesn't match<br/>any standard robot applications</p>
                                <button className="button outline" onClick={handlePlayAgain}>TRY AGAIN</button>
                            </>
                        )}
                        <button className="button" onClick={() => setScreen('leaderboard')}>VIEW RECORD</button>
                    </>
                )}

                {screen === 'leaderboard' && (
                    <>
                        <h2>Challenge Records</h2>
                        <p>🏆 TOP PERFORMERS TODAY</p>
                        <p>1. John D. - ABC Corp - 5/5 ⭐⭐⭐⭐⭐</p>
                        <p>2. Sarah K. - XYZ Ltd - 4/5 ⭐⭐⭐⭐</p>
                        <p>3. Mike L. - Tech Co - 4/5 ⭐⭐⭐⭐</p>
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