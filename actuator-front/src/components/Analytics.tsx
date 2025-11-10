import React, { useState, useEffect, useCallback } from 'react';
import '../styles/main.scss';
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
            <div className="card">
                {!isAuthenticated ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '20px' }}>Analytics Dashboard</h2>
                        <input
                            type="password"
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ maxWidth: '300px', width: '100%', marginBottom: '16px' }}
                        />
                        <p className="error" style={{ minHeight: '20px' }}>{error || '\u00A0'}</p>
                        <button className="button" onClick={handleLogin} style={{ minWidth: '120px' }}>
                            Login
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Data Analytics Dashboard</h2>
                        {analyticsData ? (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                transition={{ duration: 0.5 }}
                                style={{ width: '100%', maxWidth: '1200px' }}
                            >
                                {/* Tab Navigation */}
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        style={{
                                            padding: '10px 20px',
                                            border: 'none',
                                            background: activeTab === 'overview' ? '#007bff' : '#f0f0f0',
                                            color: activeTab === 'overview' ? '#fff' : '#333',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            borderRadius: '4px 4px 0 0',
                                        }}
                                    >
                                        📊 Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('questions')}
                                        style={{
                                            padding: '10px 20px',
                                            border: 'none',
                                            background: activeTab === 'questions' ? '#007bff' : '#f0f0f0',
                                            color: activeTab === 'questions' ? '#fff' : '#333',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            borderRadius: '4px 4px 0 0',
                                        }}
                                    >
                                        ❓ Questions
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('companies')}
                                        style={{
                                            padding: '10px 20px',
                                            border: 'none',
                                            background: activeTab === 'companies' ? '#007bff' : '#f0f0f0',
                                            color: activeTab === 'companies' ? '#fff' : '#333',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            borderRadius: '4px 4px 0 0',
                                        }}
                                    >
                                        🏢 Companies
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('trends')}
                                        style={{
                                            padding: '10px 20px',
                                            border: 'none',
                                            background: activeTab === 'trends' ? '#007bff' : '#f0f0f0',
                                            color: activeTab === 'trends' ? '#fff' : '#333',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            borderRadius: '4px 4px 0 0',
                                        }}
                                    >
                                        � Trends
                                    </button>
                                </div>

                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%' }}>
                                            <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                                                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9em' }}>Total Participants</p>
                                                <p style={{ margin: 0, fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>{analyticsData.summary.totalParticipants}</p>
                                            </div>
                                            <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                                                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9em' }}>Completed</p>
                                                <p style={{ margin: 0, fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>{analyticsData.summary.totalCompleted}</p>
                                            </div>
                                            <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                                                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9em' }}>Completion Rate</p>
                                                <p style={{ margin: 0, fontSize: '2em', fontWeight: 'bold', color: '#ffc107' }}>{analyticsData.summary.completionRate.toFixed(1)}%</p>
                                            </div>
                                            <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                                                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9em' }}>Avg Time (sec)</p>
                                                <p style={{ margin: 0, fontSize: '2em', fontWeight: 'bold', color: '#17a2b8' }}>{analyticsData.summary.averageCompletionTime.toFixed(1)}</p>
                                            </div>
                                            <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                                                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9em' }}>Avg Score</p>
                                                <p style={{ margin: 0, fontSize: '2em', fontWeight: 'bold', color: '#6f42c1' }}>{analyticsData.summary.averageScore.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        {/* Difficulty Distribution */}
                                        <div style={{ width: '100%', marginTop: '20px' }}>
                                            <h3 style={{ textAlign: 'center' }}>Difficulty Level Performance</h3>
                                            <div style={{ width: '100%', maxWidth: '800px', height: 300, margin: '0 auto' }}>
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
                                    <div style={{ overflowX: 'auto', width: '100%' }}>
                                        <table style={{
                                            width: '100%',
                                            borderCollapse: 'collapse',
                                            marginBottom: '20px',
                                            fontSize: '0.9em'
                                        }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>App</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Difficulty</th>
                                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Attempts</th>
                                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Correct</th>
                                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Success Rate</th>
                                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Avg Points</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analyticsData.questionPerformance.map((q, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '12px', borderRight: '1px solid #eee' }}>{q.applicationName}</td>
                                                        <td style={{ padding: '12px', borderRight: '1px solid #eee' }}>{q.difficulty}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #eee' }}>{q.totalAttempts}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #eee' }}>{q.correctAttempts}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #eee', fontWeight: 'bold', color: q.successRate > 50 ? '#28a745' : '#dc3545' }}>{q.successRate.toFixed(1)}%</td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>{q.avgPointsEarned.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Companies Tab */}
                                {activeTab === 'companies' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ width: '100%', maxWidth: '900px', height: 300, margin: '0 auto' }}>
                                            <h3 style={{ textAlign: 'center' }}>Participants by Company</h3>
                                            <ResponsiveContainer>
                                                <BarChart data={analyticsData.leadQuality}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="company" angle={-45} textAnchor="end" height={100} />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="participantCount" fill="#8884d8" name="Total Participants" />
                                                    <Bar dataKey="completedCount" fill="#82ca9d" name="Completed" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div style={{ overflowX: 'auto', width: '100%' }}>
                                            <table style={{
                                                width: '100%',
                                                borderCollapse: 'collapse',
                                                fontSize: '0.9em'
                                            }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                                                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Company</th>
                                                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Participants</th>
                                                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Completed</th>
                                                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Completion Rate</th>
                                                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Avg Score</th>
                                                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Avg Time (sec)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {analyticsData.leadQuality.map((company, idx) => (
                                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                            <td style={{ padding: '12px', borderRight: '1px solid #eee', fontWeight: 'bold' }}>{company.company}</td>
                                                            <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #eee' }}>{company.participantCount}</td>
                                                            <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #eee' }}>{company.completedCount}</td>
                                                            <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #eee', color: company.completionRate > 50 ? '#28a745' : '#ffc107' }}>{company.completionRate.toFixed(1)}%</td>
                                                            <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #eee' }}>{company.avgScore.toFixed(2)}</td>
                                                            <td style={{ padding: '12px', textAlign: 'center' }}>{company.avgCompletionTime.toFixed(1)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Trends Tab */}
                                {activeTab === 'trends' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ width: '100%', maxWidth: '1000px', height: 300 }}>
                                            <h3 style={{ textAlign: 'center' }}>Daily Participation Trend</h3>
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
                                        <div style={{ overflowX: 'auto', width: '100%' }}>
                                            <table style={{
                                                width: '100%',
                                                borderCollapse: 'collapse',
                                                fontSize: '0.9em',
                                                maxWidth: '600px',
                                                margin: '0 auto'
                                            }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                                                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Date</th>
                                                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Participants</th>
                                                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Completions</th>
                                                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Avg Score</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {analyticsData.dailyTrend.map((day, idx) => (
                                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                            <td style={{ padding: '12px', borderRight: '1px solid #eee' }}>{day.date}</td>
                                                            <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #eee' }}>{day.participants}</td>
                                                            <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #eee' }}>{day.completions}</td>
                                                            <td style={{ padding: '12px', textAlign: 'center' }}>{day.avgScore.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
                                    <button className="button outline" onClick={fetchAnalytics}>
                                        🔄 REFRESH
                                    </button>
                                    <button className="button" onClick={() => (window.location.href = '/')}>
                                        🏠 BACK TO GAME
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <p style={{ textAlign: 'center' }}>Loading analytics data...</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;