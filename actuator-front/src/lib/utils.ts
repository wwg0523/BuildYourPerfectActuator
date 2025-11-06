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

export interface Explanation {
    correct: string;
    improvements?: string[];
    realWorldExamples?: string[];
    learnMoreLink?: string;
}

export interface GameQuestion {
    id: string;
    type: 'multiple-choice' | 'true-false'; // Quiz type
    category: 'daily-life' | 'specification'; // Question category
    difficulty: 'easy' | 'medium' | 'hard'; // Difficulty level
    question: string;
    applicationName: string;
    options: string[]; // 4 options for multiple-choice, ['O', 'X'] for true-false
    correctAnswer: string; // Answer letter (A/B/C/D) or (O/X)
    explanation: Explanation; // Detailed explanation and examples
    points: number;
    timeLimit: number;
}

export interface ScoreCalculation {
    basePoints: number;        // 기본 점수 (정답 시 20점)
    timeBonus: number;         // 시간 보너스 (남은 시간 / 3)
    difficultyMultiplier: number; // 난이도 배수
    finalScore: number;        // 최종 점수
}

export interface RankInfo {
    rank: string;
    title: string;
    description: string;
    minScore: number;
    badge: string;
}

export interface UserAnswer {
    questionId: string;
    selectedComponents: string[];
    isCorrect: boolean;
    answerTime: number;
    timestamp: Date;
    difficulty?: 'easy' | 'medium' | 'hard'; // 난이도
    timeRemaining?: number; // 질문 시간 제한 내에 남은 시간 (초)
}

export interface GameSession {
    sessionId: string;
    userId?: string;
    questions: GameQuestion[];
    currentQuestionIndex: number;
    answers: UserAnswer[];
    startTime: Date;
    endTime?: Date;
    totalScore: number;
    completionTime?: number; // 게임 완료 시간 (ms)
}

