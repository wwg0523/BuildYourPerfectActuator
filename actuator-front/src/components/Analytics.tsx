import React, { useState, useEffect, useCallback } from 'react';
import '../styles/main.scss';
import '../styles/Analytics.scss';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../lib/utils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
} from 'recharts';

interface SummaryData {
    totalParticipants: number;
    totalCompleted: number;
    completionRate: number;
    averageCompletionTime: number;
    averageScore: number;
}

interface QuestionPerformance {
    questionId: string;
    applicationName: string;
    difficulty: string;
    maxPoints: number;
    totalAttempts: number;
    correctAttempts: number;
    successRate: number;
    avgPointsEarned: number;
}

interface DifficultyAnalysis {
    difficulty: string;
    questionCount: number;
    totalAttempts: number;
    correctAttempts: number;
    successRate: number;
    avgPointsEarned: number;
}

interface LeadQuality {
    company: string;
    participantCount: number;
    avgScore: number;
    avgCompletionTime: number;
    completedCount: number;
    completionRate: number;
}

interface DailyTrend {
    date: string;
    participants: number;
    completions: number;
    avgScore: number;
}

interface GameAnalytics {
    summary: SummaryData;
    questionPerformance: QuestionPerformance[];
    difficultyAnalysis: DifficultyAnalysis[];
    leadQuality: LeadQuality[];
    dailyTrend: DailyTrend[];
}

