import React from 'react';
import { GameComponent } from '../lib/utils';

interface GameProps {
    selectedComponents: GameComponent[];
    selectedType: 'motor' | 'gearbox' | 'encoder' | 'drive' | 'bearing' | null;
    handleTypeSelect: (type: 'motor' | 'gearbox' | 'encoder' | 'drive' | 'bearing') => void;
    handleComponentSelect: (component: GameComponent) => void;
    handleSubmit: () => void;
    removeComponent: (id: string) => void;
}

const types = ['motor', 'gearbox', 'encoder', 'drive', 'bearing'] as const;
const COMPONENTS: GameComponent[] = [
    { id: 'servo_motor', name: 'Servo Motor', type: 'motor', icon: '🔧', description: 'Servo motor for precise control' },
    { id: 'stepper_motor', name: 'Stepper Motor', type: 'motor', icon: '🔧', description: 'Stepper motor for incremental motion' },
    { id: 'ac_motor', name: 'AC Motor', type: 'motor', icon: '🔧', description: 'AC motor for industrial automation' },
    { id: 'harmonic_gearbox', name: 'Harmonic Gearbox', type: 'gearbox', icon: '⚙️', description: 'High-precision gearbox' },
    { id: 'planetary_gearbox', name: 'Planetary Gearbox', type: 'gearbox', icon: '⚙️', description: 'High torque planetary gearbox' },
    { id: 'spur_gearbox', name: 'Spur Gearbox', type: 'gearbox', icon: '⚙️', description: 'Simple spur gearbox' },
    { id: 'absolute_encoder', name: 'Absolute Encoder', type: 'encoder', icon: '📊', description: 'Measures absolute position' },
    { id: 'optical_encoder', name: 'Optical Encoder', type: 'encoder', icon: '📊', description: 'High-precision optical encoder' },
    { id: 'incremental_encoder', name: 'Incremental Encoder', type: 'encoder', icon: '📊', description: 'Measures incremental rotation' },
    { id: 'servo_drive', name: 'Servo Drive', type: 'drive', icon: '🔌', description: 'Controls servo motor' },
    { id: 'stepper_drive', name: 'Stepper Drive', type: 'drive', icon: '🔌', description: 'Controls stepper motor' },
    { id: 'ac_drive', name: 'AC Drive', type: 'drive', icon: '🔌', description: 'Controls AC motor' },
    { id: 'ball_bearing', name: 'Ball Bearing', type: 'bearing', icon: '⚡', description: 'Reduces friction' },
    { id: 'roller_bearing', name: 'Roller Bearing', type: 'bearing', icon: '⚡', description: 'Supports radial load' },
    { id: 'thrust_bearing', name: 'Thrust Bearing', type: 'bearing', icon: '⚡', description: 'Supports axial load' },
];

const Game: React.FC<GameProps> = ({
    selectedComponents,
    selectedType,
    handleTypeSelect,
    handleComponentSelect,
    handleSubmit,
    removeComponent,
}) => {
    return (
        <>
            <h2>Select Components</h2>
            <div className="game-container">
                <div className="left-panel">
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
    );
};

export default Game;