export interface LeaderboardEntry {
    rank: number;
    playerName: string;
    company: string;
    score: number;
    completionTime: number;
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
    // 모든 컴포넌트 맵 (id -> 이름)
    private allComponentsMap: Record<string, { name: string; image: string }> = {
        servo_motor: { name: 'Servo Motor', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Servo_Motor.jpg/320px-Servo_Motor.jpg' },
        ac_motor: { name: 'AC Motor', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/3_phase_AC_motor_02.jpg/320px-3_phase_AC_motor_02.jpg' },
        stepper_motor: { name: 'Stepper Motor', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Motor_icon.svg/320px-Motor_icon.svg.png' },
        harmonic_gearbox: { name: 'Harmonic Gearbox', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Gearbox.jpg/320px-Gearbox.jpg' },
        planetary_gearbox: { name: 'Planetary Gearbox', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Gearbox.jpg/320px-Gearbox.jpg' },
        spur_gearbox: { name: 'Spur Gearbox', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Gearbox.jpg/320px-Gearbox.jpg' },
        absolute_encoder: { name: 'Absolute Encoder', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/RotaryEncoder.jpg/320px-RotaryEncoder.jpg' },
        optical_encoder: { name: 'Optical Encoder', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/RotaryEncoder.jpg/320px-RotaryEncoder.jpg' },
        incremental_encoder: { name: 'Incremental Encoder', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/RotaryEncoder.jpg/320px-RotaryEncoder.jpg' },
        servo_drive: { name: 'Servo Drive', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/V-Belt_and_sheave.jpg/320px-V-Belt_and_sheave.jpg' },
        stepper_drive: { name: 'Stepper Drive', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Gearbox.jpg/320px-Gearbox.jpg' },
        ac_drive: { name: 'AC Drive', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Gearbox.jpg/320px-Gearbox.jpg' },
        ball_bearing: { name: 'Ball Bearing', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Rollenlager.jpg/320px-Rollenlager.jpg' },
        roller_bearing: { name: 'Roller Bearing', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Rollenlager.jpg/320px-Rollenlager.jpg' },
        thrust_bearing: { name: 'Thrust Bearing', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Rollenlager.jpg/320px-Rollenlager.jpg' },
    };

    // 애플리케이션 이름 매핑 (영어)
    private applicationNames: Record<string, string> = {
        robot_arm_joint: 'Robot Arm Joint',
        automotive_steering: 'Automotive Steering',
        industrial_automation: 'Industrial Automation',
        precision_robotics: 'Precision Robotics',
        automated_conveyor: 'Automated Conveyor',
        medical_robot_arm: 'Medical Robot Arm',
        cnc_machine: 'CNC Machine',
        drone_actuator: 'Drone Actuator',
        precision_manipulator: 'Precision Manipulator',
        autonomous_vehicle_suspension: 'Autonomous Vehicle Suspension',
        factory_conveyor_system: 'Factory Conveyor System',
        medical_scanner_rotation: 'Medical Scanner Rotation',
        drone_camera_gimbal: 'Drone Camera Gimbal',
        wind_turbine_blade_adjuster: 'Wind Turbine Blade Adjuster',
        cnc_milling_spindle: 'CNC Milling Spindle',
        robotic_vacuum_mobility: 'Robotic Vacuum Mobility',
    };

    // 애플리케이션 이미지 매핑 (SVG 기반)
    private applicationImages: Record<string, string> = {
        robot_arm_joint: '/images/robot-arm.svg',
        automotive_steering: '/images/automotive-steering.svg',
        industrial_automation: '/images/industrial-automation.svg',
        precision_robotics: '/images/precision-robotics.svg',
        automated_conveyor: '/images/automated-conveyor.svg',
        medical_robot_arm: '/images/medical-robot-arm.svg',
        cnc_machine: '/images/cnc-machine.svg',
        drone_actuator: '/images/drone-actuator.svg',
        precision_manipulator: '/images/precision-manipulator.svg',
        autonomous_vehicle_suspension: '/images/autonomous-vehicle-suspension.svg',
        factory_conveyor_system: '/images/factory-conveyor-system.svg',
        medical_scanner_rotation: '/images/medical-scanner-rotation.svg',
        drone_camera_gimbal: '/images/drone-camera-gimbal.svg',
        wind_turbine_blade_adjuster: '/images/wind-turbine-blade-adjuster.svg',
        cnc_milling_spindle: '/images/cnc-milling-spindle.svg',
        robotic_vacuum_mobility: '/images/robotic-vacuum-mobility.svg',
    };

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    private getRandomWrongComponent(requiredComponentIds: string[]): string {
        // 필요한 컴포넌트 목록에 없는 랜덤 컴포넌트 반환
        const allComponentIds = Object.keys(this.allComponentsMap);
        const wrongComponents = allComponentIds.filter(id => !requiredComponentIds.includes(id));
        return wrongComponents[Math.floor(Math.random() * wrongComponents.length)];
    }

    generateGameSession(userId?: string): GameSession {
        // Import quiz questions from JSON data
        const quizQuestionsImport = require('../data/quizQuestions.json');
        const allQuizQuestions: GameQuestion[] = quizQuestionsImport.questions;
        
        // Randomly select 5 questions from the pool of 10
        const shuffledQuestions = this.shuffleArray(allQuizQuestions).slice(0, 5);
        
        // Ensure 3 multiple-choice (daily-life) and 2 true-false (specification)
        const multipleChoiceQuestions = shuffledQuestions.filter(q => q.type === 'multiple-choice');
        const trueFalseQuestions = shuffledQuestions.filter(q => q.type === 'true-false');
        
        // If we don't have exactly 3 and 2, rebalance
        let questions: GameQuestion[] = [];
        if (multipleChoiceQuestions.length >= 3 && trueFalseQuestions.length >= 2) {
            questions = [...multipleChoiceQuestions.slice(0, 3), ...trueFalseQuestions.slice(0, 2)];
        } else {
            // Fallback: use first 5 questions as is
            questions = shuffledQuestions.slice(0, 5);
        }

        return {
            sessionId: generateUUID(),
            userId,
            questions,
            currentQuestionIndex: 0,
            answers: [],
            startTime: new Date(),
            totalScore: 0,
        };
    }
}

// 등급 시스템 정의
const rankSystem: RankInfo[] = [
    {
        rank: 'S',
        title: '액추에이터 마스터',
        description: '완벽한 이해도를 보여주셨습니다!',
        minScore: 90,
        badge: '🏆'
    },
    {
        rank: 'A',
        title: '액추에이터 전문가',
        description: '훌륭한 이해도를 가지고 계십니다.',
        minScore: 75,
        badge: '🥇'
    },
    {
        rank: 'B',
        title: '액추에이터 숙련자',
        description: '좋은 이해도를 보여주셨습니다.',
        minScore: 60,
        badge: '🥈'
    },
    {
        rank: 'C',
        title: '액추에이터 학습자',
        description: '더 배워나가는 중입니다.',
        minScore: 40,
        badge: '🥉'
    },
    {
        rank: 'D',
        title: '액추에이터 입문자',
        description: '시작이 반입니다!',
        minScore: 0,
        badge: '📚'
    }
];

// 점수 계산 함수
export const calculateScore = (
    isCorrect: boolean,
    timeRemaining: number,
    difficulty: 'easy' | 'medium' | 'hard'
): ScoreCalculation => {
    if (!isCorrect) {
        return {
            basePoints: 0,
            timeBonus: 0,
            difficultyMultiplier: 1,
            finalScore: 0
        };
    }

    const basePoints = 20;
    const timeBonus = Math.floor(timeRemaining / 3);
    const difficultyMultiplier = {
        easy: 1.0,
        medium: 1.2,
        hard: 1.5
    }[difficulty];

    const finalScore = Math.round((basePoints + timeBonus) * difficultyMultiplier);

    return {
        basePoints,
        timeBonus,
        difficultyMultiplier,
        finalScore
    };
};

// 등급 조회 함수
export const getRankInfo = (score: number): RankInfo => {
    return rankSystem.find(rank => score >= rank.minScore) || rankSystem[rankSystem.length - 1];
};

export class LeaderboardManager {
    private backendUrl: string = process.env.REACT_APP_BACKEND_URL || 'http://actuator-back:4004';

    async submitScore(gameSession: GameSession, userInfo: UserInfo): Promise<LeaderboardEntry> {
        const finalScore = this.calculateScore(gameSession);
        const correctCount = gameSession.answers.filter(a => a.isCorrect).length;
        const completionTime = gameSession.endTime
            ? gameSession.endTime.getTime() - gameSession.startTime.getTime()
            : 0;

        const entry: LeaderboardEntry = {
            rank: 0,
            playerName: this.maskPlayerName(userInfo.name),
            company: userInfo.company,
            score: correctCount,  // 정답 개수 (0~5)
            completionTime: completionTime,
            finalScore,  // 계산된 최종 점수
            playedAt: new Date(),
        };

        try {
            // 1. 사용자의 순위 계산 (daily_leaderboard VIEW 기반)
            entry.rank = await this.calculateRank(entry);

            // 2. 이메일 발송은 Result 화면에서 처리 (useEffect)
            // (더 이상 여기서 비동기로 발송하지 않음)
        } catch (error) {
            console.error('Error submitting score:', error);
        }
        return entry;
    }

    calculateScore(gameSession: GameSession): number {
        // 모든 답변의 개별 점수를 계산해서 합산
        const totalScore = gameSession.answers.reduce((sum, answer) => {
            if (!answer.isCorrect) {
                return sum;
            }
            
            const difficulty = answer.difficulty || 'medium';
            const timeRemaining = answer.timeRemaining || 0;
            const scoreCalc = calculateScore(true, timeRemaining, difficulty);
            
            return sum + scoreCalc.finalScore;
        }, 0);
        
        return totalScore;
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
            
            // daily_leaderboard VIEW는 이미 rank를 계산하고 있으므로,
            // 현재 점수보다 높은 순위의 엔트리를 찾아서 순위 계산
            const higherRanks = leaderboard.filter(e => 
                e.finalScore > entry.finalScore || 
                (e.finalScore === entry.finalScore && e.completionTime < entry.completionTime)
            ).length;
            
            return higherRanks + 1;
        } catch (error) {
            console.error('Error calculating rank:', error);
            return 0;
        }
    }

    private async sendResultEmail(userInfo: UserInfo, gameSession: GameSession, leaderboardEntry: LeaderboardEntry): Promise<void> {
        try {
            const emailTemplate = this.generateResultEmailTemplate(userInfo, gameSession, leaderboardEntry);
            
            const response = await fetch(`${this.backendUrl}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userInfo.id,
                    recipientEmail: userInfo.email,
                    subject: emailTemplate.subject,
                    htmlContent: emailTemplate.htmlContent,
                    textContent: emailTemplate.textContent,
                }),
            });

            if (!response.ok) {
                console.warn('Failed to send email:', response.statusText);
            } else {
                console.log('Email sent successfully');
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

    private generateResultEmailTemplate(userInfo: UserInfo, gameSession: GameSession, leaderboardEntry: LeaderboardEntry) {
        const completionSeconds = Math.round(leaderboardEntry.completionTime / 1000);
        const minutes = Math.floor(completionSeconds / 60);
        const seconds = completionSeconds % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const subject = `Your Actuator Challenge Results - Score: ${leaderboardEntry.score}/5`;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 2em; }
        .content { background: #f9f9f9; padding: 30px; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }
        .result-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .score-display { font-size: 2.5em; font-weight: bold; color: #4CAF50; text-align: center; margin: 20px 0; }
        .rank-badge { background: #FFD700; color: #333; padding: 8px 16px; border-radius: 20px;
                     font-weight: bold; display: inline-block; margin: 10px 0; }
        .stats-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .stats-label { font-weight: bold; color: #666; }
        .stats-value { color: #333; }
        .product-section { background: #e3f2fd; padding: 20px; margin: 20px 0; border-left: 4px solid #2196F3; }
        .footer { background: #333; color: white; padding: 20px; text-align: center;
                 border-radius: 0 0 10px 10px; font-size: 0.9em; }
        .btn { background: #007bff; color: white; padding: 12px 24px; text-decoration: none;
              border-radius: 5px; display: inline-block; margin: 10px 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 Actuator Challenge Results</h1>
            <p>Thank you for participating in our interactive game!</p>
        </div>
        <div class="content">
            <div class="result-card">
                <h2>Hello ${userInfo.name},</h2>
                <p>Congratulations on completing our Actuator Component Challenge! Here are your results:</p>
                <div class="score-display">${leaderboardEntry.score}/5</div>
                <p style="text-align: center; color: #666;">Correct Answers</p>
                <div style="text-align: center;">
                    <span class="rank-badge">🏅 Rank #${leaderboardEntry.rank} Today</span>
                </div>
                
                <h3>📊 Performance Summary</h3>
                <div class="stats-row">
                    <span class="stats-label">Total Score:</span>
                    <span class="stats-value">${leaderboardEntry.finalScore} points</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Completion Time:</span>
                    <span class="stats-value">${timeStr}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Daily Rank:</span>
                    <span class="stats-value">#${leaderboardEntry.rank}</span>
                </div>
            </div>

            <div class="result-card">
                <h3>📚 Learn More About Actuator Technology</h3>
                <p>Want to deepen your knowledge? Check out these resources:</p>
                <ul>
                    <li><a href="https://www.example.com/actuator-basics" style="color: #007bff;">Actuator Fundamentals Guide</a></li>
                    <li><a href="https://www.example.com/webinars" style="color: #007bff;">Upcoming Technical Webinars</a></li>
                    <li><a href="https://www.example.com/case-studies" style="color: #007bff;">Real-World Application Case Studies</a></li>
                </ul>
            </div>

            <div class="result-card">
                <h3>🤝 Connect With Our Experts</h3>
                <p>Have specific questions about actuator selection for your application?</p>
                <p>Our technical team is ready to help:</p>
                <ul style="list-style: none; padding: 0;">
                    <li>📧 <strong>Email:</strong> <a href="mailto:technical@example.com" style="color: #007bff;">technical@example.com</a></li>
                    <li>📱 <strong>Phone:</strong> +1-800-ACTUATOR</li>
                </ul>
            </div>
        </div>
        <div class="footer">
            <p><strong>Actuator Challenge - Precision Motion Solutions</strong></p>
            <p style="font-size: 12px; margin-top: 20px;">
                You received this email because you participated in our interactive game.
            </p>
        </div>
    </div>
</body>
</html>
        `;

        const textContent = `
Actuator Challenge Results

Hello ${userInfo.name},

Thank you for participating in our interactive game!

YOUR RESULTS:
- Score: ${leaderboardEntry.score}/5 correct answers
- Daily Rank: #${leaderboardEntry.rank}
- Completion Time: ${timeStr}
- Final Score: ${leaderboardEntry.finalScore} points

Learn more at https://www.example.com

Best regards,
Actuator Challenge Team
        `;

        return { subject, htmlContent, textContent };
    }
}

export class ParticipantCounter {
    private backendUrl: string = process.env.REACT_APP_BACKEND_URL || 'http://actuator-back:4004';
    private updateInterval: number = 5000;
    private intervalId: NodeJS.Timeout | null = null;

    async getTotalParticipants(): Promise<number> {
        try {
            const url = `${this.backendUrl}/api/counter`;
            console.log('Fetching participant count from:', url);
            const response = await fetch(url, {
                method: 'GET',
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API response error: ${response.status}, ${errorText}`);
            }
            const data = await response.json();
            console.log('Participant count response:', data);
            return data.value || 0;
        } catch (error) {
            console.error('Failed to fetch participant count:', error);
            return 0;
        }
    }

    async incrementParticipant(): Promise<void> {
        try {
            const url = `${this.backendUrl}/api/counter/increment`;
            console.log('Incrementing participant count at:', url);
            const response = await fetch(url, {
                method: 'POST',
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Increment failed: ${response.status}, ${errorText}`);
            }
            const data = await response.json();
            console.log('Increment response:', data);
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

// Delete User Data Function
export async function deleteUserData(userId: string): Promise<boolean> {
    try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4004';
        const response = await fetch(`${backendUrl}/api/delete-user-data`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error(`Failed to delete user data: ${response.status}`);
        }

        console.log('User data deleted successfully');
        return true;
    } catch (error) {
        console.error('Error deleting user data:', error);
        return false;
    }
}