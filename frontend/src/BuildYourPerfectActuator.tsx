import React, { useState } from 'react';
import './styles/main.scss';

type ComponentItem = {
    id: string;
    name: string;
    icon: string;
};

const COMPONENTS: ComponentItem[] = [
    { id: 'motor', name: 'Motor', icon: '🔧' },
    { id: 'gearbox', name: 'Gearbox', icon: '⚙️' },
    { id: 'encoder', name: 'Encoder', icon: '📊' },
    { id: 'drive', name: 'Drive', icon: '🔌' },
    { id: 'bearing', name: 'Bearing', icon: '⚡' },
];

export default function BuildYourPerfectActuator() {
    const [screen, setScreen] = useState<'welcome' | 'info' | 'game' | 'result' | 'leaderboard'>('welcome');

    // 사용자 입력 상태
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // 게임 화면 상태
    const [selectedComponents, setSelectedComponents] = useState<ComponentItem[]>([]);

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
        // 정보 입력 화면으로 이동하면서 입력 필드와 에러 초기화
        setName('');
        setCompany('');
        setEmail('');
        setPhone('');
        setErrors({});
        setScreen('info');
    };

    const handleContinue = () => {
        if (validate()) {
            // 게임 화면으로 이동하면서 선택된 컴포넌트 초기화
            setSelectedComponents([]);
            setScreen('game');
        }
    };

    const handleBack = () => {
        // Welcome 화면으로 돌아가면서 입력 필드와 에러 초기화
        setName('');
        setCompany('');
        setEmail('');
        setPhone('');
        setErrors({});
        setScreen('welcome');
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, component: ComponentItem) => {
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
            setScreen('result');
        } else {
            alert('최소 3개 이상의 컴포넌트를 선택해야 합니다.');
        }
    };

    const handlePlayAgain = () => {
        setSelectedComponents([]); // 선택된 컴포넌트 초기화
        setScreen('game'); // 게임 화면으로 이동
    };

    return (
        <div className="app-container">
            <div className="card">
                {screen === 'welcome' && (
                    <>
                        <h1>Welcome!</h1>
                        <p>Build Your Perfect Actuator</p>
                        <button className="button" onClick={handleStartGame}>START GAME</button>
                        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>Powered by 르봇</p>
                    </>
                )}

                {screen === 'info' && (
                    <>
                        <h2>Enter Your Information</h2>

                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <p className="error">{errors.name || '\u00A0'}</p>

                        <input
                            type="text"
                            placeholder="Company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                        />
                        <p className="error">{errors.company || '\u00A0'}</p>

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <p className="error">{errors.email || '\u00A0'}</p>

                        <input
                            type="tel"
                            placeholder="Phone (+CountryCodeNumber)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <p className="error">{errors.phone || '\u00A0'}</p>

                        <div>
                            <button className="button outline" onClick={handleBack}>BACK</button>
                            <button className="button" onClick={handleContinue}>CONTINUE</button>
                        </div>
                    </>
                )}

                {screen === 'game' && (
                    <>
                        <h2>Components & Assembly</h2>
                        <div className="game-container">
                            {/* 좌측: Components Panel */}
                            <div className="components-panel">
                                {COMPONENTS.map(c => (
                                    <div
                                        key={c.id}
                                        className={`component-item ${selectedComponents.find(s => s.id === c.id) ? 'selected' : ''}`}
                                        draggable={!selectedComponents.find(s => s.id === c.id)}
                                        onDragStart={(e) => handleDragStart(e, c)}
                                    >
                                        <span className="icon">{c.icon}</span>
                                        <span className="name">{c.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* 우측: Assembly Zone */}
                            <div className="assembly-zone">
                                <div 
                                    className="drop-zone" 
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    📱 [ DROP ZONE ]
                                </div>
                                <div className="selected-list">
                                    {selectedComponents.map(c => (
                                        <div 
                                            key={c.id} 
                                            className="selected-item"
                                            onClick={() => removeComponent(c.id)}
                                        >
                                            {c.icon} {c.name} <span className="remove-icon">❌</span>
                                        </div>
                                    ))}
                                </div>
                                <p>Selected: {selectedComponents.length}/5</p>
                                <button className="button" onClick={handleSubmit}>SUBMIT</button>
                            </div>
                        </div>
                    </>
                )}

                {screen === 'result' && (
                    <>
                        <h2>Result</h2>
                        <p>Your Actuator Can Be Used For:</p>
                        <p>🤖 Robot Arm Joint</p>
                        <p>🚗 Automotive Steering</p>
                        <p>🏭 Industrial Automation</p>
                        <div>
                            <button className="button outline" onClick={handlePlayAgain}>PLAY AGAIN</button>
                            <button className="button" onClick={() => setScreen('leaderboard')}>VIEW RECORD</button>
                        </div>
                    </>
                )}

                {screen === 'leaderboard' && (
                    <>
                        <h2>Challenge Records</h2>
                        <p>🏆 TOP PERFORMERS TODAY</p>
                        <p>1. John D. - ABC Corp - 5/5 ⭐⭐⭐⭐⭐</p>
                        <p>2. Sarah K. - XYZ Ltd - 4/5 ⭐⭐⭐⭐</p>
                        <p>3. Mike L. - Tech Co - 4/5 ⭐⭐⭐⭐⭐</p>
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