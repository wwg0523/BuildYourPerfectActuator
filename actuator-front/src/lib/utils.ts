import compatibilityMatrixJson from '../data/compatibilityMatrix.json';

export interface GameComponent {
    id: string;
    name: string;
    type: 'motor' | 'gearbox' | 'encoder' | 'drive' | 'bearing' | 'sensor' | 'actuator';
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

export interface IdleDetector {
    timeoutDuration: number;
    warningDuration: number;
    currentTimeout: ReturnType<typeof setTimeout> | null;
    warningTimeout: ReturnType<typeof setTimeout> | null;
}

export const COMPONENTS: GameComponent[] = [
    { id: 'servo_motor', name: 'Servo Motor', type: 'motor', icon: '🔧', description: 'Servo motor for precise control' },
    { id: 'ac_motor', name: 'AC Motor', type: 'motor', icon: '🔧', description: 'AC motor for industrial automation' },
    { id: 'wheel_motor', name: 'Wheel Motor', type: 'motor', icon: '🔧', description: 'Motor for mobile robot wheels' },
    { id: 'pan_tilt_motor', name: 'Pan-Tilt Motor', type: 'motor', icon: '🔧', description: 'Motor for camera positioning' },
    { id: 'harmonic_gearbox', name: 'Harmonic Gearbox', type: 'gearbox', icon: '⚙️', description: 'High-precision gearbox' },
    { id: 'speed_reducer', name: 'Speed Reducer', type: 'gearbox', icon: '⚙️', description: 'Reduces motor speed' },
    { id: 'absolute_encoder', name: 'Absolute Encoder', type: 'encoder', icon: '📊', description: 'Measures absolute position' },
    { id: 'optical_encoder', name: 'Optical Encoder', type: 'encoder', icon: '📊', description: 'High-precision optical encoder' },
    { id: 'wheel_encoder', name: 'Wheel Encoder', type: 'encoder', icon: '📊', description: 'Encoder for wheel rotation' },
    { id: 'belt_drive', name: 'Belt Drive', type: 'drive', icon: '🔌', description: 'Drive for conveyor systems' },
    { id: 'differential_drive', name: 'Differential Drive', type: 'drive', icon: '🔌', description: 'Drive for mobile robots' },
    { id: 'precision_bearing', name: 'Precision Bearing', type: 'bearing', icon: '⚡', description: 'High-precision bearing' },
    { id: 'slip_ring', name: 'Slip Ring', type: 'actuator', icon: '⚡', description: 'Continuous rotation actuator' },
    { id: 'linear_actuator', name: 'Linear Actuator', type: 'actuator', icon: '⚡', description: 'Linear motion actuator' },
    { id: 'force_sensor', name: 'Force Sensor', type: 'sensor', icon: '📏', description: 'Measures force in grippers' },
    { id: 'proximity_sensor', name: 'Proximity Sensor', type: 'sensor', icon: '📏', description: 'Detects nearby objects' },
];

export const compatibilityMatrix: Record<string, string[]> = compatibilityMatrixJson;

export function checkCompatibility(selectedComponents: GameComponent[]): string[] {
    const selectedIds = selectedComponents.map(c => c.id);
    return Object.keys(compatibilityMatrix).filter(app => {
        const requiredIds = compatibilityMatrix[app];
        return requiredIds.every(id => selectedIds.includes(id));
    });
}

export interface RobotPart {
    id: string;
    name: string;
    description: string;
    image: string;
    correctComponents: string[];
    category: 'joint' | 'gripper' | 'base' | 'sensor' | 'actuator';
}

export interface GameQuestion {
    id: string;
    robotPart: RobotPart;
    availableComponents: GameComponent[];
    correctAnswers: string[];
    timeLimit: number;
}

export interface UserAnswer {
    questionId: string;
    selectedComponents: string[];
    isCorrect: boolean;
    answerTime: number;
    timestamp: Date;
}

export interface GameSession {
    sessionId: string;
    questions: GameQuestion[];
    currentQuestionIndex: number;
    answers: UserAnswer[];
    startTime: Date;
    endTime?: Date;
    totalScore: number;
}

export interface LeaderboardEntry {
    rank: number;
    playerName: string;
    company: string;
    score: number;
    completionTime: number;
    timeBonus: number;
    finalScore: number;
    playedAt: Date;
}

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export class GameEngine {
    private robotParts: RobotPart[] = [
        {
            id: 'robot_arm_joint',
            name: 'Robot Arm Joint',
            description: 'Select components needed for a precise robot arm joint',
            image: '/images/robot-arm-joint.png',
            correctComponents: ['servo_motor', 'harmonic_gearbox', 'absolute_encoder'],
            category: 'joint',
        },
        {
            id: 'gripper_mechanism',
            name: 'Gripper Mechanism',
            description: 'Choose components for a high-precision gripper',
            image: '/images/gripper.png',
            correctComponents: ['linear_actuator', 'force_sensor', 'precision_bearing'],
            category: 'gripper',
        },
        {
            id: 'mobile_base',
            name: 'Mobile Robot Base',
            description: 'Select drive components for autonomous navigation',
            image: '/images/mobile-base.png',
            correctComponents: ['wheel_motor', 'wheel_encoder', 'differential_drive'],
            category: 'base',
        },
        {
            id: 'vision_system',
            name: 'Vision System Mount',
            description: 'Components for camera positioning system',
            image: '/images/vision-mount.png',
            correctComponents: ['pan_tilt_motor', 'optical_encoder', 'slip_ring'],
            category: 'sensor',
        },
        {
            id: 'conveyor_system',
            name: 'Conveyor Belt Drive',
            description: 'Industrial conveyor belt actuator system',
            image: '/images/conveyor.png',
            correctComponents: ['ac_motor', 'speed_reducer', 'belt_drive'],
            category: 'actuator',
        },
    ];

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    private getComponentsByIds(ids: string[]): GameComponent[] {
        return COMPONENTS.filter(c => ids.includes(c.id));
    }

    private getRandomWrongComponents(category: string, count: number): GameComponent[] {
        const wrongComponents = COMPONENTS.filter(
            c => !this.robotParts.find(p => p.category === category)?.correctComponents.includes(c.id)
        );
        return this.shuffleArray(wrongComponents).slice(0, count);
    }

    generateGameSession(): GameSession {
        const selectedParts = this.shuffleArray(this.robotParts).slice(0, 5);
        const questions: GameQuestion[] = selectedParts.map((part, index) => ({
            id: `q_${index + 1}_${part.id}`,
            robotPart: part,
            availableComponents: this.generateComponentOptions(part),
            correctAnswers: part.correctComponents,
            timeLimit: 60,
        }));
        return {
            sessionId: generateUUID(),
            questions,
            currentQuestionIndex: 0,
            answers: [],
            startTime: new Date(),
            totalScore: 0,
        };
    }

    private generateComponentOptions(robotPart: RobotPart): GameComponent[] {
        const correctComponents = this.getComponentsByIds(robotPart.correctComponents);
        const wrongComponents = this.getRandomWrongComponents(robotPart.category, 5);
        return this.shuffleArray([...correctComponents, ...wrongComponents]).slice(0, 8);
    }

    checkAnswer(questionId: string, selectedComponents: string[]): boolean {
        const question = this.robotParts
            .flatMap(p => this.generateGameSession().questions)
            .find(q => q.id === questionId);
        if (!question) return false;
        const correctSet = new Set(question.correctAnswers);
        const selectedSet = new Set(selectedComponents);
        return (
            correctSet.size === selectedSet.size && [...correctSet].every(comp => selectedSet.has(comp))
        );
    }
}

export class LeaderboardManager {
    private backendUrl: string = process.env.REACT_APP_BACKEND_URL || 'http://actuator-back:4004';

