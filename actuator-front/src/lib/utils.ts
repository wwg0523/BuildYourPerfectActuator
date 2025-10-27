import compatibilityMatrixJson from '../data/compatibilityMatrix.json';

export interface GameComponent {
    id: string;
    name: string;
    type: 'motor' | 'gearbox' | 'encoder' | 'drive' | 'bearing';
    icon: string;
    description: string;
}

export interface UserInfo {
    id?: string;
    name: string;
    company: string;
    email: string;
    phone: string;
}

export interface CompatibilityMatrix {
    [key: string]: string[];
}

export interface GameResult {
    userId: string;
    selectedComponents: string[];
    compatibleApplications: string[];
    successRate: number;
    completionTime: number;
}

export interface LeaderboardEntry {
    name: string;
    company: string;
    avg_success_rate: number;
    attempts: number;
}

export interface IdleDetector {
    timeoutDuration: number;
    warningDuration: number;
    currentTimeout: ReturnType<typeof setTimeout> | null;
    warningTimeout: ReturnType<typeof setTimeout> | null;
}

export const COMPONENTS: GameComponent[] = [
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

export const compatibilityMatrix: Record<string, string[]> = compatibilityMatrixJson;

export function checkCompatibility(selectedComponents: GameComponent[]): string[] {
    const selectedIds = selectedComponents.map(c => c.id);
    return Object.keys(compatibilityMatrix).filter(app => {
        const requiredIds = compatibilityMatrix[app];
        return requiredIds.every(id => selectedIds.includes(id));
    });
}