const Analytics: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<GameAnalytics | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'companies' | 'trends'>('overview');

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
            return dateString;
        }
    };

    const fetchAnalytics = useCallback(async () => {
        try {
            console.log('🔐 Fetching analytics with password:', password.substring(0, 3) + '***');
            const response = await fetch(`${API_BASE_URL}/analytics`, {
                headers: { Authorization: password },
            });
            
            console.log('📊 Response status:', response.status);
            console.log('📊 Content-Type:', response.headers.get('content-type'));
            
            if (!response.ok) {
                // Try to parse error response as JSON
                try {
                    const errorData = await response.json();
                    throw new Error(response.status === 401 ? 'Invalid password' : (errorData.error || `Failed to fetch analytics data (${response.status})`));
                } catch (parseErr) {
                    // If JSON parsing fails, throw status-based error
                    throw new Error(response.status === 401 ? 'Invalid password' : `Failed to fetch analytics data (${response.status})`);
                }
            }
            
            // Check content type to ensure we get JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const responseText = await response.text();
                console.error('❌ Non-JSON response:', responseText.substring(0, 200));
                throw new Error('Server returned non-JSON response. Check backend /api/analytics endpoint.');
            }
            
            const data = await response.json();
            console.log('✅ Analytics data received:', data);
            setAnalyticsData(data);
            setError('');
        } catch (err: any) {
            console.error('❌ Analytics fetch error:', err);
            setError(err.message || 'Failed to load analytics. Please check your password.');
        }
    }, [password]);

    const handleLogin = () => {
        fetchAnalytics();
        setIsAuthenticated(true);
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchAnalytics();
        }
    }, [isAuthenticated, fetchAnalytics]);

    return (
        <div className="app-container">
            <div className="analytics-card">
                {!isAuthenticated ? (
                    <div className="analytics-login">
                        <h2>Analytics Dashboard</h2>
                        <input
                            type="password"
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="error">{error || '\u00A0'}</p>
                        <button className="button" onClick={handleLogin}>
                            Login
                        </button>
                    </div>
                ) : (
                    <div className="analytics-content">
                        <h2>Data Analytics Dashboard</h2>
                        {analyticsData ? (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                transition={{ duration: 0.5 }}
                                className="analytics-container"
                            >
                                {/* Tab Navigation */}
                                <div className="analytics-tabs">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={activeTab === 'overview' ? 'active' : ''}
                                    >
                                        📊 Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('questions')}
                                        className={activeTab === 'questions' ? 'active' : ''}
                                    >
                                        ❓ Questions
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('companies')}
                                        className={activeTab === 'companies' ? 'active' : ''}
                                    >
                                        🏢 Companies
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('trends')}
                                        className={activeTab === 'trends' ? 'active' : ''}
                                    >
                                        📈 Trends
                                    </button>
                                </div>

                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="tab-content overview-section">
                                        <div className="stats-grid">
                                            <div className="stat-card">
                                                <p>Total Participants</p>
                                                <p style={{ color: '#007bff' }}>{analyticsData.summary.totalParticipants}</p>
                                            </div>
                                            <div className="stat-card">
                                                <p>Completed</p>
                                                <p style={{ color: '#28a745' }}>{analyticsData.summary.totalCompleted}</p>
                                            </div>
                                            <div className="stat-card">
                                                <p>Completion Rate</p>
                                                <p style={{ color: '#ffc107' }}>{analyticsData.summary.completionRate.toFixed(1)}%</p>
                                            </div>
                                            <div className="stat-card">
                                                <p>Avg Time (sec)</p>
                                                <p style={{ color: '#17a2b8' }}>{analyticsData.summary.averageCompletionTime.toFixed(1)}</p>
                                            </div>
                                            <div className="stat-card">
                                                <p>Avg Score</p>
                                                <p style={{ color: '#6f42c1' }}>{analyticsData.summary.averageScore.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        {/* Difficulty Distribution */}
                                        <div style={{ width: '100%', marginTop: '20px' }}>
                                            <h3 style={{ textAlign: 'center' }}>Difficulty Level Performance</h3>
                                            <div className="difficulty-chart">
                                                <ResponsiveContainer>
                                                    <BarChart data={analyticsData.difficultyAnalysis}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="difficulty" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="successRate" fill="#8884d8" name="Success Rate (%)" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Questions Tab */}
                                {activeTab === 'questions' && (
                                    <div className="tab-content questions-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>App</th>
                                                    <th>Difficulty</th>
                                                    <th>Attempts</th>
                                                    <th>Correct</th>
                                                    <th>Success Rate</th>
                                                    <th>Avg Points</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analyticsData.questionPerformance.map((q, idx) => (
                                                    <tr key={idx}>
                                                        <td>{q.applicationName}</td>
                                                        <td>{q.difficulty}</td>
                                                        <td style={{ textAlign: 'center' }}>{q.totalAttempts}</td>
                                                        <td style={{ textAlign: 'center' }}>{q.correctAttempts}</td>
                                                        <td style={{ textAlign: 'center' }} className={`success-rate ${q.successRate > 50 ? 'high' : 'low'}`}>{q.successRate.toFixed(1)}%</td>
                                                        <td style={{ textAlign: 'center' }}>{q.avgPointsEarned.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Companies Tab */}
                                {activeTab === 'companies' && (
                                    <div className="tab-content companies-section">
                                        <div className="companies-chart">
                                            <h3>Participants by Company</h3>
                                            <ResponsiveContainer>
                                                <BarChart data={analyticsData.leadQuality} margin={{ bottom: 50, left: 0, right: 0, top: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="company" angle={-45} textAnchor="end" height={50} tick={{ fontSize: 10 }} />
                                                    <YAxis tick={{ fontSize: 10 }} />
                                                    <Tooltip />
                                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                                    <Bar dataKey="participantCount" fill="#8884d8" name="Total Participants" />
                                                    <Bar dataKey="completedCount" fill="#82ca9d" name="Completed" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="questions-table">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Company</th>
                                                        <th>Participants</th>
                                                        <th>Completed</th>
                                                        <th>Completion Rate</th>
                                                        <th>Avg Score</th>
                                                        <th>Avg Time (sec)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {analyticsData.leadQuality.map((company, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ fontWeight: 'bold' }}>{company.company}</td>
                                                            <td style={{ textAlign: 'center' }}>{company.participantCount}</td>
                                                            <td style={{ textAlign: 'center' }}>{company.completedCount}</td>
                                                            <td style={{ textAlign: 'center', color: company.completionRate > 50 ? '#28a745' : '#ffc107' }}>{company.completionRate.toFixed(1)}%</td>
                                                            <td style={{ textAlign: 'center' }}>{company.avgScore.toFixed(2)}</td>
                                                            <td style={{ textAlign: 'center' }}>{company.avgCompletionTime.toFixed(1)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Trends Tab */}
                                {activeTab === 'trends' && (
                                    <div className="tab-content trends-section">
                                        <div className="trends-chart">
                                            <h3>Daily Participation Trend</h3>
                                            <ResponsiveContainer>
                                                <LineChart data={analyticsData.dailyTrend}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="participants" stroke="#8884d8" name="Participants" />
                                                    <Line type="monotone" dataKey="completions" stroke="#82ca9d" name="Completions" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="questions-table" style={{ maxWidth: '600px' }}>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th style={{ textAlign: 'center' }}>Date</th>
                                                        <th style={{ textAlign: 'center' }}>Participants</th>
                                                        <th style={{ textAlign: 'center' }}>Completions</th>
                                                        <th style={{ textAlign: 'center' }}>Avg Score</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {analyticsData.dailyTrend.map((day, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ textAlign: 'center' }}>{formatDate(day.date)}</td>
                                                            <td style={{ textAlign: 'center' }}>{day.participants}</td>
                                                            <td style={{ textAlign: 'center' }}>{day.completions}</td>
                                                            <td style={{ textAlign: 'center' }}>{day.avgScore.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div className="analytics-actions">
                                    <button className="button outline" onClick={fetchAnalytics}>
                                        🔄 REFRESH
                                    </button>
                                    <button className="button" onClick={() => (window.location.href = '/')}>
                                        🏠 BACK TO GAME
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <p className="loading">Loading analytics data...</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;