    async submitScore(gameSession: GameSession, userInfo: UserInfo): Promise<LeaderboardEntry> {
        const baseScore = this.calculateScore(gameSession);
        const timeBonus = this.calculateTimeBonus(gameSession);
        const finalScore = baseScore * 100 + timeBonus;
        const entry: LeaderboardEntry = {
            rank: 0,
            playerName: this.maskPlayerName(userInfo.name),
            company: userInfo.company,
            score: baseScore,
            completionTime: gameSession.endTime
                ? gameSession.endTime.getTime() - gameSession.startTime.getTime()
                : 0,
            timeBonus,
            finalScore,
            playedAt: new Date(),
        };

        try {
            const response = await fetch(`${this.backendUrl}/api/game/leaderboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...entry, userId: userInfo.id }),
            });
            if (!response.ok) throw new Error('Failed to save leaderboard entry');
            entry.rank = await this.calculateRank(entry);
        } catch (error) {
            console.error('Error submitting leaderboard entry:', error);
        }
        return entry;
    }

    calculateScore(gameSession: GameSession): number {
        return gameSession.answers.filter(answer => answer.isCorrect).length;
    }

    calculateTimeBonus(gameSession: GameSession): number {
        if (!gameSession.endTime) return 0;
        const totalTime = gameSession.endTime.getTime() - gameSession.startTime.getTime();
        const averageTimePerQuestion = totalTime / gameSession.questions.length;
        const bonusPerQuestion = Math.max(0, (60000 - averageTimePerQuestion) / 6000);
        return Math.round(bonusPerQuestion * gameSession.answers.filter(a => a.isCorrect).length);
    }

    private maskPlayerName(name: string): string {
        return name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : name;
    }

    private async calculateRank(entry: LeaderboardEntry): Promise<number> {
        try {
            const response = await fetch(`${this.backendUrl}/api/game/leaderboard`, {
                method: 'GET',
            });
            if (!response.ok) throw new Error('Failed to fetch leaderboard');
            const leaderboard: LeaderboardEntry[] = await response.json();
            const sorted = leaderboard
                .concat(entry)
                .sort((a, b) => {
                    if (a.score !== b.score) return b.score - a.score;
                    if (a.completionTime !== b.completionTime) return a.completionTime - b.completionTime;
                    return a.playedAt.getTime() - b.playedAt.getTime();
                });
            return sorted.findIndex(e => e.finalScore === entry.finalScore && e.playedAt === entry.playedAt) + 1;
        } catch (error) {
            console.error('Error calculating rank:', error);
            return 0;
        }
    }
}

export class ParticipantCounter {
    private apiConfig: ParticipantCountAPI;
    private updateInterval: number = 5000;
    private intervalId: NodeJS.Timeout | null = null;
    private eventId: string = 'game2025';

    constructor() {
        this.apiConfig = {
            endpoint: 'https://api.api-ninjas.com/v1/counter',
            method: 'GET',
            headers: {
                'X-Api-Key': process.env.REACT_APP_API_NINJAS_KEY || '',
            },
        };
    }

    async getTotalParticipants(): Promise<number> {
        try {
            const url = `${this.apiConfig.endpoint}?id=${this.eventId}`;
            console.log('Fetching URL:', url);
            const response = await fetch(url, {
                method: this.apiConfig.method,
                headers: this.apiConfig.headers,
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API response error: ${response.status}, ${errorText}`);
            }
            const data = await response.json();
            console.log('API Response:', data);
            return data.value || 0;
        } catch (error) {
            console.error('Failed to fetch participant count:', error);
            return 0;
        }
    }

    async incrementParticipant(): Promise<void> {
        try {
            const url = `${this.apiConfig.endpoint}?id=${this.eventId}&hit=true`;
            console.log('Incrementing URL:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: this.apiConfig.headers,
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Increment failed: ${response.status}, ${errorText}`);
            }
            const data = await response.json();
            console.log('Increment Response:', data);
        } catch (error) {
            console.error('Failed to increment participant count:', error);
        }
    }

    startRealTimeUpdates(callback: (count: number) => void): void {
        this.intervalId = setInterval(async () => {
            try {
                const count = await this.getTotalParticipants();
                callback(count);
            } catch (error) {
                console.error('Update interval error:', error);
                callback(0);
            }
        }, this.updateInterval);
    }

    stopRealTimeUpdates(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

export interface ParticipantCountAPI {
    endpoint: string;
    method: 'GET' | 'POST';
    headers: Record<string, string>;
}